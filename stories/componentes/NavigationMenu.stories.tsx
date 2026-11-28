import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowLeftRightIcon, BanknoteIcon, CreditCardIcon, LinkIcon, QrCodeIcon, ReceiptIcon } from "lucide-react"
import { useArgs } from "storybook/preview-api"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Simula, pagina, vitrine, type Interacao } from "./Opcoes"

const tipos = ["Com painel", "Link solto"] as const
type Tipo = (typeof tipos)[number]
const layouts = ["Lista", "Grade", "Destaque"] as const
type Layout = (typeof layouts)[number]
const alinhamentos = ["start", "center", "end"] as const
type Alinhamento = (typeof alinhamentos)[number]
const interacoes: Interacao[] = ["Default", "Hover", "Focus"]

type Controles = { tipo: Tipo; texto: string; aberto: boolean; layout: Layout; links: number; descricao: boolean; icone: boolean; align: Alinhamento; estado: Interacao }

const destinos = [
  { titulo: "Pix", texto: "Pagamentos na hora, a qualquer hora.", Icone: QrCodeIcon },
  { titulo: "Boleto", texto: "Cobranças que compensam em até 3 dias.", Icone: BanknoteIcon },
  { titulo: "Cartão", texto: "Crédito em até 12 vezes.", Icone: CreditCardIcon },
  { titulo: "Link de pagamento", texto: "Um link para cobrar por mensagem.", Icone: LinkIcon },
  { titulo: "Transferência", texto: "TED e Pix para outros bancos.", Icone: ArrowLeftRightIcon },
  { titulo: "Extrato", texto: "Tudo o que entrou e saiu.", Icone: ReceiptIcon },
]

// O painel (`NavigationMenuContent`) só recebe Links. A largura é a dos exemplos do shadcn, pensada para o computador.
// `de` escolhe a partir de qual destino a lista começa, para itens diferentes em Composições.
const painel = ({ layout, links, descricao, icone, de = 0 }: Pick<Controles, "layout" | "links" | "descricao" | "icone"> & { de?: number }) => {
  const itens = destinos.slice(de, de + links).map(({ titulo, texto, Icone }) => (
    <li key={titulo}>
      <NavigationMenuLink href={`#${encodeURIComponent(titulo)}`} className={descricao ? "items-start" : undefined}>
        {icone && <Icone />}
        {descricao ? <span className="flex flex-col gap-(--gap-2xs)"><span className="text-label-sm">{titulo}</span><span className="line-clamp-2 text-muted">{texto}</span></span> : titulo}
      </NavigationMenuLink>
    </li>
  ))
  if (layout === "Grade") return <ul className="grid w-md grid-cols-2 gap-(--gap-xs)">{itens}</ul>
  if (layout === "Destaque") {
    return (
      <ul className="grid w-96 grid-cols-[.75fr_1fr] gap-(--gap-xs)">
        <li style={{ gridRow: `span ${links}` }}>
          <NavigationMenuLink href="#conta" className="h-full flex-col items-start justify-end bg-muted/50 p-(--padding-2xl)">
            <span className="text-heading-sm">Conta PJ</span>
            <span className="text-muted">Tudo para receber e pagar num lugar só.</span>
          </NavigationMenuLink>
        </li>
        {itens}
      </ul>
    )
  }
  return <ul className={`grid gap-(--gap-xs) ${descricao ? "w-72" : "w-48"}`}>{itens}</ul>
}

// Um item do menu. Para montar o menu, duplique o item dentro da mesma `NavigationMenuList`.
const item = ({ tipo, texto, ...resto }: Omit<Controles, "aberto" | "align" | "estado"> & { de?: number }, valor = "item") =>
  tipo === "Link solto" ? (
    <NavigationMenuItem key={valor}><NavigationMenuLink href={`#${encodeURIComponent(texto)}`} className={navigationMenuTriggerStyle()}>{texto}</NavigationMenuLink></NavigationMenuItem>
  ) : (
    <NavigationMenuItem key={valor} value={valor}>
      <NavigationMenuTrigger>{texto}</NavigationMenuTrigger>
      <NavigationMenuContent>{painel(resto)}</NavigationMenuContent>
    </NavigationMenuItem>
  )

const base: Omit<Controles, "aberto" | "align" | "estado"> = { tipo: "Com painel", texto: "Produtos", layout: "Lista", links: 4, descricao: true, icone: false }
const comPainel = { if: { arg: "tipo", eq: "Com painel" } }

// Para as vitrines: o item já aberto, no próprio quadro.
const aberto = (props: Partial<typeof base> = {}): Story => ({
  render: () => <NavigationMenu defaultValue="item"><NavigationMenuList>{item({ ...base, ...props })}</NavigationMenuList></NavigationMenu>,
})

const meta = {
  title: "Componentes/NavigationMenu",
  // Abrir e fechar o item na amostra atualiza o controle Aberto.
  render: function Amostra({ aberto: open, align, estado, ...props }) {
    const [, atualizar] = useArgs<Controles>()
    return (
      <Simula estado={estado} so="[data-slot=navigation-menu-trigger], [data-slot=navigation-menu-link]">
        <NavigationMenu align={align === "start" ? undefined : align} value={open && props.tipo === "Com painel" ? "item" : null} onValueChange={(v) => atualizar({ aberto: v === "item" })}>
          <NavigationMenuList>{item(props)}</NavigationMenuList>
        </NavigationMenu>
      </Simula>
    )
  },
  parameters: pagina("Menu de navegação de um site ou sistema: uma barra de itens, em que cada item abre um painel de links ao passar o mouse ou clicar, ou é só um link. O `NavigationMenu` com a `NavigationMenuList` só recebe Itens, e o painel (`NavigationMenuContent`) só recebe Links. A amostra mostra um item: para montar o menu, duplique o item, como em Composições. Pensado para o computador: no celular, a navegação costuma virar uma lista dentro de um Sheet ou Drawer. Diferente do Hover Card, que só mostra uma prévia de algo, o Navigation Menu leva a outras páginas e anda entre os itens pelas setas do teclado. O `active` do link ainda não muda o visual: o estilo procura `data-active=\"true\"`, e o Base UI marca só `data-active`."),
  argTypes: {
    tipo: { name: "Type", control: "inline-radio", options: tipos, description: "**Com painel**: `NavigationMenuTrigger` com a seta e um `NavigationMenuContent`. **Link solto**: um `NavigationMenuLink` com o visual do gatilho (`navigationMenuTriggerStyle`), sem painel.", table: { category: "Conteúdo" } },
    texto: { name: "Text", control: "text", description: "O nome do item.", table: { category: "Conteúdo" } },
    aberto: { name: "Aberto", control: "boolean", ...comPainel, description: "No código, `value` no `NavigationMenu` igual ao `value` do item (ou `defaultValue`). Aberto, o gatilho fica com fundo `muted/50` e a seta vira para cima.", table: { category: "Estado" } },
    layout: { name: "Layout", control: "inline-radio", options: layouts, ...comPainel, description: "Como os links se arrumam no painel, nos formatos dos exemplos do shadcn: **Lista**, uma coluna; **Grade**, duas colunas; **Destaque**, um link maior à esquerda e a lista ao lado. A largura vem da classe do `ul`, como `w-md`.", table: { category: "Conteúdo" } },
    links: { name: "Links", control: { type: "range", min: 1, max: 6, step: 1 }, ...comPainel, description: "Quantos `NavigationMenuLink` no painel.", table: { category: "Conteúdo" } },
    descricao: { name: "Description", control: "boolean", ...comPainel, description: "Uma linha de explicação embaixo do nome do link, em `text-muted`.", table: { category: "Conteúdo" } },
    icone: { name: "Icon", control: "boolean", ...comPainel, description: "Um ícone antes do nome. Cada link tem o seu; no Figma, um boolean com a troca de ícone em cada Link.", table: { category: "Conteúdo" } },
    align: { name: "Align", control: "inline-radio", options: alinhamentos, ...comPainel, description: "No código, `align` no `NavigationMenu`: o painel alinha ao começo, ao centro ou ao fim do item.", table: { category: "Aparência" } },
    estado: { name: "State", control: "inline-radio", options: interacoes, description: "Simulado no gatilho ou no link solto.", table: { category: "Estado" } },
  },
  args: { ...base, aberto: false, align: "start", estado: "Default" },
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  name: "Padrão",
  // A amostra é alta para o painel aberto caber dentro dela, sem cobrir a tabela de controles.
  decorators: [(Historia) => <div className="flex h-96 w-xl items-start justify-center"><Historia /></div>],
}

export const Tipos: Story = {
  name: "Tipo do item",
  parameters: vitrine("Um item com painel, fechado, e um link solto, com o mesmo visual do gatilho, sem a seta."),
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>{item(base, "painel")}{item({ ...base, tipo: "Link solto", texto: "Ajuda" }, "link")}</NavigationMenuList>
    </NavigationMenu>
  ),
}

export const Lista: Story = { name: "Layout · Lista", parameters: vitrine("Uma coluna de links com nome e descrição.", 480), ...aberto() }
export const Grade: Story = { name: "Layout · Grade", parameters: vitrine("Duas colunas de links, como o painel de componentes do exemplo do shadcn.", 320), ...aberto({ layout: "Grade" }) }
export const Destaque: Story = { name: "Layout · Destaque", parameters: vitrine("Um link maior de destaque à esquerda, com a lista ao lado, como o painel de início do exemplo do shadcn.", 360), ...aberto({ layout: "Destaque", links: 3 }) }
export const SoTitulo: Story = { name: "Link · só o nome", parameters: vitrine("Links sem descrição, numa lista estreita.", 280), ...aberto({ descricao: false }) }
export const ComIcone: Story = { name: "Link · com ícone", parameters: vitrine("Um ícone antes do nome, como o painel de status do exemplo do shadcn. Vale com e sem descrição.", 280), ...aberto({ descricao: false, icone: true }) }

export const Estados: Story = {
  name: "State",
  parameters: vitrine("Hover e Focus simulados no gatilho.", 520),
  render: () => (
    <div className="flex flex-col items-start gap-(--gap-2xl)">
      {interacoes.map((e) => (
        <div key={e} className="flex items-center gap-(--gap-lg)">
          <span className="w-16 text-label-xs">{e}</span>
          <Simula estado={e} so="[data-slot=navigation-menu-trigger]"><NavigationMenu><NavigationMenuList>{item(base, e)}</NavigationMenuList></NavigationMenu></Simula>
        </div>
      ))}
    </div>
  ),
}

export const Composicoes: Story = {
  name: "Composições",
  parameters: vitrine("O exemplo do shadcn: quatro itens duplicados na mesma lista, três com painel (destaque, grade e lista com ícones) e um link solto. Passe o mouse para ver o painel deslizar de um item para o outro.", 420),
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        {item({ ...base, texto: "Início", layout: "Destaque", links: 3 }, "inicio")}
        {item({ ...base, texto: "Produtos", layout: "Grade" }, "produtos")}
        {item({ ...base, texto: "Atalhos", links: 3, de: 3, descricao: false, icone: true }, "atalhos")}
        {item({ ...base, tipo: "Link solto", texto: "Ajuda" }, "ajuda")}
      </NavigationMenuList>
    </NavigationMenu>
  ),
}
