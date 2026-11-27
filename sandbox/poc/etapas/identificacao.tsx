import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, CopyIcon, InfoIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Campo, copiar, Linha, Opcoes, reais, Rotulo, Secao, Secoes, useAtendimento, useAtraso, validar } from "../estado"
import { useRefino } from "../refino"

const entidades = ["1581 - INSS", "1582 - SIAPE", "1583 - Forças Armadas", "1584 - Governo de SP"]
const tiposBeneficio = ["41 - Aposentadoria por idade", "42 - Aposentadoria por tempo de contribuição", "21 - Pensão por morte", "32 - Aposentadoria por invalidez"]
const ufs = ["AC", "AL", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"]
const diasUteis = ["1º dia útil normal", "2º dia útil normal", "5º dia útil normal", "10º dia útil normal"]
const bancos = ["1 - Banco do Brasil S.A.", "33 - Santander", "104 - Caixa", "237 - Banco Bradesco", "318 - Banco Bmg", "341 - Itaú"]
const consultores = ["123456789 - Joelma da Silva", "987654321 - Carlos Souza"]

const idade = (nascimento: string) => {
  const [d, m, a] = nascimento.split("/").map(Number)
  if (!a || a < 1900) return null
  const hoje = new Date()
  return hoje.getFullYear() - a - (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d) ? 1 : 0)
}

export function Identificacao() {
  const { a, set, avancar } = useAtendimento()
  const [nascimento, setNascimento] = React.useState("24/05/1960")
  const anos = idade(nascimento)
  const r = useRefino()
  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validar(e.currentTarget)) avancar()
  }
  return (
    <form id="form-identificacao" noValidate onSubmit={enviar} className="flex flex-col gap-(--gap-2xl)">
      <Card>
        <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-(--gap-2xl) md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="cpf"><Rotulo texto="CPF" obrigatorio /></FieldLabel>
              <InputGroup>
                <InputGroupInput id="cpf" required inputMode="numeric" value={a.cliente.cpf} onChange={(e) => set((s) => ({ ...s, cliente: { ...s.cliente, cpf: e.target.value } }))} />
                <InputGroupAddon align="inline-end">
                  <Button variant="ghost" size="icon-sm" aria-label="Copiar CPF" onClick={() => copiar(a.cliente.cpf, "CPF copiado")}><CopyIcon /></Button>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="nascimento"><Rotulo texto="Data de nascimento" obrigatorio /></FieldLabel>
              <InputGroup>
                <InputGroupInput id="nascimento" required placeholder="dd/mm/aaaa" value={nascimento} onChange={(e) => setNascimento(e.target.value)} />
                {anos !== null && <InputGroupAddon align="inline-end"><InputGroupText>{anos} anos</InputGroupText></InputGroupAddon>}
              </InputGroup>
            </Field>
            <Campo label="Nome completo" required className="md:col-span-2" value={a.cliente.nome} onChange={(e) => set((s) => ({ ...s, cliente: { ...s.cliente, nome: e.target.value } }))} />
            <Field>
              <FieldLabel htmlFor="entidade"><Rotulo texto="Entidade" obrigatorio /></FieldLabel>
              <Combobox items={entidades} defaultValue={entidades[0]}>
                <ComboboxInput id="entidade" placeholder="Buscar entidade" />
                <ComboboxContent>
                  <ComboboxEmpty>Nenhuma entidade encontrada.</ComboboxEmpty>
                  <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {r ? <ConsultaIn100Refinada /> : <ConsultaIn100 />}

      {a.matriculas.map((m, i) => <Beneficio key={m} indice={i} matricula={m} />)}
      <Button type="button" variant="outline" className="self-start" onClick={() => set((s) => ({ ...s, matriculas: [...s.matriculas, String(Date.now()).slice(-9)] }))}>
        <PlusIcon /> Adicionar benefício
      </Button>

      <Card>
        {r && <CardHeader><CardTitle>Atendimento</CardTitle></CardHeader>}
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">Tipo de atendimento</FieldLegend>
              <RadioGroup defaultValue="remoto" className="flex gap-(--gap-2xl)">
                <Field orientation="horizontal" className="w-auto"><RadioGroupItem value="presencial" id="presencial" /><FieldLabel htmlFor="presencial">Presencial</FieldLabel></Field>
                <Field orientation="horizontal" className="w-auto"><RadioGroupItem value="remoto" id="remoto" /><FieldLabel htmlFor="remoto">Remoto</FieldLabel></Field>
              </RadioGroup>
            </FieldSet>
            <Opcoes label="Consultor responsável" opcoes={consultores} defaultValue={consultores[0]} />
          </FieldGroup>
        </CardContent>
      </Card>

      <FinalizarAtendimento />
    </form>
  )
}

function BotaoIn100() {
  const [estado, setEstado] = React.useState<"ocioso" | "consultando" | "feito">("ocioso")
  const depois = useAtraso()
  const consultar = () => {
    setEstado("consultando")
    // shortcut: consulta simulada com atraso fixo; ligar ao serviço da IN100 quando houver API.
    depois(() => {
      setEstado("feito")
      toast.add({ type: "success", title: "Dados do INSS consultados", description: "Benefício e margens conferidos com a IN100." })
    }, 1200)
  }
  return (
    <Button type="button" variant="outline" size="sm" disabled={estado === "consultando"} onClick={consultar}>
      {estado === "consultando" && <Spinner />}
      {estado === "feito" ? "Consultar IN100 de novo" : "Consultar IN100"}
    </Button>
  )
}

function ConsultaIn100() {
  return (
    <Card size="sm">
      <CardContent className="flex flex-wrap items-center gap-(--gap-lg)">
        <p className="text-label-sm">Consulte os dados do INSS: <span className="text-body-sm text-muted">(opcional)</span></p>
        <BotaoIn100 />
      </CardContent>
    </Card>
  )
}

// Refinamento: a consulta é um passo a passo (celular, token, consulta), então fica num bloco próprio,
// com o texto, o botão e os campos juntos (Proximidade, Região comum) e cada botão dizendo a ação (H2).
function ConsultaIn100Refinada() {
  const [etapa, setEtapa] = React.useState<"fechada" | "celular" | "token" | "consultando" | "feita">("fechada")
  const [celular, setCelular] = React.useState("")
  const [token, setToken] = React.useState("")
  const [erro, setErro] = React.useState<{ celular?: string; token?: string }>({})
  const depois = useAtraso()
  const enviarToken = () => {
    if (!celular.trim()) return setErro({ celular: "Informe o celular do cliente." })
    setErro({})
    setEtapa("token")
    // shortcut: envio simulado; ligar ao serviço de token quando houver API.
    toast.add({ title: "Token enviado", description: `Peça ao cliente o código que chegou em ${celular}.` })
  }
  const consultar = () => {
    if (!token.trim()) return setErro({ token: "Informe o token que o cliente recebeu." })
    setErro({})
    setEtapa("consultando")
    // shortcut: consulta simulada com atraso fixo; ligar ao serviço da IN100 quando houver API.
    depois(() => {
      setEtapa("feita")
      toast.add({ type: "success", title: "Dados do INSS consultados", description: "Benefício e margens conferidos com a IN100." })
    }, 1200)
  }
  // Enter num destes campos faz o passo dele, e não envia o formulário da etapa.
  const noEnter = (acao: () => void) => (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return
    e.preventDefault()
    acao()
  }
  const aberta = etapa !== "fechada" && etapa !== "feita"
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consulta ao INSS (IN100) <span className="text-body-sm text-muted">· opcional</span></CardTitle>
        <CardDescription>
          {etapa === "feita" ? "Benefício e margens conferidos com a IN100." : "Peça a autorização do cliente: envie um token para o celular dele (ou do representante) e confirme o código recebido."}
        </CardDescription>
        <CardAction>
          {etapa === "fechada" && <Button type="button" variant="outline" size="sm" onClick={() => setEtapa("celular")}>Consultar IN100</Button>}
          {etapa === "feita" && <Button type="button" variant="outline" size="sm" onClick={() => { setToken(""); setEtapa("celular") }}>Consultar de novo</Button>}
          {aberta && <Button type="button" variant="ghost" size="icon" aria-label="Fechar consulta" onClick={() => setEtapa("fechada")}><XIcon /></Button>}
        </CardAction>
      </CardHeader>
      {aberta && (
        <CardContent><Linha className="md:grid-cols-2">
          <Field data-invalid={erro.celular ? true : undefined}>
            <FieldLabel htmlFor="in100-celular">1. Celular do cliente</FieldLabel>
            <ButtonGroup className="w-full">
              <Input id="in100-celular" type="tel" placeholder="(00) 00000-0000" value={celular} aria-invalid={Boolean(erro.celular)} onChange={(e) => setCelular(e.target.value)} onKeyDown={noEnter(enviarToken)} />
              <Button type="button" variant="outline" onClick={enviarToken}>{etapa === "celular" ? "Enviar token" : "Reenviar"}</Button>
            </ButtonGroup>
            {erro.celular && <FieldError>{erro.celular}</FieldError>}
          </Field>
          <Field data-invalid={erro.token ? true : undefined} data-disabled={etapa === "celular" ? true : undefined}>
            <FieldLabel htmlFor="in100-token">2. Token recebido</FieldLabel>
            <ButtonGroup className="w-full">
              <Input id="in100-token" inputMode="numeric" autoComplete="one-time-code" disabled={etapa === "celular"} value={token} aria-invalid={Boolean(erro.token)} onChange={(e) => setToken(e.target.value)} onKeyDown={noEnter(consultar)} />
              <Button type="button" disabled={etapa !== "token"} onClick={consultar}>{etapa === "consultando" && <Spinner />}Consultar</Button>
            </ButtonGroup>
            {erro.token ? <FieldError>{erro.token}</FieldError> : etapa === "celular" && <FieldDescription>Libera depois de enviar o token.</FieldDescription>}
          </Field>
        </Linha></CardContent>
      )}
    </Card>
  )
}

const mascaraData = (v: string) =>
  v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3")

// Refinamento: a data é um campo como os outros. Dá para digitar (a máscara põe as barras) e, ao começar a digitar
// ou ao tocar no ícone, o calendário abre; o foco fica no campo enquanto se digita.
function CampoData({ id, label, valor, onValor, className }: { id: string; label: string; valor?: Date; onValor: (d?: Date) => void; className?: string }) {
  const [texto, setTexto] = React.useState(valor ? format(valor, "dd/MM/yyyy") : "")
  const [mes, setMes] = React.useState(valor)
  const [aberto, setAberto] = React.useState(false)
  const [erro, setErro] = React.useState("")
  const campo = React.useRef<HTMLInputElement>(null)
  const digitando = React.useRef(false)
  const digitar = (campoDigitado: HTMLInputElement) => {
    const t = mascaraData(campoDigitado.value)
    setTexto(t)
    setErro("")
    digitando.current = true
    setAberto(true)
    const d = t.length === 10 ? parse(t, "dd/MM/yyyy", new Date()) : undefined
    const valida = Boolean(d && isValid(d))
    // 31/02/2020 tem o formato certo, mas não existe: o campo fica inválido para o validar.
    campoDigitado.setCustomValidity(t.length === 10 && !valida ? "Data inválida." : "")
    onValor(valida ? d : undefined)
    if (valida) setMes(d)
  }
  const escolher = (d?: Date) => {
    onValor(d)
    campo.current?.setCustomValidity("")
    setTexto(d ? format(d, "dd/MM/yyyy") : "")
    setErro("")
    setAberto(false)
  }
  const abrir = (v: boolean) => {
    if (v) digitando.current = false
    setAberto(v)
  }
  return (
    <Field className={className} data-invalid={erro ? true : undefined}>
      <FieldLabel htmlFor={id}><Rotulo texto={label} obrigatorio /></FieldLabel>
      <Popover open={aberto} onOpenChange={abrir}>
        <InputGroup>
          <InputGroupInput
            ref={campo}
            id={id}
            required
            pattern="\d{2}/\d{2}/\d{4}"
            inputMode="numeric"
            placeholder="dd/mm/aaaa"
            value={texto}
            onChange={(e) => digitar(e.currentTarget)}
            onInput={(e) => e.currentTarget.removeAttribute("aria-invalid")}
            onInvalid={(e) => setErro(e.currentTarget.validity.valueMissing ? "Campo obrigatório." : e.currentTarget.validity.customError ? "Essa data não existe." : "Use o formato dd/mm/aaaa.")}
          />
          <InputGroupAddon align="inline-end">
            <PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Abrir calendário" />}><CalendarIcon /></PopoverTrigger>
          </InputGroupAddon>
        </InputGroup>
        <PopoverContent className="w-auto p-0" align="end" initialFocus={() => !digitando.current} finalFocus={campo}>
          <Calendar mode="single" locale={ptBR} captionLayout="dropdown" selected={valor} onSelect={escolher} month={mes} onMonthChange={setMes} />
        </PopoverContent>
      </Popover>
      {erro && <FieldError>{erro}</FieldError>}
    </Field>
  )
}

function Beneficio({ indice, matricula }: { indice: number; matricula: string }) {
  const { a, set } = useAtendimento()
  const [concessao, setConcessao] = React.useState<Date | undefined>(new Date(2000, 0, 1))
  const remover = () => {
    set((s) => ({
      ...s,
      matriculas: s.matriculas.filter((m) => m !== matricula),
      carrinho: Object.fromEntries(Object.entries(s.carrinho).filter(([id]) => !id.startsWith(`${matricula}-`))),
    }))
    toast.add({ title: "Benefício removido", description: `Matrícula ${matricula} e os produtos dela saíram do carrinho.` })
  }
  const r = useRefino()
  const remocao = a.matriculas.length > 1 && (
    <Button type="button" variant="ghost" size="icon" aria-label={`Remover benefício ${matricula}`} onClick={remover}><Trash2Icon /></Button>
  )
  const matriculaCampo = <Campo label="Matrícula" required defaultValue={matricula} inputMode="numeric" className={r ? "md:col-span-2" : "md:col-span-3"} />
  const tipo = <Opcoes label="Tipo benefício*" opcoes={tiposBeneficio} defaultValue={tiposBeneficio[1]} className={r ? "md:col-span-4" : "md:col-span-3"} />
  const uf = <Opcoes label="UF*" opcoes={ufs} defaultValue="SP" className={r ? undefined : "md:col-span-2"} />
  const renda = <Campo label="Renda" required {...reais(r, "3.000,00")} className={r ? undefined : "md:col-span-2"} />
  const diaUtil = <Opcoes label="Dia útil de pagamento*" opcoes={diasUteis} defaultValue={diasUteis[2]} className={r ? undefined : "md:col-span-2"} />
  const concessaoCampo = r ? (
    <CampoData id={`concessao-${matricula}`} label="Data de concessão" valor={concessao} onValor={setConcessao} />
  ) : (
    <Field className={r ? "md:col-span-2" : "md:col-span-3"}>
      <FieldLabel><Rotulo texto="Data de concessão" obrigatorio /></FieldLabel>
      <Popover>
        <PopoverTrigger render={<Button type="button" variant="outline" className="w-full justify-between" />}>
          {concessao ? format(concessao, "dd/MM/yyyy") : "Escolha uma data"}
          <CalendarIcon />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" locale={ptBR} captionLayout="dropdown" selected={concessao} onSelect={setConcessao} defaultMonth={concessao} />
        </PopoverContent>
      </Popover>
    </Field>
  )
  const banco = (
    <Field className={r ? undefined : "md:col-span-3"}>
      <FieldLabel htmlFor={`banco-${matricula}`}><Rotulo texto="Banco recebedor do benefício" obrigatorio /></FieldLabel>
      <Combobox items={bancos} defaultValue={bancos[0]}>
        <ComboboxInput id={`banco-${matricula}`} placeholder="Buscar banco" />
        <ComboboxContent>
          <ComboboxEmpty>Nenhum banco encontrado.</ComboboxEmpty>
          <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
  const magnetico = (
    <Field orientation="horizontal" className="md:col-span-6">
      <Checkbox id={`magnetico-${matricula}`} />
      <FieldLabel htmlFor={`magnetico-${matricula}`}>Recebe benefício por cartão magnético</FieldLabel>
    </Field>
  )
  const sobreMargens = (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-xs" aria-label="Sobre as margens" />}><InfoIcon /></TooltipTrigger>
      <TooltipContent>Quanto da renda ainda pode ir para cada tipo de produto.</TooltipContent>
    </Tooltip>
  )
  const margens = (
    <>
      <Campo label="Empréstimo Consignado" required {...reais(r, "1.250,00")} />
      <Campo label="Cartão Consignado (RMC)" required {...reais(r, "150,00")} />
      <Campo label="Cartão Benefício (RCC)" required {...reais(r, "150,00")} />
    </>
  )
  const descontos = (
    <>
      <Campo label="Débitos concorrentes" {...reais(r)} />
      <Campo label="Pensão alimentícia" {...reais(r)} />
    </>
  )

  // Refinamento: os 15 campos em grupos com título próprio (Proximidade, Região comum) e a IN100 no cabeçalho, junto do que ela preenche.
  if (r)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Benefício{a.matriculas.length > 1 && ` ${indice + 1}`}</CardTitle>
          {remocao && <CardAction>{remocao}</CardAction>}
        </CardHeader>
        <CardContent>
          <Secoes>
            <Secao titulo="Dados do benefício">
              <Linha className="md:grid-cols-6">{matriculaCampo}{tipo}</Linha>
              <Linha className="md:grid-cols-3">{uf}{concessaoCampo}{renda}</Linha>
            </Secao>
            <Secao titulo="Recebimento">
              <Linha className="md:grid-cols-2">{banco}{diaUtil}</Linha>
              {magnetico}
            </Secao>
            <Secao titulo="Margens disponíveis" extra={sobreMargens}><Linha className="md:grid-cols-3">{margens}</Linha></Secao>
            <Secao titulo="Descontos"><Linha className="md:grid-cols-2">{descontos}</Linha></Secao>
          </Secoes>
        </CardContent>
      </Card>
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benefício{a.matriculas.length > 1 && ` ${indice + 1}`}</CardTitle>
        {remocao && <CardAction>{remocao}</CardAction>}
      </CardHeader>
      <CardContent>
        <FieldGroup className="grid gap-(--gap-2xl) md:grid-cols-6">
          {matriculaCampo}
          {tipo}
          {uf}
          {renda}
          {diaUtil}
          {concessaoCampo}
          {banco}
          {magnetico}
          <FieldSet className="md:col-span-6">
            <FieldLegend variant="label" className="flex items-center gap-(--gap-xs)">Margens disponíveis{sobreMargens}</FieldLegend>
            <div className="grid gap-(--gap-2xl) md:grid-cols-3">{margens}</div>
          </FieldSet>
          <FieldSet className="md:col-span-6">
            <FieldLegend variant="label">Descontos (opcionais)</FieldLegend>
            <div className="grid gap-(--gap-2xl) md:grid-cols-2">{descontos}</div>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}


export function FinalizarAtendimento() {
  const { reiniciar } = useAtendimento()
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant="link" className="self-start px-0" />}>Finalizar atendimento</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar o atendimento?</AlertDialogTitle>
          <AlertDialogDescription>O que foi preenchido até aqui será descartado e a digitação volta ao início.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuar atendendo</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={reiniciar}>Finalizar atendimento</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
