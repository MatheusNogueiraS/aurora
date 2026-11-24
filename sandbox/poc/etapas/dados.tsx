import * as React from "react"
import { ArrowDownIcon, HouseIcon, LandmarkIcon, UserRoundIcon, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/toast"
import { Campo, Informacao, Linha, Opcoes, Secao, Secoes, useAtendimento, validar } from "../estado"
import { useRefino } from "../refino"
import { FinalizarAtendimento } from "./identificacao"

const estadosCivis = ["Solteira(o)", "Casada(o)", "União estável", "Divorciada(o)", "Viúva(o)"]
const comConjuge = ["Casada(o)", "União estável"]
const documentos = ["Carteira de identidade", "CNH", "Passaporte"]
const orgaos = ["SSP", "Detran", "Polícia Federal"]
const escolaridade = ["Fundamental incompleto", "Fundamental completo", "Segundo grau completo", "Superior completo"]
const ufs = ["SP", "RJ", "MG", "RS", "PR", "BA"]

function Titulo({ icone: Icone, children }: { icone: LucideIcon; children: React.ReactNode }) {
  return <CardTitle className="flex items-center gap-(--gap-sm)"><Icone className="size-(--size-md)" />{children}</CardTitle>
}

export function Dados() {
  const { a, avancar } = useAtendimento()
  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validar(e.currentTarget)) avancar()
  }
  return (
    <form id="form-dados" noValidate onSubmit={enviar} className="flex flex-col gap-(--gap-2xl)">
      <DadosPessoais />
      <Endereco />
      {a.matriculas.map((m) => <DadosBancarios key={m} matricula={m} />)}
      <Card size="sm">
        <CardHeader>
          <Titulo icone={LandmarkIcon}>Bancos conveniados</Titulo>
          <CardAction>
            <Button type="button" variant="outline" size="sm" onClick={() => toast.add({ title: "Bancos conveniados", description: "O cadastro de convênio não faz parte desta POC." })}>Adicionar</Button>
          </CardAction>
        </CardHeader>
      </Card>
      <FinalizarAtendimento />
    </form>
  )
}

function DadosPessoais() {
  const { a } = useAtendimento()
  const [civil, setCivil] = React.useState(estadosCivis[0])
  const temConjuge = comConjuge.includes(civil)
  const r = useRefino()
  const mae = <Campo label="Nome da mãe" required defaultValue="Antonieta Pereira" />
  const pai = <Campo label="Nome do pai" defaultValue="Márcio da Silva" />
  const tipoDoc = <Opcoes label="Tipo de documento*" opcoes={documentos} defaultValue={documentos[0]} />
  const documento = <Campo label="Documento" required defaultValue="12.456.798" />
  const emissao = <Campo label="Data da emissão" required defaultValue="12/05/2021" placeholder="dd/mm/aaaa" />
  const orgao = <Opcoes label="Órgão emissor*" opcoes={orgaos} defaultValue="SSP" />
  const uf = <Opcoes label="UF*" opcoes={ufs} defaultValue="SP" />
  const sexo = <Opcoes label="Sexo*" opcoes={["Feminino", "Masculino"]} defaultValue="Feminino" />
  const nacionalidade = <Opcoes label="Nacionalidade*" opcoes={["Brasileira", "Estrangeira"]} defaultValue="Brasileira" className={r ? undefined : "md:col-span-2"} />
  const estadoNasc = <Opcoes label="Estado de nascimento*" opcoes={ufs} defaultValue="SP" />
  const cidadeNasc = <Opcoes label="Cidade de nascimento*" opcoes={["São Paulo", "Campinas", "Santos"]} defaultValue="São Paulo" />
  const estadoCivil = <Opcoes label="Estado civil*" opcoes={estadosCivis} defaultValue={civil} onValueChange={setCivil} />
  // O nome do cônjuge só é pedido quando o estado civil tem cônjuge.
  const conjuge = <Campo label="Nome do cônjuge" required={temConjuge} disabled={!temConjuge} placeholder={temConjuge ? "" : "Não se aplica"} />
  const celular = <Campo label="Celular" required defaultValue="(11) 99999-9999" type="tel" />
  const telefone = <Campo label="Telefone" defaultValue="(11) 34569-9999" type="tel" />
  const email = <Campo label="E-mail" type="email" className={r ? undefined : "md:col-span-2"} />
  const instrucao = <Opcoes label="Grau de instrução*" opcoes={escolaridade} defaultValue={escolaridade[2]} />
  const libras = (
    <FieldSet>
      <FieldLegend variant="label">Necessidades especiais</FieldLegend>
      <Field orientation="horizontal">
        <Checkbox id="libras" />
        <FieldLabel htmlFor="libras">Comunicação por libras</FieldLabel>
      </Field>
    </FieldSet>
  )
  return (
    <Card>
      <CardHeader><Titulo icone={UserRoundIcon}>Dados pessoais</Titulo></CardHeader>
      <CardContent>
        {r ? (
          // Refinamento: os mesmos campos, na mesma ordem, em grupos com título (Miller, Proximidade), montados como no exemplo Composições do Field.
          <Secoes>
            <Secao titulo="Identificação">
              <Linha className="md:grid-cols-2">
                <Informacao rotulo="CPF cliente" valor={a.cliente.cpf} />
                <Informacao rotulo="Nome completo" valor={a.cliente.nome} />
              </Linha>
              <Linha className="md:grid-cols-2">{mae}{pai}</Linha>
            </Secao>
            <Secao titulo="Documento">
              <Linha className="md:grid-cols-3">{tipoDoc}{documento}{emissao}</Linha>
              <Linha className="md:grid-cols-2">{orgao}{uf}</Linha>
            </Secao>
            <Secao titulo="Nascimento e estado civil">
              <Linha className="md:grid-cols-2">{sexo}{nacionalidade}</Linha>
              <Linha className="md:grid-cols-2">{estadoNasc}{cidadeNasc}</Linha>
              <Linha className="md:grid-cols-2">{estadoCivil}{conjuge}</Linha>
            </Secao>
            <Secao titulo="Contato">
              <Linha className="md:grid-cols-3">{celular}{telefone}{email}</Linha>
            </Secao>
            <Secao titulo="Escolaridade e acessibilidade">
              <Linha className="md:grid-cols-2">{instrucao}{libras}</Linha>
            </Secao>
          </Secoes>
        ) : (
          <FieldGroup className="grid gap-(--gap-2xl) md:grid-cols-2">
            <Campo label="CPF cliente" value={a.cliente.cpf} disabled />
            <Campo label="Nome completo" value={a.cliente.nome} disabled />
            {mae}{pai}{tipoDoc}{documento}{emissao}{orgao}{uf}{sexo}{nacionalidade}{estadoNasc}{cidadeNasc}{estadoCivil}{conjuge}{celular}{telefone}{email}{instrucao}{libras}
          </FieldGroup>
        )}
      </CardContent>
    </Card>
  )
}

function Endereco() {
  const r = useRefino()
  const [semNumero, setSemNumero] = React.useState(false)
  return (
    <Card>
      <CardHeader><Titulo icone={HouseIcon}>Dados de endereço residencial</Titulo></CardHeader>
      <CardContent>
        <FieldGroup className="grid gap-(--gap-2xl) md:grid-cols-6">
          <Campo label="CEP" required defaultValue="12345-000" inputMode="numeric" className="md:col-span-3" />
          <Button variant="link" nativeButton={false} className="self-end justify-self-start md:col-span-3" render={<a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noreferrer" />}>
            Não sei o CEP
          </Button>
          <Campo label="Endereço" required defaultValue="Avenida Central da cidade" className="md:col-span-6" />
          <Campo label="Número" required={!semNumero} disabled={semNumero} defaultValue="123" inputMode="numeric" className="md:col-span-2" />
          {/* Refinamento: a caixa S/N centralizada na altura do campo Número. */}
          <Field orientation="horizontal" className={r ? "h-9 self-end md:col-span-1" : "self-end md:col-span-1"}>
            <Checkbox id="sem-numero" checked={semNumero} onCheckedChange={setSemNumero} />
            <FieldLabel htmlFor="sem-numero">S/N</FieldLabel>
          </Field>
          <Campo label="Complemento" className="md:col-span-3" />
          <Campo label="Bairro" required defaultValue="Centro" className="md:col-span-3" />
          <Campo label="Cidade" required defaultValue="São Paulo" className="md:col-span-3" />
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

function DadosBancarios({ matricula }: { matricula: string }) {
  const [cnc, setCnc] = React.useState("bmg")
  const opcoes = [
    { id: "bmg", banco: "318 - Banco Bmg S.A." },
    { id: "atual", banco: "1 - Banco do Brasil S.A." },
    { id: "outro", banco: "Outro banco" },
  ]
  const r = useRefino()
  const agenciaConta = (
    <>
      <Campo label="Agência" required defaultValue="2056" inputMode="numeric" className="md:col-span-2" />
      <Campo label="Conta" required defaultValue="123456" inputMode="numeric" className="md:col-span-3" />
      <Campo label="DV" required defaultValue="9" inputMode="numeric" maxLength={1} />
    </>
  )
  const cncCampos = (
    <>
      <RadioGroup value={cnc} onValueChange={(v) => setCnc(v as string)} className="md:grid-cols-3">
        {opcoes.map((o) => <Escolha key={o.id} valor={o.id} titulo={o.banco} nome={`cnc-${matricula}`} />)}
      </RadioGroup>
      {cnc === "outro" && (
        <FieldGroup className="grid gap-(--gap-lg) md:grid-cols-4">
          <Opcoes label="Banco*" opcoes={["237 - Banco Bradesco", "341 - Itaú", "104 - Caixa"]} className="md:col-span-2" />
          <Campo label="Agência" required inputMode="numeric" />
          <Campo label="Conta" required inputMode="numeric" />
        </FieldGroup>
      )}
    </>
  )

  // Refinamento: o que o consultor só confere vira texto, não campo apagado; a opção única do Consignado vira informação (H8, Hick).
  if (r)
    return (
      <Card>
        <CardHeader>
          <Titulo icone={LandmarkIcon}>Dados bancários</Titulo>
          <CardAction><Badge variant="outline">Matrícula: {matricula}</Badge></CardAction>
        </CardHeader>
        <CardContent>
          <Secoes>
            <Secao titulo="Conta atual do benefício">
              <Linha className="md:grid-cols-2">
                <Informacao rotulo="Banco" valor="1 - Banco do Brasil S.A." />
                <Informacao rotulo="Modo de recebimento" valor="Conta corrente" />
              </Linha>
              <Linha className="md:grid-cols-6">{agenciaConta}</Linha>
            </Secao>
            <Secao titulo="Nova conta a receber o benefício">
              <Linha className="md:grid-cols-2">
                <Informacao rotulo="Banco" valor="318 - Banco Bmg" />
                <Informacao rotulo="Tipo de conta" valor="Conta corrente" />
              </Linha>
            </Secao>
            <Secao titulo="Para onde vai o crédito">
              <Informacao rotulo="Consignado" valor="1 - Banco do Brasil S.A. (conta atual)" />
              <FieldSet>
                <FieldLegend variant="label">Produtos CNC</FieldLegend>
                {cncCampos}
              </FieldSet>
            </Secao>
          </Secoes>
        </CardContent>
      </Card>
    )

  return (
    <Card>
      <CardHeader>
        <Titulo icone={LandmarkIcon}>Dados bancários</Titulo>
        <CardAction><Badge variant="outline">Matrícula: {matricula}</Badge></CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">Conta atual do benefício</FieldLegend>
            <FieldGroup className="grid gap-(--gap-lg) md:grid-cols-6">
              <Opcoes label="Banco" opcoes={["1 - Banco do Brasil S.A."]} defaultValue="1 - Banco do Brasil S.A." disabled className="md:col-span-3" />
              <Opcoes label="Modo de recebimento" opcoes={["Conta corrente"]} defaultValue="Conta corrente" disabled className="md:col-span-3" />
              {agenciaConta}
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldLegend variant="label" className="flex items-center gap-(--gap-xs)"><ArrowDownIcon aria-hidden className="size-(--size-md) text-brand" />Nova conta a receber o benefício</FieldLegend>
            <FieldGroup className="grid gap-(--gap-lg) md:grid-cols-2">
              <Opcoes label="Banco" opcoes={["318 - Banco Bmg"]} defaultValue="318 - Banco Bmg" disabled />
              <Opcoes label="Tipo de conta" opcoes={["Conta corrente"]} defaultValue="Conta corrente" disabled />
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend variant="label">Conta para receber crédito Consignado</FieldLegend>
            <RadioGroup defaultValue="atual" className="md:grid-cols-3">
              <Escolha valor="atual" titulo="1 - Banco do Brasil S.A." nome={`consig-${matricula}`} />
            </RadioGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend variant="label">Conta para receber crédito de produtos CNC</FieldLegend>
            {cncCampos}
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

// Opção em cartão: o padrão do Field com o rótulo envolvendo o campo.
function Escolha({ valor, titulo, nome }: { valor: string; titulo: string; nome: string }) {
  const id = `${nome}-${valor}`
  const r = useRefino()
  // Refinamento: a ordem da story "Choice card" do Field, com o RadioGroupItem depois do conteúdo.
  return (
    <FieldLabel htmlFor={id}>
      <Field orientation="horizontal">
        {!r && <RadioGroupItem value={valor} id={id} />}
        <FieldContent><FieldTitle>{titulo}</FieldTitle></FieldContent>
        {r && <RadioGroupItem value={valor} id={id} />}
      </Field>
    </FieldLabel>
  )
}
