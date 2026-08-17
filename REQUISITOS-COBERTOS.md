# REQUISITOS COBERTOS

O documento original (`Requisitos-Controle-de-Versao.docx`, 30/07/2026) trouxe
R1–R15. Depois vieram os pedidos da coordenação (R16–R23) e o pivô de
13/08/2026, que **mudou o próprio objeto do sistema**: de versões numeradas de
arquivo para **orientações** — a mudança como informação endereçada a quem
executa.

Este documento diz, requisito a requisito, o que vale hoje.

---

## ⚠️ Antes da tabela: o que o pivô mudou de verdade

Três coisas precisam estar ditas com todas as letras, porque alteram
compromissos que a direção aprovou:

1. **R11 (registro de retrabalho) foi REMOVIDO.** Era a linha de base das
   metas do CEO ("menos revisões de retrabalho e menos horas refazendo").
   Hoje o sistema não mede retrabalho. Se as metas trimestrais continuarem
   valendo, essa medição precisa voltar de alguma forma — está registrado em
   PENDENCIAS.md como decisão a revisitar com a direção.
2. **R2 e R8 mudaram de natureza.** "Versão vigente inequívoca" e "acesso
   padrão à vigente" viravam selos, bloqueios e registro de acesso a versão
   antiga. Hoje a regra é mais simples: **a orientação mais recente é a que
   vale**, o histórico existe para comparar, e nada bloqueia. A proteção
   contra "executar informação velha" passou a ser o aviso + ciência + a
   atividade criada em nome de quem executa.
3. **A ciência (R6) não bloqueia mais nada.** Registra quem viu e quando, e
   destaca quem está atrasado — mas ninguém fica impedido de trabalhar. A
   decisão anterior (travar o arquivo) caiu junto com o arquivo.

---

## Os essenciais originais, no modelo de hoje

| R | Original | Hoje | Situação |
|---|---|---|---|
| **R1** | Repositório central dos documentos | O sistema centraliza **as mudanças e o estado de cada obra**; os arquivos ficam no Drive da empresa, com link e caminho de rede na ficha | ✅ reinterpretado |
| **R2** | Versão vigente inequívoca | "Informações atuais do projeto" = a última orientação, sempre no topo da página, com data e responsável | ✅ reinterpretado |
| **R3** | Histórico preservado | Toda orientação fica no histórico (dropdown de comparação); editar registra quem e quando | ✅ |
| **R5** | Notificação automática de mudança | Publicar avisa a equipe **na mesma transação** — não existe "esquecer de avisar". ⚑ o e-mail (R18) ainda não sai | ✅ (canal interno) |
| **R6** | Confirmação de ciência | "Confirmo que vi" com data registrada; quem falta aparece em chip, atrasado ganha destaque; **editar reabre a ciência da equipe atual**. Não bloqueia | ✅ redefinido |
| **R8** | Acesso padrão à versão vigente | O caminho natural (tela inicial, página do projeto) mostra sempre a orientação atual; a antiga só por escolha explícita no dropdown, marcada "não é a que vale" | ✅ reinterpretado |
| **R13** | Simples e dinâmico | Interface React com o visual do modelo aprovado; publicar = 1 janela; confirmar = 1 clique; instrução em cada campo | ✅ |

## Os demais originais

| R | Original | Situação |
|---|---|---|
| **R4** | Marcar versão cancelada | ❌ **saiu no pivô** — sem versões, não há o que cancelar. O equivalente atual é editar a orientação (com ciência reaberta) ou publicar outra |
| **R7** | Visibilidade antecipada de revisões | 🟡 parcial — a orientação que muda orçamento/prazo aparece na fila de aval e no projeto assim que publicada; trabalho ainda em desenho não aparece |
| **R9** | Papéis e permissões | ✅ — engenharia/arquitetura publicam; coordenação/direção publicam, aprovam, cadastram e marcam agenda para outros; orçamento/estágio consultam. Conferido no servidor, rota a rota |
| **R10** | Acesso pelo celular no canteiro | ❌ **adiado por decisão de 13/08** — foco no desktop do escritório |
| **R11** | Registro de incidentes de retrabalho | ❌ **REMOVIDO** — ver o aviso no topo |
| **R12** | Indicadores de uso | ❌ não nesta fase |
| **R14** | Confiável e sempre disponível | ❌ depende da hospedagem (pendência antiga) |
| **R15** | Registro de informação externa | ❌ não construído; a descrição da orientação cumpre parte do papel ("o cliente pediu em reunião…") |

## Os pedidos da coordenação (R16–R23, R25) e o que o pivô acrescentou (R26)

> Não existe R24: desde o levantamento a numeração saltou de R23 para R25 —
> a placa de aviso entrou como "R21b" em vez de ganhar número próprio, e
> depois foi incorporada ao R21. É um buraco de numeração, não um pedido
> descartado.

| R | Pedido | Situação |
|---|---|---|
| **R16** | Login com conta Google | ❌ espera a hospedagem; contas são Gmail comuns → lista de 8 autorizados mantida à mão |
| **R17** | Aval de mudança de orçamento/prazo | ✅ **redefinido em 13/08: registro, não portão.** A mudança já vale e a atividade já corre; o CEO/coordenação registram o aval (ou negam, com motivo) na fila própria. Ninguém aprova a própria |
| **R18** | Aviso por e-mail com modelo padrão | 🟡 texto e remetente prontos no código; envio espera a hospedagem |
| **R19** | Cada um vê só o que lhe diz respeito | ✅ — a equipe do projeto decide quem vê E quem é avisado; coordenação/direção veem tudo; vale inclusive nas notificações de quem **saiu** de uma equipe (corrigido em revisão adversarial) |
| **R20** | Arquivos no Google Drive | ✅ **completado pelo pivô**: o sistema não guarda mais arquivo nenhum — só o link da pasta e o caminho de rede |
| **R21** | Cadastro completo do projeto (+ placa ⚑) | ✅ — ficha com cliente, contrato, prazos, situação, tipo, conjunto; a placa avisa a coordenação de campo errado |
| **R22** | Conjunto de obras correlatas | 🟡 o campo existe e o formulário sugere nomes já usados; a **página** do conjunto saiu na migração e não voltou |
| **R23** | Registro de andamento (o "commit") | ✅ — na página do projeto: o que fiz, dificuldade, dúvida em aberto destacada |
| **R25** | Quadro de atividades (kanban) | ✅ — aba própria, arrastar por ponteiro, datas automáticas, **atividade nasce sozinha de cada orientação publicada** |
| **R26** | Agenda semanal (reunião/visita técnica) | ✅ **novo no pivô** — calendário na tela inicial; clicar no dia marca com instrução em cada campo; coordenação e direção marcam para qualquer pessoa e o compromisso cai direto na agenda dela |

---

## Fora de escopo — o que continua de fora

Gestão financeira e custos de obra; aprovação regulatória; cronograma de obra
(a agenda marca compromissos de pessoas, não planeja serviços); edição de
BIM/CAD; chat entre pessoas (o aviso é do sistema sobre uma mudança; a
descrição da orientação e do compromisso são texto endereçado, não conversa).

**Exceções declaradas ao escopo original, acumuladas:** o quadro de
atividades (R25, pedido pela coordenação antes do pivô), a agenda (R26) e a
migração para React (ambas no pivô de 13/08) — todas registradas em
PENDENCIAS.md.
