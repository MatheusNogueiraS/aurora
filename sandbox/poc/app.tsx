import * as React from "react"
import {
  ArrowRightLeftIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  FileSearchIcon,
  HomeIcon,
  MegaphoneIcon,
  MessageCircleIcon,
  MessagesSquareIcon,
  PhoneIcon,
  PieChartIcon,
  SearchIcon,
  StoreIcon,
  type LucideIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { PainelCsc } from "./painel-csc"
import { AtendimentoProvider, brl, etapas, useAtendimento, type EtapaId } from "./estado"
import { Dados } from "./etapas/dados"
import { Formalizacao } from "./etapas/formalizacao"
import { Identificacao } from "./etapas/identificacao"
import { Resumo } from "./etapas/resumo"
import { Simulacao } from "./etapas/simulacao"

const telas: Record<EtapaId, () => React.ReactNode> = {
  identificacao: () => <Identificacao />,
  simulacao: () => <Simulacao />,
  dados: () => <Dados />,
  resumo: () => <Resumo />,
  formalizacao: () => <Formalizacao />,
}

export function App() {
  // Trocar a key desmonta tudo: é o "Iniciar nova digitação".
  const [rodada, setRodada] = React.useState(0)
  return (
    <AtendimentoProvider key={rodada} onReiniciar={() => setRodada((r) => r + 1)}>
      <SidebarProvider defaultOpen={false}>
        <MenuLateral />
        <SidebarInset className="bg-muted">
          <Topo />
          <Conteudo />
        </SidebarInset>
        <Mensagens />
      </SidebarProvider>
    </AtendimentoProvider>
  )
}

function Conteudo() {
  const { a } = useAtendimento()
  const final = a.etapa === "formalizacao"
  return (
    <div className="flex flex-1 flex-col gap-(--gap-3xl) p-(--padding-3xl) xl:flex-row xl:items-start">
      {/* As telas ficam montadas e só se escondem: o que foi digitado sobrevive à troca de etapa. */}
      <main className="min-w-0 flex-1">
        {etapas.map((e) => (
          <div key={e.id} hidden={a.etapa !== e.id}>{telas[e.id]()}</div>
        ))}
      </main>
      <PainelCsc />
      {!final && <Carrinho />}
    </div>
  )
}

/* ---------- menu lateral ---------- */

const menu: { titulo: string; icone: LucideIcon; ativo?: boolean }[] = [
  { titulo: "Página inicial", icone: HomeIcon },
  { titulo: "Digitação", icone: BookmarkIcon, ativo: true },
  { titulo: "Consultas", icone: FileSearchIcon },
  { titulo: "Franquia/Correspondente", icone: StoreIcon },
  { titulo: "Gerenciamento", icone: PieChartIcon },
  { titulo: "Suporte e Treinamento", icone: MegaphoneIcon },
]

function MenuLateral() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Novo Consig">
              {/* shortcut: marca em texto; trocar pelo SVG do logo quando ele entrar nos assets do projeto. */}
              <span className="flex size-(--size-2xl) shrink-0 items-center justify-center rounded-3xl bg-brand text-label-sm text-on-brand">h!</span>
              <span className="text-label-sm">Novo Consig</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Buscar" onClick={() => toast.add({ title: "Busca", description: "A busca global não faz parte desta POC." })}>
              <SearchIcon /><span>Buscar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map(({ titulo, icone: Icone, ativo }) => (
                <SidebarMenuItem key={titulo}>
                  <SidebarMenuButton isActive={ativo} tooltip={titulo}><Icone /><span>{titulo}</span></SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Joelma da Silva">
              <Avatar size="sm"><AvatarFallback>JS</AvatarFallback></Avatar>
              <span className="grid text-label-sm">Joelma da Silva<span className="text-body-xs text-muted">Consultor 1</span></span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

/* ---------- topo com as etapas ---------- */

function Topo() {
  const { a, ir } = useAtendimento()
  const identificado = a.concluidas.includes("identificacao")
  // A altura do cabeçalho muda (a linha do cliente entra depois da Identificação); o carrinho fixo usa essa medida.
  const ref = React.useRef<HTMLElement>(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => document.documentElement.style.setProperty("--altura-topo", `${el.offsetHeight}px`)
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <header ref={ref} className="sticky top-0 z-10 border-b-sm bg-page/80 px-(--padding-3xl) py-(--padding-lg) backdrop-blur">
      <div className="flex flex-wrap items-center gap-(--gap-lg)">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4 self-center!" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#">Página inicial</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Digitação</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <nav aria-label="Etapas da digitação" className="ml-auto">
          <ol className="flex flex-wrap items-center gap-(--gap-sm)">
            {etapas.map((e, i) => {
              const feita = a.concluidas.includes(e.id) && a.etapa !== e.id
              const atual = a.etapa === e.id
              return (
                <li key={e.id} className="flex items-center gap-(--gap-sm)">
                  {i > 0 && <span aria-hidden className={cn("h-px w-6", feita ? "bg-success" : "bg-divider")} />}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!feita && !atual}
                    aria-current={atual ? "step" : undefined}
                    onClick={() => ir(e.id)}
                    className={cn(feita && "text-success", !atual && !feita && "text-muted")}
                  >
                    <span className={cn("flex size-(--size-lg) items-center justify-center rounded-full border-sm text-label-xs", feita ? "border-success bg-success text-on-brand" : "border-default")}>
                      {feita ? <CheckIcon className="size-(--size-xs)" /> : i + 1}
                    </span>
                    {e.titulo}
                    {feita && <span className="sr-only">(concluída)</span>}
                  </Button>
                </li>
              )
            })}
          </ol>
        </nav>
        {/* Espaço da chave "Refinamento" da POC, que flutua neste canto. */}
        <span aria-hidden className="w-40 shrink-0" />
      </div>
      {identificado && (
        <div className="mt-(--gap-xs) flex justify-between text-body-xs text-muted">
          <span>Cliente: <span className="text-label-xs text-default">{a.cliente.nome}</span> ({a.cliente.cpf})</span>
          <span>Protocolo: <span className="text-label-xs text-default">1234567890</span></span>
        </div>
      )}
    </header>
  )
}

/* ---------- carrinho e atalhos de contato ---------- */

const contatos: { titulo: string; icone: LucideIcon }[] = [
  { titulo: "Chamar no WhatsApp", icone: MessageCircleIcon },
  { titulo: "Ligar para o cliente", icone: PhoneIcon },
  { titulo: "Agendar retorno", icone: CalendarIcon },
  { titulo: "Transferir atendimento", icone: ArrowRightLeftIcon },
]

function Carrinho() {
  const { a, produtos } = useAtendimento()
  const itens = produtos.filter((p) => a.carrinho[p.id])
  const total = itens.reduce((s, p) => s + a.carrinho[p.id].valor, 0)
  return (
    <aside className="flex w-full shrink-0 flex-col gap-(--gap-lg) xl:sticky xl:top-[calc(var(--altura-topo,0px)+var(--padding-3xl))] xl:w-64">
      <ButtonGroup aria-label="Contato com o cliente" className="w-full">
        {contatos.map(({ titulo, icone: Icone }) => (
          <Tooltip key={titulo}>
            <TooltipTrigger render={<Button variant="outline" className="flex-1" aria-label={titulo} onClick={() => toast.add({ title: titulo, description: "Ação simulada na POC." })} />}>
              <Icone />
            </TooltipTrigger>
            <TooltipContent>{titulo}</TooltipContent>
          </Tooltip>
        ))}
      </ButtonGroup>
      <Card size="sm">
        <CardHeader><CardTitle>Carrinho</CardTitle></CardHeader>
        <CardContent>
          {itens.length === 0 ? (
            <p className="text-body-sm text-muted">Ainda não há nenhuma simulação salva.</p>
          ) : (
            a.matriculas.filter((m) => itens.some((p) => p.matricula === m)).map((m) => (
              <ItemGroup key={m}>
                <p className="text-label-sm">INSS · Matrícula {m}</p>
                {itens.filter((p) => p.matricula === m).map((p) => (
                  <Item key={p.id} size="xs" className="px-0">
                    <ItemContent>
                      <ItemTitle>{p.nome}</ItemTitle>
                      <ItemDescription>{p.detalhe}</ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            ))
          )}
        </CardContent>
        {itens.length > 0 && (
          <CardFooter className="justify-between">
            <span>Total liberado</span>
            <span className="text-body-sm-bold text-success">{brl(total)}</span>
          </CardFooter>
        )}
      </Card>
      <Continuar />
    </aside>
  )
}

// O botão principal muda de nome conforme a etapa, para dizer a ação.
const acao: Partial<Record<EtapaId, string>> = { identificacao: "Simular", simulacao: "Preencher dados", dados: "Revisar proposta", resumo: "Gerar proposta" }

function Continuar() {
  const { a, avancar } = useAtendimento()
  const vazio = a.etapa === "resumo" && Object.keys(a.carrinho).length === 0
  const seguir = () => {
    const form = document.getElementById(`form-${a.etapa}`) as HTMLFormElement | null
    if (form) form.requestSubmit()
    else avancar()
  }
  return <Button size="lg" className="w-full" disabled={vazio} onClick={seguir}>{acao[a.etapa] ?? "Continuar"}</Button>
}

/* ---------- mensagens ---------- */

function Mensagens() {
  return (
    <Sheet>
      <SheetTrigger render={<Button className="fixed right-(--padding-3xl) bottom-(--padding-3xl) z-20 shadow-lg" />}>
        <MessagesSquareIcon /> Mensagens
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Mensagens</SheetTitle>
          <SheetDescription>Conversas com o cliente durante o atendimento.</SheetDescription>
        </SheetHeader>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><MessagesSquareIcon /></EmptyMedia>
            <EmptyTitle>Nenhuma mensagem</EmptyTitle>
            <EmptyDescription>Quando o cliente responder, a conversa aparece aqui.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SheetContent>
    </Sheet>
  )
}
