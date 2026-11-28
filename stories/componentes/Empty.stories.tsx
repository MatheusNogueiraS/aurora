import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowUpRightIcon, FolderCodeIcon, SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { portrait } from "../../sandbox/art"
import { Opcao, Opcoes, pagina, vitrine } from "./Opcoes"

// Como no Figma: Media liga a mídia, e Media type é o `variant` do EmptyMedia.
const tiposMidia = ["icon", "default"] as const
type TipoMidia = (typeof tiposMidia)[number]
const fundos = { none: "", border: "border-sm", muted: "bg-muted/50" } as const
type Fundo = keyof typeof fundos

type Controles = { midia: boolean; tipoMidia: TipoMidia; titulo: string; descricao: boolean; acoes: boolean; fundo: Fundo }

const vazio = ({ midia, tipoMidia, titulo, descricao, acoes, fundo }: Controles) => (
  <Empty className={fundos[fundo] || undefined}>
    <EmptyHeader>
      {midia && tipoMidia === "icon" && <EmptyMedia variant="icon"><FolderCodeIcon /></EmptyMedia>}
      {midia && tipoMidia === "default" && <EmptyMedia><Avatar size="lg"><AvatarImage src={portrait("#462a71", "AS")} alt="Ana Souza" /><AvatarFallback>AS</AvatarFallback></Avatar></EmptyMedia>}
      <EmptyTitle>{titulo}</EmptyTitle>
      {descricao && <EmptyDescription>Você ainda não criou nenhum projeto. Comece criando o primeiro.</EmptyDescription>}
    </EmptyHeader>
    {acoes && (
      <EmptyContent>
        <div className="flex gap-(--gap-sm)"><Button>Criar projeto</Button><Button variant="outline">Importar</Button></div>
        <Button variant="link" size="sm" render={<a href="#saiba-mais" />} nativeButton={false}>Saiba mais <ArrowUpRightIcon data-icon="inline-end" /></Button>
      </EmptyContent>
    )}
  </Empty>
)

const base: Controles = { midia: true, tipoMidia: "icon", titulo: "Nenhum projeto ainda", descricao: true, acoes: true, fundo: "none" }

const meta = {
  title: "Componentes/Empty",
  render: vazio,
  parameters: pagina("Tela vazia: explica por que não há nada e sugere o próximo passo. Preenche o pai e centraliza o conteúdo.", "/fotos/ana.png"),
  argTypes: {
    midia: { name: "Media", control: "boolean", description: "`EmptyMedia` acima do título.", table: { category: "Conteúdo" } },
    tipoMidia: { name: "Media type", control: "inline-radio", options: tiposMidia, description: "No código, `variant` do `EmptyMedia`: `icon` põe o ícone num quadrado de fundo `muted`; `default` mostra a imagem como ela é, como um Avatar.", if: { arg: "midia" }, table: { category: "Conteúdo" } },
    titulo: { name: "Title", control: "text", description: "`EmptyTitle`.", table: { category: "Conteúdo" } },
    descricao: { name: "Description", control: "boolean", description: "`EmptyDescription`. Um link dentro dela ganha sublinhado.", table: { category: "Conteúdo" } },
    acoes: { name: "Actions", control: "boolean", description: "`EmptyContent`, abaixo do texto, para botões ou um campo.", table: { category: "Conteúdo" } },
    fundo: { name: "Background", control: "inline-radio", options: Object.keys(fundos), description: "O Empty já traz a borda tracejada sem largura: `border-sm` a mostra. `bg-muted/50` dá um fundo. São classes, não variantes.", table: { category: "Aparência" } },
  },
  args: base,
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  name: "Padrão",
  decorators: [(Historia) => <div className="w-96"><Historia /></div>],
}

export const Midias: Story = {
  name: "Mídia",
  parameters: vitrine("No código, `variant` do `EmptyMedia`. Sem a propriedade, ele é `default`."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="Media off">{vazio({ ...base, midia: false, acoes: false })}</Opcao>
      {tiposMidia.map((m) => <Opcao key={m} nome={m}>{vazio({ ...base, tipoMidia: m, acoes: false })}</Opcao>)}
    </Opcoes>
  ),
}

export const Fundos: Story = {
  name: "Fundo",
  parameters: vitrine("Os exemplos Outline e Background do shadcn, por classes."),
  render: () => <Opcoes larga>{(Object.keys(fundos) as Fundo[]).map((f) => <Opcao key={f} nome={f}>{vazio({ ...base, fundo: f, acoes: false })}</Opcao>)}</Opcoes>,
}

export const Composicoes: Story = {
  name: "Composições",
  parameters: vitrine("Os exemplos do shadcn: um grupo de avatares como mídia e a página não encontrada, com um campo de busca no `EmptyContent`."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="AvatarGroup">
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <AvatarGroup>
                <Avatar><AvatarImage src={portrait("#fa6300", "AS")} alt="Ana Souza" /><AvatarFallback>AS</AvatarFallback></Avatar>
                <Avatar><AvatarImage src={portrait("#462a71", "BL")} alt="Bruno Lima" /><AvatarFallback>BL</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>CM</AvatarFallback></Avatar>
              </AvatarGroup>
            </EmptyMedia>
            <EmptyTitle>Nenhum membro</EmptyTitle>
            <EmptyDescription>Convide a equipe para trabalhar junto.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent><Button size="sm">Convidar</Button></EmptyContent>
        </Empty>
      </Opcao>
      <Opcao nome="Com InputGroup">
        <Empty>
          <EmptyHeader><EmptyTitle>404</EmptyTitle><EmptyDescription>A página que você procura não existe. Tente buscar.</EmptyDescription></EmptyHeader>
          <EmptyContent>
            <InputGroup className="w-3/4">
              <InputGroupInput placeholder="Buscar páginas" aria-label="Buscar páginas" />
              <InputGroupAddon><SearchIcon /></InputGroupAddon>
              <InputGroupAddon align="inline-end"><Kbd>/</Kbd></InputGroupAddon>
            </InputGroup>
            <EmptyDescription>Precisa de ajuda? <a href="#suporte">Fale com o suporte</a></EmptyDescription>
          </EmptyContent>
        </Empty>
      </Opcao>
    </Opcoes>
  ),
}
