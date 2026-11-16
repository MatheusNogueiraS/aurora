import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { useArgs } from "storybook/preview-api"

import { Table, TableBody, TableFooter, TableHeader } from "@/components/ui/table"
import { Opcao, Opcoes, Simula, pagina, vitrine } from "../../componentes/Opcoes"
import { Linha, tiposDeLinha, type OpcoesDaLinha } from "./partes"

const estados = ["Default", "Hover", "Selected", "Expanded"] as const
type Estado = (typeof estados)[number]

type Controles = Omit<OpcoesDaLinha, "fatura" | "total" | "expandida" | "selecionada"> & { estado: Estado; borda: boolean }

// A linha vai na seção do Type. No corpo, a última linha perde a borda; a `tr` escondida depois dela deixa a borda aparecer.
// Marcar a caixa da linha leva ao State Selected, e desmarcar, ao Default; quem chama guarda o estado.
const linha = ({ estado, borda, ...props }: Controles, aoSelecionar?: (v: boolean) => void) => {
  // O Expanded vem do botão de ações, então ele liga as Ações.
  const conteudo = <Linha {...props} acoes={props.acoes || estado === "Expanded"} total={250} selecionada={estado === "Selected"} aoSelecionar={aoSelecionar} expandida={estado === "Expanded"} />
  return (
    <Simula estado={estado === "Hover" ? "Hover" : "Default"} so="[data-slot=table-row]">
      <Table>
        {props.tipo === "Header" && <TableHeader>{conteudo}</TableHeader>}
        {props.tipo === "Body" && <TableBody>{conteudo}{borda && <tr hidden />}</TableBody>}
        {props.tipo === "Footer" && <TableFooter>{conteudo}</TableFooter>}
      </Table>
    </Simula>
  )
}

// Para as vitrines: cada linha guarda o próprio State.
function Viva(props: Controles) {
  const [estado, setEstado] = useState(props.estado)
  return linha({ ...props, estado }, (v) => setEstado(v ? "Selected" : "Default"))
}

const base: Controles = { tipo: "Body", colunas: 4, selecao: true, acoes: false, estado: "Default", borda: true }

const meta = {
  title: "Em construção/Table/Linha",
  // Marcar a caixa na amostra atualiza o controle State.
  render: function Amostra(args) {
    const [, atualizar] = useArgs<Controles>()
    return <div className="w-2xl max-w-full">{linha(args, (v) => atualizar({ estado: v ? "Selected" : "Default" }))}</div>
  },
  parameters: pagina("`TableRow`: uma fila de células da página Célula. É a linha que tem a borda de baixo e o fundo de hover e de selecionado. A linha só recebe Células, sem slot para outros componentes. No Figma, as células ficam em Fill container, e a mesma quantidade de células em todas as linhas mantém as colunas alinhadas."),
  argTypes: {
    tipo: { name: "Type", control: "inline-radio", options: tiposDeLinha, description: "Em que seção a linha está: `TableHeader` (células Head, borda embaixo), `TableBody` (células Body) ou `TableFooter` (fundo `muted/50`, negrito e borda em cima). No rodapé, \"Total\" ocupa as colunas antes do valor, com `colSpan`.", table: { category: "Aparência" } },
    colunas: { name: "Colunas", control: { type: "range", min: 1, max: 6, step: 1 }, description: "Quantas células de dados. O Valor fica sempre por último, embaixo do total do rodapé; com uma coluna, só ele aparece.", table: { category: "Conteúdo" } },
    selecao: { name: "Seleção", control: "boolean", description: "Uma célula com Checkbox no começo: \"selecionar todas\" no cabeçalho, \"selecionar esta\" no corpo. Marcar a caixa do corpo leva a linha ao Selected.", table: { category: "Conteúdo" } },
    acoes: { name: "Ações", control: "boolean", description: "Uma célula com o menu de ações no fim. No cabeçalho, ela fica vazia, com o nome só para o leitor de tela.", table: { category: "Conteúdo" } },
    estado: { name: "State", control: "inline-radio", options: estados, description: "**Hover** (simulado): fundo `muted/50`. **Selected**: `data-state=\"selected\"`, fundo `muted`, que a linha recebe quando a caixa dela é marcada. **Expanded**: o menu de ações aberto (`aria-expanded`) mantém o fundo do hover. Selected e Expanded são do Body; o Expanded liga as Ações. O código aplica o hover a qualquer linha, inclusive à do cabeçalho.", table: { category: "Estado" } },
    borda: { name: "Borda", control: "boolean", description: "A linha de baixo. O `TableBody` tira a borda da última linha, então desligado é a última do corpo. Só muda o Body: o cabeçalho tem sempre a borda, e o rodapé nunca.", table: { category: "Aparência" } },
  },
  args: base,
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

export const Tipos: Story = {
  name: "Type",
  parameters: vitrine("A mesma linha de quatro colunas no cabeçalho, no corpo e no rodapé."),
  render: () => <Opcoes larga>{tiposDeLinha.map((t) => <Opcao key={t} nome={t}><Viva {...base} tipo={t} /></Opcao>)}</Opcoes>,
}

export const Estados: Story = {
  name: "State",
  parameters: vitrine("Os estados de uma linha do corpo, com seleção e ações para mostrar o Checkbox marcado e o botão de ações aberto."),
  render: () => <Opcoes larga>{estados.map((e) => <Opcao key={e} nome={e}><Viva {...base} colunas={2} acoes estado={e} /></Opcao>)}</Opcoes>,
}

export const SelecaoEAcoes: Story = {
  name: "Seleção e ações",
  parameters: vitrine("As duas colunas estreitas das pontas, dos exemplos Actions e Data table do shadcn, nas três seções."),
  render: () => <Opcoes larga>{tiposDeLinha.map((t) => <Opcao key={t} nome={t}><Viva {...base} tipo={t} colunas={2} acoes /></Opcao>)}</Opcoes>,
}

export const Bordas: Story = {
  name: "Borda",
  parameters: vitrine("Com borda, uma linha do meio do corpo; sem borda, a última."),
  render: () => <Opcoes larga>{[true, false].map((b) => <Opcao key={String(b)} nome={b ? "Com borda" : "Sem borda"}><Viva {...base} colunas={3} borda={b} /></Opcao>)}</Opcoes>,
}
