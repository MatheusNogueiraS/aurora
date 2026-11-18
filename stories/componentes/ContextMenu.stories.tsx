import type { Meta, StoryObj } from "@storybook/react-vite"
import { CopyIcon, DownloadIcon, FileTextIcon, Trash2Icon } from "lucide-react"
import { useEffect, useRef, type ReactNode } from "react"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { pagina, vitrine } from "./Opcoes"

// Um boolean por peça do painel, cada um liga uma instância só. Para montar o menu, duplique as peças dentro do painel.
const pecas = [
  ["label", "Label", "`ContextMenuLabel`, o título de um grupo, em `text-muted` e sem clique. Vai dentro de um `ContextMenuGroup`."],
  ["texto", "Item · texto", "`ContextMenuItem` só com o texto."],
  ["icone", "Item · com ícone", "`ContextMenuItem` com um ícone como primeiro filho."],
  ["atalho", "Item · com atalho", "`ContextMenuItem` com `ContextMenuShortcut` no fim."],
  ["inset", "Item · inset", "`ContextMenuItem` com `inset`: o texto recua para alinhar com os itens que têm ícone."],
  ["submenu", "Submenu", "`ContextMenuSub`: o `ContextMenuSubTrigger`, um item com a seta, abre o `ContextMenuSubContent`, um painel que recebe as mesmas peças."],
  ["separador", "Separator", "`ContextMenuSeparator`, a linha entre grupos."],
  ["checkbox", "Checkbox item", "`ContextMenuCheckboxItem`: mostra o ✓ à direita quando marcado. Clique para marcar."],
  ["radio", "Radio item", "`ContextMenuRadioItem`, dentro de um `ContextMenuRadioGroup`, que deixa um escolhido por vez. Mostra o ✓ à direita quando escolhido."],
  ["desabilitado", "Item · disabled", "`ContextMenuItem` com `disabled`: apagado e sem clique."],
  ["destrutivo", "Item · destructive", "`ContextMenuItem` com `variant=\"destructive\"`, em vermelho."],
] as const
type Peca = (typeof pecas)[number][0]
type Controles = Record<Peca, boolean>

const area = "flex h-36 w-72 items-center justify-center rounded-3xl border-sm border-dashed text-body-sm text-muted"

const itens = (p: Controles) => (
  <>
    {p.label && <ContextMenuGroup><ContextMenuLabel>Extrato</ContextMenuLabel></ContextMenuGroup>}
    {p.texto && <ContextMenuItem>Ver detalhes</ContextMenuItem>}
    {p.icone && <ContextMenuItem><CopyIcon />Copiar valor</ContextMenuItem>}
    {p.atalho && <ContextMenuItem>Baixar comprovante<ContextMenuShortcut>⌘S</ContextMenuShortcut></ContextMenuItem>}
    {p.inset && <ContextMenuItem inset>Compartilhar</ContextMenuItem>}
    {p.submenu && (
      <ContextMenuSub>
        <ContextMenuSubTrigger>Exportar como</ContextMenuSubTrigger>
        <ContextMenuSubContent><ContextMenuItem>PDF</ContextMenuItem><ContextMenuItem>Planilha</ContextMenuItem></ContextMenuSubContent>
      </ContextMenuSub>
    )}
    {p.separador && <ContextMenuSeparator />}
    {p.checkbox && <ContextMenuCheckboxItem defaultChecked>Mostrar saldo</ContextMenuCheckboxItem>}
    {p.radio && <ContextMenuRadioGroup defaultValue="mensal"><ContextMenuRadioItem value="mensal">Mensal</ContextMenuRadioItem></ContextMenuRadioGroup>}
    {p.desabilitado && <ContextMenuItem disabled><FileTextIcon />Segunda via</ContextMenuItem>}
    {p.destrutivo && <ContextMenuItem variant="destructive"><Trash2Icon />Excluir lançamento</ContextMenuItem>}
  </>
)

const todas = Object.fromEntries(pecas.map(([chave]) => [chave, true])) as Controles

// Nas vitrines, abre o menu com um clique direito no centro da área.
function Aberto({ children }: { children: ReactNode }) {
  const alvo = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const t = setTimeout(() => {
      const r = alvo.current?.getBoundingClientRect()
      if (r) alvo.current?.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + 24, button: 2 }))
    }, 600)
    return () => clearTimeout(t)
  }, [])
  return <ContextMenu><ContextMenuTrigger ref={alvo} className={area}>Clique com o botão direito</ContextMenuTrigger><ContextMenuContent>{children}</ContextMenuContent></ContextMenu>
}

const meta = {
  title: "Componentes/ContextMenu",
  render: (args) => <ContextMenu><ContextMenuTrigger className={area}>Clique com o botão direito</ContextMenuTrigger><ContextMenuContent>{itens(args)}</ContextMenuContent></ContextMenu>,
  parameters: pagina("Menu que abre no lugar do clique com o botão direito (ou de um toque longo) sobre uma área. Os itens têm o mesmo visual do DropdownMenu. Não tem controle Open: quem dá a posição é o clique. Por padrão, o menu abre à direita do ponteiro (`side=\"right\"`, `align=\"start\"` no `ContextMenuContent`) e vai para o outro lado se faltar espaço. O painel (`ContextMenuContent`) recebe quantas peças quiser, em qualquer ordem: cada controle liga uma peça, e para montar o menu você duplica as peças. Na amostra, clique com o botão direito na área; as opções embaixo rodam cada uma no próprio quadro, já abertas."),
  argTypes: Object.fromEntries(pecas.map(([chave, name, description]) => [chave, { name, control: "boolean", description, table: { category: "Peças" } }])),
  args: todas,
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

export const Completo: Story = {
  name: "Conteúdo",
  parameters: vitrine("Uma peça de cada, na ordem dos controles.", 520),
  render: () => <Aberto>{itens(todas)}</Aberto>,
}

// Uma seção por peça do painel. No código, o ContextMenuContent recebe quantas peças quiser, em qualquer ordem.
export const PecaItem: Story = {
  name: "Peças · Item",
  parameters: vitrine("`ContextMenuItem`: texto, com ou sem ícone e atalho (`ContextMenuShortcut`). `inset` alinha o texto de um item sem ícone com os que têm. `disabled` apaga o item, e `variant=\"destructive\"` pinta de vermelho.", 400),
  render: () => (
    <Aberto>
      <ContextMenuItem>Só o texto</ContextMenuItem>
      <ContextMenuItem><CopyIcon />Com ícone</ContextMenuItem>
      <ContextMenuItem><DownloadIcon />Com atalho<ContextMenuShortcut>⌘S</ContextMenuShortcut></ContextMenuItem>
      <ContextMenuItem inset>Inset</ContextMenuItem>
      <ContextMenuItem disabled><FileTextIcon />Disabled</ContextMenuItem>
      <ContextMenuItem variant="destructive"><Trash2Icon />Destructive</ContextMenuItem>
    </Aberto>
  ),
}

export const PecaMarcaveis: Story = {
  name: "Peças · Checkbox e Radio",
  parameters: vitrine("`ContextMenuCheckboxItem`, marcado (`defaultChecked`) e desmarcado. `ContextMenuRadioItem` só vive dentro de um `ContextMenuRadioGroup`, que deixa um escolhido por vez. Os dois mostram o ✓ à direita quando marcados.", 360),
  render: () => (
    <Aberto>
      <ContextMenuCheckboxItem defaultChecked>Checkbox marcado</ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem>Checkbox desmarcado</ContextMenuCheckboxItem>
      <ContextMenuSeparator />
      <ContextMenuRadioGroup defaultValue="mensal">
        <ContextMenuRadioItem value="mensal">Radio escolhido</ContextMenuRadioItem>
        <ContextMenuRadioItem value="anual">Radio sem escolha</ContextMenuRadioItem>
      </ContextMenuRadioGroup>
    </Aberto>
  ),
}

export const PecaSubmenu: Story = {
  name: "Peças · Submenu",
  parameters: vitrine("`ContextMenuSub` junta o `ContextMenuSubTrigger`, um item com a seta, e o `ContextMenuSubContent`, um painel igual ao principal, que recebe as mesmas peças. O gatilho aberto ainda não muda o visual: o estilo procura `data-open`, e o Base UI marca o gatilho com `data-popup-open`.", 360),
  render: () => (
    <Aberto>
      <ContextMenuItem>Item</ContextMenuItem>
      <ContextMenuSub defaultOpen>
        <ContextMenuSubTrigger>Exportar como</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem>PDF</ContextMenuItem>
          <ContextMenuItem>Planilha</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </Aberto>
  ),
}

export const PecaGrupo: Story = {
  name: "Peças · Label, Group e Separator",
  parameters: vitrine("`ContextMenuGroup` junta itens sob um `ContextMenuLabel`, o título em `text-muted` que não é clicável. `ContextMenuSeparator` é a linha entre grupos.", 400),
  render: () => (
    <Aberto>
      <ContextMenuGroup>
        <ContextMenuLabel>Label</ContextMenuLabel>
        <ContextMenuItem>Item do grupo</ContextMenuItem>
        <ContextMenuItem>Item do grupo</ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuLabel>Outro label</ContextMenuLabel>
        <ContextMenuItem>Item do grupo</ContextMenuItem>
      </ContextMenuGroup>
    </Aberto>
  ),
}
