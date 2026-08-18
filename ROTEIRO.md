# Roteiro — entenda o sistema passo a passo

> Um tour do Promav que **qualquer pessoa consegue fazer sozinha**, tela por
> tela. Cada bloco tem três partes: **Faça** (o que clicar), **O que você
> está vendo** (o que aquilo significa) e **Por que é assim** (a decisão por
> trás — nada aqui é acidente). As perguntas **P1–P22** continuam no caminho:
> anote as respostas na folha do fim enquanto avança.
>
> Caminho completo: ~45 min. Caminho curto: blocos 1, 2, 4, 5 e 9 (~20 min).

---

## Antes de começar (10 minutos)

1. Com o servidor parado: `npm run recomecar` — recria os dados de
   demonstração do zero (um backup de despedida sai sozinho antes).
2. `node servidor.js` (ou dois cliques no `iniciar.bat`).
3. Abra **http://localhost:3000** — deve entrar como **Álvaro Abrantes**.
4. Confira: 2 notificações de mudança, 1 compromisso marcado pela Thayna,
   1 atividade. Se não bater, o seed não recriou — repita o passo 1.

**Duas coisas para saber antes:** os nomes são os da equipe de verdade, mas
**a história é inventada** — foi montada para a demonstração. E o sistema
inteiro serve a uma frase: **nenhuma mudança de projeto pode se perder no
caminho até quem executa**. Foi o que faltou na pavimentação da Praça do
Ginásio, e é o critério de tudo o que você vai ver.

### Quem ser em cada bloco

O seletor **"Você está como"**, no rodapé da barra lateral, troca de pessoa
(é coisa do protótipo — morre quando o login com conta Google entrar).

| Blocos | Entre como |
|---|---|
| 1–5 | **Álvaro Abrantes** (Engenharia — é onde a dor aparece) |
| 6–7 | **Thayna Weydne** (Coordenação) |
| 8 | **Matheus Grangeiro** (Direção — o seletor pede confirmação: papéis que aprovam avisam antes) |
| 9–10 | tanto faz |

---

## Bloco 1 — A tela inicial

**Como:** Álvaro

**Faça:** só olhe a tela como ela abre, sem clicar. Depois digite "ubs" na
busca de projetos; limpe.

**O que você está vendo:** sem nenhum clique, o Álvaro já sabe o dia dele —
duas mudanças que ele ainda não confirmou, uma reunião que marcaram para
ele, uma atividade no nome dele. Embaixo, as obras dele (só as dele), cada
uma com a mudança mais recente, e a agenda da semana.

**Por que é assim:** a tela inicial é a resposta à pergunta "o que eu preciso
saber hoje?" — as notificações vêm ANTES de tudo porque o sistema existe
para informação não se perder, e informação perdida começa em tela que
esconde aviso. A pessoa só vê as próprias obras (regra R19): menos ruído, e
ninguém abre projeto que não lhe diz respeito. A busca é por nome/código
porque é assim que a equipe se refere às obras.

**P1.** A tela inicial mostra o que vocês procuram ao chegar de manhã? Falta
algo?

---

## Bloco 2 — O caso da pavimentação, no modelo novo

**Como:** Álvaro

**Faça:** clique em **Pavimentação — Praça do Ginásio**. Leia as
"Informações atuais do projeto". Depois clique em **"Confirmo que vi esta
mudança"** e veja o chip do Álvaro ficar verde (a data e a hora da
confirmação ficam guardadas — aparecem ao passar o mouse no chip).

**O que você está vendo:** "Remoção da calçada no trecho leste" — a mudança
que causou o retrabalho de verdade. Título, data, o que fazer, **quem faz
(a Lya)** e, quando houver, **de onde veio** o pedido. Embaixo, a ciência:
quem já viu, e os chips vermelhos de quem não viu — **o Álvaro e a Luiza. A
engenharia. Quem executava.** O buraco que custou o serviço, visível numa
linha.

**Por que é assim:** o sistema NÃO guarda arquivos nem versões numeradas —
isso foi o modelo antigo, abandonado em 13/08/2026, quando a coordenação
definiu que **a mudança não é um arquivo, é uma orientação**: uma instrução
endereçada a quem executa. E confirmar **não bloqueia nada** de propósito:
a primeira versão travava o trabalho até a pessoa confirmar, e a decisão
foi revertida — travar atrasa sem proteger (não há mais arquivo para
trancar). O que resolve o "eu não fui avisado" é o registro público de quem
viu e quando, não o cadeado.

**P2.** A ciência assim — registro visível, sem bloquear — resolve o "não
fui avisado", ou precisa cobrar mais forte?
**P3.** O prazo de destaque (quando o chip fica vermelho) está em 2 dias.
Bate com o ritmo de vocês?

---

## Bloco 3 — Histórico para comparar

**Como:** Álvaro, ainda na Pavimentação

**Faça:** abra o dropdown **"Histórico do projeto"** e escolha "Revisão das
cotas de greide". O painel abre logo abaixo, marcado **"orientação antiga —
não é a que vale"**.

**O que você está vendo:** as mudanças anteriores, guardadas para
comparação. O caso clássico: o cliente pede em reunião algo que já foi
diferente — aqui se mostra o que valia antes e o que vale agora.

**Por que é assim:** não existe numeração (R00, R01…) nem campo "vigente" —
**a orientação mais recente é a que vale**, sempre. Um campo de "status" a
mais seria uma segunda fonte de verdade para dessincronizar; a ordem
cronológica não mente. E a antiga abre sempre com o selo de antiga, para
ninguém executar informação velha por engano — que é literalmente a
história da pavimentação.

**P4.** Comparar assim resolve a conversa com o cliente, ou falta ver duas
lado a lado?

---

## Bloco 4 — Publicar uma mudança (o coração do sistema)

**Como:** Álvaro (engenharia também publica)

**Faça:** clique em **Publicar mudança**. Preencha: título "Rampa de
acessibilidade na esquina sul", data de hoje, uma descrição, **De onde
veio** (ex.: "pedido do cliente na reunião de hoje"), responsável
**Luiza**. Publique. Depois abra a aba **Atividades** — o cartão novo está
lá, "vem de uma mudança do projeto", no nome da Luiza. Troque para
**Luiza** no seletor: a notificação e a atividade estão com ela.

**O que você está vendo:** publicar fez três coisas num ato só — gravou a
mudança, **criou a atividade no quadro no nome da Luiza** e avisou a equipe
inteira.

**Por que é assim:** o ato é triplo e indivisível porque "esquecer de
avisar" é exatamente a falha que o sistema existe para eliminar — se avisar
fosse um passo separado, um dia alguém pularia. O responsável precisa estar
na equipe da obra (senão a atividade nasceria para alguém que nem enxerga o
projeto). O campo "De onde veio" é opcional para não virar burocracia, mas
responde o "eu não pedi isso" meses depois. E a pergunta de orçamento/prazo
é UMA caixa, não uma classificação em níveis: cada nível a mais é uma
decisão a mais por publicação, e atrito é o que devolve a equipe ao
WhatsApp.

**P5.** O formulário pede o suficiente? Sobra ou falta campo?
**P6.** A atividade nascer sozinha, já no nome da pessoa — é o fluxo de
vocês?

---

## Bloco 5 — O quadro e o andamento

**Como:** Álvaro (ou Luiza)

**Faça:** na aba **Atividades**, arraste um cartão para "Em execução" — a
data de início aparece sozinha. Clique num cartão: a janela de detalhes
abre (a coluna também muda por ali). Depois, de volta à aba Projeto,
registre um **Andamento**: "conferi o greide do trecho oeste", com uma
dúvida em aberto.

**O que você está vendo:** o quadro de atividades (Não iniciado → Em
execução → Revisão → Finalizado) e o diário de andamento do projeto.

**Por que é assim:** as datas de início e fim **ninguém digita** — entram e
saem quando o cartão muda de coluna, porque data digitada é o campo que
mais mente. Mover um cartão não gera aviso nem pede ciência: o quadro
acompanha o TRABALHO; a informação do projeto mora nas orientações — são
camadas separadas de propósito. E "Revisão" aqui é conferir o serviço
feito, não a revisão de arquivo do modelo antigo.

**P7.** Quadro e andamento dizem coisas parecidas ("estou fazendo").
**Vocês usariam os dois, ou um engole o outro?**
**P8.** A dúvida em aberto deveria avisar alguém, ou basta ficar destacada
na página?

---

## Bloco 6 — Agenda: marcar e ser marcado

**Como:** **Thayna** (troque no seletor) — mas note: qualquer papel faria o
mesmo.

**Faça:** no Início, clique num dia do calendário. No campo **"Quem
participa"**, você já está na primeira barra; escolha alguém na barra
vazia — **outra barra igual aparece embaixo** para o próximo; a barra vazia
encerra. Marque uma visita técnica para você e o **Álvaro**. Depois troque
para o Álvaro: o compromisso está no calendário dele e nas notificações,
"marcada por Thayna Weydne". Agora troque para o **Álvaro** e marque uma
reunião só com a **Luiza**: troque para a Thayna e veja que o compromisso
**apareceu no calendário dela também**, com a nota "você foi incluído(a)
automaticamente, para a coordenação ficar ciente".

**O que você está vendo:** a agenda da semana, com compromissos de vários
participantes — e a regra de transparência da coordenação em ação.

**Por que é assim:** a regra original era "só coordenação marca para os
outros" — a equipe pediu a troca em 17/08: **todos marcam**, para quantos
participarem (uma linha no calendário de cada um, dizendo quem marcou). O
controle virou transparência em vez de portão: **ninguém marca nada pelas
costas da coordenação** — se ela não estiver no compromisso, é incluída
automaticamente, só para ciência. E cada campo do formulário tem uma
instrução embaixo, porque tela que precisa de treinamento é tela errada.

**P9.** Reunião e visita técnica bastam, ou falta um terceiro tipo?
**P10.** ~~Quem mais precisaria marcar para os outros?~~ **Respondida em
17/08: todos marcam — e a coordenação é incluída automaticamente quando não
participa.** Confirme com a equipe se a regra agradou.

---

## Bloco 7 — O que a coordenação controla

**Como:** Thayna

**Faça:** na Pavimentação, olhe a **ficha**: corrigir cadastro, mudar
equipe, o caminho `G:\` com o botão Copiar. Troque para o Álvaro e clique
na placa **⚑** ao lado de um campo (avisar que está errado); volte como
Thayna, veja o aviso e clique "Já corrigi". Depois abra a **Reforma da
Escola Municipal Norte** e clique no valor do campo **Conjunto** — a página
das obras correlatas abre.

**O que você está vendo:** a ficha completa da obra (cliente, contrato,
prazos, situação, tipo, conjunto, Drive), quem pode corrigi-la, e o
conjunto de obras num lugar só.

**Por que é assim:** **a equipe é uma lista com dois usos** — quem está
nela vê a obra E é avisado quando ela muda; quem sai para de ver, inclusive
nas notificações. Uma lista só, para ser impossível alguém enxergar um
projeto e não ser avisado. Só coordenação/direção corrigem o cadastro; o
resto da equipe usa a placa ⚑ — sinaliza o erro sem poder introduzir um. O
caminho `G:\` tem botão Copiar porque navegador não abre pasta de rede por
link (limitação de segurança do próprio navegador); copiar e colar no
Explorer é o caminho que funciona. E os arquivos ficam no Drive porque **o
sistema não guarda arquivo nenhum** — ele guarda a informação e aponta onde
o arquivo mora.

**P11.** Falta campo na ficha? (Filtro: quem preenche, quem consulta, o que
acontece se envelhecer errado.)
**P12.** A letra do Drive é `G:` em **todas** as máquinas? *(o caminho
cadastrado depende disso)*

---

## Bloco 8 — O aval e os indicadores da direção

**Como:** **Matheus** (o seletor pede confirmação — papéis que aprovam
avisam antes de assumir)

**Faça:** abra **Aprovações** (badge 1) — o porcelanato da Câmara está na
fila. Abra o projeto: a mudança **já é a atual** e a atividade já corre.
Registre o aval; note que negar exige motivo. Depois abra **Indicadores**:
tempo médio até a ciência, pendências por obra e por pessoa, a fila de
aval, o quadro.

**O que você está vendo:** o "de acordo" da direção em mudanças de custo e
prazo — e o painel de números do sistema.

**Por que é assim:** o aval é **registro, não portão** — decisão de
13/08: antes, a mudança ficava parada esperando assinatura e ninguém era
avisado; agora ela vale na hora e o aval corre em paralelo. O que a direção
ganha é o registro de quem concordou e quando — e **ninguém aprova a
própria mudança** (a coordenação também publica; sem essa trava, o aval
viraria formalidade). Os Indicadores existem porque a medição de retrabalho
saiu do sistema no pivô: em vez de medir quanto o erro custou, o painel
mede **o que evita o erro** — quanto tempo a informação leva para chegar e
o que está parado. Tudo calculado sobre o que o sistema já grava, desde o
primeiro dia.

**P13.** Aval sem segurar o trabalho — confortável para a direção, ou
alguma mudança deveria esperar mesmo?
**P14.** Só Matheus e Thayna aprovam (e ninguém aprova a própria mudança).
Se os dois estiverem fora — ou um for o autor — o aval espera. Aceitável?

---

## Bloco 9 — O que o sistema NÃO faz (obrigatório ler)

Honestidade primeiro — cada limite tem um porquê:

- **Não tem senha.** O seletor é do protótipo; o login com conta Google
  está decidido, mas o Google exige um endereço fixo na internet — que só
  existe depois da decisão de hospedagem. Enquanto isso, toda troca de
  pessoa fica registrada (quem era, quem virou, de onde), mas registrar não
  é impedir: **ciência e aval valem como fluxo, não como prova**, até o
  login chegar.
- **O aviso não sai por e-mail ainda.** O texto do e-mail está pronto no
  código; o canal de envio espera a hospedagem. Hoje o aviso só existe
  dentro do sistema — quem não abre, não fica sabendo.
- **Roda numa máquina só.** O backup local é automático (a cada 6 horas,
  mais uma cópia de despedida antes de qualquer "recomeçar"), mas ainda não
  sai do disco — o destino no Drive ou a hospedagem fecham isso.
- **Celular ficou para depois** — decisão de 13/08, foco no desktop do
  escritório. O custo disso é real: quem está no canteiro só confirma
  ciência quando volta.
- **O registro de retrabalho saiu** — a medição de "quanto custou executar
  errado" não existe mais (era o modelo antigo). O painel de Indicadores é
  o candidato a substituto.

**P15.** ⚠️ **A pergunta para a direção:** as metas do trimestre eram
medidas pelo retrabalho. Sem essa medição, as metas mudam, ou ela volta de
outra forma? *(Mostre a tela Indicadores e pergunte se esses números
servem.)*
**P16.** Da lista do que falta, o que é mais urgente?
**P17.** O que ficou faltando que eu nem mencionei? *(deixe o silêncio
durar)*

---

## Bloco 10 — Com a direção: hospedagem e o número real

**Faça:** abra o [HOSPEDAGEM.md](HOSPEDAGEM.md) e percorra as quatro
opções.

**Por que essa decisão importa tanto:** ela destrava as três maiores
pendências de uma vez — o login (o Google exige endereço fixo), o e-mail de
aviso e o destino do backup fora do disco. É a única decisão sem a qual o
sistema não sai do computador de uma pessoa.

**P18.** Qual das quatro opções? (Recomendação: PaaS pago, ~R$ 40/mês —
menos manutenção, que é nosso ponto fraco. O deploy já está pronto para
isso: o serviço compila e sobe sozinho a partir do repositório.)
**P19.** **Quanto custou de verdade a pavimentação?** (R$ e dias. O sistema
não guarda mais esse número — ver P15; o dado serve à direção para decidir
se a medição volta.)
**P20.** Matheus consegue criar as credenciais do login no Google Cloud?
**P21.** Sobrenome da Rafaela para o cadastro.
**P22.** A conta do Micael fica `micaias.promav@gmail.com` ou recriam?

---

## Folha de respostas

| # | Bloco | Pergunta | Resposta |
|---|---|---|---|
| P1 | 1 | A tela inicial mostra o que procuram de manhã? | |
| P2 | 2 | Ciência sem bloquear resolve o "não fui avisado"? | |
| P3 | 2 | 2 dias de prazo de destaque bate? | |
| P4 | 3 | Comparar pelo dropdown basta? | |
| P5 | 4 | O formulário de publicar pede o suficiente? | |
| P6 | 4 | Atividade nascer sozinha é o fluxo de vocês? | |
| P7 | 5 | **Quadro e andamento: os dois, ou um engole o outro?** | |
| P8 | 5 | Dúvida em aberto deveria avisar alguém? | |
| P9 | 6 | Reunião e visita bastam como tipos? | |
| P10 | 6 | ~~Quem mais marca?~~ Respondida: todos — a regra agradou? | |
| P11 | 7 | Falta campo na ficha? | |
| P12 | 7 | **O Drive é `G:` em todas as máquinas?** | |
| P13 | 8 | Aval sem segurar o trabalho é confortável? | |
| P14 | 8 | Só dois aprovadores — aceitável? | |
| P15 | 9 | ⚠️ **As metas sem a medição de retrabalho: os Indicadores servem?** | |
| P16 | 9 | O que é mais urgente do que falta? | |
| P17 | 9 | **O que ficou faltando que eu nem mencionei?** | |
| P18 | 10 | Qual hospedagem? | |
| P19 | 10 | **Custo real da pavimentação (R$ e dias)** — o sistema não guarda mais; ver P15 | |
| P20 | 10 | Matheus cria as credenciais no Google Cloud? | |
| P21 | 10 | Sobrenome da Rafaela | |
| P22 | 10 | Conta do Micael: fica ou recriam? | |

**Fórmula do prazo mínimo** (conversas individuais, fora da reunião):
quanto tempo a obra leva para absorver uma mudança (Álvaro/Luiza) · refazer
um preço (Micael) · formalizar aditivo (Thayna) · prazo do insumo mais
lento · menor janela já vista entre "decidiu" e "executou" · dá para
informar a data prevista do serviço afetado?

---

## Se der problema na hora

| Problema | O que fazer |
|---|---|
| A tela não abre | A janela do `node servidor.js` fechou — suba de novo (ou `iniciar.bat`) |
| "o aplicativo ainda não foi compilado" | `npm run app:build` e recarregue |
| `npm run recomecar` reclama | O servidor está rodando — pare com Ctrl+C antes |
| Publicou/marcou errado demonstrando | Pare o servidor, `npm run recomecar`, suba de novo: volta ao início em segundos |
| Pedirem algo fora de escopo | "Anoto e levo para a direção" — não prometa |
