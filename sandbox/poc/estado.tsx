import * as React from "react"
import { ImageIcon } from "lucide-react"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useRefino } from "./refino"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"

/* ---------- etapas ---------- */

export const etapas = [
  { id: "identificacao", titulo: "Identificação" },
  { id: "simulacao", titulo: "Simulação" },
  { id: "dados", titulo: "Dados" },
  { id: "resumo", titulo: "Resumo" },
  { id: "formalizacao", titulo: "Formalização" },
] as const
export type EtapaId = (typeof etapas)[number]["id"]

/* ---------- produtos ---------- */

export type Produto = {
  id: string
  matricula: string
  nome: string
  detalhe: string
  valor: number
  prazo?: number
  seguro?: boolean
  saque?: number
}
export type Escolha = { valor: number; prazo?: number }

// Ofertas fictícias, as mesmas do Figma para qualquer matrícula.
export const ofertas = (matricula: string): Produto[] => [
  { id: `${matricula}-credito`, matricula, nome: "Crédito na Conta", detalhe: "Port. de benefício para Bmg", valor: 4637.77, prazo: 15, seguro: true },
  { id: `${matricula}-saque`, matricula, nome: "Saque Complementar", detalhe: "Cartão Consignado", valor: 530 },
  { id: `${matricula}-cartao`, matricula, nome: "Cartão Benefício", detalhe: "Saque Autorizado", valor: 3000, saque: 900 },
]

// shortcut: taxa fixa e fictícia de 1,79% a.m. (Tabela Price); trocar pela simulação real do backend.
export const parcela = (valor: number, prazo: number) => {
  const i = 0.0179
  return (valor * i) / (1 - (1 + i) ** -prazo)
}

export const semItem = (carrinho: Record<string, Escolha>, id: string) => Object.fromEntries(Object.entries(carrinho).filter(([k]) => k !== id))

export const brl =(n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// Copia para a área de transferência e avisa também quando o navegador recusa.
export const copiar = (texto: string, titulo: string, description?: string) =>
  navigator.clipboard
    .writeText(texto)
    .then(() => toast.add({ type: "success", title: titulo, description }))
    .catch(() => toast.add({ type: "error", title: "Não deu para copiar", description: "O navegador bloqueou a área de transferência. Copie à mão." }))

// setTimeout que é cancelado quando o componente sai da tela.
export function useAtraso() {
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  return (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(fn, ms)
  }
}

/* ---------- estado do atendimento ---------- */

type Atendimento = {
  etapa: EtapaId
  concluidas: EtapaId[]
  cliente: { nome: string; cpf: string }
  matriculas: string[]
  carrinho: Record<string, Escolha>
}

// A etapa fica na URL (#simulacao, #dados...) para dar para linkar uma tela e recarregar nela.
const inicial = (naUrl = Math.max(0, etapas.findIndex((e) => `#${e.id}` === window.location.hash))): Atendimento => ({
  etapa: etapas[naUrl].id,
  concluidas: etapas.slice(0, naUrl).map((e) => e.id),
  cliente: { nome: "Maria Dolores de Almeida Silva", cpf: "123.456.789-00" },
  matriculas: ["187235147"],
  // Quem abre direto numa etapa depois da simulação já encontra os dois produtos do Figma no carrinho.
  carrinho: naUrl > 1 ? { "187235147-credito": { valor: 4637.77, prazo: 15 }, "187235147-saque": { valor: 530 } } : {},
})

type Contexto = {
  a: Atendimento
  set: React.Dispatch<React.SetStateAction<Atendimento>>
  ir: (etapa: EtapaId) => void
  avancar: () => void
  produtos: Produto[]
  reiniciar: () => void
}
const Ctx = React.createContext<Contexto | null>(null)
export const useAtendimento = () => React.useContext(Ctx)!

export function AtendimentoProvider({ children, onReiniciar }: { children: React.ReactNode; onReiniciar: () => void }) {
  const [a, set] = React.useState(() => inicial())
  const ir = React.useCallback((etapa: EtapaId) => {
    set((s) => ({ ...s, etapa }))
    window.history.replaceState(null, "", `#${etapa}`)
    window.scrollTo({ top: 0 })
  }, [])
  const avancar = () => {
    const i = etapas.findIndex((e) => e.id === a.etapa)
    set((s) => ({ ...s, concluidas: [...new Set([...s.concluidas, s.etapa])] }))
    ir(etapas[Math.min(i + 1, etapas.length - 1)].id)
  }
  const produtos = a.matriculas.flatMap(ofertas)
  const reiniciar = () => {
    window.history.replaceState(null, "", "#identificacao")
    onReiniciar()
  }
  return <Ctx.Provider value={{ a, set, ir, avancar, produtos, reiniciar }}>{children}</Ctx.Provider>
}

/* ---------- validação ---------- */

// Marca os obrigatórios vazios com aria-invalid (o estilo de erro dos campos) e leva o foco ao primeiro.
export function validar(form: HTMLFormElement | null) {
  if (!form) return true
  const campos = [...form.querySelectorAll<HTMLInputElement>("input, textarea")]
  const invalidos = campos.filter((c) => !c.disabled && !c.checkValidity())
  campos.forEach((c) => c.toggleAttribute("aria-invalid", invalidos.includes(c)))
  if (invalidos.length) {
    invalidos[0].focus()
    toast.add({ type: "error", title: "Faltam campos obrigatórios", description: `${invalidos.length} campo(s) para preencher.` })
  }
  return invalidos.length === 0
}

/* ---------- peças que se repetem ---------- */

type CampoProps = React.ComponentProps<typeof Input> & { label: string; className?: string; prefixo?: string }

export function Campo({ label, className, id, prefixo, ...props }: CampoProps) {
  const auto = React.useId()
  const r = useRefino()
  // Refinamento: o campo diz o que falta no estado de erro do Field, em vez de um aviso geral de obrigatórios.
  const [erro, setErro] = React.useState("")
  const marcar = (e: React.FormEvent<HTMLInputElement>) => setErro(e.currentTarget.validity.valueMissing ? "Campo obrigatório." : "Confira o valor digitado.")
  const limpar = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.removeAttribute("aria-invalid")
    setErro("")
  }
  // Campo desligado (cônjuge sem estado civil com cônjuge, número com S/N) não mostra o erro antigo.
  const mostrar = r && erro && !props.disabled
  const campo = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (props.disabled) campo.current?.removeAttribute("aria-invalid")
  }, [props.disabled])
  return (
    <Field className={className} data-invalid={mostrar ? true : undefined}>
      <FieldLabel htmlFor={id ?? auto}><Rotulo texto={label} obrigatorio={props.required} /></FieldLabel>
      {prefixo ? (
        <InputGroup>
          <InputGroupAddon><InputGroupText>{prefixo}</InputGroupText></InputGroupAddon>
          <InputGroupInput ref={campo} id={id ?? auto} onInput={limpar} onInvalid={marcar} {...props} />
        </InputGroup>
      ) : (
        <Input ref={campo} id={id ?? auto} onInput={limpar} onInvalid={marcar} {...props} />
      )}
      {mostrar && <FieldError>{erro}</FieldError>}
    </Field>
  )
}

// Valor em reais: no refinamento o "R$" vira prefixo fixo, como na janela de edição da simulação.
export const reais = (refinado: boolean, valor = "") =>
  refinado ? { prefixo: "R$", inputMode: "decimal" as const, ...(valor ? { defaultValue: valor } : { placeholder: "0,00" }) }
    : { inputMode: "decimal" as const, ...(valor ? { defaultValue: `R$ ${valor}` } : { placeholder: "R$ 0,00" }) }

/* ---------- peças do refinamento: montagens documentadas do DS ---------- */

// Grupos de um formulário como no exemplo Composições do Field: FieldGroup com FieldSets e um FieldSeparator entre eles.
export function Secoes({ children }: { children: React.ReactNode }) {
  return (
    <FieldGroup>
      {React.Children.toArray(children).map((secao, i) => (
        <React.Fragment key={i}>
          {/* shortcut: a linha do FieldSeparator fica transparente e só o espaço dela separa os grupos. Quebra o
              componente de propósito; voltar ao FieldSeparator puro quando o DS tiver a separação sem linha. */}
          {i > 0 && <FieldSeparator className="*:data-[slot=separator]:bg-transparent" />}
          {secao}
        </React.Fragment>
      ))}
    </FieldGroup>
  )
}

// Um grupo: FieldSet > FieldLegend (variant padrão) > FieldGroup com os campos.
export function Secao({ titulo, extra, children }: { titulo: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <FieldSet>
      <FieldLegend className={extra ? "flex items-center gap-(--gap-xs)" : undefined}>{titulo}{extra}</FieldLegend>
      <FieldGroup>{children}</FieldGroup>
    </FieldSet>
  )
}

// Campos lado a lado: a linha em grid com gap-lg, como nos exemplos do Field.
export function Linha({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid gap-(--gap-lg)", className)}>{children}</div>
}

// Dado que só se lê: um Item muted, com o valor no título e o nome na descrição.
export function Informacao({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <Item variant="muted" size="sm">
      <ItemContent>
        <ItemTitle>{valor}</ItemTitle>
        <ItemDescription>{rotulo}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

// Asterisco de obrigatório: no refinamento, o da story do Input (vermelho, separado por um espaço).
export function Rotulo({ texto, obrigatorio }: { texto: string; obrigatorio?: boolean }) {
  const r = useRefino()
  if (!obrigatorio) return texto
  return r ? <>{texto} <span className="text-danger">*</span></> : `${texto}*`
}

export function Opcoes({ label, opcoes, defaultValue, disabled, className, onValueChange }: { label: string; opcoes: string[]; defaultValue?: string; disabled?: boolean; className?: string; onValueChange?: (v: string) => void }) {
  const r = useRefino()
  const id = React.useId()
  const obrigatorio = label.endsWith("*")
  const texto = obrigatorio ? label.slice(0, -1) : label
  // O Select do Base UI tem um input escondido com required: o validar o encontra; aqui só se mostra o erro.
  const entrada = React.useRef<HTMLInputElement>(null)
  const [faltando, setFaltando] = React.useState(false)
  React.useEffect(() => {
    const el = entrada.current
    if (!el) return
    const marcar = () => setFaltando(true)
    el.addEventListener("invalid", marcar)
    return () => el.removeEventListener("invalid", marcar)
  }, [])
  const erro = r && faltando && !disabled
  // Refinamento: o FieldLabel aponta para o SelectTrigger, como na story do Field com Select (clicar no nome abre a lista).
  return (
    <Field className={className} data-disabled={disabled} data-invalid={erro || undefined}>
      <FieldLabel htmlFor={r ? id : undefined}><Rotulo texto={texto} obrigatorio={obrigatorio} /></FieldLabel>
      <Select inputRef={entrada} required={obrigatorio} defaultValue={defaultValue} disabled={disabled} onValueChange={(v) => { setFaltando(false); onValueChange?.(v as string) }}>
        <SelectTrigger className="w-full" id={r ? id : undefined} aria-label={r ? undefined : texto} aria-invalid={erro || undefined}><SelectValue placeholder="Selecione" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>{opcoes.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

const LIMITE = 2048 * 1024
const ACEITOS = ["image/jpeg", "image/png", "application/pdf"]

export function Anexo({ titulo = "Adicionar documento" }: { titulo?: string }) {
  const [arquivo, setArquivo] = React.useState<File | null>(null)
  const [erro, setErro] = React.useState("")
  const ref = React.useRef<HTMLInputElement>(null)
  const escolher = (f?: File) => {
    if (!f) return
    const problema = !ACEITOS.includes(f.type) ? "Formato não aceito. Use JPG, JPEG, PNG ou PDF." : f.size > LIMITE ? "O arquivo passa de 2.048 Kb." : ""
    if (problema) {
      setArquivo(null)
      return setErro(problema)
    }
    setErro("")
    setArquivo(f)
  }
  const estado = erro ? "error" : arquivo ? "success" : "idle"
  return (
    <Attachment state={estado} className="w-full">
      <AttachmentMedia><ImageIcon /></AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{arquivo ? arquivo.name : titulo}</AttachmentTitle>
        <AttachmentDescription>{erro || (arquivo ? "Clique para trocar o arquivo" : "Máximo 2.048 Kb (JPG, JPEG, PNG ou PDF)")}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentTrigger onClick={() => ref.current?.click()} aria-label={titulo} />
      <input ref={ref} type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => escolher(e.target.files?.[0])} />
    </Attachment>
  )
}
