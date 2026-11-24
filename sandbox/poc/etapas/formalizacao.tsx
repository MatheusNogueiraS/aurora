import * as React from "react"
import { CircleCheckIcon, CopyIcon, DownloadIcon, EyeIcon, FileTextIcon, IdCardIcon, InfoIcon, QrCodeIcon, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Anexo, Campo, copiar, useAtendimento } from "../estado"
import { useRefino } from "../refino"

const LINK = "https://www.bancobmg.com.br/formalizacao/r7DFs38H"

export function Formalizacao() {
  const { reiniciar } = useAtendimento()
  return (
    <div className="flex flex-col gap-(--gap-2xl)">
      <Propostas />
      <LinkFormalizacao />
      <Documentos />
      <div className="flex flex-wrap justify-between gap-(--gap-lg)">
        <Button variant="outline" size="lg" onClick={() => toast.add({ title: "Acompanhamento", description: "A tela de acompanhamento não faz parte desta POC." })}>Ir para Acompanhamento</Button>
        <Button size="lg" onClick={reiniciar}>Iniciar nova digitação</Button>
      </div>
    </div>
  )
}

function Acao({ icone: Icone, rotulo }: { icone: LucideIcon; rotulo: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={rotulo} onClick={() => toast.add({ title: rotulo, description: "Documento simulado na POC." })} />}><Icone /></TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}

function Propostas() {
  const { a, produtos } = useAtendimento()
  const itens = produtos.filter((p) => a.carrinho[p.id])
  const r = useRefino()
  return (
    <Card>
      {/* Refinamento: a tela confirma o que aconteceu antes de mostrar a tabela (H1). */}
      {r && (
        <CardHeader>
          <CardTitle>Propostas geradas</CardTitle>
          <CardDescription>Envie o link de formalização para o cliente assinar.</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Proposta (ADE)</TableHead>
              <TableHead className="text-center">Termos gerais</TableHead>
              <TableHead className="text-center">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((p, i) => (
              <TableRow key={p.id}>
                <TableCell><Badge variant="outline" className="text-success"><CircleCheckIcon /> Gerada com sucesso</Badge></TableCell>
                <TableCell className="whitespace-normal">{p.nome} · {p.detalhe}</TableCell>
                {/* Número de proposta fictício, sequencial como no Figma. */}
                <TableCell className="tabular-nums">{318380771 + i * 2}</TableCell>
                <TableCell className="text-center"><Acao icone={EyeIcon} rotulo={`Ver termos gerais de ${p.nome}`} /><Acao icone={DownloadIcon} rotulo={`Baixar termos gerais de ${p.nome}`} /></TableCell>
                <TableCell className="text-center"><Acao icone={EyeIcon} rotulo={`Ver detalhes de ${p.nome}`} /><Acao icone={DownloadIcon} rotulo={`Baixar detalhes de ${p.nome}`} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function LinkFormalizacao() {
  const [meio, setMeio] = React.useState("link")
  const copiarLink = () => copiar(LINK, "Link copiado", "Envie ao cliente para ele assinar a proposta.")
  const enviar = (canal: string) => toast.add({ type: "success", title: `Link enviado por ${canal}` })
  return (
    <Card>
      <CardHeader><CardTitle>Link de formalização</CardTitle></CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">Escolha uma opção para enviar</FieldLegend>
            <RadioGroup value={meio} onValueChange={(v) => setMeio(v as string)} className="flex flex-wrap gap-(--gap-2xl)">
              {[["link", "Copiar link"], ["sms", "SMS"], ["whatsapp", "WhatsApp"]].map(([v, t]) => (
                <Field key={v} orientation="horizontal" className="w-auto">
                  <RadioGroupItem value={v} id={`meio-${v}`} />
                  <FieldLabel htmlFor={`meio-${v}`}>{t}</FieldLabel>
                </Field>
              ))}
            </RadioGroup>
          </FieldSet>
          {meio === "link" ? (
            <div className="flex flex-wrap items-center gap-(--gap-2xl)">
              {/* shortcut: ícone no lugar do QR Code real; gerar com uma biblioteca de QR quando o link vier do backend. */}
              <QrCodeIcon aria-label="QR Code do link de formalização" className="size-28 text-default" />
              <Field className="min-w-0 flex-1">
                <FieldLabel htmlFor="link-formalizacao">Copie novamente ou use o QR Code ao lado.</FieldLabel>
                <InputGroup>
                  <InputGroupInput id="link-formalizacao" readOnly value={LINK} />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton size="icon-xs" aria-label="Copiar link" onClick={copiarLink}><CopyIcon /></InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </div>
          ) : (
            <form className="flex flex-wrap items-end gap-(--gap-lg)" onSubmit={(e) => { e.preventDefault(); enviar(meio === "sms" ? "SMS" : "WhatsApp") }}>
              <Campo label="Celular do cliente" type="tel" required defaultValue="(11) 99999-9999" className="max-w-xs" />
              <Button type="submit">Enviar link</Button>
            </form>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

function Grupo({ icone: Icone, titulo, ajuda, children }: { icone: LucideIcon; titulo: string; ajuda: string; children: React.ReactNode }) {
  return (
    <FieldSet>
      <FieldLegend className="flex items-center gap-(--gap-sm)">
        <Icone className="size-(--size-md)" /> {titulo}
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Sobre ${titulo.toLowerCase()}`} />}><InfoIcon /></TooltipTrigger>
          <TooltipContent>{ajuda}</TooltipContent>
        </Tooltip>
      </FieldLegend>
      {children}
    </FieldSet>
  )
}

function Documentos() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gostaria de adiantar o envio destes documentos?</CardTitle>
        <CardDescription>Opcional.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {/* O Figma tem o ícone de ajuda, mas não o texto: fica um aviso até a regra ser definida. */}
          <Grupo icone={IdCardIcon} titulo="Documentos de identificação" ajuda="Texto de ajuda a definir.">
            <div className="grid gap-(--gap-2xl) md:grid-cols-2">
              <Field><FieldLabel>RG ou CNH (frente)</FieldLabel><Anexo /></Field>
              <Field><FieldLabel>RG ou CNH (verso)</FieldLabel><Anexo /></Field>
            </div>
          </Grupo>
          <Grupo icone={FileTextIcon} titulo="Comprovantes" ajuda="Texto de ajuda a definir.">
            <div className="grid gap-(--gap-2xl) md:grid-cols-3">
              <Field><FieldLabel>Comprovante de residência</FieldLabel><Anexo /></Field>
              <Field><FieldLabel>Comprovante de renda</FieldLabel><Anexo /></Field>
              <Field><FieldLabel>Extrato bancário</FieldLabel><Anexo /></Field>
            </div>
          </Grupo>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
