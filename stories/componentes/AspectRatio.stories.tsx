import type { Meta, StoryObj } from "@storybook/react-vite"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { banner } from "../../sandbox/art"
import { pagina, vitrine } from "./Opcoes"

// Proporções comuns: duas de paisagem (16 / 9, 4 / 3), quadrado e retrato. No código, `ratio` aceita qualquer número.
const proporcoes = { "16 / 9": 16 / 9, "4 / 3": 4 / 3, "1 / 1": 1, "9 / 16": 9 / 16 } as const
type Proporcao = keyof typeof proporcoes
const imagem = banner("#fa6300", "#462a71", "")

const quadro = (ratio: number) => (
  <AspectRatio ratio={ratio} className="overflow-hidden rounded-3xl bg-muted">
    <img src={imagem} alt="Capa" className="size-full object-cover" />
  </AspectRatio>
)

type Controles = { proporcao: Proporcao }

const meta = {
  title: "Componentes/AspectRatio",
  render: ({ proporcao }) => quadro(proporcoes[proporcao]),
  decorators: [(Historia) => <div className="w-64"><Historia /></div>],
  parameters: pagina("**Só no código.** O Aspect Ratio não está no Figma: não tem aparência própria, só mantém a proporção entre largura e altura, como 16 / 9, para imagens e vídeos. A largura vem do pai; a altura sai da proporção. No Figma, trave a proporção do próprio frame ou da imagem.", "/fotos/capa.png"),
  argTypes: {
    proporcao: { name: "Ratio", control: "inline-radio", options: Object.keys(proporcoes), description: "No código, `ratio`, um número: `16 / 9`, `1` ou `9 / 16`.", table: { category: "Aparência" } },
  },
  args: { proporcao: "16 / 9" },
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = { name: "Padrão" }

export const Quadrado: Story = {
  name: "Exemplo · Quadrado",
  parameters: vitrine("`ratio={1 / 1}`: altura igual à largura, para avatares e miniaturas."),
  render: () => quadro(1),
}

export const Retrato: Story = {
  name: "Exemplo · Retrato",
  parameters: vitrine("`ratio={9 / 16}`: mais alto que largo, para vídeos e telas de celular."),
  decorators: [(Historia) => <div className="w-40"><Historia /></div>],
  render: () => quadro(9 / 16),
}
