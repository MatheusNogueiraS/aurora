import type { Meta, StoryObj } from "@storybook/react-vite"

import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow } from "@/components/ui/table"
import { Opcao, Opcoes, pagina, vitrine } from "../../componentes/Opcoes"
import { acoesDoHead, alinhamentos, Cabecalho, conteudo, conteudos, icones, ordens, type AcaoDoHead, type Alinhamento, type Conteudo, type Icone, type Ordem } from "./partes"

const tipos = ["Head", "Body", "Footer"] as const
type Tipo = (typeof tipos)[number]
const status = ["Pago", "Pendente", "Atrasado"]

type Controles = { tipo: Tipo; texto: string; align: Alinhamento; conteudo: Conteudo; acao: AcaoDoHead; ordem: Ordem; filtroAtivo: boolean; esquerdo: Icone; direito: Icone }

// A célula precisa de uma tabela em volta para existir no HTML; a seção (thead, tbody, tfoot) é a do Type.
const celula = ({ tipo, texto, align, conteudo: c, acao, ordem, filtroAtivo, esquerdo, direito }: Controles) => {
  const classe = align === "right" ? "text-right" : undefined
  return (
    <Table>
      {tipo === "Head" && <TableHeader><TableRow><Cabecalho texto={texto} acao={acao} ordem={ordem} esquerdo={esquerdo} direito={direito} align={align} valores={status} filtrados={filtroAtivo ? ["Pago"] : []} /></TableRow></TableHeader>}
      {tipo === "Body" && <TableBody><TableRow><TableCell className={classe}>{conteudo(c, texto)}</TableCell></TableRow></TableBody>}
      {tipo === "Footer" && <TableFooter><TableRow><TableCell className={classe}>{texto}</TableCell></TableRow></TableFooter>}
    </Table>
  )
}

const base: Controles = { tipo: "Head", texto: "Status", align: "left", conteudo: "Texto", acao: "Nenhuma", ordem: "Nenhuma", filtroAtivo: false, esquerdo: "Nenhum", direito: "Nenhum" }
const soHead = { if: { arg: "tipo", eq: "Head" } }

const meta = {
  title: "Em construção/Table/Célula",
  render: (args) => <div className="w-64">{celula(args)}</div>,
  parameters: pagina("A menor peça da tabela: `TableHead` no cabeçalho e `TableCell` no corpo e no rodapé. A célula não tem borda nem fundo próprios: a borda, o hover e o selecionado são da Linha. O Head descreve a coluna e pode agir sobre ela (ordenar, filtrar); o Body mostra o dado; o Footer, o total. No Figma, a célula ocupa a largura da linha (Fill container), e as linhas com o mesmo número de células alinham as colunas sozinhas. Os controles mudam com o Type."),
  argTypes: {
    tipo: { name: "Type", control: "inline-radio", options: tipos, description: "`Head` é o `TableHead`: 48 px de altura e negrito (`text-mono-sm-bold`). `Body` é o `TableCell`, com padding de 12 px. `Footer` é o mesmo `TableCell` dentro do `TableFooter`, que dá o fundo `muted/50` e o negrito.", table: { category: "Aparência" } },
    texto: { name: "Texto", control: "text", description: "O nome da coluna no Head; o dado no Body; o total no Footer.", table: { category: "Conteúdo" } },
    align: { name: "Align", control: "inline-radio", options: alinhamentos, description: "No código, `className=\"text-right\"`. Valores e ações vão à direita; o resto, à esquerda. No Head à direita, o ícone da ação passa para antes do texto, para o texto alinhar com o das células.", table: { category: "Aparência" } },
    conteudo: { name: "Conteúdo", control: "select", options: conteudos, if: { arg: "tipo", eq: "Body" }, description: "O dado, como nos exemplos do shadcn: **Texto**; **Badge**, para status; **Checkbox**, para selecionar a linha (a célula perde o padding da direita); **Ações**, um botão que abre o menu da linha; **Slot**, qualquer outro dado.", table: { category: "Conteúdo" } },
    acao: { name: "Ação", control: "select", options: acoesDoHead, ...soHead, description: "O que o cabeçalho faz. **Ordenar**: o nome vira um botão que alterna crescente, decrescente e sem ordem. **Filtrar**: um botão de filtro ao lado do nome abre um DropdownMenu com os valores da coluna. **Menu**: o nome abre um DropdownMenu com ordenar, filtrar e ocultar a coluna, como no exemplo Tasks do shadcn. **Seleção**: o Checkbox de selecionar todas, na coluna de seleção. O menu é o componente DropdownMenu, por cima da tabela: a célula mostra só o gatilho.", table: { category: "Conteúdo" } },
    ordem: { name: "Ordem", control: "inline-radio", options: ordens, ...soHead, description: "Com Ordenar ou Menu. O ícone mostra o estado: ⇅ apagado sem ordem, ↑ crescente, ↓ decrescente. No código, `aria-sort` no `TableHead` avisa o leitor de tela.", table: { category: "Estado" } },
    filtroAtivo: { name: "Filtro ativo", control: "boolean", ...soHead, description: "Com Filtrar. Com algum valor marcado, o botão de filtro fica `secondary`, preenchido.", table: { category: "Estado" } },
    esquerdo: { name: "Ícone esquerdo", control: "select", options: Object.keys(icones), ...soHead, description: "Um ícone antes do nome, para identificar a coluna. No Figma, um boolean com troca de ícone.", table: { category: "Conteúdo" } },
    direito: { name: "Ícone direito", control: "select", options: Object.keys(icones), ...soHead, description: "Um ícone depois do nome, como o ⓘ de uma explicação. No Figma, um boolean com troca de ícone.", table: { category: "Conteúdo" } },
  },
  args: base,
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

export const Tipos: Story = {
  name: "Type",
  parameters: vitrine("A mesma coluna nas três seções da tabela. A linha embaixo do Head vem do `TableHeader`; a de cima do Footer, do `TableFooter`."),
  render: () => <Opcoes>{tipos.map((t) => <Opcao key={t} nome={t}>{celula({ ...base, tipo: t, texto: t === "Head" ? "Status" : t === "Footer" ? "Total" : "Pago" })}</Opcao>)}</Opcoes>,
}

export const Acoes: Story = {
  name: "Ação do Head",
  parameters: vitrine("As ações do cabeçalho. Clique para ver o menu de Filtrar e de Menu; aqui o clique não muda a tabela, que fica parada. Funcionando, elas estão na Data table da página Tabela."),
  render: () => (
    <Opcoes>
      {acoesDoHead.map((a) => <Opcao key={a} nome={a}>{celula({ ...base, acao: a })}</Opcao>)}
      <Opcao nome="Filtrar · ativo">{celula({ ...base, acao: "Filtrar", filtroAtivo: true })}</Opcao>
    </Opcoes>
  ),
}

export const Ordens: Story = {
  name: "Ordem",
  parameters: vitrine("O ícone de Ordenar e de Menu em cada estado."),
  render: () => <Opcoes>{ordens.map((o) => <Opcao key={o} nome={o}>{celula({ ...base, texto: "Valor", acao: "Ordenar", ordem: o })}</Opcao>)}</Opcoes>,
}

export const Icones: Story = {
  name: "Ícones do Head",
  parameters: vitrine("Ícone antes do nome, depois dele, ou os dois."),
  render: () => (
    <Opcoes>
      <Opcao nome="Esquerdo">{celula({ ...base, texto: "Valor", esquerdo: "Carteira" })}</Opcao>
      <Opcao nome="Direito">{celula({ ...base, texto: "Vencimento", direito: "Informação" })}</Opcao>
      <Opcao nome="Os dois">{celula({ ...base, texto: "Vencimento", esquerdo: "Calendário", direito: "Informação" })}</Opcao>
    </Opcoes>
  ),
}

// Cada conteúdo com um dado do jeito que aparece nos exemplos.
const dados: Record<Conteudo, Partial<Controles>> = { Texto: { texto: "FAT-001" }, Badge: { texto: "Pendente" }, Checkbox: { texto: "FAT-001" }, Ações: { texto: "FAT-001", align: "right" }, Slot: {} }

export const Conteudos: Story = {
  name: "Conteúdo do Body",
  parameters: vitrine("Os dados dos exemplos do shadcn. Checkbox e Ações ficam em colunas estreitas, nas pontas da linha."),
  render: () => <Opcoes>{conteudos.map((c) => <Opcao key={c} nome={c}>{celula({ ...base, tipo: "Body", conteudo: c, ...dados[c] })}</Opcao>)}</Opcoes>,
}

export const Alinhamentos: Story = {
  name: "Align",
  parameters: vitrine("Sem a classe, à esquerda; com `text-right`, à direita, como os valores em reais. O texto monoespaçado alinha os algarismos de uma linha para a outra. No Head com Ordenar, o ícone troca de lado junto."),
  render: () => (
    <Opcoes>
      {alinhamentos.map((a) => <Opcao key={a} nome={`${a} · Body`}>{celula({ ...base, tipo: "Body", texto: "R$ 250,00", align: a })}</Opcao>)}
      {alinhamentos.map((a) => <Opcao key={`h-${a}`} nome={`${a} · Head`}>{celula({ ...base, texto: "Valor", acao: "Ordenar", ordem: "Crescente", align: a })}</Opcao>)}
    </Opcoes>
  ),
}
