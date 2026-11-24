import * as React from "react"
import { CircleCheckIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { brl, parcela, semItem, useAtendimento, type Produto } from "../estado"
import { useRefino } from "../refino"
import { FinalizarAtendimento } from "./identificacao"

const prazos = [12, 15, 24, 36, 48, 60, 72, 84]

export function Simulacao() {
  const { a, avancar, produtos } = useAtendimento()
  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.keys(a.carrinho).length) return avancar()
    toast.add({ type: "error", title: "Carrinho vazio", description: "Adicione pelo menos um produto para seguir." })
  }
  return (
    <form id="form-simulacao" onSubmit={enviar} className="flex flex-col gap-(--gap-2xl)">
      {a.matriculas.map((m) => (
        <Card key={m}>
          <CardHeader>
            <CardTitle>INSS</CardTitle>
            <CardDescription>Matrícula {m}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-(--gap-2xl) md:grid-cols-2">
            {produtos.filter((p) => p.matricula === m).map((p) => <CardProduto key={p.id} produto={p} />)}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Produtos indisponíveis</CardTitle>
          <CardDescription>Matrícula {a.matriculas[0]}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Os motivos no Figma são "Lorem ipsum": ficam como texto de exemplo até a regra real chegar. */}
          <ItemGroup>
            <Item size="sm" className="px-0">
              <ItemContent><ItemTitle>Empréstimo Consignado</ItemTitle><ItemDescription>Motivo da indisponibilidade (texto de exemplo).</ItemDescription></ItemContent>
            </Item>
            <ItemSeparator />
            <Item size="sm" className="px-0">
              <ItemContent><ItemTitle>Cartão Consignado</ItemTitle><ItemDescription>Motivo da indisponibilidade (texto de exemplo).</ItemDescription></ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>

      <FinalizarAtendimento />
    </form>
  )
}

function CardProduto({ produto: p }: { produto: Produto }) {
  const { a, set } = useAtendimento()
  const [editando, setEditando] = React.useState(false)
  // Cada abertura monta a janela de novo, com o valor e o prazo atuais do produto.
  const [aberturas, setAberturas] = React.useState(0)
  const abrir = () => {
    setAberturas((n) => n + 1)
    setEditando(true)
  }
  const escolha = a.carrinho[p.id]
  const no = Boolean(escolha)
  const valor = escolha?.valor ?? p.valor
  const prazo = escolha?.prazo ?? p.prazo
  const salvar = (v: number, pz?: number) => set((s) => ({ ...s, carrinho: { ...s.carrinho, [p.id]: { valor: v, prazo: pz } } }))
  const remover = () => {
    set((s) => ({ ...s, carrinho: semItem(s.carrinho, p.id) }))
    toast.add({ title: "Produto removido do carrinho", description: p.nome })
  }
  const r = useRefino()
  const seguro = p.seguro && <Badge variant="secondary">Com seguro</Badge>
  return (
    <Card size="sm" className={no ? "ring-success" : undefined}>
      <CardHeader>
        <CardTitle className={no ? "flex items-center gap-(--gap-xs) text-success" : undefined}>
          {p.nome} {no && <><CircleCheckIcon className="size-(--size-md)" /><span className="sr-only">(no carrinho)</span></>}
        </CardTitle>
        <CardDescription>{p.detalhe}</CardDescription>
        {r && seguro && <CardAction>{seguro}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-col gap-(--gap-sm)">
        <div>
          <p className="text-body-xs text-muted">{p.saque ? "Disponível" : "Valor liberado"}</p>
          <p className="text-heading-sm">{brl(valor)}</p>
        </div>
        {prazo && (
          <div>
            <p className="text-body-xs text-muted">Prazo</p>
            <p className="text-heading-sm">{prazo}x {r && "de "}{brl(parcela(valor, prazo))}</p>
          </div>
        )}
        {p.saque && (
          <div>
            <p className="text-body-xs text-muted">Saque autorizado</p>
            <p className="text-heading-sm">{brl(p.saque)}</p>
          </div>
        )}
      </CardContent>
      {/* Refinamento: o rodapé vai para o fim do card e a ação fica sempre no mesmo canto (Consistência, Fitts). */}
      <CardFooter className={r ? "mt-auto justify-end gap-(--gap-xs)" : "gap-(--gap-xs)"}>
        {!r && seguro}
        {no ? (
          <div className="ml-auto flex gap-(--gap-2xs)">
            <Button type="button" variant="ghost" size="icon" aria-label={`Editar ${p.nome}`} onClick={abrir}><PencilIcon /></Button>
            <Button type="button" variant="ghost" size="icon" aria-label={`Remover ${p.nome}`} onClick={remover}><Trash2Icon /></Button>
          </div>
        ) : (
          <Button type="button" onClick={abrir}>Adicionar</Button>
        )}
      </CardFooter>
      <Editar key={aberturas} produto={p} valor={valor} prazo={prazo} aberto={editando} onAberto={setEditando} onSalvar={salvar} novo={!no} />
    </Card>
  )
}

function Editar({ produto: p, valor, prazo, aberto, onAberto, onSalvar, novo }: { produto: Produto; valor: number; prazo?: number; aberto: boolean; onAberto: (v: boolean) => void; onSalvar: (v: number, pz?: number) => void; novo: boolean }) {
  const [texto, setTexto] = React.useState(valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 }))
  const [pz, setPz] = React.useState(prazo)
  const numero = Number(texto.replace(/\./g, "").replace(",", "."))
  // O valor liberado da oferta é o teto: a simulação só pode pedir menos.
  const erro = !numero || numero <= 0 ? "Informe um valor válido." : numero > p.valor ? `O máximo liberado é ${brl(p.valor)}.` : ""
  const id = React.useId()
  return (
    <Dialog open={aberto} onOpenChange={onAberto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{novo ? "Adicionar" : "Editar"} {p.nome}</DialogTitle>
          <DialogDescription>{p.detalhe} · Matrícula {p.matricula}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={Boolean(erro)}>
            <FieldLabel htmlFor={`${id}-valor`}>Valor</FieldLabel>
            <InputGroup>
              <InputGroupAddon><InputGroupText>R$</InputGroupText></InputGroupAddon>
              <InputGroupInput id={`${id}-valor`} value={texto} aria-invalid={Boolean(erro)} inputMode="decimal" onChange={(e) => setTexto(e.target.value)} />
            </InputGroup>
            {erro ? <FieldError>{erro}</FieldError> : <FieldDescription>Até {brl(p.valor)}.</FieldDescription>}
          </Field>
          {pz && (
            <Field>
              <FieldLabel>Prazo</FieldLabel>
              <Select value={String(pz)} onValueChange={(v) => setPz(Number(v))}>
                <SelectTrigger className="w-full" aria-label="Prazo"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>{prazos.map((n) => <SelectItem key={n} value={String(n)}>{n} meses</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              {!erro && <FieldDescription>Parcela de {brl(parcela(numero, pz))} (taxa fictícia da POC).</FieldDescription>}
            </Field>
          )}
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button disabled={Boolean(erro)} onClick={() => { onSalvar(numero, pz); onAberto(false); toast.add({ type: "success", title: novo ? "Produto adicionado ao carrinho" : "Simulação atualizada", description: p.nome }) }}>
            {novo ? "Adicionar ao carrinho" : "Salvar simulação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
