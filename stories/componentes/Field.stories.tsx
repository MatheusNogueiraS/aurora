import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Opcao, Opcoes, pagina, Slot, vitrine } from "./Opcoes"

// Os nomes repetem as propriedades do Figma. O responsive (troca sozinho entre vertical e horizontal) é só do código: fica no exemplo Responsive.
// Checkbox, Radio e Switch são sempre horizontal.
const orientacoes = ["vertical", "horizontal"] as const
type Orientacao = (typeof orientacoes)[number]
const controles = ["Input", "Textarea", "Select", "Slider", "Checkbox", "Radio", "Switch", "Slot"] as const
type Controle = (typeof controles)[number]
const estados = ["Default", "Invalid", "Disabled"] as const
type Estado = (typeof estados)[number]

// O nome e a descrição do exemplo de cada controle.
const exemplos: Record<Controle, [string, string]> = {
  Input: ["Chave Pix", "CPF, e-mail ou celular de quem recebe."],
  Textarea: ["Mensagem", "Aparece no comprovante de quem recebe."],
  Select: ["Conta", "De onde sai o dinheiro."],
  Slider: ["Limite do Pix", "Quanto pode sair por dia, até R$ 5.000."],
  Checkbox: ["Salvar como favorito", "Aparece primeiro na próxima transferência."],
  Radio: ["Transferir agora", "Cai na hora, pelo Pix."],
  Switch: ["Avisos de Pix recebido", "Uma notificação a cada entrada."],
  Slot: ["Nome do campo", "Ajuda para preencher."],
}
const contas = { corrente: "Conta corrente", poupanca: "Poupança", investimentos: "Investimentos" }
const lista = (itens: Record<string, string>) => <SelectContent><SelectGroup>{Object.entries(itens).map(([v, n]) => <SelectItem key={v} value={v}>{n}</SelectItem>)}</SelectGroup></SelectContent>

type Controles = { orientation: Orientacao; controle: Controle; estado: Estado; nomeVisivel: boolean; rotulo: string; descricao: boolean; emCima: boolean; posicaoControle?: "start" | "end" }

const campo = ({ orientation, controle, estado, nomeVisivel, rotulo, descricao, emCima, posicaoControle }: Controles, id = "field-amostra") => {
  // Control position: sem escolha, o Checkbox e o Radio vêm antes do nome e o Switch depois, como no Figma.
  const noFim = posicaoControle ? posicaoControle === "end" : controle === "Switch"
  const invalido = estado === "Invalid", disabled = estado === "Disabled"
  const [nomeDoExemplo, textoDoExemplo] = exemplos[controle]
  const comum = { id, disabled: disabled || undefined, "aria-invalid": invalido || undefined }
  const entrada = {
    Input: <Input {...comum} placeholder="CPF, e-mail ou celular" />,
    Textarea: <Textarea {...comum} placeholder="Opcional" />,
    Select: (
      <Select items={contas} disabled={disabled || undefined}>
        <SelectTrigger id={id} className="w-full" aria-invalid={invalido || undefined}><SelectValue placeholder="Escolha a conta" /></SelectTrigger>
        {lista(contas)}
      </Select>
    ),
    Slider: <Slider defaultValue={[1000]} max={5000} step={100} disabled={disabled || undefined} aria-label={rotulo || nomeDoExemplo} />,
    Checkbox: <Checkbox {...comum} />,
    Radio: <RadioGroupItem {...comum} value="agora" />,
    Switch: <Switch {...comum} />,
    Slot: <Slot />,
  }[controle]
  const marcador = controle === "Checkbox" || controle === "Radio" || controle === "Switch"
  // Description e Description above são independentes, como no Figma; com o FieldError na tela, o Field esconde a descrição.
  const descricaoEmCima = emCima && !marcador && <FieldDescription>{textoDoExemplo}</FieldDescription>
  const texto = <>{descricao && <FieldDescription>{textoDoExemplo}</FieldDescription>}{invalido && <FieldError>Confira o que foi preenchido.</FieldError>}</>
  // O Slider não tem um elemento só para o htmlFor, então o nome é um FieldTitle. Sem o nome visível, o FieldLabel continua para o leitor de tela, com sr-only.
  const nome = controle === "Slider"
    ? <FieldTitle className={nomeVisivel ? undefined : "sr-only"}>{rotulo || nomeDoExemplo}</FieldTitle>
    : <FieldLabel htmlFor={controle === "Slot" ? undefined : id} className={nomeVisivel ? undefined : "sr-only"}>{rotulo || nomeDoExemplo}</FieldLabel>
  // Com Checkbox, Radio e Switch, e nos campos de texto na horizontal, o FieldContent junta o nome e a descrição ao lado do controle, como no Figma.
  const corpo = (
    <Field orientation={marcador ? "horizontal" : orientation === "vertical" ? undefined : "horizontal"} data-invalid={invalido || undefined} data-disabled={disabled || undefined}>
      {marcador ? (
        <>
          {!noFim && entrada}
          <FieldContent>{nome}{texto}</FieldContent>
          {noFim && entrada}
        </>
      ) : orientation === "horizontal" ? (
        <>
          <FieldContent>{nome}{texto}</FieldContent>
          {entrada}
        </>
      ) : (
        <>
          {nome}
          {descricaoEmCima}
          {entrada}
          {texto}
        </>
      )}
    </Field>
  )
  // O RadioGroupItem só funciona dentro de um RadioGroup.
  return controle === "Radio" ? <RadioGroup defaultValue="agora" disabled={disabled || undefined}>{corpo}</RadioGroup> : corpo
}

const base: Controles = { orientation: "vertical", controle: "Input", estado: "Default", nomeVisivel: true, rotulo: "", descricao: true, emCima: false }

const meta = {
  title: "Componentes/Field",
  render: (args) => campo(args),
  parameters: pagina("Junta o nome, o controle, a descrição e o erro de um campo de formulário, com os espaços certos entre eles. O `FieldLabel` liga o nome ao controle pelo `htmlFor`. `FieldSet` e `FieldGroup` organizam vários campos. As histórias **Exemplo** repetem, com os nossos tokens, os exemplos da documentação do shadcn."),
  argTypes: {
    controle: { name: "Control", control: "select", options: controles, description: "O que vai dentro. Com Checkbox, Radio ou Switch, o Field é `horizontal`: o controle mantém o próprio tamanho, e o nome e a descrição entram num `FieldContent` ao lado. **Slot**: o Field aceita qualquer controle, como um Input Group ou um Combobox; o marcador ocupa o lugar do controle.", table: { category: "Conteúdo" } },
    estado: { name: "State", control: "inline-radio", options: estados, description: "**Invalid**: `data-invalid` no `Field` pinta o nome de vermelho, `aria-invalid` no controle pinta a borda e o `FieldError` mostra a mensagem no lugar do `FieldDescription`. **Disabled**: `data-disabled` no `Field` esmaece o nome e `disabled` no controle o desliga.", table: { category: "Estado" } },
    orientation: { name: "Orientation", control: "inline-radio", options: orientacoes, description: "No código, `orientation`, para os campos de texto, o Select, o Slider e o Slot. `horizontal` põe o nome ao lado do controle. O `responsive`, que troca sozinho entre os dois pela largura do `FieldGroup`, é só do código: veja o exemplo Responsive. Checkbox, Radio e Switch são sempre `horizontal`, então este controle não muda nada neles.", table: { category: "Aparência" } },
    rotulo: { name: "Label", control: "text", description: "`FieldLabel`; no Slider, `FieldTitle`, porque ele não tem um elemento só para o `htmlFor`. Vazio, usa o nome do exemplo de cada controle.", table: { category: "Conteúdo" } },
    nomeVisivel: { name: "Label visible", control: "boolean", description: "Desligado, o nome ganha `className=\"sr-only\"`: some da tela, mas o leitor de tela continua anunciando o nome do campo.", table: { category: "Conteúdo" } },
    descricao: { name: "Description", control: "boolean", description: "`FieldDescription` depois do controle.", table: { category: "Conteúdo" } },
    emCima: { name: "Description above", control: "boolean", description: "`FieldDescription` antes do controle, logo abaixo do nome, como no campo de senha do exemplo Input do shadcn. Com Checkbox, Radio e Switch, a descrição fica sempre no `FieldContent`, e este controle não muda nada.", table: { category: "Conteúdo" } },
    posicaoControle: { name: "Control position", control: "inline-radio", options: ["start", "end"], description: "Com Checkbox, Radio e Switch, o controle antes do nome (`start`) ou depois (`end`). No código, é a ordem dentro do `Field`. Sem escolha, o Checkbox e o Radio ficam em `start` e o Switch em `end`.", table: { category: "Aparência" } },
  },
  args: base,
} satisfies Meta<Controles>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  name: "Padrão",
  decorators: [(Historia) => <FieldGroup className="w-80"><Historia /></FieldGroup>],
}

export const Orientacoes: Story = {
  name: "Orientation",
  parameters: vitrine("No código, `orientation`. Sem a propriedade, o Field é `vertical`. O Checkbox, o Radio e o Switch são sempre horizontal, com o nome ao lado. Nos campos de texto, horizontal põe o nome ao lado do controle. O `responsive`, que troca sozinho entre os dois, é só do código: o exemplo Responsive mostra ele."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="vertical"><FieldGroup className="max-w-80">{campo(base, "field-o-vertical")}</FieldGroup></Opcao>
      <Opcao nome="Switch · horizontal"><FieldGroup className="max-w-80">{campo({ ...base, controle: "Switch" }, "field-o-switch")}</FieldGroup></Opcao>
      <Opcao nome="horizontal"><FieldGroup className="max-w-80">{campo({ ...base, orientation: "horizontal" }, "field-o-horizontal")}</FieldGroup></Opcao>
    </Opcoes>
  ),
}

export const TiposDeControle: Story = {
  name: "Control",
  parameters: vitrine("Com os campos de texto, o Select e o Slider, o nome fica em cima. Com Checkbox, Radio e Switch, ele fica ao lado, num `FieldContent` com a descrição, e o controle mantém o próprio tamanho. O Slot marca o lugar de qualquer outro controle."),
  render: () => <Opcoes larga>{controles.map((c) => <Opcao key={c} nome={c}><FieldGroup>{campo({ ...base, controle: c }, `field-c-${c}`)}</FieldGroup></Opcao>)}</Opcoes>,
}

export const PosicaoDaDescricao: Story = {
  name: "Description above",
  parameters: vitrine("A descrição vai onde estiver no código: depois do controle (Description) ou entre o nome e o controle (Description above), como no campo de senha do exemplo Input do shadcn."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="Description"><FieldGroup>{campo(base, "field-p-baixo")}</FieldGroup></Opcao>
      <Opcao nome="Description above"><FieldGroup>{campo({ ...base, descricao: false, emCima: true }, "field-p-cima")}</FieldGroup></Opcao>
    </Opcoes>
  ),
}

export const Estados: Story = {
  name: "State",
  parameters: vitrine("Invalid pinta o nome e a borda e mostra o `FieldError` no lugar da descrição; Disabled esmaece o nome e desliga o controle."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="Default"><FieldGroup>{campo(base, "field-e1")}</FieldGroup></Opcao>
      <Opcao nome="Invalid"><FieldGroup>{campo({ ...base, estado: "Invalid" }, "field-e2")}</FieldGroup></Opcao>
      <Opcao nome="Disabled"><FieldGroup>{campo({ ...base, estado: "Disabled" }, "field-e3")}</FieldGroup></Opcao>
    </Opcoes>
  ),
}

export const Conjuntos: Story = {
  name: "FieldSet e FieldSeparator",
  parameters: vitrine("`FieldSet` agrupa campos sob um `FieldLegend`: `variant=\"legend\"` (o padrão) é um título; `variant=\"label\"`, do tamanho de um nome de campo. A opção legend é o exemplo Fieldset do shadcn. `FieldSeparator` traça uma linha, com ou sem texto no meio."),
  render: () => (
    <Opcoes larga>
      <Opcao nome="legend">
        <FieldSet className="w-full">
          <FieldLegend>Endereço</FieldLegend>
          <FieldDescription>Para onde mandamos o cartão.</FieldDescription>
          <FieldGroup>
            <Field><FieldLabel htmlFor="fs-rua">Rua</FieldLabel><Input id="fs-rua" placeholder="Rua das Flores, 120" /></Field>
            <div className="grid grid-cols-2 gap-(--gap-lg)">
              <Field><FieldLabel htmlFor="fs-cidade">Cidade</FieldLabel><Input id="fs-cidade" placeholder="São Paulo" /></Field>
              <Field><FieldLabel htmlFor="fs-cep">CEP</FieldLabel><Input id="fs-cep" placeholder="01310-100" /></Field>
            </div>
          </FieldGroup>
        </FieldSet>
      </Opcao>
      <Opcao nome="label">
        <FieldSet className="w-full">
          <FieldLegend variant="label">Avisos</FieldLegend>
          <FieldGroup className="gap-(--gap-md)">
            <Field orientation="horizontal"><Checkbox id="fs-email" defaultChecked /><FieldLabel htmlFor="fs-email">Por e-mail</FieldLabel></Field>
            <Field orientation="horizontal"><Checkbox id="fs-sms" /><FieldLabel htmlFor="fs-sms">Por SMS</FieldLabel></Field>
          </FieldGroup>
        </FieldSet>
      </Opcao>
      <Opcao nome="FieldSeparator">
        <FieldGroup className="w-full">
          <Button variant="outline" className="w-full">Entrar com Google</Button>
          <FieldSeparator>ou</FieldSeparator>
          <Field><FieldLabel htmlFor="fs-sep">E-mail</FieldLabel><Input id="fs-sep" /></Field>
        </FieldGroup>
      </Opcao>
    </Opcoes>
  ),
}

export const SemNomeVisivel: Story = {
  name: "Label visible",
  parameters: vitrine("Formulário com o nome dentro do campo, como placeholder. O `FieldLabel` continua em cada campo com `className=\"sr-only\"`: some da tela, mas o leitor de tela anuncia o nome, que o placeholder sozinho não garante."),
  render: () => (
    <FieldGroup className="w-md">
      <Field><FieldLabel htmlFor="snv-rua" className="sr-only">Rua</FieldLabel><Input id="snv-rua" placeholder="Rua" /></Field>
      <div className="grid grid-cols-2 gap-(--gap-lg)">
        <Field><FieldLabel htmlFor="snv-numero" className="sr-only">Número</FieldLabel><Input id="snv-numero" placeholder="Número" /></Field>
        <Field><FieldLabel htmlFor="snv-complemento" className="sr-only">Complemento</FieldLabel><Input id="snv-complemento" placeholder="Complemento" /></Field>
      </div>
      <Field><FieldLabel htmlFor="snv-cep" className="sr-only">CEP</FieldLabel><Input id="snv-cep" placeholder="CEP" /><FieldDescription>Só os números.</FieldDescription></Field>
      <Field><FieldLabel htmlFor="snv-cidade" className="sr-only">Cidade</FieldLabel><Input id="snv-cidade" placeholder="Cidade" /></Field>
    </FieldGroup>
  ),
}

// Os exemplos da documentação do shadcn, na mesma ordem, com conteúdo do banco.

export const ExemploInput: Story = {
  name: "Exemplo · Input",
  parameters: vitrine("Dois campos num `FieldSet`. No segundo, a descrição vem antes do campo."),
  render: () => (
    <FieldSet className="w-xs">
      <FieldGroup>
        <Field><FieldLabel htmlFor="ex-usuario">Usuário</FieldLabel><Input id="ex-usuario" placeholder="@anasouza" /><FieldDescription>Aparece para quem te manda um Pix.</FieldDescription></Field>
        <Field><FieldLabel htmlFor="ex-senha">Senha</FieldLabel><FieldDescription>Pelo menos 8 caracteres.</FieldDescription><Input id="ex-senha" type="password" placeholder="••••••••" /></Field>
      </FieldGroup>
    </FieldSet>
  ),
}

export const ExemploTextarea: Story = {
  name: "Exemplo · Textarea",
  parameters: vitrine("Um campo de texto longo, com quatro linhas."),
  render: () => (
    <FieldSet className="w-xs">
      <FieldGroup>
        <Field><FieldLabel htmlFor="ex-opiniao">Sua opinião</FieldLabel><Textarea id="ex-opiniao" rows={4} placeholder="O que podemos melhorar no app?" /><FieldDescription>Lemos todas as respostas.</FieldDescription></Field>
      </FieldGroup>
    </FieldSet>
  ),
}

export const ExemploSelect: Story = {
  name: "Exemplo · Select",
  parameters: vitrine("Um Select no lugar do campo. O `htmlFor` do `FieldLabel` aponta para o `id` do `SelectTrigger`, e clicar no nome abre a lista."),
  render: () => (
    <Field className="w-xs">
      <FieldLabel htmlFor="ex-conta">Conta</FieldLabel>
      <Select items={contas}>
        <SelectTrigger id="ex-conta" className="w-full"><SelectValue placeholder="Escolha a conta" /></SelectTrigger>
        {lista(contas)}
      </Select>
      <FieldDescription>De onde sai o dinheiro.</FieldDescription>
    </Field>
  ),
}

function FaixaDeValor() {
  const [valor, setValor] = useState([200, 800])
  return (
    <Field className="w-xs">
      <FieldTitle>Faixa de valor</FieldTitle>
      <FieldDescription>Mostrar transações entre R$ {valor[0].toLocaleString("pt-BR")} e R$ {valor[1].toLocaleString("pt-BR")}.</FieldDescription>
      <Slider value={valor} onValueChange={(v) => setValor(v as number[])} max={1000} step={10} className="mt-(--gap-sm)" aria-label="Faixa de valor" />
    </Field>
  )
}

export const ExemploSlider: Story = {
  name: "Exemplo · Slider",
  parameters: vitrine("Um Slider de dois pinos, com o nome num `FieldTitle` e os valores escritos na descrição."),
  render: () => <FaixaDeValor />,
}

export const ExemploCheckbox: Story = {
  name: "Exemplo · Checkbox",
  parameters: vitrine("Uma lista de Checkbox num `FieldSet` com `FieldLegend variant=\"label\"`, um separador e um Checkbox com descrição num `FieldContent`. Nos itens da lista, o nome usa `text-body-sm`, mais leve que o nome de um campo."),
  render: () => (
    <FieldGroup className="w-xs">
      <FieldSet>
        <FieldLegend variant="label">Mostrar no extrato</FieldLegend>
        <FieldDescription>Escolha o que aparece na lista de transações.</FieldDescription>
        <FieldGroup className="gap-(--gap-md)">
          {[["pix", "Pix", true], ["boletos", "Boletos", false], ["cartao", "Compras no cartão", false], ["rendimentos", "Rendimentos", false]].map(([v, n, marcado]) => (
            <Field key={v as string} orientation="horizontal"><Checkbox id={`ex-cb-${v}`} defaultChecked={marcado as boolean} /><FieldLabel htmlFor={`ex-cb-${v}`} className="text-body-sm">{n}</FieldLabel></Field>
          ))}
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <Field orientation="horizontal">
        <Checkbox id="ex-cb-sync" defaultChecked />
        <FieldContent><FieldLabel htmlFor="ex-cb-sync">Enviar o extrato por e-mail</FieldLabel><FieldDescription>Todo dia 1º, com as transações do mês anterior.</FieldDescription></FieldContent>
      </Field>
    </FieldGroup>
  ),
}

export const ExemploRadio: Story = {
  name: "Exemplo · Radio",
  parameters: vitrine("Um `RadioGroup` num `FieldSet`, cada opção num `Field` horizontal."),
  render: () => (
    <FieldSet className="w-xs">
      <FieldLegend variant="label">Plano da conta</FieldLegend>
      <FieldDescription>Os planos anual e vitalício saem mais em conta.</FieldDescription>
      <RadioGroup defaultValue="mensal">
        {[["mensal", "Mensal (R$ 9,90 por mês)"], ["anual", "Anual (R$ 99,90 por ano)"], ["vitalicio", "Vitalício (R$ 299,90)"]].map(([v, n]) => (
          <Field key={v} orientation="horizontal"><RadioGroupItem value={v} id={`ex-plano-${v}`} /><FieldLabel htmlFor={`ex-plano-${v}`} className="text-body-sm">{n}</FieldLabel></Field>
        ))}
      </RadioGroup>
    </FieldSet>
  ),
}

export const ExemploSwitch: Story = {
  name: "Exemplo · Switch",
  parameters: vitrine("O caso mais curto: só o nome e o Switch num `Field` horizontal, sem `FieldContent`."),
  render: () => <Field orientation="horizontal" className="w-fit"><FieldLabel htmlFor="ex-2fa">Verificação em duas etapas</FieldLabel><Switch id="ex-2fa" /></Field>,
}

export const ExemploCartaoDeEscolha: Story = {
  name: "Exemplo · Choice card",
  parameters: vitrine("O cartão de escolha: o `FieldLabel` em volta de um `Field` vira um cartão clicável, com borda, e ganha fundo quando está marcado. Funciona igual com Checkbox e Switch."),
  render: () => (
    <FieldGroup className="w-xs">
      <FieldSet>
        <FieldLegend variant="label">Onde investir</FieldLegend>
        <FieldDescription>Escolha para onde vai o dinheiro guardado.</FieldDescription>
        <RadioGroup defaultValue="cdb">
          {[["cdb", "CDB", "Rende 100% do CDI, com resgate a qualquer hora."], ["tesouro", "Tesouro Selic", "Título público, com resgate em um dia útil."]].map(([v, n, t]) => (
            <FieldLabel key={v} htmlFor={`ex-cc-${v}`}>
              <Field orientation="horizontal">
                <FieldContent><FieldTitle>{n}</FieldTitle><FieldDescription>{t}</FieldDescription></FieldContent>
                <RadioGroupItem value={v} id={`ex-cc-${v}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </FieldSet>
    </FieldGroup>
  ),
}

export const ExemploGrupo: Story = {
  name: "Exemplo · Field group",
  parameters: vitrine("Dois grupos de Checkbox separados por um `FieldSeparator`. `data-slot=\"checkbox-group\"` no `FieldGroup` aproxima os itens, e um link na descrição ganha sublinhado."),
  render: () => (
    <FieldGroup className="w-xs">
      <FieldSet>
        <FieldLabel>Transferências</FieldLabel>
        <FieldDescription>Avisamos quando uma transferência agendada sai da conta.</FieldDescription>
        <FieldGroup data-slot="checkbox-group">
          <Field orientation="horizontal" data-disabled><Checkbox id="ex-g-push" defaultChecked disabled /><FieldLabel htmlFor="ex-g-push" className="text-body-sm">Notificação no celular</FieldLabel></Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <FieldSet>
        <FieldLabel>Boletos</FieldLabel>
        <FieldDescription>Avisamos quando um boleto está perto de vencer. <a href="#">Ver boletos</a></FieldDescription>
        <FieldGroup data-slot="checkbox-group">
          <Field orientation="horizontal"><Checkbox id="ex-g-push-boleto" /><FieldLabel htmlFor="ex-g-push-boleto" className="text-body-sm">Notificação no celular</FieldLabel></Field>
          <Field orientation="horizontal"><Checkbox id="ex-g-email-boleto" /><FieldLabel htmlFor="ex-g-email-boleto" className="text-body-sm">E-mail</FieldLabel></Field>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  ),
}

export const ExemploResponsivo: Story = {
  name: "Exemplo · Responsive",
  parameters: vitrine("`orientation=\"responsive\"` com o `FieldGroup` largo: o nome e a descrição ficam à esquerda, num `FieldContent`, e o campo à direita. Abaixo de 448 px, tudo empilha. Os botões usam a mesma orientação."),
  render: () => (
    <form className="w-lg" onSubmit={(e) => e.preventDefault()}>
      <FieldSet>
        <FieldLegend>Perfil</FieldLegend>
        <FieldDescription>Seus dados de cadastro.</FieldDescription>
        <FieldGroup>
          <Field orientation="responsive">
            <FieldContent><FieldLabel htmlFor="ex-r-nome">Nome</FieldLabel><FieldDescription>Como está no seu documento.</FieldDescription></FieldContent>
            <Input id="ex-r-nome" placeholder="Ana Souza" />
          </Field>
          <Field orientation="responsive"><Button type="submit">Salvar</Button><Button type="button" variant="outline">Cancelar</Button></Field>
        </FieldGroup>
      </FieldSet>
    </form>
  ),
}

const sequencia = (inicio: number, total: number) => Object.fromEntries(Array.from({ length: total }, (_, i) => String(inicio + i).padStart(2, "0")).map((v) => [v, v]))
const meses = sequencia(1, 12)
const anos = sequencia(new Date().getFullYear(), 6)

export const Composicoes: Story = {
  name: "Composições",
  parameters: vitrine("O exemplo principal do shadcn, o formulário de pagamento: um `FieldSet` com título e campos lado a lado num grid, com dois Select; um separador; o endereço de cobrança com um Checkbox; um comentário; e os botões num `Field` horizontal."),
  render: () => (
    <form className="w-md" onSubmit={(e) => e.preventDefault()}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Pagamento</FieldLegend>
          <FieldDescription>Todas as transações são seguras.</FieldDescription>
          <FieldGroup>
            <Field><FieldLabel htmlFor="pg-nome">Nome no cartão</FieldLabel><Input id="pg-nome" placeholder="Ana Souza" /></Field>
            <Field><FieldLabel htmlFor="pg-numero">Número</FieldLabel><Input id="pg-numero" placeholder="0000 0000 0000 0000" /><FieldDescription>Os 16 números da frente.</FieldDescription></Field>
            <div className="grid grid-cols-3 gap-(--gap-lg)">
              <Field><FieldLabel htmlFor="pg-mes">Mês</FieldLabel><Select items={meses}><SelectTrigger id="pg-mes" className="w-full"><SelectValue placeholder="MM" /></SelectTrigger>{lista(meses)}</Select></Field>
              <Field><FieldLabel htmlFor="pg-ano">Ano</FieldLabel><Select items={anos}><SelectTrigger id="pg-ano" className="w-full"><SelectValue placeholder="AAAA" /></SelectTrigger>{lista(anos)}</Select></Field>
              <Field><FieldLabel htmlFor="pg-cvv">CVV</FieldLabel><Input id="pg-cvv" placeholder="123" /></Field>
            </div>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Endereço de cobrança</FieldLegend>
          <FieldDescription>O endereço cadastrado no cartão.</FieldDescription>
          <FieldGroup>
            <Field orientation="horizontal"><Checkbox id="pg-mesmo" defaultChecked /><FieldLabel htmlFor="pg-mesmo" className="text-body-sm">O mesmo do cadastro</FieldLabel></Field>
          </FieldGroup>
        </FieldSet>
        <Field><FieldLabel htmlFor="pg-obs">Comentário</FieldLabel><Textarea id="pg-obs" className="resize-none" placeholder="Algo que devemos saber?" /></Field>
        <Field orientation="horizontal"><Button type="submit">Pagar</Button><Button variant="outline" type="button">Cancelar</Button></Field>
      </FieldGroup>
    </form>
  ),
}
