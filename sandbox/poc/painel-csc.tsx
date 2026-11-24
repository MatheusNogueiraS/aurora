import * as React from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { toast } from "@/components/ui/toast"
import { Anexo, Campo, Opcoes, reais, Secao, Secoes } from "./estado"
import { useRefino } from "./refino"

const necessidades = ["Médico/hospital", "Reforma da casa", "Quitar dívidas", "Viagem", "Educação", "Outra"]
const bancos = ["Banco do Brasil", "Bradesco", "Caixa", "Itaú", "Santander", "Bmg", "Outro"]

export function PainelCsc() {
  return (
    <Card size="sm" className="w-full shrink-0 xl:w-80">
      <CardContent>
        <Tabs defaultValue="csc">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="csc">CSC</TabsTrigger>
            <TabsTrigger value="argumento">Argumento</TabsTrigger>
            <TabsTrigger value="insight">Insight</TabsTrigger>
          </TabsList>
          <TabsContent value="csc" className="pt-(--padding-lg)"><Csc /></TabsContent>
          {/* O Figma não mostra o conteúdo destas abas: ficam como vazias até alguém desenhar. */}
          <TabsContent value="argumento"><SemConteudo /></TabsContent>
          <TabsContent value="insight"><SemConteudo /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function SemConteudo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Sem conteúdo ainda</EmptyTitle>
        <EmptyDescription>Esta aba não está desenhada no Figma de referência.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function Csc() {
  const r = useRefino()
  const [renda, setRenda] = React.useState<"sim" | "nao">("sim")
  const camposRenda = (
    <>
      <Campo label="Atividade" defaultValue="Assistente no mercado" />
      <Campo label="Valor da renda" {...reais(r, "2.123,00")} />
      <Field>
        <FieldLabel>Comprovante de renda</FieldLabel>
        <Anexo titulo="Adicionar comprovante" />
      </Field>
    </>
  )
  const historico = (
    <div className="flex items-center gap-(--gap-sm)">
      <ToggleGroup defaultValue={["atual"]} variant="outline" size="sm" aria-label="Qual CSC ver">
        <ToggleGroupItem value="atual">Atual</ToggleGroupItem>
        <ToggleGroupItem value="ultimo">Último</ToggleGroupItem>
      </ToggleGroup>
      <Button variant="link" size="sm" className="ml-auto" onClick={() => toast.add({ title: "Histórico de CSC", description: "A lista completa não faz parte desta POC." })}>Todos</Button>
    </div>
  )

  // Refinamento: um grupo por assunto, montado como no exemplo Composições do Field (FieldSets com FieldSeparator).
  if (r)
    return (
      <FieldGroup>
        {historico}
        <Secoes>
          <Secao titulo="Necessidades imediatas"><Necessidades rotulo="Necessidade imediata" atendida /></Secao>
          <Secao titulo="Necessidades futuras"><Necessidades rotulo="Necessidade futura" /></Secao>
          <Secao titulo="Patrimônio e renda">
          <SimNao pergunta="Tem imóvel?" />
          <SimNao pergunta="Tem veículo?" />
          <SimNao pergunta="Tem plano de saúde?" />
          <SimNao pergunta="Tem investimentos?" />
          <SimNao pergunta="Tem renda adicional?" inicial={renda} aoMudar={setRenda} />
        </Secao>
        {/* Refinamento: os dados da renda adicional formam um bloco próprio, separado do grupo das perguntas e sem título. */}
        {renda === "sim" && (
          <Card size="sm">
            <CardContent><FieldGroup>{camposRenda}</FieldGroup></CardContent>
          </Card>
        )}
        <Secao titulo="Outras informações">
          <Opcoes label="Banco principal do cliente" opcoes={bancos} defaultValue="Itaú" />
          <Field>
            <FieldLabel htmlFor="obs-gerais">Observações gerais</FieldLabel>
            <Textarea id="obs-gerais" />
          </Field>
        </Secao>
        </Secoes>
      </FieldGroup>
    )

  return (
    <FieldGroup>
      <div className="flex items-center gap-(--gap-sm)">
        <ToggleGroup defaultValue={["atual"]} variant="outline" size="sm" aria-label="Qual CSC ver">
          <ToggleGroupItem value="atual">Atual</ToggleGroupItem>
          <ToggleGroupItem value="ultimo">Último</ToggleGroupItem>
        </ToggleGroup>
        <Button variant="link" size="sm" className="ml-auto" onClick={() => toast.add({ title: "Histórico de CSC", description: "A lista completa não faz parte desta POC." })}>Todos</Button>
      </div>

      <FieldSet>
        <FieldLegend>Necessidades</FieldLegend>
        <Necessidades rotulo="Necessidades imediatas" atendida />
        <Necessidades rotulo="Necessidades futuras" />
      </FieldSet>

      <SimNao pergunta="Tem imóvel?" />
      <SimNao pergunta="Tem veículo?" />
      <SimNao pergunta="Tem plano de saúde?" />
      <SimNao pergunta="Tem investimentos?" />
      <SimNao pergunta="Tem renda adicional?" inicial="sim">{camposRenda}</SimNao>

      <FieldSet>
        <FieldLegend>Banco principal</FieldLegend>
        <Opcoes label="Banco principal do cliente" opcoes={bancos} defaultValue="Itaú" />
      </FieldSet>

      <FieldSet>
        <FieldLegend>Observações</FieldLegend>
        <Textarea placeholder="Observações gerais" aria-label="Observações gerais" />
      </FieldSet>
    </FieldGroup>
  )
}

function Necessidades({ rotulo, atendida }: { rotulo: string; atendida?: boolean }) {
  const [ids, setIds] = React.useState([1])
  const r = useRefino()
  const remover = (id: number, i: number) => (
    <Button variant="ghost" size="icon" aria-label={`Remover ${rotulo.toLowerCase()} ${i + 1}`} onClick={() => setIds(ids.filter((x) => x !== id))}><Trash2Icon /></Button>
  )
  const adicionar = (
    <Button variant="link" className="justify-start px-0" onClick={() => setIds([...ids, Math.max(...ids) + 1])}>
      <PlusIcon /> Adicionar necessidade
    </Button>
  )
  // Refinamento: cada necessidade é um Card sm do DS, com o número no título e a remoção no CardAction (Região comum).
  if (r)
    return (
      <FieldGroup>
        {ids.map((id, i) => (
          <Card key={id} size="sm">
            <CardHeader>
              <CardTitle>Necessidade {i + 1}</CardTitle>
              {ids.length > 1 && <CardAction>{remover(id, i)}</CardAction>}
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Opcoes label="Tipo de necessidade" opcoes={necessidades} defaultValue={i === 0 ? "Médico/hospital" : undefined} />
                <Field>
                  <FieldLabel htmlFor={`obs-${rotulo}-${id}`}>Observações</FieldLabel>
                  <Textarea id={`obs-${rotulo}-${id}`} defaultValue={i === 0 ? "Precisa pagar exames do oftalmo." : ""} />
                </Field>
                <Campo label="Valor" {...reais(r, i === 0 ? "200,00" : "")} />
                {atendida && <SimNao pergunta="Necessidade atendida?" inicial="sim" />}
              </FieldGroup>
            </CardContent>
          </Card>
        ))}
        {adicionar}
      </FieldGroup>
    )
  return (
    <FieldGroup>
      {ids.map((id, i) => (
        <FieldGroup key={id} className="gap-(--gap-lg)">
          <div className="flex items-end gap-(--gap-xs)">
            <Opcoes label={`${rotulo} ${i + 1}`} opcoes={necessidades} defaultValue={i === 0 ? "Médico/hospital" : undefined} className="flex-1" />
            {ids.length > 1 && remover(id, i)}
          </div>
          <Field>
            <FieldLabel htmlFor={`obs-${rotulo}-${id}`}>Observações {i + 1}</FieldLabel>
            <Textarea id={`obs-${rotulo}-${id}`} defaultValue={i === 0 ? "Precisa pagar exames do oftalmo." : ""} />
          </Field>
          <Campo label="Valor" {...reais(r, i === 0 ? "200,00" : "")} />
          {atendida && <SimNao pergunta="Necessidade atendida?" inicial="sim" legenda="label" />}
        </FieldGroup>
      ))}
      {adicionar}
    </FieldGroup>
  )
}

function SimNao({ pergunta, inicial = "nao", legenda = "legend", aoMudar, children }: { pergunta: string; inicial?: "sim" | "nao"; legenda?: "legend" | "label"; aoMudar?: (v: "sim" | "nao") => void; children?: React.ReactNode }) {
  const [valor, setValorInterno] = React.useState(inicial)
  const setValor = (v: "sim" | "nao") => {
    setValorInterno(v)
    aoMudar?.(v)
  }
  const id = React.useId()
  const r = useRefino()
  const opcoes = (
    <>
      <Field orientation="horizontal" className="w-auto">
        <RadioGroupItem value="sim" id={`${id}-sim`} />
        <FieldLabel htmlFor={`${id}-sim`}>Sim</FieldLabel>
      </Field>
      <Field orientation="horizontal" className="w-auto">
        <RadioGroupItem value="nao" id={`${id}-nao`} />
        <FieldLabel htmlFor={`${id}-nao`}>Não</FieldLabel>
      </Field>
    </>
  )
  // Refinamento: pergunta à esquerda e Sim/Não à direita, numa linha; o espaço entre as perguntas é o do FieldGroup.
  // Nota: esta linha é montada à mão. O DS não tem um jeito documentado de pôr um RadioGroup ao lado da pergunta
  // (a story Radio empilha a legenda e as opções, e o RadioGroup não tem orientação horizontal). Rever junto com a
  // documentação do FieldGroup e do FieldSet para o Figma, quando formos mexer no comportamento herdado do shadcn.
  if (r)
    return (
      <div className="flex flex-col gap-(--gap-sm)">
        <div className="flex items-center justify-between gap-(--gap-lg)">
          <span id={`${id}-pergunta`} className="text-label-sm">{pergunta}</span>
          <RadioGroup aria-labelledby={`${id}-pergunta`} value={valor} onValueChange={(v) => setValor(v as "sim" | "nao")} className="flex w-auto gap-(--gap-lg)">{opcoes}</RadioGroup>
        </div>
        {valor === "sim" && children && (
          <Card size="sm">
            <CardContent><FieldGroup>{children}</FieldGroup></CardContent>
          </Card>
        )}
      </div>
    )
  return (
    <FieldSet>
      <FieldLegend variant={legenda}>{pergunta}</FieldLegend>
      <RadioGroup value={valor} onValueChange={(v) => setValor(v as "sim" | "nao")} className="flex gap-(--gap-2xl)">{opcoes}</RadioGroup>
      {valor === "sim" && children && <FieldGroup>{children}</FieldGroup>}
    </FieldSet>
  )
}
