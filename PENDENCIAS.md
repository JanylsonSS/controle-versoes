# PENDÊNCIAS

Quatro listas: o que **já foi decidido** (e o que isso muda), os **requisitos
novos** que surgiram dessas decisões, as **decisões que tomei sozinho** e as
**ideias anotadas em vez de construídas**.

Atualizado em 05/08/2026, depois das respostas da direção e da obra.

---

## Parte 1 — Decidido (os itens ⚑ do documento de requisitos)

### ✅ Cadastro de projeto e equipe

**Decidido:** cadastrar projeto é atribuição do coordenador, que também liga a
ele cada colaborador que vai trabalhar nele. **Construído** — ver R19 na Parte 2.

Isso respondeu, de tabela, a dúvida antiga sobre o R5 ("avisar todo mundo vira
ruído?"): agora o aviso vai para a equipe do projeto, e quem não está nela não é
incomodado.

### ✅ R5 — Por onde o aviso chega

**Hoje:** WhatsApp e reunião presencial. **Decidido:** o aviso passa a sair por
**e-mail da Promav, com modelo padrão já dizendo o que a pessoa precisa saber**,
somado à notificação dentro do sistema.

**O que muda:** vira o requisito novo **R18** (abaixo). O protótipo hoje só
notifica dentro do sistema.

### ✅ R6 — Confirmar ciência é obrigatório ✅ feito

**Decidido e construído (06/08/2026):** sem confirmar, a pessoa não abre o
arquivo. Prazo de cobrança: **2 dias**.

**Como ficou, e por quê:** o texto do "o que mudou" fica **sempre visível**; só
o **arquivo** é bloqueado. Se a tela inteira travasse, a pessoa clicaria em
"confirmo" só para passar — e a confirmação viraria aquele "li e aceito os
termos", perdendo justamente o valor que faz dela a resposta ao "eu não fui
avisado". Do jeito que está, para baixar a prancha é obrigatório ter passado
pela tela que diz o que mudou.

O bloqueio vale **por revisão**: quem entrou na equipe depois e nunca foi
avisado não fica travado. A verificação é no servidor, não só escondendo o
botão. Tudo em [`src/regras/ciencia.js`](src/regras/ciencia.js).

**Risco que fica registrado:** confirmar continua sendo um clique. Vale observar
no piloto se as pessoas leem ou se clicam automático — se clicarem automático, o
problema não se resolve com mais trava, e sim com o texto do "o que mudou" ser
melhor escrito.

### 🟡 Prazo entre publicar e virar serviço — em aberto, aguardando dados

**Decidido:** não há prazo fixo, porque as obras têm janelas diferentes. Foi
pedida uma **fórmula** que calcule o prazo mínimo por revisão.

**Proposta de fórmula** (a calibrar):

```
Antecedência mínima = T_ciência + T_reação + T_suprimento + margem
```

| Termo | O que é | De onde vem |
|---|---|---|
| `T_ciência` | tempo até todos confirmarem que viram | **o sistema já mede isso** — usar o percentil 90 dos últimos 3 meses |
| `T_reação` | o maior tempo entre as áreas para absorver a mudança (obra remanejar frente, orçamento refazer preço, contratos formalizar) | precisa vir das áreas |
| `T_suprimento` | prazo de compra/entrega do insumo mais lento afetado; zero se a revisão não mexe em material | precisa vir de suprimentos |
| `margem` | folga de segurança | sugestão: 20% |

**Indicador de acompanhamento:** `folga = início do serviço − confirmação de
ciência`. Folga negativa significa que a informação chegou depois de a obra
começar — é a definição operacional de "candidato a retrabalho".

**Tensão a resolver:** para calcular a folga automaticamente o sistema precisa
saber quando o serviço começa, e isso é cronograma — que a direção pôs **fora de
escopo**. Duas saídas: (a) a obra informa a data prevista só do serviço afetado
pela revisão, sem virar planejamento; ou (b) o sistema mede apenas `T_ciência`,
que é a única parte que ele controla sozinho.

**As 6 perguntas que faltam para fechar a fórmula estão no fim deste documento.**

### ⏸ Custo real da pavimentação — adiado

Fica para depois da apresentação do primeiro protótipo. Até lá, **os R$ 18.400 e
as 24 horas continuam fictícios** e não devem ser mostrados à direção como reais.

### ⏸ Validação com a equipe — adiada para a próxima fase

### ✅ Quem mantém o sistema

Os dois estagiários de Sistemas de Informação (Janylson e Pedro), como teste. Se
o sistema pegar, a empresa investe em equipe de TI própria.

**O que muda:** confirma a recomendação da [AVALIACAO.md](AVALIACAO.md) de
construir sob medida, e reforça a escolha de **zero dependências** — quanto menos
peças, menos coisa para dois estagiários manterem.

### ⏸ Onde hospedar — decidido depois da apresentação

As quatro opções, com vantagens, desvantagens e custo anual, estão em
[HOSPEDAGEM.md](HOSPEDAGEM.md), escritas para apresentar à direção.
Recomendação: serviço de publicação automática (Render/Railway), plano pago.

Três coisas estão **paradas até esta decisão**: o login com Google (R16), o teste
no celular com internet real no canteiro, e o backup automático do banco.

### ✅ Onde ficam os arquivos

Google Drive, em drive compartilhado, cada pessoa com e-mail próprio.

**O que muda:** confirma o desenho híbrido recomendado. O sistema deve guardar o
**link** para o arquivo no Drive, não uma cópia. Backup e disponibilidade dos
arquivos passam a ser do Google. Vira o requisito novo **R20**.

---

## Parte 2 — Requisitos novos (não estavam no documento original)

Estes nasceram das decisões acima e **precisam entrar no documento de
requisitos** para não virarem regra informal.

### R21b — Placa de aviso de cadastro errado ✅ feito

Ao lado de cada campo da ficha há um **⚑**. Quem vir algo errado clica, escreve
opcionalmente o que está errado, e a coordenação recebe o aviso — sem precisar
sair da tela nem saber a quem falar. O campo sinalizado fica destacado, e só a
coordenação encerra o aviso ("já corrigi").

**A placa avisa, não edita.** Quem corrige continua sendo só a coordenação — a
correção passa por quem responde pelo cadastro.

### R16 — Login com a conta Google da Promav ✅ decidido

Fim do seletor "entrar como". Cada pessoa entra com a **conta Google da
Promav**, que já traz o e-mail certo para onde vão os avisos.

**Não construído ainda, e de propósito:** o Google exige registrar um endereço
fixo de retorno (*redirect URI*), e esse endereço só existe depois de escolher
onde hospedar — ver [HOSPEDAGEM.md](HOSPEDAGEM.md). Construir antes seria
refazer depois.

**Não é Google Workspace — são contas Gmail comuns** (`lya.promav@gmail.com`),
do mesmo jeito que o Drive compartilhado hoje: o Matheus dá acesso a e-mails
específicos, e todos abrem pelo explorador de arquivos do Windows.

Consequência para o login: **não dá para restringir por domínio.** Vai ser uma
**lista das 8 contas autorizadas, mantida à mão** — quando alguém sair da
empresa, é preciso tirar da lista, e isso é um passo manual que não pode ser
esquecido. Vale anotar como risco operacional.

**O que vai precisar quando chegar a hora:**
- o Matheus criar as credenciais (Client ID e Secret) no Google Cloud com a
  conta dele;
- a lista das 8 contas autorizadas;
- os e-mails — ✅ já cadastrados no sistema (ver a ressalva do Micael acima).

**Durante a apresentação, o "entrar como" continua** — e é melhor assim: permite
trocar de papel na frente da equipe em um clique, sem depender de internet nem
de conta.

### R17 — Aprovação de alteração grande ✅ feito

**Definição da coordenação (06/08/2026):** grande é a revisão que **muda
orçamento ou muda prazo**. Essa definição substituiu a minha proposta de três
níveis — é melhor, porque mudar quantidade já muda orçamento, e os níveis 2 e 3
caíam no mesmo lugar.

**Como ficou:** uma pergunta só no formulário de publicar — *"esta revisão muda
orçamento ou prazo?"*. Uma pergunta é um clique; três níveis são uma decisão, e
decisão a cada publicação é atrito, que é o que faz a equipe voltar ao WhatsApp
(R13).

Quando a resposta é sim:

1. a revisão entra como **aguardando aprovação** e **não passa a valer**;
2. a versão vigente continua sendo a anterior;
3. **ninguém recebe aviso de ciência ainda** — para a obra nada mudou;
4. a direção ou a coordenação aprova, e só então ela vira vigente e os avisos
   saem;
5. se não aprovar, precisa dizer o porquê, e a revisão fica cancelada com o
   motivo, preservada no histórico (R3).

**Trava importante:** **ninguém aprova a própria revisão**
([`src/regras/aprovacao.js`](src/regras/aprovacao.js)). Como a coordenação
agora também publica, sem essa regra a Thayna poderia publicar uma mudança de
orçamento e aprová-la sozinha. Quando isso acontece, quem aprova é o outro.

**Consequência a vigiar:** se as duas pessoas que aprovam estiverem fora, a
revisão fica parada. É inerente a ter aprovação, mas vale observar no piloto se
trava demais.

**Efeito colateral bom — entrega boa parte do R7:** enquanto espera aprovação, a
revisão já aparece na página do projeto como *"vem mudança por aí"*. Contratos e
Orçamento passam a ver a mudança **antes** de ela valer, que era exatamente o
pedido do R7 — sem construir nada a mais.

### R18 — Aviso por e-mail com modelo padrão 🟡 texto guardado, envio não construído

**Decidido:** o texto do modelo e a conta remetente
(`engenharia.promav@gmail.com`). Guardei os dois em
[`src/regras/aviso-email.js`](src/regras/aviso-email.js), montando o e-mail a
partir da revisão — assim o texto não se perde num documento e, quando o envio
for ligado, não é preciso reescrever nada.

**Falta:** o envio em si. Depende da hospedagem (um sistema que roda no
computador de alguém não manda e-mail de forma confiável) e de decidir como
autenticar na conta do Gmail.

### R21 — Cadastro completo do projeto ✅ feito

**Decidido pela coordenação:** cliente/contratante, número do contrato, data de
início, prazo, situação da obra e tipo de obra. Preenchidos pela coordenação,
que também é quem corrige.

Situação da obra: **em projeto · em execução · concluída · parada**. Obra
concluída ou parada sai da lista principal, mas continua guardada e acessível.
Tipo: **pavimentação · edificação · reforma · outro**. Ambos em
[`src/regras/cadastro.js`](src/regras/cadastro.js).

**Cuidado registrado:** o campo "data de início / prazo" é o que encosta no
escopo excluído (cronograma). Guardar a data como informação descritiva está
ok; vira cronograma no dia em que alguém começar a planejar tarefas contra ela.

### R22 — Conjunto de obras correlatas ✅ feito

Um campo livre com sugestão dos conjuntos já usados, e uma página que lista as
obras daquele conjunto num lugar só (ex.: "Reformas de Escolas 2026").

**Decisão de desenho:** o conjunto **agrupa, mas não manda**. Cada obra continua
com equipe, versão vigente e histórico próprios, e não existe "revisão do
conjunto" — seria um jeito de a obra executar por uma versão que não é a dela.
A lista respeita o R19: só aparecem as obras que a pessoa já enxergaria.

### R23 — Registro de andamento (o "commit") ✅ feito

Qualquer pessoa da equipe registra, na página do projeto: **o que fiz**, **onde
tive dificuldade** e **dúvida que ficou em aberto**. Dúvida em aberto fica
destacada.

**Decisões de desenho, para revisar:**

1. **Não é revisão.** Não numera, não muda qual versão vale, não gera aviso.
   Se cada registro virasse revisão, em um mês o projeto teria trinta e a
   pergunta "qual é a vigente?" ficaria barulhenta — que é o que o sistema
   existe para evitar.
2. **Não gera aviso nem exige ciência.** Aviso é para mudança de versão; se
   todo registro notificasse todo mundo, o aviso perderia o peso. **Revisar:**
   uma *dúvida em aberto* deveria avisar alguém? Hoje ela só fica destacada na
   página do projeto, e depende de alguém entrar para ver.
3. **Quem registra:** qualquer pessoa da equipe, inclusive quem não publica
   revisão — quem mais precisa registrar uma trava costuma ser justamente quem
   não tem a caneta para publicar.

### R25 — Quadro de atividades (kanban) ✅ feito

Pedido posterior da coordenação: acompanhar o que está sendo feito em cada obra,
num quadro de colunas arrastável.

**Colunas:** Não iniciado · Em execução · Revisão · Finalizado. Cada cartão traz
**nome, quem está fazendo e desde quando**; clicar abre uma janela com a
descrição e o resto.

**⚠️ Isto é gestão de tarefas, que o documento original pôs explicitamente fora
de escopo.** Entrou por decisão posterior. Fica registrado para a direção saber
que o escopo foi ampliado — não é uma coisa que apareceu sozinha.

**Decisões de desenho, para revisar:**

1. **Está numa aba própria, não na tela do projeto.** A pergunta "qual versão
   vale?" não pode dividir espaço com um quadro de tarefas, senão o sistema
   deixa de responder rápido aquilo para o que existe. A tela do projeto ganhou
   duas abas: *Projeto e versões* | *Atividades*.
2. **Mover cartão não encosta em versão, aviso nem ciência.** São dois mundos
   separados de propósito, e há verificação automática garantindo isso.
3. **As datas são do sistema, não digitadas.** Entrou em execução, marca o
   início; chegou em finalizado, marca o fim; saiu de finalizado, apaga o fim —
   senão a data mentiria. Ninguém digita data, que é o campo que mais fica errado.
4. **Quem mexe:** qualquer pessoa da equipe do projeto. Restringir faria o quadro
   ficar desatualizado, e quadro desatualizado é pior que quadro nenhum.
   **Apagar** é só de quem criou, ou da coordenação.
5. **Arrastar funciona no dedo e no mouse** (eventos de ponteiro, sem
   biblioteca). Quem não puder arrastar muda a coluna pelo seletor na janela de
   detalhes — e a página inteira funciona sem JavaScript, só sem o arraste.

**⚑ Sobreposição a resolver: quadro × registro de andamento.** Agora existem
duas formas de dizer o que se está fazendo — o "commit" (R23) e o cartão do
quadro. A equipe vai perguntar *"onde eu registro?"*. Duas saídas possíveis:
amarrar o andamento a uma atividade, ou aposentar um dos dois. **Vale decidir no
piloto**, olhando qual dos dois as pessoas realmente usam.

### R20 — Arquivos no Google Drive 🟡 link e caminho feitos, migração não

O projeto tem **dois jeitos de chegar na pasta**, porque nenhum serve nos dois
lugares:

- **Link do Drive** — abre no navegador. É o que funciona no celular, no canteiro.
- **Caminho no computador** (`G:\Drives compartilhados\PROMAV\...`) — para quem
  está no escritório e abre pelo explorador de arquivos.

**Por que o caminho não é clicável:** navegador nenhum abre `file:///G:/...` a
partir de uma página web. É trava de segurança do Chrome, do Edge e do Firefox,
e não tem como contornar pelo sistema. O que dá para fazer bem é entregar o
caminho pronto: um botão copia, a pessoa cola na barra do Explorer. Se o
navegador bloquear até a cópia — acontece no endereço de rede
`http://192.168…`, que não é considerado seguro —, o texto fica selecionado e o
botão avisa para usar Ctrl+C.

**⚑ Um risco a confirmar:** a letra do drive (`G:`) é definida por máquina pelo
aplicativo do Google Drive. Se na máquina de alguém ele montar como `H:`, o
caminho cadastrado não serve para essa pessoa. Vale conferir com os estagiários
de TI se está igual em todas as máquinas — e, se não estiver, padronizar.

O upload de arquivo por revisão continua funcionando — os três convivem.

Migrar de vez (o sistema deixar de guardar arquivo e passar a apontar só para o
Drive) continua sendo decisão de produção: economiza backup, mas exige colar um
link a cada publicação, que é mais um passo e mais uma chance de esquecer.

### R19 — Cada pessoa vê apenas o que lhe diz respeito ✅ feito

**Decidido e construído:** a coordenação cadastra o projeto e marca quem trabalha
nele. O recorte é **por projeto**, não por área.

Essa mesma lista tem **dois usos**: define quem *vê* o projeto e quem é *avisado*
quando ele muda. Foi de propósito — com duas listas separadas, mais cedo ou mais
tarde alguém enxergaria um projeto sem receber aviso dele, que é exatamente o
buraco que custou a pavimentação.

O bloqueio é verificado no servidor em todas as telas, inclusive no download do
arquivo — não é só esconder o link.

**Duas decisões minhas dentro disso, para você revisar:**

1. **Coordenação e direção enxergam todos os projetos.** A coordenação porque é
   quem monta as equipes (não teria como cadastrar um projeto que ela mesma não
   vê); a direção porque responde pela empresa. Se a intenção for que nem o CEO
   veja tudo, a troca é numa linha de
   [`src/regras/visibilidade.js`](src/regras/visibilidade.js).
2. **A direção também pode cadastrar projeto**, não só a coordenação. Se ficar
   só com a Thayna, o sistema para quando ela estiver de férias.

### R20 — Arquivos no Google Drive

O sistema guarda o link do arquivo no drive compartilhado, não uma cópia.

---

## Parte 3 — Decisões que tomei por conta própria

### 1. Cancelar a versão vigente é permitido, e deixa o projeto sem versão que valha

O projeto passa a exibir, em vermelho: *"sem versão vigente — não execute nem
orce"*. **Por quê:** o caso real existe (sai uma revisão errada e é preciso
mandar parar antes de a certa ficar pronta), e um vazio declarado é mais seguro
do que a versão errada continuar valendo.

### 2. Papéis dos estagiários

**TI (Janylson e Pedro): ✅ decidido** — não entram como usuários. Dão suporte de
manutenção ao sistema (servidor, banco, código) e não participam dos projetos,
então não recebem aviso de revisão nem ocupam linha na lista de ciência. O papel
"TI" foi removido do código.

**Rafaela (Estágio — Arquitetura): precisa da sua confirmação.** Está como quem
**consulta e recebe aviso, mas não publica revisão** — na dúvida, restringi,
porque publicar é o ato que define o que a obra executa. Ela precisa publicar
revisão no dia a dia?

### 3. Quem publica revisão

Engenharia, arquitetura, **coordenação e direção**. A coordenação entrou a
pedido dela (publica andamento e também revisão técnica em mudança grande); a
direção entrou pelo mesmo motivo do cadastro — não travar nas férias.

**Revisar:** o CEO publicar revisão técnica é útil ou é só permissão sobrando?
Se for sobrando, tirar de `DIRECAO` em
[`src/regras/papeis.js`](src/regras/papeis.js) — a trava de "ninguém aprova a
própria" continua funcionando de qualquer forma.

### 4. O texto "o que mudou" é escrito à mão

O sistema não compara arquivos; mostra o que o projetista escreveu.
**Risco a vigiar no piloto:** se escreverem "revisão geral", o aviso perde o
valor — e aí o problema é de desenho, não de treinamento.

### 5. O arquivo em si não diz se ainda vale

Os PDFs trazem de propósito: *"Este arquivo não diz se a revisão ainda vale.
Quem diz isso é o sistema."* **Por quê:** carimbar "VIGENTE" no arquivo cria uma
mentira que envelhece junto com a cópia baixada ou impressa.

### 6. O histórico dos dados de teste é fictício, com nomes reais

Quem publicou o quê, quem confirmou e quando foi montado por mim para a
demonstração. Em particular, **Álvaro e Luiza aparecem como "ainda não
confirmaram" a R03** — é o que faz a demonstração funcionar, mas são nomes
reais. Se achar que pega mal na apresentação, dá para trocar o cenário para não
deixar ninguém nominalmente na posição de quem não viu.

### 7. Rafaela está cadastrada só com o primeiro nome

Faltou o sobrenome. Corrigir em
[`src/persistencia/seed.js`](src/persistencia/seed.js).

### 8. O nome exibido é provisório

Está em `NOME_EXIBICAO`, em [`src/config.js`](src/config.js), e em nenhum outro
lugar.

---

## Parte 4 — Perguntas abertas

### Para fechar a fórmula do prazo

1. Depois de saber de uma mudança, quanto tempo a obra leva para remanejar
   frente, equipe e material? (horas ou dias)
2. Quanto o Micael leva para refazer o preço de um trecho? E a Thayna para
   formalizar um aditivo?
3. Qual o prazo de entrega do insumo mais lento que vocês costumam usar?
4. Qual a **menor** janela já vista entre "decidiu-se mudar" e "a frente
   começou"? É o pior caso que a fórmula precisa cobrir.
5. A obra consegue informar a data prevista de início do serviço afetado? (sem
   isso, a folga não é calculável automaticamente)
6. Os três níveis de impacto propostos batem com a realidade de vocês?

### ⚑ A conta de e-mail do Micael está com o nome errado

O nome é **Micael Machado**; a conta criada é `micaias.promav@gmail.com`.
Guardei o endereço **que existe de verdade**, senão o aviso não chega em
ninguém. Se a conta for recriada como `micael.promav@gmail.com`, trocar em
[`src/persistencia/seed.js`](src/persistencia/seed.js) — está comentado lá.

### Para fechar os requisitos novos

7. ~~**Login:** conta Google ou senha própria?~~ ✅ decidido: conta Google da Promav.
8. ~~**Ciência obrigatória:** o que acontece com quem não confirma?~~ ✅ trava o
   arquivo; cobrança a partir de 2 dias. Feito.
9. ~~**R19:** por projeto ou por área?~~ ✅ decidido e construído: por projeto,
   com a equipe montada pela coordenação. Resta confirmar as duas decisões
   minhas descritas no R19 acima.
10. ~~**R18:** texto do modelo e conta remetente?~~ ✅ respondido e guardado no
    código. Falta só o envio.
11. ~~**E-mails** das 8 pessoas?~~ ✅ recebidos — pendente a dúvida **A**
    (Micaias/Micael) e a **B** (são contas Gmail, não Workspace).

### Ainda sem resposta, do documento original

12. **A obra tem sinal e aparelho no canteiro?** Se não houver sinal, a
    conferência de versão precisa funcionar sem internet — e isso é outro
    sistema.

---

## Parte 5 — Ideias anotadas, não construídas

- **Painel para a direção** com evolução de revisões e retrabalho no tempo
  (completa o R12). Sem valor antes de haver histórico real de uso.
- **Carimbo automático nos arquivos** com projeto, revisão e data (ver decisão 5).
- **Exportar o histórico de ciência em PDF**, para anexar a medição ou contrato.
  Ninguém pediu; pode ser útil à Coordenação de contratos.
