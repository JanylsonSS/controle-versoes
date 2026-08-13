# Roteiro da apresentação

> Tour completo do que o sistema faz, tela por tela.
>
> Cada bloco tem três partes: **mostrar** (o que clicar), **dizer** (a ideia em
> uma frase) e as **perguntas**, numeradas de **P1 a P34** em sequência. A folha
> do fim tem os mesmos números, na mesma ordem — é só ir preenchendo conforme
> avança, sem procurar nada.
>
> **Duração: 60 a 75 minutos** com tudo. Há um caminho curto de 25 minutos.

---

## Antes de começar (10 minutos, sozinho)

1. Recomece do zero, para os dados estarem limpos. **Pare o servidor antes**
   (Ctrl+C na janela dele): `npm run recomecar`
2. Suba o sistema: **dois cliques em `iniciar.bat`** (ou `node servidor.js` no
   terminal, aberto dentro da pasta do projeto).
3. Anote os endereços que o terminal imprime. Ele lista **um para este
   computador** (`localhost`) e, separadamente, **o do celular** — sob o título
   *"No celular (mesma rede Wi-Fi)"*. Se aparecerem outros embaixo de *"Ignore
   estes"*, ignore mesmo: são de VPN ou máquina virtual e o celular não alcança.
4. **Teste o celular antes**, na mesma rede Wi-Fi. Se não abrir, o bloco 15 cai.
   Os três motivos, na ordem: **VPN ligada** no computador (desligue — muitas
   bloqueiam a rede local), **firewall do Windows** barrando o Node, ou o celular
   estar noutra rede. O README tem o passo a passo.
5. Tenha **um PDF qualquer** no computador — o bloco 8 pede para anexar.
6. Deixe aberta a tela inicial, entrado como **Álvaro Abrantes**.

**Levar:** a folha de respostas impressa e o [HOSPEDAGEM.md](HOSPEDAGEM.md)
aberto para o bloco 17.

### Quem ser em cada bloco

O seletor no topo troca de pessoa em um clique. É por ele que os papéis são
demonstrados — no protótipo não há senha.

| Blocos | Entre como | Por quê |
|---|---|---|
| 1 a 7 | **Álvaro Abrantes** (Engenharia) | é onde a dor aparece: obra, versão errada, retrabalho |
| 8 e 9 | **Lya Melo** (Arquitetura) → **Matheus** | quem publica, e quem aprova |
| 10 | **Micael Machado** (Orçamento) | quem só consulta |
| 11 a 13 | **Thayna Weydne** (Coordenação) | quem cadastra obra e monta equipe |
| 14 a 17 | qualquer um | retrabalho, celular, limites, direção |

### Se o tempo apertar

**Caminho curto (25 min):** blocos 1, 2, 3, 5, 8, 9, 16. É a história da
pavimentação de ponta a ponta, mais a aprovação e a lista honesta do que falta.

**Primeiros a cortar:** 13 (conjunto), 12 (ficha e placa), 7 (andamento).

---

## Abertura (2 minutos)

> "Isto é um protótipo. Serve para vocês olharem e dizerem 'é isso' ou 'faltou
> X'. Não está pronto, e várias coisas de propósito ainda não fazem nada — eu
> vou apontar cada uma no fim.
>
> Duas coisas antes de começar. Primeira: os nomes de vocês estão aqui, mas
> **toda a história é inventada** — quem publicou o quê, quem confirmou e
> quando. Eu montei para a demonstração. Se aparecer que alguém não confirmou
> alguma coisa, é cenário, não é registro do que aconteceu.
>
> Segunda: o sistema tem **um objetivo só** — que ninguém trabalhe, orce ou
> execute sobre uma versão que não é a que vale. Tudo o mais que ele faz existe
> para servir a isso."

---

# Parte 1 — O caso da pavimentação

## Bloco 1 — A tela inicial

**Como:** Álvaro · **Requisitos:** R1, R2, R8, R19

### Mostrar
A tela inicial, sem clicar em nada.

### Dizer
> "Não cliquei em lugar nenhum. Os projetos do Álvaro estão aqui, e em cada um já
> está escrito qual versão vale hoje: R03 na pavimentação, R01 na UBS. Não tem
> pasta para abrir, não tem que perguntar para ninguém.
>
> Lá em cima: 'duas versões novas desde a última vez' — e o aviso de que, enquanto
> ele não confirmar, o arquivo dessas revisões fica bloqueado.
>
> E repara: aparecem **dois** projetos, não os quatro da empresa. São as obras do
> Álvaro. Quem define isso é a coordenação, e eu mostro na parte 3."

### Perguntar
**P1.** Isso é o que vocês procuram hoje quando precisam saber qual desenho vale?
Falta alguma informação nesse cartão?

---

## Bloco 2 — A versão que vale, quem viu, e o que custou

**Como:** Álvaro · **Requisitos:** R2, R6, R11

### Mostrar
Clicar em **Pavimentação — Praça do Ginásio**. Ficar no topo.

### Dizer
> "'Execute por esta: R03 — removida a calçada no trecho leste, entre as estacas
> 15 e 19.' Verde, número grande, frase em português de obra. Embaixo, quem
> publicou e quando."

### Mostrar
Rolar: **"Quem já viu esta versão — 3 de 5 confirmaram"**.

### Dizer
> "O sistema não só avisou: ele registra **quem confirmou que viu, com dia e
> hora**. Três confirmaram. Os dois que faltam são o Álvaro e a Luiza — a
> engenharia. A informação saiu, mas não chegou em quem ia executar."

### Mostrar
Rolar até **Retrabalho por versão errada**: R$ 18.400 e 24 horas.

### Dizer
> "E aqui está a consequência, na mesma tela: o trecho executado com a calçada
> que a R03 mandava remover, demolido e refeito.
>
> A tela conta a história inteira sozinha. Hoje essas três informações estão em
> três lugares diferentes, e ninguém junta."

### Perguntar
**P2.** Os R$ 18.400 e as 24 horas são inventados por mim. **Quanto foi de
verdade, em material e em dias?** *(É o número que fecha a linha de base das
metas — vale insistir para sair da reunião com ele.)*

**P3.** O texto "o que mudou" está claro o suficiente para quem está no canteiro
decidir o que fazer? O que vocês escreveriam aí?

---

## Bloco 3 — Confirmar ciência, e por que o arquivo está trancado

**Como:** Álvaro · **Requisito:** R6

### Mostrar
Onde ficaria o botão de abrir o arquivo, está escrito: **"Arquivo bloqueado até
você confirmar que viu esta mudança."**

### Dizer
> "Vocês decidiram que confirmar é obrigatório. Ficou assim: **o texto do que
> mudou está aí, visível — só o arquivo está trancado**.
>
> Essa separação é de propósito. Se a tela inteira travasse, a pessoa clicaria em
> 'confirmo' só para passar, e a confirmação viraria aquele 'li e aceito os
> termos'. Do jeito que está, para baixar a prancha é obrigatório ter passado
> pela tela que diz o que mudou."

### Mostrar
Clicar em **"Confirmo que vi a R03"**. Passa a **4 de 5**, com nome, data e hora
— e o botão de abrir o arquivo aparece.

### Perguntar
**P4.** Trancar o arquivo é forte na medida certa, ou vai irritar? *(Se irritar,
o risco real é a pessoa pedir o arquivo por WhatsApp — que é o que estamos
tentando acabar.)*

**P5.** O prazo de cobrança está em 2 dias, como vocês disseram. Bate com a
realidade de uma obra em andamento?

---

## Bloco 4 — Onde está o arquivo

**Como:** Álvaro · **Requisito:** R20

### Mostrar
Os dois caminhos: o botão **Abrir a pasta no Drive** e o campo **Pasta no
computador do escritório**, com o botão **Copiar**.

### Dizer
> "Duas maneiras de chegar na pasta, porque nenhuma serve nos dois lugares.
>
> O botão do Drive abre no navegador — é o que funciona no celular, no canteiro.
> O campo de baixo é o caminho de vocês, `G:\\Drives compartilhados\\PROMAV\\...`.
> Clica em Copiar e cola na barra do explorador de arquivos.
>
> Uma coisa que eu não consigo resolver: **nenhum navegador abre uma pasta do
> computador direto de uma página web**. É trava de segurança do Chrome, do Edge
> e do Firefox. Por isso é copiar e colar, e não um clique só."

### Perguntar
**P6.** Copiar e colar resolve, ou atrapalha o suficiente para vocês não usarem?

**P7.** A letra do drive é `G:` em **todas** as máquinas? *(O aplicativo do Google
Drive escolhe a letra por computador. Se na de alguém for `H:`, o caminho
cadastrado não serve para essa pessoa. Vale o Janylson e o Pedro conferirem.)*

---

## Bloco 5 — Histórico: a versão antiga e a cancelada

**Como:** Álvaro · **Requisitos:** R3, R8, R4

### Mostrar
Rolar até **Histórico de versões** (R02, R01, R00) e clicar na **R02**.

### Dizer
> "Primeiro: nada se perde. As versões antigas continuam aqui, com quem publicou
> e quando.
>
> Mas olha o que acontece quando eu abro a R02: antes de qualquer outra coisa, a
> tela avisa — **'esta não é a versão que vale hoje. A que vale é a R03'** — e me
> dá o caminho de volta. E mais: 'este acesso ficou registrado'. Lá embaixo
> aparece quem abriu esta versão antiga e quando.
>
> Para chegar aqui eu tive que rolar e clicar. Achar a versão certa é o caminho
> fácil; achar a errada dá trabalho. Isso é de propósito."

### Mostrar
Voltar e abrir a **R00**: faixa vermelha, "não use", o motivo — "base topográfica
errada" — e quem cancelou. No histórico ela aparece riscada.

### Perguntar
**P8.** Esse aviso é forte o suficiente? Com pressa, no canteiro, ainda daria
para confundir?

**P9.** Com que frequência uma revisão é cancelada na prática de vocês?

---

# Parte 2 — O trabalho do dia a dia

## Bloco 6 — O quadro de atividades

**Como:** Álvaro · **Aba:** Atividades

> Este é o bloco mais novo. Vale reservar tempo — e é o que mais gera opinião.

### Mostrar
No alto da tela do projeto há duas abas: **Projeto e versões** | **Atividades**.
Clicar em **Atividades**.

### Dizer
> "Este é o quadro que a coordenação pediu. Quatro colunas: não iniciado, em
> execução, revisão e finalizado. Cada cartão diz **o que é, quem está fazendo e
> desde quando**.
>
> Repara que ele está numa aba separada, e não junto com as versões. Foi de
> propósito: a pergunta 'qual versão vale?' não pode dividir espaço com um quadro
> de tarefas, senão a tela deixa de responder rápido aquilo para o que existe."

### Mostrar
Arrastar **"Compatibilizar drenagem com a nova seção"** de *Não iniciado* para
*Em execução*. As contagens mudam sozinhas.

### Dizer
> "Arrasta com o mouse e arrasta com o dedo — vou mostrar no celular daqui a
> pouco. E quem preferir não arrastar muda a coluna pelo seletor dentro do
> cartão."

### Mostrar
Clicar no nome de um cartão. Abre a janela: descrição, quem está fazendo,
iniciada em, criada por, e o formulário de edição.

### Dizer
> "A descrição fica aqui dentro, não no cartão. Cartão cheio de texto deixa de
> ser legível de relance, que é a única vantagem de um quadro.
>
> E uma coisa que o sistema faz sozinho: **a data de início não é digitada por
> ninguém**. Quando o cartão entra em 'em execução', ele marca a data. Quando
> chega em 'finalizado', marca o fim. Se voltar de finalizado, apaga o fim —
> senão a data mentiria."

### Mostrar
Voltar à aba **Projeto e versões** e mostrar que a versão vigente continua a R03.

### Dizer
> "Mover cartão **não** muda versão, não dispara aviso e não pede ciência. São
> dois mundos separados de propósito."

### Perguntar
**P10.** Vocês usariam este quadro, ou é mais uma coisa para manter atualizada?
*(Quadro desatualizado é pior que quadro nenhum — ele passa a mentir.)*

**P11.** Quem cria as atividades: cada um as suas, ou a coordenação distribui?

**P12.** As quatro colunas bastam, ou falta alguma etapa do jeito de vocês
trabalhar?

**P13.** Hoje qualquer pessoa da equipe move qualquer cartão. Está certo, ou só
quem é responsável pelo cartão deveria mover?

---

## Bloco 7 — Registro de andamento (o "commit")

**Como:** Álvaro · **Aba:** Projeto e versões · **Requisito:** R23

### Mostrar
Voltar à aba do projeto, seção **Andamento do trabalho**. Mostrar o registro da
Lya, com a **dúvida em aberto** destacada em âmbar.

### Dizer
> "Antes do quadro, vocês tinham pedido isto: cada um registra o que fez, onde
> teve dificuldade e que dúvida ficou. A dúvida em aberto fica destacada."

### Perguntar

> ⚠️ **Este é o ponto mais importante da reunião para mim.** Agora existem
> **duas** formas de dizer o que se está fazendo: o cartão do quadro e este
> registro. A equipe vai perguntar "onde eu escrevo?". Precisamos sair daqui com
> uma resposta.

**P14.** Vendo os dois lado a lado: **você usaria os dois, ou só um?** Qual?

**P15.** Se for para ficar um só, o que não pode se perder do outro?

**P16.** A dúvida em aberto deveria **avisar** alguém? Hoje ela só fica destacada
na tela, e depende de alguém entrar para ver. *(Se a ideia é desbloquear as
pessoas mais rápido, ficar parada na tela pode não bastar.)*

---

## Bloco 8 — Publicar uma revisão

**Como:** Lya Melo · **Requisitos:** R3, R5, R9

### Mostrar
Trocar para **Lya Melo**, aba do projeto, **Publicar nova revisão**. Antes de
enviar, mostrar o bloco *"Quem será avisado quando esta revisão passar a valer"*.

### Dizer
> "Três campos e uma pergunta. E olha antes de eu apertar o botão: o sistema já
> me diz **quem vai ser avisado** — a equipe do projeto, aquela que a Thayna
> montou. Eu não escolho, não marco caixinha, não posso esquecer.
>
> Isso é o coração da coisa. Hoje, avisar a obra é tarefa de alguém — e tarefa de
> alguém, um dia, não acontece. Aqui o aviso é consequência de publicar."

### Mostrar
Publicar a **R04** *(ex.: "Acrescentada rampa de acessibilidade na esquina
sul.")*, **sem marcar** a pergunta do orçamento.

> ⚠️ **Anexe um arquivo** — o PDF que você separou. Sem arquivo anexado não há o
> que bloquear, e a parte mais importante da demonstração não aparece.

Depois voltar para **Álvaro**: o aviso está lá, e o arquivo da R04 aparece
bloqueado até ele confirmar.

### Perguntar
**P17.** O aviso também vai sair por e-mail, com o modelo que vocês passaram,
saindo de `engenharia.promav@gmail.com`. **O texto está bom?** Falta algo que a
pessoa precise saber sem abrir o sistema?

---

## Bloco 9 — Alteração grande: a aprovação

**Como:** Lya, depois Matheus · **Requisito:** R17

### Mostrar
Como **Lya**, publicar outra revisão — agora **marcando** *"Sim — muda orçamento
ou prazo"*.

### Dizer
> "Vocês definiram que alteração grande é a que **muda orçamento ou muda prazo**.
> Virou uma pergunta só, em vez de três níveis — uma pergunta é um clique; três
> níveis são uma decisão, e decisão a cada publicação é atrito."

### Mostrar
Voltar ao projeto: bloco roxo **"Vem mudança por aí — R05 esperando aprovação"**.
A versão vigente continua sendo a anterior.

### Dizer
> "Três coisas. Um: ela **não passou a valer**. Dois: **ninguém foi avisado**,
> porque para a obra nada mudou. Três: ela já **aparece** para a equipe.
>
> Essa terceira é de graça e responde a um pedido antigo — o Micael e a Thayna
> disseram que a informação chega tarde. Agora dá para ver que vem mudança
> **antes** de ela valer."

### Mostrar
Trocar para **Matheus**: no menu apareceu **Aprovações** com contador. Abrir.
Estão lá a **R02 da Câmara** (que já vem esperando nos dados) e a que a Lya
acabou de publicar. Aprovar a da Câmara. Trocar para **Micael** e mostrar que
**só agora** o aviso chegou.

### Dizer
> "Aprovou: aí sim vira a versão vigente e os avisos saem. Não aprovar exige
> escrever o motivo, e a revisão fica no histórico como cancelada, com o porquê.
>
> E uma regra que precisei acrescentar: **ninguém aprova a própria revisão**. Se
> a Thayna publicar uma mudança de orçamento, quem aprova é o Matheus, e
> vice-versa. Sem isso, a aprovação vira formalidade."

### Perguntar
**P18.** Se os dois estiverem fora, a revisão fica parada. É aceitável, ou precisa
de um terceiro que possa aprovar?

**P19.** "Muda orçamento ou prazo" é claro o bastante para quem publica responder
sem pensar muito, ou vai gerar dúvida caso a caso?

**P20.** Enquanto espera aprovação, alguém deveria ser avisado de que tem coisa na
fila? Hoje só aparece o contador no menu de quem aprova.

---

## Bloco 10 — Papéis: quem pode o quê

**Como:** Micael Machado · **Requisito:** R9

### Mostrar
Ir a um projeto. Não existe "Publicar nova revisão", nem "Aprovações" no menu,
nem "Corrigir o cadastro". *(Se quiser provar que não é só o botão escondido,
digite o endereço de publicação direto — o sistema recusa.)*

### Dizer
> "Quem projeta publica: engenharia e arquitetura. A coordenação e a direção
> também publicam, como vocês pediram, e são as duas que aprovam. Quem orça e
> quem está de estágio consulta e recebe. E não é só o botão sumir — o sistema
> recusa mesmo se a pessoa tentar por fora."

### Perguntar
**P21.** O CEO publicar revisão técnica é útil, ou é permissão sobrando? *(Coloquei
pelo mesmo motivo do cadastro — não travar nas férias da Thayna.)*

**P22.** A Rafaela só consulta. Está certo?

---

# Parte 3 — O que a coordenação controla

## Bloco 11 — Cadastrar projeto e definir a equipe

**Como:** Thayna Weydne · **Requisitos:** R1, R19, R21

### Mostrar
Ao trocar para a Thayna aparecem **os quatro projetos**, não dois — e surge o
botão **Cadastrar projeto**. Clicar.

### Dizer
> "Quem cadastra obra é a coordenação, e a direção junto, para o sistema não
> parar nas férias de ninguém. Além do código e do nome, tem tudo o que vocês
> pediram: cliente, contrato, início, prazo, situação e tipo. E os dois caminhos
> da pasta."

### Mostrar
Rolar até **Quem trabalha neste projeto**.

### Dizer
> "Esta lista não é detalhe de configuração. Ela decide duas coisas ao mesmo
> tempo: **quem enxerga o projeto** e **quem recebe aviso quando ele muda**. Uma
> lista só, dois usos — de propósito. Se fossem duas listas, uma hora alguém
> estaria numa e não na outra: enxergaria o projeto e não seria avisado. Que é
> exatamente o buraco que custou a pavimentação."

### Mostrar
Cadastrar uma obra de mentira ao vivo, marcando só duas ou três pessoas
presentes. Trocar para alguém **não marcado**: não aparece. Para alguém marcado:
aparece.

### Perguntar
**P23.** Quem monta a equipe na prática, e o quadro muda no meio da obra?

**P24.** Falta algum campo no cadastro? *(Antes de responder, o filtro: quem
preencheria, quem consultaria, e o que muda se estiver desatualizado. Campo que
envelhece sem ninguém perceber vira mentira dentro da fonte única da verdade.)*

---

## Bloco 12 — A ficha e a placa de aviso

**Como:** Álvaro, depois Thayna · **Requisito:** R21

### Mostrar
Na seção **Ficha do projeto**, o **⚑** ao lado de cada campo. Como **Álvaro**,
clicar no ⚑ do campo Contrato e mandar um aviso. Trocar para **Thayna** e mostrar
o aviso na tela dela, com o botão **Já corrigi**.

### Dizer
> "Quem vir algo errado clica no ⚑ do campo, escreve o que está errado, e a
> coordenação recebe — sem sair da tela nem saber a quem falar. A placa **avisa,
> não edita**: quem corrige continua sendo só a coordenação."

### Perguntar
**P25.** A coordenação precisa ser avisada de outro jeito — e-mail, por exemplo —,
ou ver na tela do projeto basta?

---

## Bloco 13 — Conjunto de obras correlatas

**Como:** Thayna Weydne · **Requisito:** R22

### Mostrar
Abrir a **Reforma da Escola Municipal Norte**; no topo, o link para **Reformas de
Escolas 2026**. Clicar. Depois, na tela inicial, o link **"Mostrar também 1 obra
concluída"**.

### Dizer
> "Obras parecidas ficam num lugar só — aqui estão as duas reformas de escola,
> cada uma com a sua versão vigente. O conjunto **agrupa, mas não manda**: cada
> obra mantém equipe, versão e histórico próprios. Não existe 'revisão do
> conjunto' — seria um jeito de a obra executar por uma versão que não é a dela.
>
> E obra concluída sai da lista principal sem ser apagada."

### Perguntar
**P26.** O agrupamento certo é por conjunto de obras, ou vocês juntariam por outra
coisa — cliente, contrato, bairro?

---

# Parte 4 — Medir, canteiro e limites

## Bloco 14 — Retrabalho por versão errada

**Como:** Matheus · **Requisito:** R11

### Mostrar
Menu **Retrabalho**: 1 caso, R$ 18.400, 24 h. Abrir **Registrar um caso**.

### Dizer
> "Este é o número que a direção vai olhar daqui a três meses. Cada vez que um
> serviço foi executado, orçado ou refeito sobre a versão errada, entra aqui.
> Sem isso não dá para provar que o sistema funcionou."

### Perguntar
**P27.** Quantos casos assim vocês lembram no último ano? *(Mesmo por alto — é a
linha de base.)*

**P28.** Quem deveria registrar? Hoje qualquer pessoa da equipe pode.

---

## Bloco 15 — No celular, no canteiro

**Requisito:** R10

### Mostrar
Abrir `192.168.x.x:3000` no celular. Refazer o bloco 2 (ver a R03, confirmar
ciência), abrir a pasta no Drive, e **arrastar um cartão no quadro com o dedo**.

### Dizer
> "A mesma coisa no telefone, inclusive o quadro. Porque o erro da pavimentação
> não aconteceu no escritório — aconteceu no campo, na hora de executar."

### Perguntar
**P29.** Tem sinal de internet no canteiro? *(Se não tiver, a conferência precisa
funcionar sem internet — e isso é outro sistema, bem mais caro.)*

**P30.** O celular é de quem — da empresa ou pessoal?

**P31.** Vocês usariam isso no canteiro, de verdade, antes de começar um serviço?

---

## Bloco 16 — O que ainda NÃO faz

> Bloco obrigatório. Demonstração que só mostra o que funciona cria expectativa
> errada e cobra a conta depois.

### Dizer
> "Para ser honesto sobre o que vocês estão vendo:
>
> - **Não tem senha.** O seletor de nome existe só para demonstrar os papéis. O
>   login com a conta Google está decidido, mas depende de escolher onde
>   hospedar.
> - **O aviso ainda não sai por e-mail.** O texto e o remetente já estão no
>   sistema; falta ligar o envio, que também depende da hospedagem.
> - **Roda no meu computador.** Não está na internet e não tem backup automático.
>   E aviso desde já: **o GitHub não resolve isso** — ele guarda o código, não o
>   banco nem os arquivos. O backup precisa ser cópia diária para o Drive.
> - **Os arquivos ainda ficam dentro do sistema.** O link e o caminho da pasta já
>   existem; migrar de vez para o Drive é decisão de produção.
> - **Revisão que ainda está sendo desenhada o sistema não enxerga** — só depois
>   de publicada. A aprovação cobriu parte disso, não tudo."

### Perguntar
**P32.** Dessa lista, o que é mais urgente para vocês?

**P33.** E o que ficou faltando que eu nem mencionei? *(Melhor pergunta da
reunião. Deixe o silêncio durar.)*

---

## Bloco 17 — Com a direção: onde hospedar

**Só se o Matheus estiver presente.** Abrir o [HOSPEDAGEM.md](HOSPEDAGEM.md).

### Dizer
> "Para o sistema sair do meu computador e virar ferramenta, ele precisa de um
> lugar na internet. São quatro caminhos, de R$ 0 a uns R$ 700 por ano. A
> recomendação é o serviço de publicação automática, plano pago — uns R$ 40 por
> mês — porque é o que menos exige de manutenção, e manutenção é o nosso ponto
> fraco.
>
> Para dar dimensão: custa por ano menos do que um único retrabalho por versão
> errada."

### Perguntar
**P34.** Qual das quatro opções? E o Matheus consegue criar as credenciais do
login no Google Cloud? *(Como as contas são Gmail comuns e não Workspace, não dá
para liberar por domínio: vai ser uma lista das 8 contas, mantida à mão.)*

---

## Folha de respostas

Mesma ordem do roteiro. Vá preenchendo conforme avança.

| # | Bloco | Pergunta | Resposta |
|---|---|---|---|
| P1 | 1 | A tela inicial mostra o que vocês procuram? Falta algo no cartão? | |
| P2 | 2 | **Custo real da pavimentação (R$ e dias)** | |
| P3 | 2 | O texto "o que mudou" está claro? O que escreveriam? | |
| P4 | 3 | Trancar o arquivo é forte na medida, ou vai irritar? | |
| P5 | 3 | 2 dias de prazo bate com a realidade? | |
| P6 | 4 | Copiar e colar o caminho resolve? | |
| P7 | 4 | **A letra do drive é `G:` em todas as máquinas?** | |
| P8 | 5 | O aviso de versão antiga é forte o suficiente? | |
| P9 | 5 | Com que frequência uma revisão é cancelada? | |
| P10 | 6 | Usariam o quadro, ou é mais uma coisa para manter? | |
| P11 | 6 | Quem cria as atividades: cada um, ou a coordenação? | |
| P12 | 6 | As quatro colunas bastam? | |
| P13 | 6 | Qualquer um move qualquer cartão, ou só o responsável? | |
| P14 | 7 | **Quadro e "commit": usariam os dois, ou só um? Qual?** | |
| P15 | 7 | Se ficar um só, o que não pode se perder do outro? | |
| P16 | 7 | Dúvida em aberto deveria avisar alguém? | |
| P17 | 8 | O texto do e-mail está bom? Falta algo? | |
| P18 | 9 | Se os dois aprovadores estiverem fora, pode travar? | |
| P19 | 9 | "Muda orçamento ou prazo" é claro para quem publica? | |
| P20 | 9 | Alguém deveria ser avisado da fila de aprovação? | |
| P21 | 10 | CEO publicar revisão técnica é útil ou sobra? | |
| P22 | 10 | Rafaela só consulta — confirma? | |
| P23 | 11 | Quem monta a equipe, e muda no meio da obra? | |
| P24 | 11 | Falta algum campo no cadastro? | |
| P25 | 12 | A coordenação precisa de aviso fora da tela? | |
| P26 | 13 | Agrupar por conjunto, ou por outra coisa? | |
| P27 | 14 | Quantos casos de retrabalho no último ano? | |
| P28 | 14 | Quem deveria registrar retrabalho? | |
| P29 | 15 | Tem sinal no canteiro? | |
| P30 | 15 | O celular é de quem? | |
| P31 | 15 | Usariam no canteiro de verdade? | |
| P32 | 16 | O que é mais urgente da lista do que falta? | |
| P33 | 16 | **O que ficou faltando que eu nem mencionei?** | |
| P34 | 17 | Qual hospedagem? Matheus cria as credenciais? | |

### Pendências que não são perguntas de reunião

Anotar se surgir, mas não gastar tempo da sala:

- **Sobrenome da Rafaela** — falta no cadastro.
- **E-mail do Micael** — a conta existe como `micaias.promav@gmail.com`, mas o
  nome é Micael. Confirmar se recriam a conta ou fica assim.

### Para a fórmula do prazo mínimo

Perguntar depois, individualmente — não rende em reunião:

| # | Pergunta | Para quem |
|---|---|---|
| F1 | Quanto tempo a obra leva para remanejar frente, equipe e material? | Álvaro / Luiza |
| F2 | Quanto leva para refazer o preço de um trecho? | Micael |
| F3 | Quanto leva para formalizar um aditivo? | Thayna |
| F4 | Prazo de entrega do insumo mais lento que vocês usam | suprimentos |
| F5 | Menor janela já vista entre "decidiu mudar" e "a frente começou" | obra |
| F6 | Dá para informar a data prevista de início do serviço afetado? | obra |

---

## Se der problema na hora

| Problema | O que fazer |
|---|---|
| A tela não abre | Confirme que a janela preta do servidor está aberta. Se fechou, dê dois cliques no `iniciar.bat`. |
| "O Node.js instalado é antigo demais" | Instale a versão LTS de nodejs.org e **feche e reabra** a janela. |
| "A porta 3000 já está ocupada" | O sistema já está rodando em outra janela — use aquela. |
| `npm run recomecar` dá erro | O sistema está rodando e segurando o banco. Pare o servidor (Ctrl+C) e rode de novo. |
| O celular não abre | Nesta ordem: (1) usou o endereço que aparece sob **"No celular"**, e não um dos de "Ignore estes"? (2) tem **VPN ligada** no computador? desligue. (3) o **firewall** do Windows liberou o Node? (4) é a mesma Wi-Fi — não a de visitante, nem 4G? |
| O cartão não arrasta | Toque e segure um instante antes de mover. Se não for, use o seletor de coluna dentro da janela do cartão. |
| O botão "Copiar" diz "Aperte Ctrl+C" | Normal fora do `localhost`: o navegador bloqueia a cópia automática em página sem HTTPS. O texto já está selecionado. |
| Publiquei, aprovei ou movi errado | Pare o servidor, rode `npm run recomecar` e suba de novo. Volta tudo ao começo em dois segundos. |
| Alguém pede algo fora de escopo | Anote e diga: "isso está fora do que a direção definiu, mas eu registro". Não prometa. |
