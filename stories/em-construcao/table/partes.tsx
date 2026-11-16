import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, ChevronsUpDownIcon, EyeOffIcon, InfoIcon, ListFilterIcon, MoreHorizontalIcon, UserIcon, WalletIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Slot } from "../../componentes/Opcoes"

// Peças comuns às páginas Célula, Linha e Tabela.

export const conteudos = ["Texto", "Badge", "Checkbox", "Ações", "Slot"] as const
export type Conteudo = (typeof conteudos)[number]
export const alinhamentos = ["left", "right"] as const
export type Alinhamento = (typeof alinhamentos)[number]
export const icones = { Carteira: WalletIcon, Calendário: CalendarIcon, Informação: InfoIcon, Pessoa: UserIcon }
export type Icone = keyof typeof icones
// Ícone esquerdo e direito: no Figma, um boolean cada, com a troca de ícone à parte.
export type Icones = { esquerdo?: Icone; direito?: Icone }

const variantes = { Pago: "outline", Pendente: "secondary", Atrasado: "destructive" } as const
export type Status = keyof typeof variantes

// O menu de ações do exemplo Actions do shadcn. `expandida` troca o menu por um botão com `aria-expanded`, para mostrar o estado sem abrir o menu.
export function Acoes({ rotulo, expandida }: { rotulo: string; expandida?: boolean }) {
  if (expandida) return <Button variant="ghost" size="icon-xs" aria-label={rotulo} aria-expanded><MoreHorizontalIcon /></Button>
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={rotulo} />}><MoreHorizontalIcon /></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Editar</DropdownMenuItem>
        <DropdownMenuItem>Duplicar</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Excluir</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// O texto com os ícones dos lados, no Head, no Body e no Footer.
export function ComIcones({ texto, esquerdo, direito }: { texto: string } & Icones) {
  const Esquerdo = esquerdo && icones[esquerdo]
  const Direito = direito && icones[direito]
  if (!Esquerdo && !Direito) return <>{texto}</>
  return <span className="inline-flex items-center gap-(--gap-xs) [&>svg]:size-(--size-md)">{Esquerdo && <Esquerdo />}{texto}{Direito && <Direito />}</span>
}

export const conteudo = (tipo: Conteudo, texto: string, lados: Icones = {}) => {
  const Esquerdo = lados.esquerdo && icones[lados.esquerdo]
  const Direito = lados.direito && icones[lados.direito]
  return {
    Texto: () => <ComIcones texto={texto} {...lados} />,
    Badge: () => <Badge variant={variantes[texto as Status] ?? "outline"}>{Esquerdo && <Esquerdo data-icon="inline-start" />}{texto}{Direito && <Direito data-icon="inline-end" />}</Badge>,
    Checkbox: () => <Checkbox aria-label={`Selecionar ${texto}`} />,
    Ações: () => <Acoes rotulo={`Ações de ${texto}`} />,
    Slot: () => <Slot className="min-h-8" />,
  }[tipo]()
}

export const acoesDoHead = ["Nenhuma", "Ordenável", "Seleção"] as const
export type AcaoDoHead = (typeof acoesDoHead)[number]
export const ordens = ["Nenhuma", "Crescente", "Decrescente"] as const
export type Ordem = (typeof ordens)[number]

const setas = { Nenhuma: ChevronsUpDownIcon, Crescente: ArrowUpIcon, Decrescente: ArrowDownIcon }
const ariaSort = { Nenhuma: "none", Crescente: "ascending", Decrescente: "descending" } as const
const proxima: Record<Ordem, Ordem> = { Nenhuma: "Crescente", Crescente: "Decrescente", Decrescente: "Nenhuma" }

export type OpcoesDoHead = Icones & {
  texto: string; acao?: AcaoDoHead; ordem?: Ordem; filtroAtivo?: boolean; align?: Alinhamento
  // Só comportamento, sem mudar o desenho: o clique abre o menu de ordenar, filtrar e ocultar em vez de alternar a ordem.
  menu?: boolean; valores?: string[]; filtrados?: string[]
  aoOrdenar?: (o: Ordem) => void; aoFiltrar?: (v: string[]) => void; aoOcultar?: () => void
  marcado?: boolean | "algumas"; aoMarcar?: (v: boolean) => void
}

// O TableHead: o nome da coluna e, se ela for ordenável, o botão que ordena.
export function Cabecalho({ texto, acao = "Nenhuma", ordem = "Nenhuma", filtroAtivo, esquerdo, direito, align = "left", menu, valores = [], filtrados = [], aoOrdenar, aoFiltrar, aoOcultar, marcado = false, aoMarcar }: OpcoesDoHead) {
  const direita = align === "right"
  const Seta = setas[ordem]
  const nome = <ComIcones texto={texto} esquerdo={esquerdo} direito={direito} />
  // Na coluna à direita, os ícones de estado vão antes do texto, para o texto alinhar com o das células.
  const estado = <>{filtroAtivo && <ListFilterIcon data-icon={direita ? "inline-start" : "inline-end"} role="img" aria-label="Filtrado" />}<Seta data-icon={direita ? "inline-start" : "inline-end"} className={ordem === "Nenhuma" ? "text-muted" : undefined} /></>
  const rotulo = <>{direita && estado}{nome}{!direita && estado}</>
  // O botão sm tem o padding da célula; a margem negativa do mesmo token alinha o texto com o das células.
  const botao = `text-mono-sm-bold ${direita ? "-mr-(--padding-lg)" : "-ml-(--padding-lg)"}`
  const itens = valores.map((v) => <DropdownMenuCheckboxItem key={v} checked={filtrados.includes(v)} onCheckedChange={(c) => aoFiltrar?.(c ? [...filtrados, v] : filtrados.filter((x) => x !== v))}>{v}</DropdownMenuCheckboxItem>)
  const dentro = {
    Nenhuma: () => nome,
    Seleção: () => <Checkbox aria-label="Selecionar todas" checked={marcado === true} indeterminate={marcado === "algumas"} onCheckedChange={(v) => aoMarcar?.(v)} />,
    Ordenável: () => menu ? (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className={botao} />}>{rotulo}</DropdownMenuTrigger>
        <DropdownMenuContent align={direita ? "end" : "start"}>
          <DropdownMenuItem onClick={() => aoOrdenar?.("Crescente")}><ArrowUpIcon />Crescente</DropdownMenuItem>
          <DropdownMenuItem onClick={() => aoOrdenar?.("Decrescente")}><ArrowDownIcon />Decrescente</DropdownMenuItem>
          {itens.length > 0 && <><DropdownMenuSeparator /><DropdownMenuSub><DropdownMenuSubTrigger><ListFilterIcon />Filtrar</DropdownMenuSubTrigger><DropdownMenuSubContent>{itens}</DropdownMenuSubContent></DropdownMenuSub></>}
          {aoOcultar && <><DropdownMenuSeparator /><DropdownMenuItem onClick={aoOcultar}><EyeOffIcon />Ocultar coluna</DropdownMenuItem></>}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : <Button variant="ghost" size="sm" className={botao} onClick={() => aoOrdenar?.(proxima[ordem])}>{rotulo}</Button>,
  }[acao]()
  return <TableHead className={direita ? "text-right" : undefined} aria-sort={acao === "Ordenável" ? ariaSort[ordem] : undefined}>{dentro}</TableHead>
}

export type Fatura = { id: string; cliente: string; status: Status; forma: string; vencimento: string; valor: number }
export const faturas: Fatura[] = [
  { id: "FAT-001", cliente: "Ana Souza", status: "Pago", forma: "Pix", vencimento: "05/11", valor: 250 },
  { id: "FAT-002", cliente: "Bruno Lima", status: "Pendente", forma: "Boleto", vencimento: "10/11", valor: 150 },
  { id: "FAT-003", cliente: "Carla Dias", status: "Pago", forma: "Cartão", vencimento: "12/11", valor: 350 },
  { id: "FAT-004", cliente: "Diego Alves", status: "Atrasado", forma: "Boleto", vencimento: "01/11", valor: 450 },
  { id: "FAT-005", cliente: "Elisa Rocha", status: "Pago", forma: "Pix", vencimento: "15/11", valor: 550 },
  { id: "FAT-006", cliente: "Felipe Melo", status: "Pendente", forma: "Cartão", vencimento: "18/11", valor: 200 },
  { id: "FAT-007", cliente: "Gabriela Reis", status: "Pago", forma: "Pix", vencimento: "20/11", valor: 300 },
  { id: "FAT-008", cliente: "Heitor Nunes", status: "Pendente", forma: "Boleto", vencimento: "22/11", valor: 120 },
  { id: "FAT-009", cliente: "Isabela Prado", status: "Atrasado", forma: "Cartão", vencimento: "03/11", valor: 780 },
  { id: "FAT-010", cliente: "João Pires", status: "Pago", forma: "Pix", vencimento: "25/11", valor: 95 },
]
export const reais = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// Valor fica sempre por último, embaixo do total do rodapé; o controle Colunas escolhe quantas das outras aparecem antes dele.
const outras = [
  { nome: "Fatura", celula: (f: Fatura) => f.id },
  { nome: "Cliente", celula: (f: Fatura) => f.cliente },
  { nome: "Status", celula: (f: Fatura) => conteudo("Badge", f.status) },
  { nome: "Forma", celula: (f: Fatura) => f.forma },
  { nome: "Vencimento", celula: (f: Fatura) => f.vencimento },
]
const valor = { nome: "Valor", celula: (f: Fatura) => reais(f.valor), direita: true }
const visiveis = (colunas: number) => [...outras.slice(0, colunas - 1), valor]

export const tiposDeLinha = ["Header", "Body", "Footer"] as const
export type TipoDeLinha = (typeof tiposDeLinha)[number]
export type OpcoesDaLinha = {
  tipo: TipoDeLinha; colunas: number; selecao: boolean; acoes: boolean; fatura?: Fatura; total?: number; expandida?: boolean
  selecionada?: boolean | "algumas"; aoSelecionar?: (v: boolean) => void
}

// Uma linha montada com as células da página Célula. `selecionada` no Header marca o "selecionar todas".
export function Linha({ tipo, colunas, selecao, acoes, fatura = faturas[0], total = 0, expandida, selecionada = false, aoSelecionar }: OpcoesDaLinha) {
  const cols = visiveis(colunas)
  if (tipo === "Header") {
    return (
      <TableRow>
        {selecao && <Cabecalho texto="" acao="Seleção" marcado={selecionada} aoMarcar={aoSelecionar} />}
        {cols.map((c) => <Cabecalho key={c.nome} texto={c.nome} align={"direita" in c ? "right" : "left"} />)}
        {acoes && <TableHead><span className="sr-only">Ações</span></TableHead>}
      </TableRow>
    )
  }
  if (tipo === "Footer") {
    // "Total" ocupa as colunas antes do valor, com um colSpan.
    const antes = cols.length - 1 + (selecao ? 1 : 0)
    return (
      <TableRow>
        {antes > 0 && <TableCell colSpan={antes}>Total</TableCell>}
        <TableCell className="text-right">{reais(total)}</TableCell>
        {acoes && <TableCell />}
      </TableRow>
    )
  }
  return (
    <TableRow data-state={selecionada === true ? "selected" : undefined}>
      {selecao && <TableCell><Checkbox aria-label={`Selecionar ${fatura.id}`} checked={selecionada === true} onCheckedChange={(v) => aoSelecionar?.(v)} /></TableCell>}
      {cols.map((c) => <TableCell key={c.nome} className={"direita" in c ? "text-right" : undefined}>{c.celula(fatura)}</TableCell>)}
      {acoes && <TableCell className="text-right"><Acoes rotulo={`Ações de ${fatura.id}`} expandida={expandida} /></TableCell>}
    </TableRow>
  )
}
