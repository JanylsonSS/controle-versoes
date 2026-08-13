# Para quem vai mexer no código

Documento de passagem para o time de TI. Explica **como o sistema é por dentro,
por que é assim, e onde mexer** para cada tipo de mudança.

Se você só quer rodar e usar, o [README.md](README.md) basta. Este aqui é para
quem vai manter.

---

## 1. O que o sistema faz — e o que ele recusa fazer

Uma frase só:

> ninguém trabalha, orça ou executa sobre uma versão de projeto que não seja a
> vigente.

Isso não é slogan, é **critério de decisão**. Toda vez que aparecer uma ideia
nova, a pergunta é: "isso ajuda alguém a não usar a versão errada?". Se a
resposta for não, provavelmente não entra.

A direção deixou **fora de escopo**, por escrito: gestão financeira, aprovação
regulatória, cronograma, edição de BIM/CAD, e chat entre pessoas. Isso explica
coisas que parecem faltar de propósito.

**Uma exceção, declarada:** planejamento de tarefas também estava fora, e entrou
depois como o quadro de atividades (R25), a pedido da coordenação. Foi posto
numa **aba separada** justamente para o escopo original — saber qual versão vale
— continuar sendo a primeira coisa que a tela do projeto responde. Se você for
mexer no quadro, mantenha essa separação.

O que cada requisito (R1…R25) cobre e o que ficou de fora está em
[REQUISITOS-COBERTOS.md](REQUISITOS-COBERTOS.md). As decisões em aberto estão em
[PENDENCIAS.md](PENDENCIAS.md). **Leia os dois antes de mexer em regra de
negócio** — muita coisa que parece arbitrária tem motivo registrado lá.

---

## 2. Ambiente

- **Node.js 22.5 ou mais novo.** Só isso.
- **Zero dependências.** Não existe `npm install`, não existe `node_modules`,
  não existe `package-lock.json`.
- **Sem etapa de build.** Editou o arquivo, reinicia o servidor, pronto.

```bash
node servidor.js       # sobe (ou dois cliques no iniciar.bat, no Windows)
npm run recomecar      # apaga tudo e recria os dados de teste
```

### Por que zero dependências

Foi decisão consciente, não preguiça. A avaliação inicial
([AVALIACAO.md](AVALIACAO.md)) apontou que o maior risco de construir sob medida
não é construir — é **manter**, numa empresa sem equipe de TI dedicada. Um
projeto sem dependências não tem `npm install` que quebra, não tem pacote que
sai do ar, não tem CVE para acompanhar e não apodrece parado. Daqui a dois anos
`node servidor.js` ainda sobe.

O custo: o encanamento é escrito à mão — casamento de rotas, leitura de
formulário, sessão por cookie e arquivos estáticos somam cerca de **60 linhas**,
todas na seção "Encanamento" no fim de `src/web/roteador.js`. Se um dia o
sistema crescer muito além destes requisitos, trocar por Express é meia hora —
mas **não faça isso só por conforto**. A ausência de dependências é uma
funcionalidade aqui, não uma limitação a superar.

O que o Node moderno deu de graça e tornou isso possível:

| Recurso | Substitui |
|---|---|
| `node:sqlite` (`DatabaseSync`) | better-sqlite3 / driver de banco |
| `new Response(buf, {headers}).formData()` | multer / busboy |
| `node:http` | Express |
| Template literals | motor de templates |

---

## 3. Mapa do código

```
servidor.js                  verificações de ambiente + sobe o http
iniciar.bat                  atalho de dois cliques no Windows
src/
  config.js                  NOME_EXIBICAO, porta, caminhos
  persistencia/
    banco.js                 conexão, esquema, migrações        ┐ únicos dois
    repositorio.js           todas as consultas                 ┘ com SQL
    seed.js                  dados de teste
    pdf-exemplo.js           gera os PDFs fictícios do seed
  regras/                    ← as decisões de negócio moram aqui
    papeis.js                quem pode publicar, aprovar, cadastrar
    visibilidade.js          quem vê qual projeto
    notificacao.js           quem é avisado
    ciencia.js               ciência obrigatória e o que ela trava
    aprovacao.js             o que é alteração grande, quem dá o aval
    cadastro.js              vocabulário: situação e tipo de obra
    atividades.js            colunas do quadro e as datas automáticas
    aviso-email.js           modelo do e-mail (envio ainda não existe)
  web/
    roteador.js              tabela de rotas + encanamento http
    html.js                  escapar texto, formatar datas e valores
    paginas/                 uma tela por arquivo
publico/
  estilo.css
  copiar.js                  copiar o caminho da pasta
  quadro.js                  arrastar cartão e abrir a janela de detalhes
verificacao/
  executar.mjs               `npm test` — roda tudo num banco separado
  ajuda.mjs                  auxiliares comuns às verificações
  01..07-*.mjs               as verificações
dados/                       criado ao rodar: banco.db + arquivos enviados
```

### As três regras de organização

**1. Só `banco.js` e `repositorio.js` conhecem SQL.** As telas pedem dados ao
repositório e não sabem onde eles estão guardados. Trocar SQLite por Postgres é
reescrever esses dois arquivos — nada mais. **Não escreva SQL numa página.**

**2. `src/regras/` guarda o que a empresa pode mudar de ideia.** Cada arquivo é
uma decisão de negócio, com o motivo escrito ao lado. Quando a coordenação
mudar uma regra, a alteração deve caber em um desses arquivos. Se você se pegar
espalhando um `if` de regra por três telas, pare: ele pertence a `regras/`.

**3. Uma tela por arquivo em `web/paginas/`.** Cada uma começa dizendo quais
requisitos atende. As páginas só montam HTML — não decidem nada.

---

## 4. Modelo de dados

Dez tabelas. Todas em `src/persistencia/banco.js`.

| Tabela | Para quê |
|---|---|
| `usuarios` | as 8 pessoas, com papel e e-mail. Sem senha (ver §12) |
| `projetos` | a obra e sua ficha: cliente, contrato, prazo, situação, tipo, conjunto, link do Drive, caminho de rede |
| `revisoes` | as versões, com a situação de cada uma (ver §5) |
| `equipes` | quem trabalha em qual projeto — **a tabela mais importante** (ver §6) |
| `avisos` | quem foi avisado de qual revisão e se confirmou (R5 + R6 na mesma linha) |
| `acessos_versao_antiga` | quem abriu versão que não vale, e quando (R8) |
| `andamentos` | o "commit": o que fiz, dificuldade, dúvida |
| `incidentes` | retrabalho por versão errada, com custo e horas (R11) |
| `flags_cadastro` | quem avisou que um campo do cadastro está errado |
| `atividades` | o quadro kanban: cartão, coluna, responsável, ordem, datas (ver §7) |

### Invariantes que o código depende

Não estão todos no banco como constraint — alguns dependem do repositório. Se
você mexer em `revisoes.publicar` ou `revisoes.aprovar`, **preserve estes**:

1. **No máximo uma revisão `VIGENTE` por projeto.** Pode haver zero (quando a
   vigente é cancelada) — a tela trata isso com um aviso vermelho.
2. **No máximo uma `AGUARDANDO_APROVACAO` por projeto.** Duas deixariam ambíguo
   o que vem depois da vigente. Validado no roteador, ao publicar.
3. **Aviso só nasce quando a revisão passa a valer.** Nunca ao publicar algo
   que ainda espera aprovação — para a obra, nada mudou ainda.
4. **Revisão nunca é apagada.** Superada e cancelada continuam na tabela (R3).
5. **Atividade não encosta em revisão.** Mover cartão do quadro não muda versão,
   não gera aviso e não exige ciência — ver §7.

---

## 5. A máquina de estados da revisão

É o coração do sistema. Vale desenhar na cabeça antes de mexer.

```
                    publicar (muda orçamento/prazo = não)
                         │
   [nova] ───────────────┼──────────────────────► VIGENTE
     │                                              │
     │ publicar (muda orçamento/prazo = sim)        │ outra revisão passa a valer
     ▼                                              ▼
  AGUARDANDO_APROVACAO ──── aprovar ──► VIGENTE   SUPERADA
     │
     └──────────────────── reprovar ──► CANCELADA (com motivo)

  qualquer situação ────── cancelar ──► CANCELADA (com motivo)
```

- **`VIGENTE`** — é esta que a obra executa. Só ela.
- **`AGUARDANDO_APROVACAO`** — publicada, mas ainda **não vale**. A anterior
  continua vigente. Ninguém foi avisado.
- **`SUPERADA`** — já valeu. Abrir fica registrado (R8).
- **`CANCELADA`** — não pode ser usada. Continua no histórico.

Quem aprova está em `regras/aprovacao.js`. A regra que mais gera dúvida:
**ninguém aprova a própria revisão**. Como a coordenação publica *e* aprova, sem
isso a aprovação vira formalidade.

---

## 6. `equipes`: uma lista, dois usos

A tabela `equipes` decide **duas coisas ao mesmo tempo**:

- **quem vê o projeto** (`regras/visibilidade.js`)
- **quem é avisado quando ele muda** (`regras/notificacao.js`)

Isso é deliberado. Com duas listas separadas, mais cedo ou mais tarde alguém
estaria numa e não na outra — enxergaria o projeto e não receberia aviso dele.
Que é exatamente o buraco que custou a pavimentação de R$ 18.400.

**Se for tentado a separar as duas, leia o PENDENCIAS antes.**

Exceção: coordenação e direção enxergam todos os projetos, porque são quem monta
as equipes e quem responde pela empresa. Está numa função só,
`veTodosOsProjetos`.

### Onde a visibilidade é aplicada

Em **todas** as portas, no servidor — não é só esconder link:

- lista de projetos, tela do projeto, tela da revisão
- **download do arquivo** (`/arquivos/:id`)
- avisos, retrabalho, formulário de incidente
- páginas de conjunto

Ao criar rota nova que toque um projeto, chame `enxerga(usuario, projetoId)` no
roteador. Esqueceu = vazamento.

---

## 7. O quadro de atividades

O kanban da aba **Atividades**. É a parte mais recente e a que mais destoa do
resto do sistema — vale entender antes de mexer.

### A regra que não pode ser quebrada

**Atividade e revisão não se tocam.** Mover um cartão não muda versão vigente,
não gera aviso e não exige ciência. Não existe coluna ligando `atividades` a
`revisoes`, e é de propósito.

O motivo é o objetivo do sistema: se um cartão puder mexer no que a obra
executa, existe um segundo caminho para mudar a versão — e a pergunta "qual
versão vale?" volta a ter duas respostas possíveis. O
`07-quadro-de-atividades.mjs` tem três verificações que existem só para isso.
**Se elas quebrarem, alguém acoplou as duas coisas.**

Pelo mesmo motivo o quadro está numa **aba separada**, e não numa seção da tela
do projeto: a versão vigente precisa ser a primeira coisa que alguém vê ao abrir
uma obra.

### Onde cada parte mora

| Parte | Arquivo |
|---|---|
| Colunas e datas automáticas | `src/regras/atividades.js` |
| Consultas e o movimento | `atividades` em `src/persistencia/repositorio.js` |
| A tela, os cartões e a janela | `src/web/paginas/atividades.js` |
| Arrastar e abrir a janela | `publico/quadro.js` |
| Rotas | `roteador.js`, seção "Quadro de atividades" |

As **abas** (Projeto e versões / Atividades) são a função `abas()`, exportada de
`paginas/atividades.js` e usada também por `paginas/projeto.js`.

### Datas: o sistema preenche, ninguém digita

`datasAoMover()` em `regras/atividades.js` decide:

- entrou em qualquer coluna que não seja "não iniciado" → marca `iniciada_em`,
  se ainda não tiver;
- chegou em "finalizado" → marca `finalizada_em`;
- **saiu de "finalizado" → apaga `finalizada_em`**, senão a data mentiria.

Data digitada à mão é o campo que mais fica errado, e data errada num sistema
que se propõe a ser a fonte da verdade é pior que campo vazio.

### Ordenação: renumera a coluna inteira

`atividades.mover()` não tenta ser esperto com índices fracionários. Ele lê os
ids da coluna de destino, insere o cartão na posição pedida e **renumera todos
de 0 a n**, dentro de uma transação.

É mais escrita do que o necessário, e de propósito: são poucos cartões por obra,
e assim não existe estado meio torto se dois movimentos acontecerem perto um do
outro. Não troque isso por algo mais eficiente sem uma razão medida.

### Arrastar: por que não é a API do HTML

`publico/quadro.js` usa **eventos de ponteiro** (`pointerdown` / `pointermove` /
`pointerup`), e não a API de drag-and-drop do HTML. Motivo: a nativa **não
funciona no toque**, e a obra usa celular. Com ponteiro é uma implementação só
para mouse e dedo.

Três coisas para não quebrar se for mexer:

1. **`touch-action: none` no cartão.** Sem isso, o navegador rola a página em vez
   de arrastar.
2. **O limite de 6 pixels** separa clique de arraste. Sem ele, todo clique no
   cartão vira um arraste de zero pixel e a janela nunca abre.
3. **O `elementFromPoint` precisa que o fantasma tenha `pointer-events: none`**,
   senão ele se detecta a si mesmo e a coluna alvo nunca é encontrada.

Ao soltar, o cartão é movido na tela **antes** da resposta do servidor — esperar
travaria a mão. Se o POST falhar, o cartão volta para onde estava e aparece um
recado. Se der certo, a página recarrega, porque as datas quem decide é o
servidor.

### Funciona sem JavaScript

Isto é requisito, não enfeite: se o `quadro.js` não carregar, a página continua
utilizável.

- o nome do cartão é um **link** para `?atividade=N`; o servidor então renderiza
  aquele `<dialog>` com o atributo `open`;
- dentro da janela há um **seletor de coluna** que faz, por formulário, o mesmo
  que o arraste.

Com JavaScript, o mesmo `<dialog>` é aberto com `showModal()` sem recarregar. Se
você acrescentar algo ao quadro, mantenha os dois caminhos.

### Uma sobreposição que ainda não foi resolvida

Existem **duas** formas de registrar o que se está fazendo: o cartão do quadro
(`atividades`) e o registro de andamento (`andamentos`, o "commit"). A equipe vai
perguntar onde escrever.

Isso está em aberto de propósito — a decisão depende de qual dos dois as pessoas
usarem no piloto. As saídas prováveis são amarrar o andamento a uma atividade ou
aposentar um dos dois. **Não resolva por conta própria**; está registrado em
[PENDENCIAS.md](PENDENCIAS.md).

---

## 8. Onde mexer para cada tipo de mudança

| Quero… | Mexa em |
|---|---|
| trocar o nome que aparece na tela | `src/config.js` → `NOME_EXIBICAO` |
| mudar quem publica / aprova / cadastra | `src/regras/papeis.js` |
| mudar quem vê qual projeto | `src/regras/visibilidade.js` |
| mudar quem recebe aviso | `src/regras/notificacao.js` |
| mudar o que a ciência trava, ou o prazo de cobrança | `src/regras/ciencia.js` |
| mudar o que conta como "alteração grande" | `src/regras/aprovacao.js` |
| acrescentar situação ou tipo de obra | `src/regras/cadastro.js` |
| mudar o texto do e-mail | `src/regras/aviso-email.js` |
| acrescentar/renomear coluna do quadro | `src/regras/atividades.js` (`COLUNAS`) **e** o `CHECK` de `atividades` em `banco.js` — ver §9 |
| mexer no arrastar dos cartões | `publico/quadro.js` — leia §7 antes |
| acrescentar campo no cadastro | `banco.js` (`garantirColunas`) → `repositorio.js` → `paginas/novo-projeto.js` → `roteador.js` (`camposDoCadastro` e `deVoltaAoFormulario`) |
| criar tela nova | arquivo em `web/paginas/` + linha na tabela `ROTAS` |
| trocar de banco | só `banco.js` e `repositorio.js` |

### Acrescentar um campo no cadastro — receita completa

Foi o caminho mais percorrido até agora. São **quatro** lugares, nesta ordem:

1. `banco.js` → acrescente a coluna no `garantirColunas('projetos', {...})`.
   **Só adicione ao fim; nunca renomeie nem remova.**
2. `repositorio.js` → `projetos.criar` e `projetos.atualizar` (as duas!).
3. `paginas/novo-projeto.js` → o `<input>` em `camposDoProjeto`, e a linha na
   ficha em `paginas/projeto.js` se for para aparecer lá.
4. `roteador.js` → `camposDoCadastro` (lê do formulário) e
   `deVoltaAoFormulario` (devolve em caso de erro de validação).

Esquecer o passo 4 causa um bug silencioso: o campo salva na criação e some ao
dar erro de validação.

---

## 9. Migrações

O banco de quem já usou o sistema não pode ser apagado para caber um campo novo.
Existem dois mecanismos em `banco.js`:

**Coluna nova** — `garantirColunas(tabela, { coluna: 'TIPO DEFAULT x' })`. Lê o
`PRAGMA table_info` e só faz `ALTER TABLE` se faltar. Idempotente.

**Mudar um `CHECK`** — SQLite não altera constraint no lugar. É preciso
reconstruir a tabela: criar a nova, copiar, `DROP`, `RENAME`. Já existe um
exemplo funcionando: o bloco que acrescentou `AGUARDANDO_APROVACAO` à tabela
`revisoes`. Ele se detecta pelo próprio SQL da tabela em `sqlite_master`, então
roda uma vez e nunca mais. **Copie esse padrão** e lembre de
`PRAGMA foreign_keys = OFF` durante o rebuild.

---

## 10. Convenções

- **Tudo em português**, inclusive nomes de variáveis, tabelas e funções. Quem
  vai manter isto trabalha numa construtora brasileira; `revisoes.vigenteDoProjeto`
  se lê melhor que `revisions.getCurrentByProject`.
- **Todo texto de usuário passa por `esc()`** (`web/html.js`) antes de virar
  HTML. Sem exceção.
- **Transação é manual:** `banco.exec('BEGIN')` / `COMMIT` / `ROLLBACK` dentro de
  `try/catch`. Veja `revisoes.publicar` como modelo.
- **Datas são ISO no banco**, formatadas para pt-BR só na tela
  (`html.js` → `dataHora`, `data`, `haQuantoTempo`).
- **Comentário explica o porquê, não o quê.** O código já diz o que faz; o que
  se perde é a razão de a regra ser aquela.
- **Rotas com parte fixa vêm antes das com `:param`.** `/projetos/novo` precisa
  estar acima de `/projetos/:id`, senão "novo" vira um id.

---

## 11. Armadilhas que já custaram tempo

Todas foram encontradas construindo isto. Estão aqui para não custarem de novo.

**Caminho do Windows com acento quebra `new URL(...).pathname`.**
O usuário desta máquina é `Fábio Ernesto`; o pathname vem percent-encoded
(`F%C3%A1bio`) e nenhum `fs.existsSync` acha o arquivo. Use **sempre**
`fileURLToPath(import.meta.url)`.

**`npm run recomecar` falha com o servidor rodando.**
No Windows o SQLite mantém o arquivo travado. O script detecta `EPERM`/`EBUSY` e
avisa em português. Pare o servidor antes.

**Cookie não vai em `Invoke-WebRequest -Headers @{Cookie=...}`.**
Testes em PowerShell dão falso positivo: tudo responde como o usuário padrão.
Para testar sessão, use `fetch` do Node com `headers: { cookie }`.

**PDF em `latin1` come travessão e aspas curvas.**
`pdf-exemplo.js` tem um mapa WinAnsi para `—`, `–`, `"`, `'` etc. Sem ele o
caractere vira lixo silenciosamente.

**A área de transferência falha de dois jeitos diferentes.**
`navigator.clipboard` só existe em contexto seguro — no endereço de rede
(`http://192.168…`) não existe. `execCommand('copy')` funciona lá, mas exige
clique real e alguns navegadores já recusam. `publico/copiar.js` tenta os dois e,
se ambos falharem, seleciona o texto e manda usar Ctrl+C. **Sempre trate a
rejeição da promise** — sem isso o usuário clica e não acontece nada.

**Navegador não abre `file:///G:/...` a partir de página web.** Trava de
segurança, sem contorno. Por isso o caminho da pasta é um campo para copiar, e
não um link.

**Checkbox repetido precisa de `getAll`.** `corpo.get('equipe')` devolve só o
primeiro. `URLSearchParams` e `FormData` têm os dois métodos — o helper
`todosOsValores` no roteador cobre isso.

**Crase dentro de template literal quebra o `banco.js`.** O esquema inteiro está
numa template string. Um comentário SQL com `` `nome_da_coluna` `` derruba o
arquivo com um erro de sintaxe que aponta para a linha errada. Use aspas.

**A API de drag-and-drop do HTML não funciona no toque.** Por isso
`publico/quadro.js` usa eventos de ponteiro — uma implementação só, que serve
mouse e dedo. Se for mexer: os cartões precisam de `touch-action: none` no CSS,
senão o navegador rola a página em vez de arrastar o cartão.

**O computador tem vários IPv4, e só um serve para o celular.** VPN, Docker,
WSL e Hyper-V criam endereços de faixa privada que parecem legítimos — nesta
máquina são três, e dois não funcionam. Não dá para distinguir pelo número; o
`servidor.js` separa **pelo nome do adaptador** e imprime os inúteis sob "Ignore
estes". Se aparecer um adaptador novo que não serve, acrescente ao
`ADAPTADORES_QUE_NAO_SERVEM`.

E mesmo com o endereço certo, dois bloqueios são comuns: **VPN ativa** (muitas
cortam o tráfego da rede local) e o **firewall do Windows** barrando o Node na
primeira execução.

**Upload sem dependência:** leia o corpo como Buffer e passe por
`new Response(buffer, { headers: { 'content-type': tipoOriginal } }).formData()`.
Funciona a partir do Node 18.

---

## 12. O que ainda não existe, e por quê

Nada disto é esquecimento — cada um tem um motivo registrado em
[PENDENCIAS.md](PENDENCIAS.md).

| O quê | Trava |
|---|---|
| **Login de verdade** (conta Google) | precisa de endereço fixo para registrar no Google Cloud → depende da hospedagem. Hoje há um seletor "entrar como", sem senha |
| **Envio do e-mail** (R18) | o modelo e o remetente já estão no código; falta o envio, que também depende da hospedagem |
| **Backup automático** | ⚠️ **o GitHub não cobre isto.** Ele versiona o código; o banco (`dados/banco.db`) e os arquivos ficam de fora, e de propósito — o `.gitignore` exclui `dados/`. O backup precisa ser cópia periódica do `banco.db` para o Drive |
| **Arquivos no Drive** (R20) | hoje o sistema guarda o arquivo e também tem link + caminho da pasta. Migrar de vez é decisão de produção |
| **Ver revisão em elaboração** (R7) | parcialmente resolvido pela aprovação; revisão não publicada o sistema não enxerga |

### Duas dívidas técnicas conhecidas

**A lista de contas autorizadas será manual.** As contas são Gmail comuns
(`nome.promav@gmail.com`), não Google Workspace — então o login não poderá
filtrar por domínio. Vai ser uma lista das 8 contas no código ou no banco, e
tirar alguém que saiu da empresa é passo manual. Não deixe isso implícito quando
construir o login.

**A letra do drive (`G:`) é por máquina.** O caminho de rede cadastrado assume
que todos têm a mesma letra. O aplicativo do Google Drive escolhe por
computador. Vale padronizar antes que alguém confie nisso.

---

## 13. Como verificar que você não quebrou nada

```bash
npm test
```

É só isso. Roda **251 verificações** em cerca de 20 segundos e diz o que quebrou.

Não há framework de teste — seria dependência. São sete scripts em JavaScript
puro, na pasta `verificacao/`, que conversam com o sistema **pela porta**, do
mesmo jeito que uma pessoa usaria. Nada de mock: se a verificação passa, o
sistema funciona de verdade.

| Script | Cobre |
|---|---|
| `01-caso-pavimentacao` | o caso âncora de ponta a ponta |
| `02-visibilidade` | R19: quem vê o quê, e o bloqueio no servidor |
| `03-cadastro-e-equipe` | criar projeto, montar equipe, permissões |
| `04-ficha-conjunto-andamento` | trava do arquivo, ficha, conjunto, o "commit" |
| `05-aprovacao-e-avisos-de-cadastro` | R17 inteiro + placa de aviso |
| `06-roteiro-da-apresentacao` | percorre o `APRESENTACAO.md` e confere se cada frase ainda bate com a tela |
| `07-quadro-de-atividades` | o kanban, e a garantia de que ele **não** encosta em versão, aviso nem ciência |

O último merece atenção especial: sempre que o sistema muda, ele aponta em
segundos qual bloco do roteiro de demonstração ficou mentiroso. É barato manter
e evita chegar numa reunião com um documento que não corresponde ao sistema.

### O executor não toca nos seus dados

`verificacao/executar.mjs` usa **porta 3999 e a pasta `dados-verificacao/`**,
apagada no fim. Dá para rodar `npm test` com a demonstração aberta na porta 3000
sem perder nada do que estiver na tela — o que importa quando alguém pede "roda
o teste rapidinho" no meio de uma apresentação.

Isso vem das variáveis `PORTA` e `PASTA_DADOS`, lidas em `src/config.js`. Para
cada script, o executor recria o banco do zero, sobe um servidor só para ele,
roda e derruba — porque os scripts publicam, aprovam e cadastram de propósito,
e sujam os dados.

### Rodar um script sozinho

Útil quando você está mexendo em uma área só:

```bash
npm run recomecar && node servidor.js     # numa janela
node verificacao/02-visibilidade.mjs      # noutra
```

Assim ele fala com a porta 3000 e o banco normal — então **os dados ficam
sujos**. Rode `npm run recomecar` depois.

### Escrevendo uma verificação nova

Use `verificacao/ajuda.mjs`: `ok()`, `secao()`, `encerrar()`, `pegar()`,
`form()`, `enviarArquivo()` e o mapa `COMO` com as pessoas por nome
(`COMO.thayna` em vez de `usuario_id=7`). O nome do arquivo precisa começar com
dois dígitos — é assim que o executor o encontra.

Uma coisa que o `02-visibilidade` faz e vale copiar: ele **confere que a sessão
é mesmo de quem se pediu** antes de testar qualquer outra coisa. Sem isso, um
cookie que não pega faz tudo responder como o usuário padrão, e a verificação
passa por engano.

### Verificação manual mínima, se estiver sem os scripts

1. Entrar como Álvaro → vê 2 projetos, 2 avisos pendentes
2. Abrir a pavimentação → "3 de 5", arquivo bloqueado
3. Confirmar → "4 de 5", arquivo abre
4. Abrir a R02 no histórico → faixa "não é a versão que vale" + acesso registrado
5. Como Lya, publicar marcando "muda orçamento ou prazo" → não vira vigente
6. Como Matheus, aprovar → vira vigente e os avisos saem
7. Como Micael, tentar `/projetos/1/publicar` → 403

---

## 14. Antes de tocar em regra de negócio

Três perguntas, nesta ordem:

1. **Está em `PENDENCIAS.md`?** Muita coisa que parece errada é decisão
   registrada, com o motivo. Algumas esperam resposta da coordenação.
2. **A mudança cabe num arquivo de `regras/`?** Se não couber, provavelmente o
   desenho está sendo forçado — vale conversar antes de espalhar `if`.
3. **Isso ajuda alguém a não usar a versão errada?** Se não, é candidato a ficar
   de fora — e a anotar no PENDENCIAS em vez de construir.
