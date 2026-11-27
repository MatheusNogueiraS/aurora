import type { Meta, StoryObj } from "@storybook/react-vite"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Opcao, Opcoes, pagina, vitrine } from "./Opcoes"

const modos = ["single", "range", "multiple"] as const
type Modo = (typeof modos)[number]
const legendas = ["label", "dropdown", "dropdown-months", "dropdown-years"] as const
type Legenda = (typeof legendas)[number]
const botoes = ["ghost", "outline"] as const
type Botao = (typeof botoes)[number]

// Mês fixo, para a página sair igual em qualquer dia.
const mes = new Date(2026, 10, 1)
const dia = (d: number) => new Date(2026, 10, d)

type Controles = { mode: Modo; listaMes: boolean; listaAno: boolean; meses: number; foraDoMes: boolean; semanas: boolean; buttonVariant: Botao; fimDeSemana: boolean }

// Cada calendário guarda a própria seleção; o modo decide o formato dela.
// As duas listas do Figma (Month dropdown e Year dropdown) viram o captionLayout do código.
const legenda = (mesLista: boolean, anoLista: boolean): Exclude<Legenda, "label"> | undefined => (mesLista && anoLista ? "dropdown" : mesLista ? "dropdown-months" : anoLista ? "dropdown-years" : undefined)
const listas: Record<Legenda, [boolean, boolean]> = { label: [false, false], dropdown: [true, true], "dropdown-months": [true, false], "dropdown-years": [false, true] }

function Calendario({ mode, listaMes, listaAno, meses, foraDoMes, semanas, buttonVariant, fimDeSemana }: Controles) {
  const [um, setUm] = useState<Date | undefined>(dia(12))
  const [faixa, setFaixa] = useState<DateRange | undefined>({ from: dia(9), to: dia(13) })
  const [varios, setVarios] = useState<Date[] | undefined>([dia(5), dia(12), dia(19)])
  const comum = {
    locale: ptBR,
    defaultMonth: mes,
    captionLayout: legenda(listaMes, listaAno),
    numberOfMonths: meses > 1 ? meses : undefined,
    showOutsideDays: foraDoMes ? undefined : false,
    showWeekNumber: semanas || undefined,
    buttonVariant: buttonVariant === "ghost" ? undefined : buttonVariant,
    disabled: fimDeSemana ? { dayOfWeek: [0, 6] } : undefined,
    startMonth: new Date(2024, 0),
    endMonth: new Date(2028, 11),
    className: "rounded-4xl border-sm",
  }
  if (mode === "range") return <Calendar {...comum} mode="range" selected={faixa} onSelect={setFaixa} />
  if (mode === "multiple") return <Calendar {...comum} mode="multiple" selected={varios} onSelect={setVarios} />
  return <Calendar {...comum} mode="single" selected={um} onSelect={setUm} />
}

const base: Controles = { mode: "single", listaMes: false, listaAno: false, meses: 1, foraDoMes: true, semanas: false, buttonVariant: "ghost", fimDeSemana: false }

function SeletorDeData() {
  const [data, setData] = useState<Date | undefined>()
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className="w-56 justify-start" />}>
        <CalendarIcon data-icon="inline-start" />{data ? format(data, "PPP", { locale: ptBR }) : <span className="text-muted">Escolha uma data</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0"><Calendar mode="single" locale={ptBR} selected={data} onSelect={setData} defaultMonth={mes} /></PopoverContent>
    </Popover>
  )
}

const meta = {
  title: "Componentes/Calendar",
  render: (args) => <Calendario {...args} />,
  parameters: pagina("Calendário para escolher um dia, um período ou vários dias. Usa o react-day-picker; a língua vem de `locale` (aqui, `ptBR` do date-fns). Os dias são botões `ghost`; o escolhido ganha o fundo `brand`. A página mostra sempre novembro de 2026."),
  argTypes: {
    mode: { name: "Mode", control: "inline-radio", options: modos, description: "No código, `mode`: um dia (`single`), um período (`range`, com o começo e o fim marcados e o meio em `muted`) ou vários dias (`multiple`).", table: { category: "Comportamento" } },
    listaMes: { name: "Month dropdown", control: "boolean", description: "Uma lista para trocar o mês. No código, é o `captionLayout`: com Month dropdown e Year dropdown, `dropdown`; só o mês, `dropdown-months`; só o ano, `dropdown-years`; sem nenhum, `label` (o padrão).", table: { category: "Aparência" } },
    listaAno: { name: "Year dropdown", control: "boolean", description: "Uma lista para trocar o ano. Veja Month dropdown.", table: { category: "Aparência" } },
    meses: { name: "Months", control: { type: "range", min: 1, max: 2, step: 1 }, description: "No código, `numberOfMonths`. Dois meses ficam lado a lado na tela larga.", table: { category: "Aparência" } },
    foraDoMes: { name: "Outside days", control: "boolean", description: "`showOutsideDays` (ligado por padrão): os dias do mês anterior e do seguinte, apagados.", table: { category: "Aparência" } },
    semanas: { name: "Week number", control: "boolean", description: "`showWeekNumber`: uma coluna com o número da semana no ano.", table: { category: "Aparência" } },
    buttonVariant: { name: "Previous and Next", control: "inline-radio", options: botoes, description: "`buttonVariant`: o Type do `Button` das setas de mês. No Figma, é o Type do Button exposto.", table: { category: "Aparência" } },
    fimDeSemana: { name: "Disabled days", control: "boolean", description: "`disabled` com `{ dayOfWeek: [0, 6] }`: sábados e domingos esmaecem e não se escolhem. No Figma, não é propriedade: marque os dias como Disabled no CalendarDay.", table: { category: "Estado" } },
  },
  args: base,
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

export const Modos: Story = {
  name: "Mode",
  parameters: vitrine("No código, `mode`. Os exemplos do shadcn de um dia, de um período e de vários dias."),
  render: () => <Opcoes larga>{modos.map((m) => <Opcao key={m} nome={m}><Calendario {...base} mode={m} /></Opcao>)}</Opcoes>,
}

export const Legendas: Story = {
  name: "Caption layout",
  parameters: vitrine("No código, `captionLayout`; no Figma, os booleans Month dropdown e Year dropdown. Sem a propriedade, o calendário é `label`."),
  render: () => <Opcoes larga>{legendas.map((l) => <Opcao key={l} nome={l}><Calendario {...base} listaMes={listas[l][0]} listaAno={listas[l][1]} /></Opcao>)}</Opcoes>,
}

export const OutrasOpcoes: Story = {
  name: "Outras opções",
  parameters: vitrine("Número da semana, dias desabilitados, sem os dias de fora e as setas em `outline`."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="showWeekNumber"><Calendario {...base} semanas /></Opcao>
      <Opcao nome="disabled"><Calendario {...base} fimDeSemana /></Opcao>
      <Opcao nome="showOutsideDays={false}"><Calendario {...base} foraDoMes={false} /></Opcao>
      <Opcao nome="buttonVariant=outline"><Calendario {...base} buttonVariant="outline" /></Opcao>
    </Opcoes>
  ),
}

export const DoisMeses: Story = {
  name: "Dois meses",
  parameters: vitrine("O exemplo do shadcn de período em dois meses (`numberOfMonths={2}`)."),
  render: () => <Calendario {...base} mode="range" meses={2} />,
}

export const Composicoes: Story = {
  name: "Composições",
  parameters: vitrine("Os exemplos do shadcn: o seletor de data, um Popover com o Calendar dentro (clique para abrir), e o Calendar num Card, que tira o fundo dele."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="Date picker"><SeletorDeData /></Opcao>
      <Opcao nome="Em Card"><Card size="sm" className="w-fit"><CardContent><Calendar mode="single" locale={ptBR} selected={dia(20)} defaultMonth={mes} /></CardContent></Card></Opcao>
    </Opcoes>
  ),
}
