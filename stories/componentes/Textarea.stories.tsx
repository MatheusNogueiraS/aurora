import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Opcao, Opcoes, Simula, estadoDe, pagina, vitrine } from "./Opcoes"

// Um State só, como no Figma: Disabled e Invalid são estados, não controles à parte.
const estados = ["Default", "Focus", "Disabled", "Invalid"] as const

type Controles = { placeholder: string; valor: string; estado: (typeof estados)[number] }

const meta = {
  title: "Componentes/Textarea",
  // O que se digita na amostra atualiza o controle Value, e o controle atualiza a amostra.
  render: function Amostra({ placeholder, valor, estado }) {
    const [, atualizar] = useArgs<Controles>()
    return (
      <Textarea placeholder={placeholder} value={valor} onChange={(e) => atualizar({ valor: e.target.value })} disabled={estado === "Disabled" || undefined} aria-invalid={estado === "Invalid" || undefined} aria-label="Mensagem" />
    )
  },
  parameters: pagina("Campo de várias linhas para textos longos, como uma mensagem. Não tem Size: começa com 64 px de altura e cresce com o texto; a largura preenche o pai."),
  argTypes: {
    placeholder: { name: "Placeholder", control: "text", description: "Texto de exemplo, em cor apagada, enquanto o campo está vazio.", table: { category: "Conteúdo" } },
    valor: { name: "Value", control: "text", description: "No código, `value` (ou `defaultValue`, quando o próprio Textarea guarda o valor). Quebre linhas para ver o campo crescer.", table: { category: "Conteúdo" } },
    estado: { name: "State", control: "inline-radio", options: estados, description: "Focus é simulado (o Textarea não tem hover no código). Disabled é `disabled`: impede a digitação e esmaece. Invalid é `aria-invalid`: borda de erro.", table: { category: "Estado" } },
  },
  args: { placeholder: "Escreva sua mensagem", valor: "", estado: "Default" },
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  name: "Padrão",
  decorators: [(Historia, { args }) => <div className="w-72"><Simula estado={estadoDe(args)}><Historia /></Simula></div>],
}

export const Estados: Story = {
  name: "State",
  parameters: vitrine("Focus simulado. Empty mostra o placeholder; Filled, o valor digitado, com a altura acompanhando as linhas."),
  render: () => (
    <Opcoes>
      <Opcao nome="Empty"><Textarea placeholder="Escreva sua mensagem" aria-label="Mensagem" /></Opcao>
      <Opcao nome="Filled"><Textarea defaultValue={"Olá!\nO pagamento caiu hoje.\nObrigada."} aria-label="Mensagem" /></Opcao>
      <Opcao nome="Focus"><Simula estado="Focus"><Textarea placeholder="Escreva sua mensagem" aria-label="Mensagem" /></Simula></Opcao>
      <Opcao nome="Disabled"><Textarea placeholder="Escreva sua mensagem" disabled aria-label="Mensagem" /></Opcao>
      <Opcao nome="Invalid"><Textarea defaultValue="Oi" aria-invalid aria-label="Mensagem" /></Opcao>
    </Opcoes>
  ),
}

export const Composicoes: Story = {
  name: "Composições",
  parameters: vitrine("Os exemplos do shadcn com outros componentes: o `Field` dá o nome e a descrição, e o botão envia a mensagem."),
  render: () => (
    <Opcoes>
      <Opcao nome="Com Field"><Field><FieldLabel htmlFor="textarea-mensagem">Mensagem</FieldLabel><FieldDescription>Conte o que aconteceu.</FieldDescription><Textarea id="textarea-mensagem" placeholder="Escreva aqui" /></Field></Opcao>
      <Opcao nome="Com botão"><div className="grid w-full gap-(--gap-sm)"><Textarea placeholder="Escreva sua mensagem" aria-label="Mensagem" /><Button>Enviar</Button></div></Opcao>
    </Opcoes>
  ),
}
