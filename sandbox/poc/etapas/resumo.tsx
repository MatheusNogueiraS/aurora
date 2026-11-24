import { PencilIcon, ShoppingCartIcon, Trash2Icon } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { brl, parcela, semItem, useAtendimento } from "../estado"
import { useRefino } from "../refino"
import { FinalizarAtendimento } from "./identificacao"

export function Resumo() {
  const { a, set, ir, produtos } = useAtendimento()
  const r = useRefino()
  const itens = produtos.filter((p) => a.carrinho[p.id])
  const remover = (id: string, nome: string) => {
    set((s) => ({ ...s, carrinho: semItem(s.carrinho, id) }))
    toast.add({ title: "Produto removido da proposta", description: nome })
  }

  if (!itens.length)
    return (
      <Card>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ShoppingCartIcon /></EmptyMedia>
            <EmptyTitle>Nenhum produto na proposta</EmptyTitle>
            <EmptyDescription>Volte à simulação para escolher o que entra na proposta.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent><Button onClick={() => ir("simulacao")}>Voltar à simulação</Button></EmptyContent>
        </Empty>
      </Card>
    )

  return (
    <div className="flex flex-col gap-(--gap-2xl)">
      {a.matriculas.map((m) => {
        const daMatricula = itens.filter((p) => p.matricula === m)
        if (!daMatricula.length) return null
        // Refinamento: na conferência final os valores ficam à vista, numa tabela com os números alinhados (H5, H6).
        if (r)
          return (
            <Card key={m}>
              <CardHeader><CardTitle>INSS · Matrícula {m}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Valor liberado</TableHead>
                      <TableHead className="text-right">Prazo</TableHead>
                      <TableHead>Seguro</TableHead>
                      <TableHead><span className="sr-only">Ações</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daMatricula.map((p) => {
                      const { valor, prazo } = a.carrinho[p.id]
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="whitespace-normal"><span className="text-label-sm">{p.nome}</span><br /><span className="text-muted">{p.detalhe}</span></TableCell>
                          <TableCell className="text-right tabular-nums">{brl(valor)}</TableCell>
                          <TableCell className="text-right tabular-nums">{prazo ? `${prazo}x de ${brl(parcela(valor, prazo))}` : "—"}</TableCell>
                          <TableCell>{p.seguro ? "Incluído" : "—"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" aria-label={`Editar ${p.nome}`} onClick={() => ir("simulacao")}><PencilIcon /></Button>
                            <Button variant="ghost" size="icon" aria-label={`Remover ${p.nome}`} onClick={() => remover(p.id, p.nome)}><Trash2Icon /></Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        return (
          <Card key={m}>
            <CardHeader><CardTitle>INSS · Matrícula {m}</CardTitle></CardHeader>
            <CardContent>
              <Accordion>
                {daMatricula.map((p) => {
                  const { valor, prazo } = a.carrinho[p.id]
                  return (
                    <AccordionItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-(--gap-2xs)">
                        <AccordionTrigger className="flex-1">
                          <span>{p.nome} · {p.detalhe} <span className="text-body-xs text-muted">(Liberado: {brl(valor)})</span></span>
                        </AccordionTrigger>
                        <Button variant="ghost" size="icon" aria-label={`Editar ${p.nome}`} onClick={() => ir("simulacao")}><PencilIcon /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Remover ${p.nome}`} onClick={() => remover(p.id, p.nome)}><Trash2Icon /></Button>
                      </div>
                      <AccordionContent>
                        <dl className="grid grid-cols-2 gap-(--gap-sm) pb-(--padding-2xl) md:grid-cols-3">
                          <div><dt className="text-body-xs text-muted">Valor liberado</dt><dd className="text-label-sm">{brl(valor)}</dd></div>
                          {prazo && <div><dt className="text-body-xs text-muted">Prazo</dt><dd className="text-label-sm">{prazo}x {brl(parcela(valor, prazo))}</dd></div>}
                          {p.seguro && <div><dt className="text-body-xs text-muted">Seguro</dt><dd className="text-label-sm">Incluído</dd></div>}
                        </dl>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </CardContent>
          </Card>
        )
      })}
      <FinalizarAtendimento />
    </div>
  )
}
