import { ArrowUpDownIcon, MoreHorizontalIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Slot } from "../../componentes/Opcoes"

// Peças comuns às páginas Célula, Linha e Tabela.

export const conteudos = ["Texto", "Badge", "Checkbox", "Ações", "Ordenável", "Slot"] as const
export type Conteudo = (typeof conteudos)[number]
export const alinhamentos = ["left", "right"] as const
export type Alinhamento = (typeof alinhamentos)[number]

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

export const conteudo = (tipo: Conteudo, texto: string) => ({
  Texto: () => texto,
  Badge: () => <Badge variant={variantes[texto as Status] ?? "outline"}>{texto}</Badge>,
  Checkbox: () => <Checkbox aria-label={`Selecionar ${texto}`} />,
  Ações: () => <Acoes rotulo={`Ações de ${texto}`} />,
  Ordenável: () => <Button variant="ghost">{texto}<ArrowUpDownIcon /></Button>,
  Slot: () => <Slot className="min-h-8" />,
})[tipo]()

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
export type OpcoesDaLinha = { tipo: TipoDeLinha; colunas: number; selecao: boolean; acoes: boolean; fatura?: Fatura; total?: number; expandida?: boolean; selecionada?: boolean }

// Uma linha montada com as células da página Célula: Head no cabeçalho, Cell no corpo e no rodapé.
export function Linha({ tipo, colunas, selecao, acoes, fatura = faturas[0], total = 0, expandida, selecionada }: OpcoesDaLinha) {
  const cols = visiveis(colunas)
  if (tipo === "Header") {
    return (
      <TableRow>
        {selecao && <TableHead><Checkbox aria-label="Selecionar todas" checked={false} /></TableHead>}
        {cols.map((c) => <TableHead key={c.nome} className={"direita" in c ? "text-right" : undefined}>{c.nome}</TableHead>)}
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
    <TableRow data-state={selecionada ? "selected" : undefined}>
      {selecao && <TableCell><Checkbox aria-label={`Selecionar ${fatura.id}`} checked={selecionada ?? false} /></TableCell>}
      {cols.map((c) => <TableCell key={c.nome} className={"direita" in c ? "text-right" : undefined}>{c.celula(fatura)}</TableCell>)}
      {acoes && <TableCell className="text-right"><Acoes rotulo={`Ações de ${fatura.id}`} expandida={expandida} /></TableCell>}
    </TableRow>
  )
}
