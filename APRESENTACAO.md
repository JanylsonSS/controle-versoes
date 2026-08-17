# Roteiro da apresentação

> Tour do Promav em React, tela por tela. Cada bloco: **mostrar** (o que
> clicar), **dizer** (a ideia) e as perguntas **P1–P22**, na mesma ordem da
> folha do fim — é preencher enquanto avança.
>
> **Duração: 35–45 min.** Caminho curto (20 min): blocos 1, 2, 4, 5 e 9.

---

## Antes de começar (10 minutos, sozinho)

1. Com o servidor parado: `npm run recomecar`
2. `npm run app:build` (se mexeu no frontend) e `node servidor.js`
3. Abra **http://localhost:3000** — deve entrar como **Álvaro Abrantes**
4. Confira: 2 notificações de mudança, 1 compromisso marcado pela Thayna,
   1 atividade; se não bater, o seed não recriou — repita o passo 1
5. Feche outras janelas; a demonstração é no projetor, janela maximizada

**Levar:** a folha de respostas impressa e o [HOSPEDAGEM.md](HOSPEDAGEM.md)
aberto para o bloco 10.

### Quem ser em cada bloco

| Blocos | Entre como |
|---|---|
| 1–5 | **Álvaro Abrantes** (Engenharia — é onde a dor aparece) |
| 6–7 | **Thayna Weydne** (Coordenação) |
| 8 | **Matheus Grangeiro** (Direção) |
| 9–10 | tanto faz |

---

## Abertura (2 min)

> "Isto é um protótipo para vocês dizerem 'é isso' ou 'faltou X'. Duas coisas:
> os nomes são de vocês, mas **a história é inventada** — montei para a
> demonstração. E o sistema faz uma coisa central: **nenhuma mudança de
> projeto pode se perder no caminho até quem executa**. Foi o que faltou na
> pavimentação da Praça do Ginásio."

---

## Bloco 1 — A tela inicial

**Como:** Álvaro

**Mostrar:** a tela como abre, sem clicar.

> "Sem clicar em nada, o Álvaro já sabe: duas mudanças que ele ainda não
> confirmou, uma reunião que a Thayna marcou para ele, uma atividade no nome
> dele. Embaixo, as obras dele — só as dele — com a mudança mais recente de
> cada uma. E a agenda da semana."

**Mostrar:** digitar "ubs" na busca; limpar.

**P1.** A tela inicial mostra o que vocês procuram ao chegar de manhã? Falta
algo?

---

## Bloco 2 — O caso da pavimentação, no modelo novo

**Como:** Álvaro · clicar em **Pavimentação — Praça do Ginásio**

**Mostrar:** as Informações atuais.

> "'Remoção da calçada no trecho leste' — a mudança que causou o retrabalho de
> verdade. Título, data, o que fazer, e **quem faz: a Lya**. Embaixo, a
> ciência: três viram, e os chips vermelhos mostram quem não viu — **o Álvaro
> e a Luiza. A engenharia. Quem executava.** É o buraco que custou o serviço,
> visível numa linha."

**Mostrar:** o botão "Confirmo que vi esta mudança" — clicar. O chip do
Álvaro fica verde — a data e a hora ficam guardadas (aparecem ao passar o
mouse no chip; não conte com o tooltip no projetor).

> "Um clique, e ficou registrado quando ele soube. Não trava nada — a pessoa
> trabalha; o que existe é o registro que acaba com o 'eu não fui avisado'."

**P2.** A ciência assim — registro visível, sem bloquear — resolve o "não fui
avisado", ou precisa cobrar mais forte?
**P3.** O prazo de destaque está em 2 dias. Bate com o ritmo de vocês?

---

## Bloco 3 — Histórico para comparar

**Como:** Álvaro, ainda na Pavimentação

**Mostrar:** o dropdown "Histórico do projeto" → escolher "Revisão das cotas
de greide". O painel abre marcado **"orientação antiga — não é a que vale"**.

> "As mudanças anteriores ficam guardadas para comparar — o caso clássico é o
> cliente pedir em reunião algo que já foi diferente. A antiga abre logo
> abaixo, sempre marcada como antiga."

**P4.** Comparar assim resolve a conversa com o cliente, ou falta ver duas
lado a lado?

---

## Bloco 4 — Publicar uma mudança (o coração)

**Como:** Álvaro (engenharia também publica) · botão **Publicar mudança**

**Mostrar:** a janela — título, data, descrição, **quem vai fazer**, e a
pergunta de orçamento/prazo. Publicar algo real, ex.: título "Rampa de
acessibilidade na esquina sul", responsável **Luiza**.

> "Publicar faz três coisas de uma vez: grava a mudança, **cria a atividade no
> quadro no nome da Luiza**, e avisa a equipe. Não existe 'esquecer de
> avisar' — é um ato só."

**Mostrar:** a aba **Atividades** — o cartão novo está lá, "vem de uma mudança
do projeto", no nome da Luiza. Trocar para **Luiza** no seletor: a notificação
e a atividade estão com ela.

**P5.** O formulário pede o suficiente? Sobra ou falta campo?
**P6.** A atividade nascer sozinha, já no nome da pessoa — é o fluxo de vocês?

---

## Bloco 5 — O quadro e o andamento

**Como:** Álvaro (ou Luiza) · aba **Atividades**

**Mostrar:** arrastar um cartão para "Em execução" (a data de início aparece
sozinha); clicar num cartão (a janela de detalhes; a coluna também muda por
aqui).

> "As datas de início e fim ninguém digita — entram e saem quando o cartão
> muda de coluna. Data digitada é o campo que mais mente."

**Mostrar:** de volta à aba Projeto, o **Andamento** — registrar "conferi o
greide do trecho oeste" com uma dúvida em aberto.

**P7.** Quadro e andamento dizem coisas parecidas ("estou fazendo"). **Vocês
usariam os dois, ou um engole o outro?**
**P8.** A dúvida em aberto deveria avisar alguém, ou basta ficar destacada na
página?

---

## Bloco 6 — Agenda: marcar e ser marcado

**Como:** **Thayna** (trocar no seletor)

**Mostrar:** no Início, clicar num dia do calendário. A janela tem instrução
em cada campo e — porque é a Thayna — o campo **"Para quem"**. Marcar uma
visita técnica para o **Álvaro**. Trocar para o Álvaro: o compromisso está no
calendário dele e nas notificações, "marcada por Thayna Weydne".

> "Cada um marca para si; coordenação e direção marcam para qualquer
> pessoa, e cai direto na agenda dela, dizendo quem marcou."

**P9.** Reunião e visita técnica bastam, ou falta um terceiro tipo?
**P10.** Quem mais, além de coordenação e direção, precisaria marcar para os
outros?

---

## Bloco 7 — O que a coordenação controla

**Como:** Thayna

**Mostrar:** na Pavimentação, a **ficha** — corrigir cadastro, mudar equipe, o
caminho `G:\` com Copiar, e a placa **⚑** (como Álvaro, sinalizar um campo;
como Thayna, ver o aviso e "Já corrigi").

> "A equipe daqui decide duas coisas de uma vez: quem vê a obra e quem é
> avisado quando ela muda. Quem sai da equipe para de ver — inclusive nas
> notificações."

**P11.** Falta campo na ficha? (Filtro: quem preenche, quem consulta, o que
acontece se envelhecer errado.)
**P12.** A letra do Drive é `G:` em **todas** as máquinas? *(o caminho
cadastrado depende disso)*

---

## Bloco 8 — O aval de orçamento e prazo

**Como:** **Matheus**

**Mostrar:** o menu **Aprovações** (badge 1) — o porcelanato da Câmara está
na fila. Abrir o projeto: a mudança **já é a atual** e a atividade já corre.
Registrar o aval; mostrar que negar exige motivo.

> "O aval não segura o trabalho — decisão do pivô. O que ele garante é o
> registro: quem deu o de acordo numa mudança de custo ou prazo, e quando. E
> ninguém aprova a própria mudança."

**P13.** Aval sem segurar o trabalho — confortável para a direção, ou alguma
mudança deveria esperar mesmo?
**P14.** Se Matheus e Thayna estiverem fora, o aval espera. Aceitável?

---

## Bloco 9 — O que o sistema NÃO faz (obrigatório)

> "Para ser honesto: **não tem senha** — o seletor é do protótipo; o login
> Google espera a hospedagem (toda troca fica registrada, mas registrar não é
> impedir). **O aviso não sai por e-mail ainda** — o texto está pronto, falta
> o canal. **Roda no meu computador** — o backup local é automático, a cada
> 6 horas, mas ainda não sai desta máquina: o destino no Drive ou a
> hospedagem resolvem isso. **Celular ficou para depois** — decisão nossa,
> foco no escritório. E **o registro de retrabalho saiu do sistema** —
> aquela medição de 'quanto custou executar errado' não existe mais."

**P15.** ⚠️ **A pergunta para a direção:** as metas do trimestre eram medidas
pelo retrabalho. Sem essa medição no sistema, as metas mudam, ou ela volta de
outra forma?
**P16.** Da lista do que falta, o que é mais urgente?
**P17.** O que ficou faltando que eu nem mencionei? *(deixe o silêncio durar)*

---

## Bloco 10 — Com a direção: hospedagem e o número real

**Mostrar:** [HOSPEDAGEM.md](HOSPEDAGEM.md).

**P18.** Qual das quatro opções? (Recomendação: PaaS pago, ~R$ 40/mês — menos
manutenção, que é nosso ponto fraco. O deploy agora inclui o build do
frontend, que o PaaS faz sozinho.)
**P19.** **Quanto custou de verdade a pavimentação?** (R$ e dias. O sistema
não guarda mais esse número — a medição de retrabalho saiu no pivô, ver P15;
o dado serve à direção para decidir se ela volta.)
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
| P10 | 6 | Quem mais marca para os outros? | |
| P11 | 7 | Falta campo na ficha? | |
| P12 | 7 | **O Drive é `G:` em todas as máquinas?** | |
| P13 | 8 | Aval sem segurar o trabalho é confortável? | |
| P14 | 8 | Só dois aprovadores — aceitável? | |
| P15 | 9 | ⚠️ **As metas sem a medição de retrabalho: e agora?** | |
| P16 | 9 | O que é mais urgente do que falta? | |
| P17 | 9 | **O que ficou faltando que eu nem mencionei?** | |
| P18 | 10 | Qual hospedagem? | |
| P19 | 10 | **Custo real da pavimentação (R$ e dias)** — o sistema não guarda mais; ver P15 | |
| P20 | 10 | Matheus cria as credenciais no Google Cloud? | |
| P21 | 10 | Sobrenome da Rafaela | |
| P22 | 10 | Conta do Micael: fica ou recriam? | |

**Fórmula do prazo mínimo** (conversas individuais, fora da reunião):
quanto tempo a obra leva para absorver uma mudança (Álvaro/Luiza) · refazer um
preço (Micael) · formalizar aditivo (Thayna) · prazo do insumo mais lento ·
menor janela já vista entre "decidiu" e "executou" · dá para informar a data
prevista do serviço afetado?

---

## Se der problema na hora

| Problema | O que fazer |
|---|---|
| A tela não abre | A janela do `node servidor.js` fechou — suba de novo (ou `iniciar.bat`) |
| "o aplicativo ainda não foi compilado" | `npm run app:build` e recarregue |
| `npm run recomecar` reclama | O servidor está rodando — pare com Ctrl+C antes |
| Publiquei/marquei errado demonstrando | Pare o servidor, `npm run recomecar`, suba de novo: volta ao início em segundos |
| Pedirem algo fora de escopo | "Anoto e levo para a direção" — não prometa |
