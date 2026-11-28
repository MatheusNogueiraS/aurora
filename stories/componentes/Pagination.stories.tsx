import type { Meta, StoryObj } from "@storybook/react-vite"

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Opcao, Opcoes, Simula, pagina, vitrine, type Interacao } from "./Opcoes"

const interacoes: Interacao[] = ["Default", "Hover", "Focus"]

// O `size` do PaginationLink é o do Button; os números usam os tamanhos só de ícone.
const tamanhos = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const
type Tamanho = (typeof tamanhos)[number]

// O Type do Figma: com reticências, simples (números e setas) ou só as setas.
const tipos = ["ellipsis", "simple", "arrows"] as const

type Controles = { tipo: (typeof tipos)[number]; atual: number; total: number; size: Tamanho; textoSetas: boolean; estado: Interacao }
type Dados = { atual: number; total: number; size?: Tamanho; reticencias: boolean; setas: boolean; textoSetas: boolean }

// Mostra a página atual com uma vizinha de cada lado; com reticências, o resto vira "…".
const paginacao = ({ atual: pedida, total, size = "icon", reticencias, setas, textoSetas }: Dados) => {
  // O controle de página vai até 10; a atual não passa do total.
  const atual = Math.min(pedida, total)
  const paginas = Array.from({ length: total }, (_, i) => i + 1)
  const visiveis = reticencias ? paginas.filter((p) => p === 1 || p === total || Math.abs(p - atual) <= 1) : paginas
  return (
    <Pagination>
      <PaginationContent>
        {setas && <PaginationItem><PaginationPrevious href="#anterior" text={textoSetas ? "Anterior" : ""} /></PaginationItem>}
        {visiveis.flatMap((p, i) => [
          i > 0 && p - visiveis[i - 1] > 1 && <PaginationItem key={`r${p}`}><PaginationEllipsis /></PaginationItem>,
          <PaginationItem key={p}><PaginationLink href={`#${p}`} isActive={p === atual || undefined} size={size === "icon" ? undefined : size}>{p}</PaginationLink></PaginationItem>,
        ])}
        {setas && <PaginationItem><PaginationNext href="#proxima" text={textoSetas ? "Próxima" : ""} /></PaginationItem>}
      </PaginationContent>
    </Pagination>
  )
}

const base = { atual: 2, total: 3, reticencias: false, setas: true, textoSetas: true }

const meta = {
  title: "Componentes/Pagination",
  render: ({ tipo, total, ...args }) => paginacao({ ...args, reticencias: tipo === "ellipsis", setas: true, total: tipo === "arrows" ? 0 : total }),
  parameters: pagina("Navega entre páginas de uma lista longa. Cada número é um link com o visual do `Button`: `ghost`, e `outline` na página atual. O Type não é uma propriedade do código: é a montagem, com `PaginationEllipsis` (ellipsis), só números e setas (simple) ou só `PaginationPrevious` e `PaginationNext` (arrows)."),
  argTypes: {
    tipo: { name: "Type", control: "inline-radio", options: tipos, description: "`ellipsis` troca as páginas longe da atual por `PaginationEllipsis`; `simple` mostra todos os números; `arrows` deixa só as setas.", table: { category: "Conteúdo" } },
    atual: { name: "Current page", control: { type: "range", min: 1, max: 10, step: 1 }, description: "`isActive` no `PaginationLink` da página atual: ele vira `outline` e ganha `aria-current=\"page\"`.", if: { arg: "tipo", neq: "arrows" }, table: { category: "Conteúdo" } },
    total: { name: "Total pages", control: { type: "range", min: 1, max: 10, step: 1 }, if: { arg: "tipo", neq: "arrows" }, table: { category: "Conteúdo" } },
    size: { name: "Size", control: "inline-radio", options: tamanhos, description: "No código, `size` no `PaginationLink`, o mesmo do Button: 24, 32, 36 (o padrão, `icon`) ou 40 px. As setas usam o `default` do Button.", table: { category: "Aparência" } },
    textoSetas: { name: "Arrow text", control: "boolean", description: "A propriedade `text` (em inglês, Previous e Next, se faltar). Na tela estreita, o texto some e fica só a seta.", table: { category: "Conteúdo" } },
    estado: { name: "State", control: "inline-radio", options: interacoes, description: "Simulado, no primeiro número.", if: { arg: "tipo", neq: "arrows" }, table: { category: "Estado" } },
  },
  args: { tipo: "simple", atual: base.atual, total: base.total, textoSetas: base.textoSetas, size: "icon", estado: "Default" },
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  name: "Padrão",
  decorators: [(Historia, { args }) => <Simula estado={args.estado} so="[data-slot=pagination-link]:not([aria-label]):not([data-active=true])"><Historia /></Simula>],
}

export const Estados: Story = {
  name: "State",
  parameters: vitrine("Hover e Focus simulados num número. Active é a página atual."),
  render: () => (
    <Opcoes larga>
      {interacoes.map((e) => <Opcao key={e} nome={e}><Simula estado={e} so="[data-slot=pagination-link]"><Pagination><PaginationContent><PaginationItem><PaginationLink href="#1">1</PaginationLink></PaginationItem></PaginationContent></Pagination></Simula></Opcao>)}
      <Opcao nome="Active"><Pagination><PaginationContent><PaginationItem><PaginationLink href="#1" isActive>1</PaginationLink></PaginationItem></PaginationContent></Pagination></Opcao>
    </Opcoes>
  ),
}

export const Tamanhos: Story = {
  name: "Size",
  parameters: vitrine("No código, `size` no `PaginationLink`. Sem a propriedade, o número é `icon` (36 px)."),
  render: () => <Opcoes larga>{tamanhos.map((s) => <Opcao key={s} nome={s}>{paginacao({ ...base, size: s, setas: false })}</Opcao>)}</Opcoes>,
}

export const Conteudo: Story = {
  name: "Type",
  parameters: vitrine("Os exemplos do shadcn, com os nomes do Type no Figma: a paginação com reticências, a simples e a só com as setas. Sem o texto, as setas ficam só com o ícone."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="ellipsis">{paginacao({ ...base, atual: 5, total: 10, reticencias: true })}</Opcao>
      <Opcao nome="simple">{paginacao(base)}</Opcao>
      <Opcao nome="arrows">{paginacao({ ...base, total: 0, textoSetas: true })}</Opcao>
      <Opcao nome="Arrow text off">{paginacao({ ...base, textoSetas: false })}</Opcao>
    </Opcoes>
  ),
}
