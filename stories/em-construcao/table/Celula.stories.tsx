import type { Meta, StoryObj } from "@storybook/react-vite"

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Opcao, Opcoes, pagina, vitrine } from "../../componentes/Opcoes"
import { alinhamentos, conteudo, conteudos, type Alinhamento, type Conteudo } from "./partes"

const tipos = ["Head", "Body", "Footer"] as const
type Tipo = (typeof tipos)[number]

type Controles = { tipo: Tipo; conteudo: Conteudo; texto: string; align: Alinhamento }

// A célula precisa de uma tabela em volta para existir no HTML; a seção (thead, tbody, tfoot) é a do Type.
const celula = ({ tipo, conteudo: c, texto, align }: Controles) => {
  const dentro = conteudo(c, texto)
  const classe = align === "right" ? "text-right" : undefined
  return (
    <Table>
      {tipo === "Head" && <TableHeader><TableRow><TableHead className={classe}>{dentro}</TableHead></TableRow></TableHeader>}
      {tipo === "Body" && <TableBody><TableRow><TableCell className={classe}>{dentro}</TableCell></TableRow></TableBody>}
      {tipo === "Footer" && <TableFooter><TableRow><TableCell className={classe}>{dentro}</TableCell></TableRow></TableFooter>}
    </Table>
  )
}

const base: Controles = { tipo: "Body", conteudo: "Texto", texto: "Pago", align: "left" }

const meta = {
  title: "Em construção/Table/Célula",
  render: (args) => <div className="w-56">{celula(args)}</div>,
  parameters: pagina("A menor peça da tabela: `TableHead` no cabeçalho e `TableCell` no corpo e no rodapé. A célula não tem borda nem fundo próprios: a borda, o hover e o selecionado são da Linha. No Figma, a célula ocupa a largura da linha (Fill container), e as linhas com o mesmo número de células alinham as colunas sozinhas."),
  argTypes: {
    tipo: { name: "Type", control: "inline-radio", options: tipos, description: "`Head` é o `TableHead`: 48 px de altura e negrito (`text-mono-sm-bold`). `Body` é o `TableCell`, com padding de 12 px. `Footer` é o mesmo `TableCell` dentro do `TableFooter`, que dá o fundo `muted/50` e o negrito.", table: { category: "Aparência" } },
    conteudo: { name: "Conteúdo", control: "select", options: conteudos, description: "O que vai dentro, como nos exemplos do shadcn: **Texto**; **Badge**, para status; **Checkbox**, para selecionar a linha (a célula perde o padding da direita); **Ações**, um botão que abre o menu; **Ordenável**, o botão com seta do cabeçalho da data table; **Slot**, qualquer outro conteúdo. No Figma, é uma variante ou um slot.", table: { category: "Conteúdo" } },
    texto: { name: "Texto", control: "text", description: "O texto da célula, do Badge ou do botão Ordenável.", table: { category: "Conteúdo" } },
    align: { name: "Align", control: "inline-radio", options: alinhamentos, description: "No código, `className=\"text-right\"`. Valores e ações vão à direita; o resto, à esquerda.", table: { category: "Aparência" } },
  },
  args: base,
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

export const Tipos: Story = {
  name: "Type",
  parameters: vitrine("A mesma célula nas três seções da tabela. A linha embaixo do Head vem do `TableHeader`; a de cima do Footer, do `TableFooter`."),
  render: () => <Opcoes>{tipos.map((t) => <Opcao key={t} nome={t}>{celula({ ...base, tipo: t, texto: t === "Head" ? "Status" : t === "Footer" ? "Total" : "Pago" })}</Opcao>)}</Opcoes>,
}

// Cada conteúdo na seção em que aparece nos exemplos: Ordenável no cabeçalho, o resto no corpo.
const exemplos: Record<Conteudo, Partial<Controles>> = {
  Texto: { texto: "FAT-001" },
  Badge: { texto: "Pendente" },
  Checkbox: { texto: "FAT-001" },
  Ações: { texto: "FAT-001", align: "right" },
  Ordenável: { tipo: "Head", texto: "E-mail" },
  Slot: {},
}

export const Conteudos: Story = {
  name: "Conteúdo",
  parameters: vitrine("Os conteúdos dos exemplos do shadcn. O Ordenável aparece no cabeçalho; os outros, no corpo. Checkbox e Ações ficam em colunas estreitas, nas pontas da linha."),
  render: () => <Opcoes>{conteudos.map((c) => <Opcao key={c} nome={c}>{celula({ ...base, conteudo: c, ...exemplos[c] })}</Opcao>)}</Opcoes>,
}

export const Alinhamentos: Story = {
  name: "Align",
  parameters: vitrine("Sem a classe, o texto fica à esquerda. Com `text-right`, à direita, como os valores em reais. O texto monoespaçado alinha os algarismos de uma linha para a outra."),
  render: () => <Opcoes>{alinhamentos.map((a) => <Opcao key={a} nome={a}>{celula({ ...base, texto: "R$ 250,00", align: a })}</Opcao>)}</Opcoes>,
}
