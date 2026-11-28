import type { Meta, StoryObj } from "@storybook/react-vite"
import { Fragment } from "react"
import { useArgs } from "storybook/preview-api"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Simula, estadoDe, pagina, vitrine } from "./Opcoes"

const pessoas = ["Ana Souza", "Bruno Lima", "Carla Dias", "Diego Rocha", "Elisa Prado", "Fábio Nunes"]
const grupos = [
  { value: "Favoritos", items: ["Ana Souza", "Bruno Lima", "Carla Dias"] },
  { value: "Recentes", items: ["Diego Rocha", "Elisa Prado", "Fábio Nunes"] },
]

const lados = ["bottom", "top"] as const
type Lado = (typeof lados)[number]
const alinhamentos = ["start", "center", "end"] as const
type Alinhamento = (typeof alinhamentos)[number]
// Um State só, como no Figma: Disabled e Invalid são estados, não controles à parte.
const estados = ["Default", "Focus", "Disabled", "Invalid"] as const

type Controles = { aberto: boolean; side: Lado; align: Alinhamento; agrupado: boolean; seta: boolean; limpar: boolean; campoTipo: "Input" | "Chips"; estado: (typeof estados)[number] }

const lista = (agrupado: boolean) =>
  agrupado ? (
    <ComboboxList>
      {(grupo: (typeof grupos)[number], i: number) => (
        <ComboboxGroup key={grupo.value} items={grupo.items}>
          <ComboboxLabel>{grupo.value}</ComboboxLabel>
          <ComboboxCollection>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxCollection>
          {i < grupos.length - 1 && <ComboboxSeparator />}
        </ComboboxGroup>
      )}
    </ComboboxList>
  ) : (
    <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
  )

const campo = ({ side = "bottom", align = "start", agrupado, seta, limpar, disabled, invalido }: Omit<Controles, "aberto" | "estado" | "side" | "align" | "campoTipo"> & { side?: Lado; align?: Alinhamento; disabled?: boolean; invalido?: boolean }, raiz: { open?: boolean; onOpenChange?: (o: boolean) => void; defaultOpen?: boolean; defaultValue?: string; defaultInputValue?: string } = {}) => (
  <Combobox items={agrupado ? grupos : pessoas} {...raiz}>
    <ComboboxInput placeholder="Buscar pessoa" aria-label="Pessoa" showTrigger={seta} showClear={limpar || undefined} disabled={disabled || undefined} aria-invalid={invalido || undefined} className="w-64" />
    <ComboboxContent side={side === "bottom" ? undefined : side} align={align === "start" ? undefined : align}>
      <ComboboxEmpty>Ninguém encontrado.</ComboboxEmpty>
      {lista(agrupado)}
    </ComboboxContent>
  </Combobox>
)

const base = { agrupado: false, seta: true, limpar: false, campoTipo: "Input" as const }

// O exemplo do shadcn de várias escolhas: cada pessoa escolhida vira um chip dentro do campo.
function Multiplo({ aberto, open, onOpenChange }: { aberto?: boolean; open?: boolean; onOpenChange?: (o: boolean) => void }) {
  const ancora = useComboboxAnchor()
  return (
    <Combobox multiple items={pessoas} defaultValue={["Bruno Lima", "Carla Dias"]} defaultOpen={aberto} open={open} onOpenChange={onOpenChange}>
      <ComboboxChips ref={ancora} className="w-80">
        <ComboboxValue>
          {(valores: string[]) => (
            <Fragment>
              {valores.map((v) => <ComboboxChip key={v}>{v}</ComboboxChip>)}
              <ComboboxChipsInput placeholder="Adicionar pessoa" aria-label="Adicionar pessoa" />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={ancora}>
        <ComboboxEmpty>Ninguém encontrado.</ComboboxEmpty>
        {lista(false)}
      </ComboboxContent>
    </Combobox>
  )
}

const meta = {
  title: "Componentes/Combobox",
  // Abrir e fechar na amostra atualiza o controle Open.
  render: function Amostra({ aberto, campoTipo, ...args }) {
    const [, atualizar] = useArgs<Controles>()
    const raiz = { open: aberto, onOpenChange: (o: boolean) => atualizar({ aberto: o }) }
    return campoTipo === "Chips" ? <Multiplo {...raiz} /> : campo({ ...args, disabled: args.estado === "Disabled", invalido: args.estado === "Invalid" }, raiz)
  },
  parameters: pagina("Campo com busca que filtra uma lista enquanto se digita, para escolher entre muitas opções. O campo é um InputGroup e a lista tem o visual do Select. Na amostra, digite ou use o controle **Open**; as opções abertas embaixo rodam no próprio quadro."),
  argTypes: {
    aberto: { name: "Open", control: "boolean", description: "No código, `open` no `Combobox` (ou `defaultOpen`).", table: { category: "Estado" } },
    side: { name: "Side", if: { arg: "campoTipo", eq: "Input" }, control: "inline-radio", options: lados, description: "No código, `side` no `ComboboxContent`: a lista abre embaixo ou em cima do campo.", table: { category: "Aparência" } },
    align: { name: "Align", if: { arg: "campoTipo", eq: "Input" }, control: "inline-radio", options: alinhamentos, description: "No código, `align`. Sem a propriedade, a lista alinha ao começo do campo (`start`). Ela é um pouco mais larga que o campo.", table: { category: "Aparência" } },
    estado: { name: "State", if: { arg: "campoTipo", eq: "Input" }, control: "inline-radio", options: estados, description: "Focus é simulado: com o campo focado, ele ganha a borda e o anel do InputGroup. Disabled é `disabled` no `ComboboxInput`. Invalid é `aria-invalid` no `ComboboxInput`: borda de erro.", table: { category: "Estado" } },
    agrupado: { name: "Groups", if: { arg: "campoTipo", eq: "Input" }, control: "boolean", description: "`items` em grupos: cada `ComboboxGroup` com `ComboboxLabel` e `ComboboxCollection`, separados por `ComboboxSeparator`.", table: { category: "Conteúdo" } },
    seta: { name: "Trigger", if: { arg: "campoTipo", eq: "Input" }, control: "boolean", description: "`showTrigger` no `ComboboxInput`: o botão de seta que abre a lista.", table: { category: "Conteúdo" } },
    limpar: { name: "Clear", if: { arg: "campoTipo", eq: "Input" }, control: "boolean", description: "`showClear`: um X que apaga a escolha. Com algo escolhido, ele aparece no lugar da seta.", table: { category: "Conteúdo" } },
    campoTipo: { name: "Field", control: "inline-radio", options: ["Input", "Chips"], description: "O campo: `ComboboxInput` ou, com `multiple` no `Combobox`, `ComboboxChips`, com um chip por escolha e o `ComboboxChipsInput` para buscar, e a seta vem ligada (`showTrigger`). Os controles Trigger, Clear e State valem para o `ComboboxInput`.", table: { category: "Conteúdo" } },
  },
  args: { aberto: false, side: "bottom", align: "start", ...base, estado: "Default" },
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  name: "Padrão",
  decorators: [(Historia, { args }) => <Simula estado={args.campoTipo === "Chips" ? "Default" : estadoDe(args)} so="[data-slot=input-group-control]"><Historia /></Simula>],
}

export const Lista: Story = {
  name: "Lista aberta",
  parameters: vitrine("A lista aberta embaixo do campo. A pessoa escolhida ganha o ✓; a da vez, pelo mouse ou pelas setas, ganha fundo `muted`.", 320),
  render: () => campo(base, { defaultOpen: true, defaultValue: "Bruno Lima" }),
}

export const Grupos: Story = {
  name: "Grupos",
  parameters: vitrine("O exemplo do shadcn com grupos: rótulo em cima de cada grupo e separador entre eles.", 480),
  render: () => campo({ ...base, agrupado: true }, { defaultOpen: true }),
}

export const Vazio: Story = {
  name: "Sem resultado",
  parameters: vitrine("`ComboboxEmpty`: a mensagem que aparece quando nada combina com a busca.", 200),
  render: () => campo(base, { defaultOpen: true, defaultInputValue: "Zé" }),
}

export const ComLimpar: Story = {
  name: "Limpar",
  parameters: vitrine("Com `showClear` e algo escolhido, o X aparece no lugar da seta."),
  render: () => campo({ ...base, limpar: true }, { defaultValue: "Ana Souza" }),
}

export const Varios: Story = {
  name: "Multiple",
  parameters: vitrine("O exemplo do shadcn com `multiple`: as escolhas viram chips (`ComboboxChip`) dentro de `ComboboxChips`, e o `X` de cada um a tira (`showRemove={false}` no `ComboboxChip` esconde o X). No fim, a mesma seta do campo simples abre a lista (`showTrigger`, ligado por padrão no `ComboboxChips`). O campo fica numa linha: o que não cabe rola na horizontal, sem barra, com um esmaecido no fim. A lista se prende aos chips por `useComboboxAnchor`.", 360),
  render: () => <Multiplo aberto />,
}

export const Composicoes: Story = {
  name: "Composições",
  parameters: vitrine("Os exemplos do shadcn: um botão como gatilho (`ComboboxTrigger` com um `Button`, mostrando a escolha com `ComboboxValue`) e o campo dentro de um `Field`. Clique para abrir."),
  render: () => (
    <div className="flex flex-wrap items-start gap-(--gap-3xl)">
      <Combobox items={["Novembro", "Dezembro", "Janeiro"]} defaultValue="Novembro">
        <ComboboxTrigger render={<Button variant="outline" />}><ComboboxValue /></ComboboxTrigger>
        <ComboboxContent><ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent>
      </Combobox>
      <Field className="w-64">
        <FieldLabel htmlFor="combo-pessoa">Favorecido</FieldLabel>
        <Combobox items={pessoas}>
          <ComboboxInput id="combo-pessoa" placeholder="Buscar pessoa" />
          <ComboboxContent><ComboboxEmpty>Ninguém encontrado.</ComboboxEmpty>{lista(false)}</ComboboxContent>
        </Combobox>
        <FieldDescription>Para quem o dinheiro vai.</FieldDescription>
      </Field>
    </div>
  ),
}
