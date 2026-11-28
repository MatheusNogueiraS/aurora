import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ChevronUpIcon, CommandIcon, OptionIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Opcao, Opcoes, pagina, vitrine } from "./Opcoes"

// As teclas que viram ícone. No código, a tecla é só o conteúdo do Kbd: qualquer texto ou ícone.
const ICONES = {
  Command: <CommandIcon />,
  // O Mac escreve o Control como ⌃; o lucide não tem esse ícone, e a seta para cima fina é o mais parecido.
  Control: <ChevronUpIcon />,
  Option: <OptionIcon />,
  "Arrow up": <ArrowUpIcon />,
  "Arrow down": <ArrowDownIcon />,
  "Arrow left": <ArrowLeftIcon />,
  "Arrow right": <ArrowRightIcon />,
}
// Como no Figma: Content (texto ou ícone) e Context, onde o Kbd muda de aparência.
const conteudos = ["Text", "Icon"] as const
const contextos = ["default", "Input Group", "Tooltip"] as const

type Controles = { conteudo: (typeof conteudos)[number]; texto: string; icone: keyof typeof ICONES; contexto: (typeof contextos)[number] }

const meta = {
  title: "Componentes/Kbd",
  render: ({ conteudo, texto, icone, contexto }) => {
    const tecla = <Kbd>{conteudo === "Icon" ? ICONES[icone] : texto}</Kbd>
    if (contexto === "Input Group") return <InputGroup className="w-64"><InputGroupInput placeholder="Buscar" aria-label="Buscar" /><InputGroupAddon align="inline-end">{tecla}</InputGroupAddon></InputGroup>
    if (contexto === "Tooltip") return <Tooltip open><TooltipTrigger render={<Button variant="outline" />}>Imprimir</TooltipTrigger><TooltipContent>Imprimir {tecla}</TooltipContent></Tooltip>
    return tecla
  },
  parameters: pagina("Mostra uma tecla do teclado, como num atalho. Não tem Type, Size nem State."),
  argTypes: {
    conteudo: { name: "Content", control: "inline-radio", options: conteudos, description: "O conteúdo do Kbd: um texto, como `Ctrl`, ou um ícone, como o ⌘.", table: { category: "Conteúdo" } },
    texto: { name: "Text", control: "text", if: { arg: "conteudo", eq: "Text" }, table: { category: "Conteúdo" } },
    icone: { name: "↳ Icon", control: "select", options: Object.keys(ICONES), if: { arg: "conteudo", eq: "Icon" }, table: { category: "Conteúdo" } },
    contexto: { name: "Context", control: "inline-radio", options: contextos, description: "Onde o Kbd está. Não é propriedade: dentro de um `InputGroup` ou de um `Tooltip`, o próprio Kbd muda de fundo.", table: { category: "Aparência" } },
  },
  args: { conteudo: "Text", texto: "Ctrl", icone: "Command", contexto: "default" },
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

export const Conteudo: Story = {
  name: "Conteúdo",
  parameters: vitrine("`KbdGroup` junta as teclas de um atalho."),
  render: () => (
    <Opcoes>
      <Opcao nome="Text"><Kbd>K</Kbd></Opcao>
      <Opcao nome="Icon"><Kbd><CommandIcon /></Kbd></Opcao>
      <Opcao nome="KbdGroup"><KbdGroup><Kbd>Ctrl</Kbd><Kbd>K</Kbd></KbdGroup></Opcao>
      <Opcao nome="KbdGroup com +"><KbdGroup><Kbd>Ctrl</Kbd><span>+</span><Kbd>B</Kbd></KbdGroup></Opcao>
    </Opcoes>
  ),
}

export const Composicoes: Story = {
  name: "Composições",
  parameters: vitrine("Os exemplos do shadcn: o Kbd numa frase, num botão, num campo de busca e num Tooltip. No Tooltip, ele ganha fundo translúcido."),
  render: () => (
    <Opcoes>
      <Opcao nome="Em frase"><p className="text-body-sm text-muted">Use <Kbd>Ctrl + K</Kbd> para abrir os comandos</p></Opcao>
      <Opcao nome="Em Button"><Button variant="outline">Aceitar <Kbd data-icon="inline-end" className="translate-x-0.5">⏎</Kbd></Button></Opcao>
      <Opcao nome="Em InputGroup">
        <InputGroup>
          <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
          <InputGroupAddon><SearchIcon /></InputGroupAddon>
          <InputGroupAddon align="inline-end"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></InputGroupAddon>
        </InputGroup>
      </Opcao>
      <Opcao nome="Em Tooltip">
        <Tooltip open>
          <TooltipTrigger render={<Button variant="outline" />}>Imprimir</TooltipTrigger>
          <TooltipContent>Imprimir <KbdGroup><Kbd>Ctrl</Kbd><Kbd>P</Kbd></KbdGroup></TooltipContent>
        </Tooltip>
      </Opcao>
    </Opcoes>
  ),
}

