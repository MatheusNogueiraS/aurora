---
name: componente-figma
description: Leva ao Figma um componente do Aurora ajustado ou desenhado no código, ou revisa um que já está lá, pelo padrão de construção do MUI for Figma (variantes só para o visual, boolean + troca de ícone, texto como propriedade, slot para região livre, dependências expostas), com nomes em inglês e fiel ao Storybook. Use quando um componente mudar no código e precisar chegar ao Figma, ou quando o usuário pedir para revisar, limpar, padronizar ou refazer um componente no Figma, ou para seguir "componente a componente".
---

# Componente no Figma, padrão Aurora

Um componente do Figma é bom quando quem desenha monta uma tela só pelo painel: liga partes por boolean, escolhe o ícone logo abaixo, digita o texto, solta conteúdo no slot. A referência de **estrutura** é o MUI for Figma (arquivo `Zf4q7r2IJQMGonraa5Nhw7`; `<Select>` na página `6026:46349`, `<TextField>` no nó `8612:6136`). A referência de **conteúdo** é o Storybook: o Figma mostra o que o código faz, nem mais, nem diferente. Por isso a ordem é sempre código e Storybook primeiro, Figma depois: quando um componente muda no código, esta skill leva a mudança ao Figma; quando nasce no código, ela cria a página dele. Pilotos prontos: **Select**, **InputGroup** e **Calendar**.

Um componente por vez. Cada um passa pelos passos abaixo.

## 1. Ler a fonte

- `stories/componentes/<Nome>.stories.tsx`: controles, opções e exemplos. É a lista do que precisa existir.
- `src/components/ui/<nome>.tsx`: medidas, o que muda com cada prop e **que outros componentes do DS ele usa por dentro**.
- No Figma (`X4B5OL1ztFND8H58JIWkxR`): os sets da página `↳ <Nome>`, as propriedades, a árvore e **as instâncias em todas as páginas**, contando as que estão dentro de slots e de instâncias ocultas (percorra `children` à mão; `findAll` não entra em tudo).

## 2. Conferir o padrão

| Regra | Como fica |
|---|---|
| **Inglês** | Componente, propriedades, valores de variante e nomes de camada em inglês: `Icon left` / `↳ Icon left`, `Text`, `Value`, `Placeholder`, `Filled`, `Open`, `Label`, `Prefix`, `Suffix`, `Top row`. Camadas: `Background`, `Border`, `Ring`, `Icon`. Os textos da documentação e os conteúdos de exemplo seguem em português. |
| **Variante só para visual** | Size, State, Type, Filled. Nada de variante para "onde fica a peça" ou "se a peça aparece". |
| **Parte opcional** | Boolean com o nome da parte (`Icon left`, `Prefix`, `Button`). |
| **Ícone** | Boolean + `INSTANCE_SWAP` logo abaixo (`↳ Icon left`), com `preferredValues` nos ícones da página `↳ Ícones` e, quando o código aceita, Spinner e Kbd. A instância do ícone fica exposta. |
| **Texto** | Propriedade `TEXT` ligada à camada. Texto opcional: boolean + `↳ <Nome>` de texto. |
| **Região livre** | `SLOT` (com boolean quando é opcional). |
| **Dependência** | Peças que existem no DS (Button, Separator, ícones, SelectItem…) entram como **instância exposta** do componente original. Nunca redesenhar. |
| **Menos subcomponentes** | Texto estilizado (rótulo, prefixo, contador) é camada de texto com estilo e propriedade, não componente. Subcomponente só quando se repete dentro de slot com estados próprios (ex.: SelectItem). Na dúvida, avaliar com o usuário. |
| **Sem sobrescrita** | A instância do DS fica como é. Se o código dá medidas próprias a uma peça do DS, é o caso abaixo. |

## 3. Alertar antes de mudar

Pare e explique ao usuário, com o efeito concreto, quando houver:

- **Peça derivada:** o componente tem uma versão própria de outro do DS (como o antigo InputGroupButton). Diga o que difere, onde aparece e o que muda ao trocar. Para decidir, monte uma tela A/B/C temporária na sandbox (`sandbox/views/`, registrada em `sandbox/page.tsx`) e apague depois.
- **Instâncias que quebram:** mudar eixos de variante quebra instâncias. Diga quantas e em que páginas.
- **Código diferente do desenho:** se o certo exige mudar o código (como o alinhamento no Textarea), o código muda primeiro, numa branch, e só depois o Figma.

Sem nada disso, siga direto.

## 4. Executar

- Renomear: `editComponentProperty(nome, { name })` mantém as escolhas das instâncias. Prefira editar o set no lugar.
- Trocar eixos de variante: monte o set novo ao lado, migre cada instância (todas as páginas, slots, ocultas), apague o antigo e atualize o registro `figma.root.getSharedPluginData('aurora','sets')`.
- Peça do DS dentro do componente: `createInstance()` do original, `isExposedInstance = true`.
- Remover subcomponente: troque as instâncias por camadas ou pelo componente certo antes de apagar.
- Componente novo, sem página: crie `↳ <Nome>` com a documentação à esquerda e o set à direita, como as outras páginas. A biblioteca de funções do arquivo monta cards e grades: `const L = await new Function('return ' + figma.root.getSharedPluginData('aurora', 'lib'))()(figma);`. Registre o set em `getSharedPluginData('aurora','sets')`.

## 5. Documentar e verificar

- Página `↳ <Nome>`: cards com instâncias reais do set, títulos e textos em português, descrição do componente com o que cada propriedade é no código.
- Capture a página e as páginas que usam o componente. Teste numa instância: ligar cada boolean, trocar o ícone, soltar algo no slot, trocar Size de uma peça exposta.
- Storybook: o `name` de cada controle repete o nome da propriedade do Figma. Ajuste num PR pequeno.
- Registre o andamento na memória do projeto.

## Armadilhas da API do Figma

- Instância oculta não carrega os filhos: mostre (`visible = true`), aplique e esconda de novo. A ligação com o boolean continua.
- `resize()` desliga o Hug: depois dele, volte `primaryAxisSizingMode = 'AUTO'`.
- Instância aninhada não muda de tamanho: trocar o Size de um Button exposto só acompanha a altura quando ela vem de variável (`xs` ↔ `icon-sm` funciona; `xs` → `sm` fica com 24 px).
- Os nomes das páginas começam com espaços (`    ↳ Nome`): procure por regex.
- Valor de variável semântica é um alias: leia a medida do nó, não `valuesByMode`.
