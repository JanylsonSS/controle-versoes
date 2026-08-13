# REQUISITOS COBERTOS

Cada requisito do documento `Requisitos-Controle-de-Versao.docx` e o que foi
feito nesta rodada. Serve para conferir na validação: "isto aqui já faz, isto
ainda não".

**Resumo:** os 7 Essenciais estão feitos. Dos 5 Importantes, **4 feitos** — o R7
saiu de tabela junto com a aprovação — e 1 não (R14, que depende de hospedagem).
Dos 3 Desejáveis, 1 feito, 1 parcial e 1 não. Dos requisitos novos pedidos
depois do documento, **6 feitos, 2 parciais e 1 não** (o login, que espera a
decisão de hospedagem).

---

## Essenciais — todos feitos

| R | Requisito | Situação | Onde está | Como conferir |
|---|---|---|---|---|
| **R1** | Repositório central dos documentos | ✅ **Feito** | Cadastro de projeto, tela inicial e tela do projeto · `paginas/novo-projeto.js`, `paginas/inicio.js`, `paginas/projeto.js` | A coordenação cadastra o projeto e define a equipe; a partir daí ele aparece numa tela só, com o arquivo da versão vigente a um toque. Ninguém precisa perguntar a ninguém. |
| **R2** | Identificação inequívoca da versão vigente | ✅ **Feito** | `componentes.js` (`blocoVigente`, `selo`) · três estados no banco: VIGENTE / SUPERADA / CANCELADA | A vigente ocupa o topo da tela, em verde, com o número grande e o rótulo "Execute por esta". Versão antiga abre com faixa âmbar; cancelada, com faixa vermelha. |
| **R3** | Histórico de versões preservado | ✅ **Feito** | `repositorio.js` (`revisoes.publicar` nunca apaga) · seção "Histórico" | Publicar não sobrescreve: a anterior vira SUPERADA e continua na lista, com autor e data. A Pavimentação tem as 4 revisões. |
| **R5** | Notificação automática a cada nova versão | ✅ **Feito** ⚑ | `regras/notificacao.js` · avisos criados dentro da mesma transação da publicação | Publicar gera o aviso sozinho — não é um segundo botão que dá para esquecer. Vai para a equipe do projeto (R19), não para a empresa toda, e a tela mostra antes quem será avisado. ⚑ falta sair também por e-mail (R18). |
| **R6** | Confirmação de ciência pela área que recebe | ✅ **Feito** | `regras/ciencia.js` · tela de avisos · lista "quem já viu esta versão" | Um botão confirma; a tela mostra "3 de 5 confirmaram", com nome, papel e data, e quem falta. **Confirmar é obrigatório:** sem confirmar, o arquivo daquela revisão não abre — mas o texto do "o que mudou" fica sempre visível, para que a confirmação signifique alguma coisa. Cobrança a partir de 2 dias. |
| **R8** | Acesso padrão sempre à versão vigente | ✅ **Feito** ⚑ | `paginas/projeto.js` (ordem da tela) · `acessos_versao_antiga` | O caminho normal só entrega a vigente. Chegar numa antiga exige rolar até o histórico e clicar — e o acesso fica registrado com nome e hora, visível na própria tela da revisão. |
| **R13** | Simples e dinâmico de usar | ✅ **Feito** | todo o desenho | Ver a versão vigente: zero cliques (está na tela inicial). Confirmar ciência: um clique. Publicar: três campos e um botão. Sem menu escondido, sem jargão de sistema na tela. |

---

## Importantes

| R | Requisito | Situação | Observação |
|---|---|---|---|
| **R4** | Marcação de versão cancelada/obsoleta | ✅ **Feito** | Restrito a quem publica. Pede o motivo, que aparece na faixa vermelha. A versão fica riscada no histórico e continua preservada (R3). A R00 da Pavimentação está assim nos dados de teste. |
| **R7** | Visibilidade antecipada de revisões em andamento | 🟡 **Parcial, de tabela** | Não foi construído para isso, mas o R17 entregou boa parte: uma revisão que muda orçamento ou prazo fica visível como *"vem mudança por aí"* **antes** de valer, e Contratos e Orçamento a veem na página do projeto. **Falta:** revisão que ainda está sendo desenhada e não foi publicada — essa o sistema continua não enxergando. |
| **R9** | Papéis e permissões por área | ✅ **Feito** | `regras/papeis.js`. Engenharia e Arquitetura publicam e cancelam revisão; Coordenação e Direção cadastram projeto e montam equipe; Orçamento e Estágio consultam e recebem. A restrição é verificada no servidor, não só escondendo o botão. **Sem senha nesta rodada** — o seletor "entrar como" demonstra os papéis. |
| **R11** | Registro de incidentes de versão incorreta | ✅ **Feito** | Tela "Retrabalho": data, o que aconteceu, versão que acabou sendo usada, custo e horas. Mostra o total acumulado — é a linha de base das metas. Qualquer pessoa pode registrar, porque quem vê o retrabalho é a obra. |
| **R14** | Confiável e sempre disponível | ❌ **Não nesta rodada** | É requisito de operação, não de código: depende de onde o sistema for hospedado e de rotina de backup. Roda num computador só. O banco é um arquivo (`dados/banco.db`), então backup é copiar esse arquivo — mas isso não está automatizado. |

---

## Desejáveis

| R | Requisito | Situação | Observação |
|---|---|---|---|
| **R10** | Acesso pelo celular no canteiro | ✅ **Feito** ⚑ | Saiu de graça por ter sido feito para o celular desde o começo. Testado a 375 px: sem rolagem lateral, botões de 48 px. O servidor imprime o endereço de rede para abrir no telefone. ⚑ falta confirmar com a obra se há sinal e aparelho no canteiro. |
| **R12** | Indicadores de uso e de revisões | 🟡 **Parcial** | Saiu de graça a contagem de revisões por projeto (na tela inicial) e o total de retrabalho com custo e horas. **Não tem** evolução no tempo nem volume de acessos à versão vigente — isso exigiria registrar todo acesso, e ficou fora. |
| **R15** | Registro de informação externa que chega de fora | ❌ **Não nesta rodada** | Não sai de graça: pede um segundo tipo de anexo, com data de recebimento, ao lado do projeto. Anotado como próximo passo. |

---

---

## Requisitos novos (pedidos depois do documento original)

Surgiram das decisões da direção em 05/08/2026. Estão detalhados na Parte 2 do
[PENDENCIAS.md](PENDENCIAS.md) e **precisam entrar no documento oficial de
requisitos**.

| R | Requisito | Situação | Observação |
|---|---|---|---|
| **R16** | Login com a conta Google da Promav | ❌ **Não nesta rodada** | Decidido, mas depende do endereço fixo que só existe depois de escolher a hospedagem. Construir antes seria refazer. O seletor "entrar como" continua para a demonstração. |
| **R17** | Aprovação de alteração grande pelo CEO ou pela Coordenação | ✅ **Feito** | `regras/aprovacao.js` + menu "Aprovações". Uma pergunta ao publicar — *"muda orçamento ou prazo?"*. Se sim, a revisão fica **aguardando aprovação**: não vale, a anterior continua vigente e ninguém é avisado. Depois do aval ela vira vigente e os avisos saem. **Ninguém aprova a própria revisão.** Não aprovar exige motivo, e a revisão fica no histórico como cancelada. |
| **R18** | Aviso por e-mail com modelo padrão | 🟡 **Parcial** | Texto do modelo e conta remetente (`engenharia.promav@gmail.com`) guardados em `regras/aviso-email.js`. **O envio não existe** — depende da hospedagem. |
| **R19** | Cada pessoa vê apenas o que lhe diz respeito | ✅ **Feito** | `regras/visibilidade.js` + tabela `equipes`. A coordenação cadastra o projeto e marca quem trabalha nele; só essas pessoas veem o projeto **e** recebem aviso. Uma lista, dois usos — é impossível ver um projeto sem ser avisado dele. Coordenação e direção enxergam tudo (decisão minha, ver PENDENCIAS). O bloqueio é verificado no servidor em todas as telas, inclusive no download do arquivo. |
| **R20** | Arquivos no Google Drive | 🟡 **Parcial** | Dois caminhos até a pasta: **link do Drive** (abre no navegador, serve no celular) e **caminho `G:\...`** com botão de copiar (para quem abre pelo explorador de arquivos). O caminho não é clicável porque navegador nenhum abre pasta local a partir de uma página web. Os arquivos por revisão continuam em `dados/arquivos` — migrar de vez é decisão de produção. |
| **R21** | Cadastro completo do projeto | ✅ **Feito** | Cliente, número do contrato, início, prazo, situação da obra e tipo. Preenchido e corrigido pela coordenação. Vocabulário em `regras/cadastro.js`. |
| **R22** | Conjunto de obras correlatas | ✅ **Feito** | Campo com sugestão dos conjuntos já usados, e página listando as obras do conjunto. Agrupa mas não manda: cada obra mantém equipe, vigente e histórico próprios. |
| **R21b** | Placa de aviso de cadastro errado | ✅ **Feito** | Um ⚑ ao lado de cada campo da ficha: quem vir algo errado avisa a coordenação sem sair da tela. A placa avisa, não edita — corrigir continua sendo da coordenação. |
| **R25** | Quadro de atividades (kanban) | ✅ **Feito** | Aba própria no projeto, com as colunas Não iniciado · Em execução · Revisão · Finalizado. Cartão com nome, responsável e desde quando; janela de detalhes com a descrição. Arrasta no dedo e no mouse. **Mover cartão não muda versão, não gera aviso e não exige ciência** — há verificação automática garantindo. ⚠️ É gestão de tarefas, que o documento original excluía: entrou por decisão posterior. |
| **R23** | Registro de andamento (o "commit") | ✅ **Feito** | O que fiz · dificuldade · dúvida em aberto, por qualquer pessoa da equipe. **Não é revisão**: não numera, não muda a vigente e não gera aviso — para não transformar cada anotação numa versão e embaralhar o R2. |

**Efeito colateral do R19 no R7:** ao restringir o aviso à equipe do projeto,
parte do incômodo que motivava o R7 (informação chegando a quem não precisa, e
tarde para quem precisa) diminui. O R7 em si — ver que uma revisão *está vindo* —
continua não implementado.

---

## Fora de escopo

Conforme a definição da direção, nada disto existe no sistema, nem "de brinde":
gestão financeira ou custos de obra (o R11 registra o custo **de um incidente**,
que é medição de retrabalho, não controle de custos); aprovação regulatória;
cronograma; edição de BIM/CAD (o sistema versiona e distribui arquivos, não os
abre para editar); e **chat ou mensageria entre pessoas** — o aviso é gerado
pelo sistema sobre uma mudança de versão, e não há nenhum lugar onde uma pessoa
escreva para outra.

### ⚠️ Uma exceção, declarada

**Planejamento de tarefas** estava nessa lista e **entrou** depois, como o
quadro de atividades (R25), a pedido da coordenação. Está registrado aqui para
a direção saber que o escopo foi ampliado — e para que ninguém descubra isso
por acidente numa reunião.

Foi construído numa aba separada justamente para que o escopo original — saber
qual versão vale — continue sendo a primeira coisa que a tela do projeto
responde.
