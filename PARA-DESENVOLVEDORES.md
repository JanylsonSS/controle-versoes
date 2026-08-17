# Para quem vai mexer no código

Documento de passagem para o time de TI. Explica **como o sistema é por
dentro, por que é assim, e onde mexer** para cada tipo de mudança.

Se você só quer rodar e usar, o [README.md](README.md) basta.

---

## 1. O que o sistema faz — e a história que explica o desenho

O produto de hoje nasceu de dois momentos:

1. **O problema original (julho/2026):** uma pavimentação foi executada sobre
   uma versão antiga do projeto — a mudança não chegou em quem executava — e o
   serviço foi refeito. O sistema nasceu para "ninguém trabalhar sobre versão
   que não é a vigente".
2. **O pivô (13/08/2026):** a coordenação definiu que a mudança de projeto
   **não é um arquivo, é uma orientação** — "mudou o orçamento", "mudou a
   estrutura" — endereçada a quem vai executá-la. Saíram as revisões numeradas
   (R00→R03), a "versão vigente", o upload de arquivo e o bloqueio por ciência;
   entraram as orientações, o vínculo automático com o quadro de atividades e
   a agenda.

O critério de decisão continua o mesmo: **uma mudança não pode se perder no
caminho até quem executa**. Ideia nova que não sirva a isso é candidata a
ficar de fora.

Decisões e pendências estão em [PENDENCIAS.md](PENDENCIAS.md); o mapa
requisito-a-requisito em [REQUISITOS-COBERTOS.md](REQUISITOS-COBERTOS.md).
**Leia os dois antes de mexer em regra de negócio.**

---

## 2. Ambiente

Duas metades com filosofias diferentes, e é proposital:

| | Servidor (`src/`, `servidor.js`) | Frontend (`frontend/`) |
|---|---|---|
| Dependências | **zero** — nem `npm install` | React, Vite, react-router |
| Build | não tem | `npm run app:build` → `dist/` |
| Por quê | é a parte que não pode apodrecer parada | interface rica e padrão de mercado |

```bash
npm --prefix frontend install   # 1ª vez numa máquina nova
npm run app:build               # compila o frontend para dist/
node servidor.js                # sobe tudo em :3000
npm run app                     # dev do frontend (Vite :5173 + proxy /api)
npm run recomecar               # recria os dados de teste
npm test                        # as 177 verificações da API
```

O que o Node moderno dá de graça no servidor: `node:sqlite` (sem driver),
`node:http` (sem Express), template literals. **Não acrescente dependência ao
servidor por conforto** — a ausência delas é uma funcionalidade.

---

## 3. Mapa do código

```
servidor.js                verificações de ambiente + /api/* + serve dist/ (SPA)
src/
  config.js                NOME_EXIBICAO, porta, PASTA_DADOS (testes usam outra)
  persistencia/
    banco.js               conexão, esquema, limpeza do modelo antigo   ┐ únicos
    repositorio.js         todas as consultas                           ┘ com SQL
    seed.js                dados de teste (agenda relativa a HOJE)
  regras/                  ← as decisões de negócio moram aqui
    papeis.js              quem publica, aprova, cadastra
    visibilidade.js        quem vê qual projeto (R19)
    notificacao.js         quem é avisado
    ciencia.js             prazo de cobrança; ciência NÃO bloqueia
    aprovacao.js           aval de orçamento/prazo — registro, não portão
    atividades.js          colunas do quadro e datas automáticas
    cadastro.js            vocabulário: situação e tipo de obra
    aviso-email.js         modelo do e-mail (envio ainda não existe)
  api/
    http.js                encanamento: rotas, corpo JSON, erros, sessão
    guardas.js             projetoVisivel & cia — o R19 em forma de função
    sessao.js              /api/sessao, /api/notificacoes
    projetos.js            listagem+busca, ficha agregada, cadastro, equipe, flags
    orientacoes.js         publicar/editar, ciência, aval, /api/avisos
    atividades.js          quadro, mover, andamentos
    agenda.js              semana, marcar (para si e para outros)
    indice.js              junta as tabelas de rotas
frontend/
  vite.config.js           proxy /api → :3000; build → ../dist
  src/
    api.js                 o único fetch do app + formatação de datas pt-BR
    estilos.css            os tokens da marca (62) + todo o CSS
    App.jsx                sessão em contexto, rotas, barra lateral
    componentes/Janela.jsx <dialog> + <Campo> (rótulo + instrução)
    telas/                 Inicio, Projeto, Quadro (com Abas), Aprovacoes
verificacao/
  executar.mjs             npm test — porta 3999 e banco descartável
  ajuda.mjs                api(), COMO (pessoas por nome), ok/secao/encerrar
  0*-*.mjs                 as suítes (00 fala direto com o repositório)
```

### As quatro regras de organização

1. **Só `banco.js` e `repositorio.js` conhecem SQL.**
2. **`src/regras/` guarda o que a empresa pode mudar de ideia**, um arquivo por
   regra, com o motivo escrito. Um `if` de negócio espalhado por rotas é sinal
   de que ele pertence a `regras/`.
3. **A API serve decisões prontas, não matéria-prima.** Rótulos
   (`situacao_rotulo`, colunas `{codigo, rotulo}`) e permissões calculadas
   (`pode` na sessão, `pode_excluir` por cartão, `pode_corrigir` na ficha) vão
   no JSON. O frontend que reimplementa regra do servidor está errado por
   definição.
4. **Toda rota que toca projeto passa por `guardas.js`.** `projetoVisivel`
   devolve o projeto só depois de conferir o R19 — quem quer o dado é obrigado
   a passar pela guarda. O mesmo para orientação, atividade e agenda.

---

## 4. Modelo de dados

Nove tabelas, todas em `banco.js`:

| Tabela | Para quê |
|---|---|
| `usuarios` | as 8 pessoas, papel e e-mail. Sem senha (ver §10) |
| `projetos` | a obra e sua ficha: cliente, contrato, prazos, situação, tipo, conjunto, link do Drive, caminho de rede |
| `equipes` | quem trabalha em qual projeto — **a tabela mais importante** (§5) |
| `orientacoes` | a mudança: título, data, descrição, responsável, aval (aprovada/reprovada), edição |
| `avisos` | quem foi avisado de qual orientação e se confirmou (R5+R6 na mesma linha) |
| `atividades` | o quadro: coluna, ordem, responsável, datas, e `orientacao_id` quando nasceu de uma mudança |
| `andamentos` | o "commit": o que fiz, dificuldade, dúvida |
| `agenda` | reunião/visita por pessoa, com quem marcou |
| `flags_cadastro` | a placa ⚑: quem avisou que um campo do cadastro está errado |

`banco.js` também **dropa** as tabelas do modelo antigo (`revisoes`,
`incidentes`, `acessos_versao_antiga`) em bancos criados antes do pivô — os
dados delas não têm para onde migrar, o modelo mudou de forma.

### Invariantes que o código depende

1. **A orientação mais recente do projeto é "a que vale".** Não há campo de
   estado: é `ORDER BY publicada_em DESC LIMIT 1` (`atualDoProjeto`). Não crie
   um campo "atual" — vira duas fontes de verdade.
2. **Publicar é transacional e triplo:** orientação + atividade + avisos, tudo
   ou nada (`orientacoes.publicar`).
3. **Editar reabre a ciência SÓ da equipe atual, renovando o prazo.** O upsert
   em `avisarEquipe` faz `ON CONFLICT DO UPDATE SET enviado_em, confirmado_em
   = NULL`. Ex-membros não são tocados (não teriam como confirmar) e o editor
   não deve ciência do que ele mesmo escreveu.
4. **Aviso é histórico: nunca se apaga.** Quem sai da equipe deixa de LER o
   conteúdo (o EXISTS de `avisos.doUsuario`/`atividades.doResponsavel`
   reconfere a equipe atual), mas a linha fica — é o registro do R6.
5. **Atividade não encosta em orientação ao mover.** Mudar de coluna não gera
   aviso, não muda a orientação, não pede ciência.
6. **Excluir atividade desfaz o vínculo antes** (`UPDATE orientacoes SET
   atividade_id = NULL` na mesma transação) — senão a FK torna o cartão
   inapagável.
7. **Datas do quadro são do sistema** (`datasAoMover`): entrar em execução
   carimba início; finalizar carimba fim; sair de finalizado **apaga** o fim.

---

## 5. `equipes`: uma lista, dois usos

A tabela `equipes` decide **duas coisas ao mesmo tempo**:

- quem **vê** o projeto (`regras/visibilidade.js` + `api/guardas.js`);
- quem é **avisado** quando ele muda (`regras/notificacao.js`).

Com listas separadas, mais cedo ou mais tarde alguém estaria numa e não na
outra — veria o projeto sem ser avisado. É exatamente o buraco que causou o
prejuízo da pavimentação. **Não separe as duas.**

Exceção: coordenação e direção (`aprova: true` em `papeis.js`) veem tudo —
são quem monta as equipes. Está em `veTodosOsProjetos`.

A visibilidade vale **também nas leituras "por usuário"**: `/api/notificacoes`
e `/api/avisos` reconferem a equipe atual no SQL. Isso foi um vazamento real
achado em revisão — quem saía da equipe continuava lendo o conteúdo pelas
notificações.

---

## 6. Papéis e permissões

| Papel | vê | publica/edita orientação | aprova | cadastra projeto/equipe | marca agenda p/ outros |
|---|---|---|---|---|---|
| Engenharia, Arquitetura | só suas obras | ✓ | — | — | — |
| Orçamento, Estágio | só suas obras | — | — | — | — |
| Coordenação, Direção | **tudo** | ✓ | ✓ | ✓ | ✓ |

Duas regras finas:

- **Ninguém aprova a própria orientação** (`porQueNaoPodeAprovar`). Como a
  coordenação publica E aprova, sem isso o aval viraria formalidade.
- **Apagar atividade:** quem criou, ou coordenação/direção
  (`podeExcluirAtividade`). A decisão vai pronta no JSON (`pode_excluir`).

---

## 7. Contrato da API

30 rotas em `/api/*`. Convenções:

- **snake_case do banco direto no JSON** — sem camada de renomeação.
- **Erro sempre `{ erro: "mensagem legível" }`** com o status certo. As
  mensagens já são de tela, em português.
- **Autor uniforme:** toda lista traz `autor_id`/`autor_nome`, além dos campos
  específicos do domínio.
- **Agregação onde a tela precisa:** `GET /api/projetos/:id` devolve a página
  inteira (ficha, orientação atual + ciência, andamentos, equipe, flags,
  `pode_corrigir`) — uma chamada, uma tela.
- **POST/PUT/PATCH com corpo exigem `application/json`** (415 sem isso). POST
  de ação sem corpo é aceito. Junto do cookie `HttpOnly + SameSite=Lax`, é a
  defesa contra CSRF do protótipo.
- Sessão: cookie `usuario_id`. Sem cookie → primeiro usuário do seed (o
  protótipo abre logado de propósito; vira 401 quando o login Google entrar).

---

## 8. Frontend

- **`api.js` é o único lugar que chama `fetch`.** Componente que quer dado
  passa por ele; erro vira `Error` com a mensagem do servidor, pronta para o
  `recado-erro`.
- **`estilos.css` carrega os tokens da marca.** A paleta vem do logotipo
  oficial (preto #201E1F + dourado #A68E71, medidos pixel a pixel da imagem
  `logo promav fundo cinza.png`); a estrutura (raios, espaços, sombras) vem do
  modelo "Promav App". Não invente cor nova — e respeite a regra de contraste
  escrita no cabeçalho do arquivo: **dourado puro nunca é texto em fundo
  claro** (3.1:1); texto dourado usa `--brand-forte`, e texto sobre dourado é
  sempre o preto da marca.
- **`<Campo rotulo instrucao>`** é o padrão de formulário: todo campo do
  sistema explica o que espera. Foi pedido do produto, não estética.
- **A Janela é `<dialog>` nativo** — fecha no ✕, no Esc e no clique fora.
- **O arrastar do quadro usa eventos de ponteiro**, não a API de drag do HTML
  (que não funciona no toque). O limiar de 6px separa clique (abre a janela)
  de arraste (move). Depois de soltar, a tela **sempre** recarrega do servidor
  — certo ou errado, ela espelha o que foi salvo.
- **A lateral recarrega projetos e o contador de aprovações a cada troca de
  rota** — é o mecanismo de atualização do app inteiro; não crie um segundo.
- Grids usam `minmax(0, 1fr)`/`min-width: 0` — sem isso o min-content estoura
  a página em janela estreita (bug clássico; já aconteceu aqui).

---

## 9. Onde mexer para cada tipo de mudança

| Quero… | Mexa em |
|---|---|
| trocar o nome que aparece na tela | `src/config.js` → `NOME_EXIBICAO` |
| mudar quem publica / aprova / cadastra | `src/regras/papeis.js` |
| mudar quem vê qual projeto | `src/regras/visibilidade.js` (+ guardas usam) |
| mudar o prazo de cobrança da ciência | `src/regras/ciencia.js` |
| acrescentar coluna no quadro | `regras/atividades.js` (`COLUNAS`) **e** o `CHECK` de `atividades` em `banco.js` |
| acrescentar situação ou tipo de obra | `src/regras/cadastro.js` (o `CHECK` de projetos não existe — só o vocabulário) |
| acrescentar campo no cadastro do projeto | `banco.js` (coluna) → `repositorio.js` (criar E atualizar) → `api/projetos.js` (`camposDoCadastro`) → `frontend/.../Projeto.jsx` (`JanelaCadastro`) |
| criar rota nova | arquivo da área em `src/api/` + **guarda de visibilidade** |
| criar tela nova | `frontend/src/telas/` + rota no `App.jsx` |
| mudar o texto do futuro e-mail | `src/regras/aviso-email.js` |
| trocar de banco | só `banco.js` e `repositorio.js` |

---

## 10. O que ainda não existe, e por quê

| O quê | Trava |
|---|---|
| **Login de verdade** (conta Google) | precisa do endereço fixo para registrar no Google Cloud → depende da hospedagem. As contas são **Gmail comuns**, não Workspace: a autorização será uma lista de 8 contas mantida à mão |
| **Envio do e-mail de aviso** | modelo e remetente prontos em `aviso-email.js`; o envio depende da hospedagem |
| **Backup automático** | ⚠️ o GitHub não cobre: guarda o código, não `dados/banco.db`. Precisa de cópia periódica para o Drive |
| **Celular/canteiro** | decisão de 13/08: foco no desktop. O layout não quebra, mas nada foi desenhado para o dedo |
| **Medição de retrabalho** | o R11 foi **removido** no pivô — ver o aviso em REQUISITOS-COBERTOS.md |

---

## 11. Armadilhas que já custaram tempo

Todas aconteceram de verdade neste projeto.

**Caminho do Windows com acento quebra `new URL(...).pathname`.** O usuário
desta máquina é `Fábio Ernesto`; o pathname vem percent-encoded e nenhum
`existsSync` acha o arquivo. Use **sempre** `fileURLToPath`.

**`decodeURIComponent` lança em encoding inválido.** Uma URL torta derrubou o
processo inteiro (URIError síncrono no handler). Hoje: try/catch no
`servidor.js` responde 400, e `casar()` decodifica só os `:params`, uma vez.
Não reintroduza um decode "de passagem".

**`npm run recomecar` falha com o servidor rodando** — o SQLite segura o
arquivo no Windows. O script explica em português; pare o servidor antes.

**Cookie não vai em `Invoke-WebRequest -Headers @{Cookie=...}`.** Teste de
sessão em PowerShell dá falso positivo (tudo responde como o usuário padrão).
Use `fetch` do Node com `headers: { cookie }` — é o que `verificacao/ajuda.mjs`
faz.

**Crase dentro de template literal quebra o `banco.js`.** O esquema é uma
template string; um comentário SQL com `` `coluna` `` derruba o arquivo com
erro apontando para a linha errada. Use aspas.

**Upsert de aviso, não INSERT OR IGNORE.** O IGNORE não renova `enviado_em` na
edição — a ciência reaberta nascia "atrasada". Está certo em `avisarEquipe`;
não "simplifique" de volta.

**PATCH parcial é `'campo' in corpo`,** não `corpo.campo ?? null` — senão
campos omitidos são apagados em silêncio.

**Valores de coluna/situação vindos do cliente: validar com 400, nunca cair
num default silencioso.** Um mover sem `situacao` já arrastou cartão para
"Não iniciado" apagando a data de conclusão.

**O working directory do PowerShell persiste entre comandos.** Um `cd frontend`
esquecido faz o próximo `npm test` falhar com "Missing script".

**A API de drag-and-drop do HTML não funciona no toque** — por isso eventos de
ponteiro. Se mexer no quadro: `touch-action: none` no cartão, e o limiar de
distância que separa clique de arraste.

---

## 12. Como verificar que você não quebrou nada

```bash
npm test
```

**177 verificações em 6 suítes**, contra um servidor que o executor sobe em
**porta 3999 com banco descartável** (`dados-verificacao/`) — rodar os testes
nunca toca nos dados da demonstração.

| Suíte | Cobre |
|---|---|
| `00-dominio` | o repositório direto, sem HTTP (marcada `// sem-servidor`) |
| `01-api-sessao-e-notificacoes` | sessão, permissões, CSRF, a URL que matava o servidor |
| `02-api-projetos` | busca, R19 na lista/item/leituras, cadastro, equipe, flags |
| `03-api-orientacoes` | o ato triplo, edição reabrindo ciência, aval sem portão |
| `04-api-atividades` | quadro, datas automáticas, PATCH parcial, FK do excluir |
| `05-api-agenda` | semana, marcar para si/outros, validação de calendário |

Cada bug corrigido em revisão tem uma verificação com o nome do bug — se
alguém reintroduzir, o teste diz qual foi.

**O frontend não tem teste automatizado** (decisão de custo desta fase). A
verificação é manual: `npm run app:build && node servidor.js` e percorrer
início → projeto → atividades → aprovações com dois usuários (Álvaro e
Thayna). O que conferir está no roteiro de [APRESENTACAO.md](APRESENTACAO.md).

### Escrevendo uma verificação nova

Use `verificacao/ajuda.mjs`: `api(metodo, rota, COMO.thayna, corpo)` devolve
`{status, dados}`. O nome do arquivo começa com dois dígitos. Copie do
`01` o padrão de conferir **quem a sessão realmente é** antes de testar — um
cookie que não pega faz tudo passar como o usuário padrão.

---

## 13. Antes de tocar em regra de negócio

1. **Está em `PENDENCIAS.md`?** Muita coisa que parece errada é decisão
   registrada com motivo — inclusive as reversões do pivô.
2. **A mudança cabe num arquivo de `regras/`?** Se não couber, o desenho está
   sendo forçado.
3. **Isso ajuda uma mudança a chegar em quem executa?** Se não, é candidata a
   ficar de fora — e a virar anotação no PENDENCIAS em vez de código.
