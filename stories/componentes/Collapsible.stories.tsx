import type { Meta, StoryObj } from "@storybook/react-vite"
import { ChevronDownIcon, ChevronRightIcon, ChevronsUpDownIcon, FileIcon, FolderIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useArgs } from "storybook/preview-api"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { pagina, vitrine } from "./Opcoes"

type Controles = { aberto: boolean; disabled: boolean }

const linha = "flex items-center justify-between rounded-2xl border-sm px-(--padding-lg) py-(--padding-sm)"

const meta = {
  title: "Componentes/Collapsible",
  // O exemplo do topo da página do shadcn: um pedido com o status sempre à vista e o resto escondido.
  // Abrir e fechar na amostra atualiza o controle Open.
  render: function Amostra({ aberto, disabled }) {
    const [, atualizar] = useArgs<Controles>()
    return (
      <Collapsible open={aberto} onOpenChange={(open) => atualizar({ aberto: open })} disabled={disabled || undefined} className="flex w-72 flex-col gap-(--gap-sm) text-body-sm">
        <div className="flex items-center justify-between gap-(--gap-lg) px-(--padding-lg)">
          <span className="text-label-sm">Pedido #4189</span>
          <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" aria-label={aberto ? "Esconder itens" : "Mostrar itens"} disabled={disabled || undefined} />}><ChevronsUpDownIcon /></CollapsibleTrigger>
        </div>
        <div className={linha}><span className="text-muted">Status</span><span>Enviado</span></div>
        <CollapsibleContent className="flex flex-col gap-(--gap-sm)">
          <div className={linha}><span className="text-muted">Endereço</span><span>Rua das Flores, 120</span></div>
          <div className={linha}><span className="text-muted">Itens</span><span>2 camisetas</span></div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
  parameters: pagina("**Só no código.** O Collapsible não está no Figma: não tem aparência própria, é só o comportamento de mostrar e esconder um trecho por um gatilho. O visual é do gatilho (aqui, um `Button`) e do conteúdo; no Figma, desenhe o estado fechado e o aberto com esses componentes. Para várias seções que abrem uma por vez, com título e divisória, use o Accordion."),
  argTypes: {
    aberto: { name: "Open", control: "boolean", description: "`open` com `onOpenChange`, quando quem usa guarda o estado; `defaultOpen`, quando o próprio Collapsible guarda.", table: { category: "Estado" } },
    disabled: { name: "Disabled", control: "boolean", description: "`disabled`: o gatilho deixa de abrir e fechar. O Collapsible não esmaece nada; quem esmaece é o `Button`, se receber `disabled`.", table: { category: "Estado" } },
  },
  args: { aberto: false, disabled: false },
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

export const PainelDeConfiguracoes: Story = {
  name: "Exemplo · Painel de configurações",
  parameters: vitrine("Um botão revela as opções avançadas. A seta gira quando o painel abre (`data-panel-open`)."),
  render: () => (
    <Collapsible className="flex w-72 flex-col gap-(--gap-lg) text-body-sm">
      <Field>
        <FieldLabel htmlFor="cfg-valor">Valor do empréstimo</FieldLabel>
        <Input id="cfg-valor" defaultValue="R$ 10.000,00" />
      </Field>
      <CollapsibleTrigger render={<Button variant="ghost" size="sm" className="group self-start" />}>
        <ChevronDownIcon data-icon="inline-start" className="transition-transform group-data-panel-open:rotate-180" />Opções avançadas
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-(--gap-lg)">
        <Field>
          <FieldLabel htmlFor="cfg-prazo">Prazo</FieldLabel>
          <Input id="cfg-prazo" defaultValue="24 meses" />
        </Field>
        <Field>
          <FieldLabel htmlFor="cfg-carencia">Carência</FieldLabel>
          <Input id="cfg-carencia" defaultValue="30 dias" />
        </Field>
      </CollapsibleContent>
    </Collapsible>
  ),
}

const pasta = (nome: string, filhos: ReactNode, aberta = false) => (
  <Collapsible defaultOpen={aberta}>
    <CollapsibleTrigger render={<Button variant="ghost" size="sm" className="w-full justify-start group" />}>
      <ChevronRightIcon data-icon="inline-start" className="transition-transform group-data-panel-open:rotate-90" /><FolderIcon />{nome}
    </CollapsibleTrigger>
    <CollapsibleContent className="ml-(--gap-xl) flex flex-col">{filhos}</CollapsibleContent>
  </Collapsible>
)
const arquivo = (nome: string) => <Button key={nome} variant="ghost" size="sm" className="w-full justify-start"><FileIcon data-icon="inline-start" />{nome}</Button>

export const ArvoreDeArquivos: Story = {
  name: "Exemplo · Árvore de arquivos",
  parameters: vitrine("Um Collapsible dentro do outro: cada pasta tem o seu gatilho, e a seta gira quando ela abre (`data-panel-open`)."),
  render: () => (
    <div className="w-56">
      {pasta("src", <>{pasta("components", <>{arquivo("button.tsx")}{arquivo("card.tsx")}</>, true)}{arquivo("main.tsx")}</>, true)}
      {pasta("public", arquivo("favicon.svg"))}
    </div>
  ),
}
