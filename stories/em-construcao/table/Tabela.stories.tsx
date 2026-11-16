import type { Meta, StoryObj } from "@storybook/react-vite"
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Opcao, Opcoes, pagina, vitrine } from "../../componentes/Opcoes"
import { Acoes, Cabecalho, faturas, Linha, reais, type Ordem } from "./partes"

type Controles = { colunas: number; linhas: number; cabecalho: boolean; selecao: boolean; acoes: boolean; rodape: boolean; legenda: boolean; selecionada: boolean }

// As caixas marcam as linhas de verdade. "Linha selecionada" só dá o ponto de partida: mudar o controle recomeça a tabela (a `key` de quem chama).
function Tabela({ colunas, linhas, cabecalho, selecao, acoes, rodape, legenda, selecionada }: Controles) {
  const mostradas = faturas.slice(0, linhas)
  const [marcadas, setMarcadas] = useState<string[]>(selecionada ? [mostradas[Math.min(1, linhas - 1)].id] : [])
  const visiveis = mostradas.filter((f) => marcadas.includes(f.id)).length
  const todas = visiveis === mostradas.length ? true : visiveis ? "algumas" : false
  const linha = { colunas, selecao, acoes }
  return (
    <Table>
      {legenda && <TableCaption>Faturas de novembro.</TableCaption>}
      {cabecalho && <TableHeader><Linha tipo="Header" {...linha} selecionada={todas} aoSelecionar={(v) => setMarcadas(v ? mostradas.map((f) => f.id) : [])} /></TableHeader>}
      <TableBody>
        {mostradas.map((f) => <Linha key={f.id} tipo="Body" {...linha} fatura={f} selecionada={marcadas.includes(f.id)} aoSelecionar={(v) => setMarcadas((m) => (v ? [...m, f.id] : m.filter((id) => id !== f.id)))} />)}
      </TableBody>
      {rodape && <TableFooter><Linha tipo="Footer" {...linha} total={mostradas.reduce((s, f) => s + f.valor, 0)} /></TableFooter>}
    </Table>
  )
}
const tabela = (args: Controles) => <Tabela key={`${args.selecionada}-${args.linhas}`} {...args} />

const base: Controles = { colunas: 4, linhas: 4, cabecalho: true, selecao: false, acoes: false, rodape: true, legenda: true, selecionada: false }

const meta = {
  title: "Em construção/Table/Tabela",
  render: (args) => <div className="w-2xl max-w-full">{tabela(args)}</div>,
  parameters: pagina("`Table`: uma linha de cabeçalho, o corpo com as linhas, o rodapé e a legenda, montados com as páginas Linha e Célula. A tabela só recebe Linhas, sem slot para outros componentes: o cabeçalho, o corpo e o rodapé são feitos de Linhas, e as Linhas, de Células. O texto é monoespaçado (`text-mono-sm`), para os números alinharem. A largura preenche o pai e, se faltar espaço, a tabela rola para o lado. A amostra do topo junta os exemplos Demo, Footer e Actions do shadcn: ligue Rodapé, Legenda e Ações."),
  argTypes: {
    colunas: { name: "Colunas", control: { type: "range", min: 1, max: 6, step: 1 }, description: "Quantas colunas de dados em cada linha. O Valor fica sempre por último.", table: { category: "Conteúdo" } },
    linhas: { name: "Linhas", control: { type: "range", min: 1, max: 10, step: 1 }, description: "Quantas linhas no `TableBody`. O total do rodapé soma as que aparecem.", table: { category: "Conteúdo" } },
    cabecalho: { name: "Cabeçalho", control: "boolean", description: "`TableHeader` com uma Linha Header.", table: { category: "Conteúdo" } },
    selecao: { name: "Seleção", control: "boolean", description: "Coluna de Checkbox no começo de todas as linhas. Marcar a caixa seleciona a linha; a do cabeçalho seleciona todas.", table: { category: "Conteúdo" } },
    acoes: { name: "Ações", control: "boolean", description: "Coluna com o menu de ações no fim de todas as linhas, como no exemplo Actions do shadcn.", table: { category: "Conteúdo" } },
    rodape: { name: "Rodapé", control: "boolean", description: "`TableFooter` com uma Linha Footer, para o total.", table: { category: "Conteúdo" } },
    legenda: { name: "Legenda", control: "boolean", description: "`TableCaption`, embaixo da tabela.", table: { category: "Conteúdo" } },
    selecionada: { name: "Linha selecionada", control: "boolean", description: "Começa com a segunda linha (ou a única) com `data-state=\"selected\"`, como fica depois de marcar a caixa dela. Com Seleção ligada, as caixas mudam a seleção dali em diante.", table: { category: "Estado" } },
  },
  args: base,
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

const noCard = (bordaABorda: boolean) => {
  const t = tabela({ ...base, colunas: 3, linhas: 3, legenda: false })
  return (
    <Card className="w-full">
      <CardHeader><CardTitle>Faturas</CardTitle><CardDescription>Vencimento em novembro.</CardDescription></CardHeader>
      {bordaABorda ? t : <CardContent>{t}</CardContent>}
    </Card>
  )
}

export const DentroDoCard: Story = {
  name: "Dentro de um Card",
  parameters: vitrine("O Card é o container da tabela, como o `TableContainer` com `Paper` da MUI. Dentro do `CardContent`, a tabela respeita o padding do Card. Como filha direta do Card, vai de borda a borda, e as linhas encostam nas laterais; a primeira coluna fica com o padding da célula (12 px), menor que o do título (24 px)."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="No CardContent">{noCard(false)}</Opcao>
      <Opcao nome="Borda a borda">{noCard(true)}</Opcao>
    </Opcoes>
  ),
}

const pagamentos = [
  { id: "p1", status: "Pago", email: "ana@exemplo.com", valor: 316 },
  { id: "p2", status: "Pago", email: "bruno@exemplo.com", valor: 242 },
  { id: "p3", status: "Processando", email: "carla@exemplo.com", valor: 837 },
  { id: "p4", status: "Pendente", email: "diego@exemplo.com", valor: 874 },
  { id: "p5", status: "Falhou", email: "elisa@exemplo.com", valor: 721 },
  { id: "p6", status: "Pago", email: "felipe@exemplo.com", valor: 129 },
  { id: "p7", status: "Pendente", email: "gabriela@exemplo.com", valor: 450 },
]
const nomes = { status: "Status", email: "E-mail", valor: "Valor" }
type Coluna = keyof typeof nomes
const porPagina = 5

// O exemplo Data table do shadcn, com estado do React no lugar do TanStack Table: filtro, ordenação, seleção, colunas e páginas.
function TabelaDeDados() {
  const [filtro, setFiltro] = useState("")
  const [status, setStatus] = useState<string[]>([])
  const [ordem, setOrdem] = useState<{ coluna: Coluna; sentido: Ordem }>({ coluna: "email", sentido: "Nenhuma" })
  const [marcadas, setMarcadas] = useState<string[]>([])
  const [visiveis, setVisiveis] = useState<Record<Coluna, boolean>>({ status: true, email: true, valor: true })
  const [pagina, setPagina] = useState(0)
  const ordenar = (coluna: Coluna) => (sentido: Ordem) => setOrdem({ coluna, sentido })
  const sinal = { Nenhuma: 0, Crescente: 1, Decrescente: -1 }[ordem.sentido]
  const filtradas = pagamentos
    .filter((p) => p.email.includes(filtro.toLowerCase()) && (!status.length || status.includes(p.status)))
    .sort((a, b) => sinal * (ordem.coluna === "valor" ? a.valor - b.valor : a[ordem.coluna].localeCompare(b[ordem.coluna])))
  const naPagina = filtradas.slice(pagina * porPagina, (pagina + 1) * porPagina)
  const todas = naPagina.length > 0 && naPagina.every((p) => marcadas.includes(p.id))
  const colunas = (Object.keys(nomes) as Coluna[]).filter((c) => visiveis[c])
  return (
    <div className="w-2xl max-w-full">
      <div className="flex items-center gap-(--gap-sm) py-(--padding-lg)">
        <Input placeholder="Filtrar e-mails..." value={filtro} onChange={(e) => { setFiltro(e.target.value); setPagina(0) }} className="max-w-sm" aria-label="Filtrar e-mails" />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="ml-auto" />}>Colunas <ChevronDownIcon /></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(nomes) as Coluna[]).map((c) => <DropdownMenuCheckboxItem key={c} checked={visiveis[c]} onCheckedChange={(v) => setVisiveis((s) => ({ ...s, [c]: v }))}>{nomes[c]}</DropdownMenuCheckboxItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-3xl border-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Checkbox aria-label="Selecionar todas" checked={todas} indeterminate={!todas && naPagina.some((p) => marcadas.includes(p.id))} onCheckedChange={(v) => setMarcadas((m) => (v ? [...new Set([...m, ...naPagina.map((p) => p.id)])] : m.filter((id) => !naPagina.some((p) => p.id === id))))} /></TableHead>
              {visiveis.status && <Cabecalho texto="Status" acao="Ordenável" menu ordem={ordem.coluna === "status" ? ordem.sentido : "Nenhuma"} aoOrdenar={ordenar("status")} valores={[...new Set(pagamentos.map((p) => p.status))]} filtrados={status} filtroAtivo={status.length > 0} aoFiltrar={(v) => { setStatus(v); setPagina(0) }} aoOcultar={() => setVisiveis((s) => ({ ...s, status: false }))} />}
              {visiveis.email && <Cabecalho texto="E-mail" acao="Ordenável" ordem={ordem.coluna === "email" ? ordem.sentido : "Nenhuma"} aoOrdenar={ordenar("email")} />}
              {visiveis.valor && <Cabecalho texto="Valor" acao="Ordenável" menu align="right" ordem={ordem.coluna === "valor" ? ordem.sentido : "Nenhuma"} aoOrdenar={ordenar("valor")} aoOcultar={() => setVisiveis((s) => ({ ...s, valor: false }))} />}
              <TableHead><span className="sr-only">Ações</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {naPagina.length ? naPagina.map((p) => {
              const marcada = marcadas.includes(p.id)
              return (
                <TableRow key={p.id} data-state={marcada ? "selected" : undefined}>
                  <TableCell><Checkbox aria-label={`Selecionar ${p.email}`} checked={marcada} onCheckedChange={(v) => setMarcadas((m) => (v ? [...m, p.id] : m.filter((id) => id !== p.id)))} /></TableCell>
                  {visiveis.status && <TableCell>{p.status}</TableCell>}
                  {visiveis.email && <TableCell>{p.email}</TableCell>}
                  {visiveis.valor && <TableCell className="text-right">{reais(p.valor)}</TableCell>}
                  <TableCell className="text-right"><Acoes rotulo={`Ações de ${p.email}`} /></TableCell>
                </TableRow>
              )
            }) : <TableRow><TableCell colSpan={colunas.length + 2} className="h-24 text-center">Nenhum resultado.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-(--gap-sm) py-(--padding-lg)">
        <div className="flex-1 text-body-sm text-muted">{filtradas.filter((p) => marcadas.includes(p.id)).length} de {filtradas.length} linha(s) selecionada(s).</div>
        <Button variant="outline" size="sm" disabled={pagina === 0} onClick={() => setPagina((n) => n - 1)}>Anterior</Button>
        <Button variant="outline" size="sm" disabled={(pagina + 1) * porPagina >= filtradas.length} onClick={() => setPagina((n) => n + 1)}>Próxima</Button>
      </div>
    </div>
  )
}

export const Composicoes: Story = {
  name: "Composições",
  parameters: vitrine("O exemplo Data table do shadcn, com os Heads ordenáveis funcionando nos dois jeitos do código: E-mail alterna a ordem no clique; Status e Valor abrem o menu do exemplo Tasks, com ordenar e ocultar a coluna, e o de Status também com o filtro pela lista de valores, que acende o ícone de filtro no cabeçalho. Tem ainda busca, escolha de colunas, seleção com \"selecionar todas\", menu de ações, linha de \"nenhum resultado\" e paginação. A tabela fica numa moldura com borda; a busca e a paginação ficam fora dela."),
  render: () => <TabelaDeDados />,
}
