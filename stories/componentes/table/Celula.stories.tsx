import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { useArgs } from "storybook/preview-api"

import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow } from "@/components/ui/table"
import { Opcao, Opcoes, pagina, vitrine } from "../Opcoes"
import { acoesDoHead, alinhamentos, Cabecalho, ComIcones, conteudo, conteudos, icones, ordens, type AcaoDoHead, type Alinhamento, type Conteudo, type Icone, type Ordem } from "./partes"

const tipos = ["Head", "Body", "Footer"] as const
type Tipo = (typeof tipos)[number]

type Controles = {
  tipo: Tipo; texto: string; apoio: string; align: Alinhamento; conteudo: Conteudo; acao: AcaoDoHead; ordem: Ordem; filtroAtivo: boolean
  iconeEsquerdo: boolean; esquerdo: Icone; iconeDireito: boolean; direito: Icone
}

// A célula precisa de uma tabela em volta para existir no HTML; a seção (thead, tbody, tfoot) é a do Type.
// Os cliques chegam por `aoOrdenar` e `aoMarcar`; quem chama guarda o estado.
const celula = (args: Controles, aoOrdenar?: (o: Ordem) => void, marcado?: boolean, aoMarcar?: (v: boolean) => void) => {
  const { tipo, texto, align, acao, ordem, filtroAtivo } = args
  const lados = { esquerdo: args.iconeEsquerdo ? args.esquerdo : undefined, direito: args.iconeDireito ? args.direito : undefined }
  const classe = align === "right" ? "text-right" : undefined
  return (
    <Table>
      {tipo === "Head" && <TableHeader><TableRow><Cabecalho texto={texto} acao={acao} ordem={ordem} filtroAtivo={filtroAtivo} align={align} {...lados} aoOrdenar={aoOrdenar} marcado={marcado} aoMarcar={aoMarcar} /></TableRow></TableHeader>}
      {tipo === "Body" && <TableBody><TableRow><TableCell className={classe}>{conteudo(args.conteudo, texto, lados, args.apoio)}</TableCell></TableRow></TableBody>}
      {tipo === "Footer" && <TableFooter><TableRow><TableCell className={classe}><ComIcones texto={texto} {...lados} /></TableCell></TableRow></TableFooter>}
    </Table>
  )
}

// Para as vitrines: cada célula guarda a própria ordem e a própria caixa, e o clique muda o que aparece.
function Viva(args: Controles) {
  const [ordem, setOrdem] = useState(args.ordem)
  const [marcado, setMarcado] = useState(false)
  return celula({ ...args, ordem }, setOrdem, marcado, setMarcado)
}

const base: Controles = { tipo: "Head", texto: "Valor", apoio: "CPF •••.456.789-••", align: "left", conteudo: "Texto", acao: "Ordenável", ordem: "Nenhuma", filtroAtivo: false, iconeEsquerdo: false, esquerdo: "Carteira", iconeDireito: false, direito: "Informação" }
const ordenavel = { if: { arg: "acao", eq: "Ordenável" } }

const meta = {
  title: "Componentes/Table/Célula",
  // Clicar para ordenar na amostra atualiza o controle Ordem.
  render: function Amostra(args) {
    const [, atualizar] = useArgs<Controles>()
    const [marcado, setMarcado] = useState(false)
    return <div className="w-64">{celula(args, (ordem) => atualizar({ ordem }), marcado, setMarcado)}</div>
  },
  parameters: pagina("A menor peça da tabela: `TableHead` no cabeçalho e `TableCell` no corpo e no rodapé. A célula não tem borda nem fundo próprios: a borda, o hover e o selecionado são da Linha. O Head descreve a coluna e pode ordená-la; o Body mostra o dado; o Footer, o total. No Figma, a célula ocupa a largura da linha (Fill container), e as linhas com o mesmo número de células alinham as colunas sozinhas. Os controles mudam com o Type."),
  argTypes: {
    tipo: { name: "Type", control: "inline-radio", options: tipos, description: "`Head` é o `TableHead`: 48 px de altura e negrito (`text-mono-sm-bold`). `Body` é o `TableCell`, com padding de 12 px. `Footer` é o mesmo `TableCell` dentro do `TableFooter`, que dá o fundo `muted/50` e o negrito.", table: { category: "Aparência" } },
    texto: { name: "Text", control: "text", description: "O nome da coluna no Head; o dado no Body; o total no Footer.", table: { category: "Conteúdo" } },
    align: { name: "Align", control: "inline-radio", options: alinhamentos, description: "No código, `className=\"text-right\"`. Valores e ações vão à direita; o resto, à esquerda. No Head ordenável à direita, a seta passa para antes do texto, para o texto alinhar com o das células.", table: { category: "Aparência" } },
    conteudo: { name: "Content", control: "inline-radio", options: conteudos, if: { arg: "tipo", eq: "Body" }, description: "O dado: **Texto**; **Duas linhas**, o texto com um de apoio embaixo, em `text-muted`, como o nome e o CPF; **Badge**, para status; **Checkbox**, para selecionar a linha (a célula perde o padding da direita); **Switch**, para ligar e desligar algo da linha; **Button**, uma ação com nome (`outline`, `xs`, para não aumentar a linha); **Ações**, o botão que abre o menu da linha; **Slot**, qualquer outro dado. Os ícones valem para Texto, Duas linhas, Badge e Button.", table: { category: "Conteúdo" } },
    apoio: { name: "Supporting text", control: "text", if: { arg: "conteudo", eq: "Duas linhas" }, description: "A segunda linha de Duas linhas.", table: { category: "Conteúdo" } },
    acao: { name: "Head action", control: "inline-radio", options: acoesDoHead, if: { arg: "tipo", eq: "Head" }, description: "**Ordenável**: o nome vira um botão com a seta da ordem. No código, o clique alterna a ordem ou abre um menu com ordenar, filtrar e ocultar a coluna (`menu`), como no exemplo Tasks do shadcn; o desenho é o mesmo, e a Data table da página Tabela mostra os dois. **Seleção**: o Checkbox de selecionar todas, na coluna de seleção.", table: { category: "Conteúdo" } },
    ordem: { name: "Ordem", control: "inline-radio", options: ordens, ...ordenavel, description: "A seta mostra o estado: ⇅ apagada sem ordem, ↑ crescente, ↓ decrescente. Clique no nome para alternar. No código, `aria-sort` no `TableHead` avisa o leitor de tela.", table: { category: "Estado" } },
    filtroAtivo: { name: "Filtro ativo", control: "boolean", ...ordenavel, description: "Um ícone de filtro ao lado do nome, quando a coluna está filtrada pelo menu.", table: { category: "Estado" } },
    iconeEsquerdo: { name: "Icon left", control: "boolean", description: "Um ícone antes do texto, para identificar a coluna ou o dado. Vale no Head (menos na Seleção), no Body (Texto e Badge) e no Footer.", table: { category: "Conteúdo" } },
    esquerdo: { name: "↳ Icon left", control: "inline-radio", options: Object.keys(icones), if: { arg: "iconeEsquerdo" }, description: "No Figma, a troca de ícone.", table: { category: "Conteúdo" } },
    iconeDireito: { name: "Icon right", control: "boolean", description: "Um ícone depois do texto, como o ⓘ de uma explicação. Vale nos mesmos lugares do esquerdo.", table: { category: "Conteúdo" } },
    direito: { name: "↳ Icon right", control: "inline-radio", options: Object.keys(icones), if: { arg: "iconeDireito" }, description: "No Figma, a troca de ícone.", table: { category: "Conteúdo" } },
  },
  args: base,
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

export const Tipos: Story = {
  name: "Type",
  parameters: vitrine("A mesma coluna nas três seções da tabela. A linha embaixo do Head vem do `TableHeader`; a de cima do Footer, do `TableFooter`."),
  render: () => <Opcoes>{tipos.map((t) => <Opcao key={t} nome={t}><Viva {...base} tipo={t} acao="Nenhuma" texto={t === "Head" ? "Valor" : t === "Footer" ? "Total" : "R$ 250,00"} /></Opcao>)}</Opcoes>,
}

export const Acoes: Story = {
  name: "Ação do Head",
  parameters: vitrine("Clique no Ordenável para alternar a ordem e na Seleção para marcar. Com filtro, o ícone de filtro aparece ao lado do nome."),
  render: () => (
    <Opcoes>
      {acoesDoHead.map((a) => <Opcao key={a} nome={a}><Viva {...base} acao={a} /></Opcao>)}
      <Opcao nome="Ordenável · filtro ativo"><Viva {...base} filtroAtivo /></Opcao>
    </Opcoes>
  ),
}

export const Ordens: Story = {
  name: "Ordem",
  parameters: vitrine("A seta em cada estado. Clique para seguir para o próximo."),
  render: () => <Opcoes>{ordens.map((o) => <Opcao key={o} nome={o}><Viva {...base} ordem={o} /></Opcao>)}</Opcoes>,
}

export const Icones: Story = {
  name: "Ícones",
  parameters: vitrine("Ícone antes do texto, depois dele, ou os dois, no Head, no Body (Texto e Badge) e no Footer."),
  render: () => (
    <Opcoes>
      <Opcao nome="Esquerdo · Head"><Viva {...base} acao="Nenhuma" iconeEsquerdo /></Opcao>
      <Opcao nome="Direito · Head"><Viva {...base} texto="Vencimento" acao="Nenhuma" iconeDireito /></Opcao>
      <Opcao nome="Os dois · Head ordenável"><Viva {...base} texto="Vencimento" esquerdo="Calendário" iconeEsquerdo iconeDireito /></Opcao>
      <Opcao nome="Esquerdo · Body"><Viva {...base} tipo="Body" texto="Ana Souza" esquerdo="Pessoa" iconeEsquerdo /></Opcao>
      <Opcao nome="Esquerdo · Badge"><Viva {...base} tipo="Body" conteudo="Badge" texto="Atrasado" esquerdo="Informação" iconeEsquerdo /></Opcao>
      <Opcao nome="Esquerdo · Footer"><Viva {...base} tipo="Footer" texto="Total" iconeEsquerdo /></Opcao>
    </Opcoes>
  ),
}

// Cada conteúdo com um dado do jeito que aparece nos exemplos.
const dados: Record<Conteudo, Partial<Controles>> = {
  Texto: { texto: "FAT-001" }, "Duas linhas": { texto: "Ana Souza" }, Badge: { texto: "Pendente" }, Checkbox: { texto: "FAT-001" },
  Switch: { texto: "Débito automático" }, Button: { texto: "Pagar" }, Ações: { texto: "FAT-001", align: "right" }, Slot: {},
}

export const Conteudos: Story = {
  name: "Conteúdo do Body",
  parameters: vitrine("Os dados que cabem numa célula, dos exemplos do shadcn e do uso no banco. Checkbox, Switch, Button e Ações ficam em colunas estreitas; Duas linhas deixa a linha mais alta."),
  render: () => <Opcoes>{conteudos.map((c) => <Opcao key={c} nome={c}><Viva {...base} tipo="Body" conteudo={c} {...dados[c]} /></Opcao>)}</Opcoes>,
}

export const Alinhamentos: Story = {
  name: "Align",
  parameters: vitrine("Sem a classe, à esquerda; com `text-right`, à direita, como os valores em reais. O texto monoespaçado alinha os algarismos de uma linha para a outra. No Head ordenável, a seta troca de lado junto."),
  render: () => (
    <Opcoes>
      {alinhamentos.map((a) => <Opcao key={a} nome={`${a} · Body`}><Viva {...base} tipo="Body" texto="R$ 250,00" align={a} /></Opcao>)}
      {alinhamentos.map((a) => <Opcao key={`h-${a}`} nome={`${a} · Head`}><Viva {...base} ordem="Crescente" align={a} /></Opcao>)}
    </Opcoes>
  ),
}
