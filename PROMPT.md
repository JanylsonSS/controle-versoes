# PROMPT — controle-versoes · Sistema de Controle de Versões de Projeto (protótipo funcional)

> Nome do projeto/pasta: **controle-versoes**. Use-o como nome técnico do projeto (repositório, package, etc.). O nome "de marca" que aparece na tela para a equipe pode ser definido depois, com os usuários, durante o piloto.
>
> Este arquivo orienta a construção. Leia-o inteiro antes de escrever qualquer código.
> O documento de requisitos está nesta mesma pasta (arquivo `.docx` — abra e leia primeiro).

---

## 0. Contexto (leia antes de tudo)

Uma construtora pequena (7 pessoas: 2 engenheiros, 2 arquitetas, 1 orçamentista, 1 de contratos e o CEO) fez um diagnóstico de processos e priorizou **um** problema: versões desatualizadas de projeto circulam entre as áreas e mudanças chegam tarde, gerando retrabalho e custo. O caso âncora, que dá o custo real: **uma pavimentação foi executada sobre uma versão antiga — a revisão mandava remover uma calçada, a obra não foi avisada, executou com a calçada e o serviço teve de ser refeito, alterando o orçamento.**

O objetivo do sistema, aprovado pela direção:

> Centralizar e controlar as versões dos projetos de engenharia e arquitetura, de modo que ninguém trabalhe, orce ou execute sobre uma versão que não seja a vigente — atacando a circulação de versões antigas ou canceladas que geram refação de entrega.

O CEO pediu, textualmente, algo **"simples e dinâmico"**. Leve isso como uma restrição de projeto, não como um detalhe: a equipe não é de tecnologia; se a ferramenta for pesada, eles voltam para o WhatsApp.

---

## 1. PRIMEIRA TAREFA — não é codar. É recomendar.

**Antes de escrever qualquer código, produza uma análise curta (em um arquivo `AVALIACAO.md`) respondendo:**

Os requisitos deste projeto justificam **desenvolver um sistema sob medida**, ou uma **ferramenta pronta** já os atenderia com menos custo e manutenção?

- Considere honestamente alternativas prontas que cobrem controle de versão + notificação + histórico + acesso por papel: por exemplo, um Google Drive/SharePoint com convenção rígida de nomenclatura e permissões, um Nextcloud, um gestor de documentos de engenharia (GED/EDMS), ou plataformas de gestão de obra que já fazem controle de pranchas.
- Para cada opção (incluindo "construir sob medida"), avalie: cobertura dos requisitos essenciais, custo inicial e recorrente, esforço de manutenção por uma equipe não-técnica, e aderência ao "simples e dinâmico".
- Termine com uma **recomendação clara** e o porquê.

**Depois de escrever `AVALIACAO.md`, PARE e mostre a recomendação ao usuário.** Só prossiga para o código se o usuário confirmar que quer seguir com o desenvolvimento sob medida. Se ele já tiver dito que quer construir de qualquer forma, registre a recomendação mesmo assim (ela pode ser útil depois) e siga.

---

## 2. O que construir nesta rodada

Um **protótipo funcional** para validar com a equipe — não o sistema de produção final. Isso significa:

- Deve **funcionar de verdade**: dá para criar projeto, publicar versão, ver a vigente, receber aviso, confirmar ciência, navegar histórico. Não é maquete de telas estáticas.
- Pode usar **dados de teste / armazenamento simples** (ver seção 5). Não precisa de infraestrutura de produção, mas o código deve ser organizado de forma que dê para evoluir.
- O alvo é: colocar na frente dos 7 e perguntar "é isso? funciona pra vocês?".

### Você decide a stack

Recomende e justifique a stack a partir dos requisitos e da restrição "simples e dinâmico" — tanto para o usuário final quanto para quem vai manter. Priorize: rodar no navegador (acessível do escritório e do **celular no canteiro** — ver R10), simplicidade de deploy, e o mínimo de peças móveis que atenda aos requisitos. Registre a escolha e o motivo no `README.md`.

---

## 3. Requisitos — a fonte da verdade

**Abra e leia o documento de requisitos (`.docx`) nesta pasta antes de projetar qualquer coisa.** Ele traz 15 requisitos (R1–R15) com descrição, motivação e critério de aceite, classificados em Essencial / Importante / Desejável.

Regras de escopo:

- **Implemente todos os Essenciais nesta rodada.** São o mínimo que faz o protótipo valer a validação: R1 (repositório central), R2 (versão vigente inequívoca), R3 (histórico preservado), R5 (notificação automática de mudança), R6 (confirmação de ciência), R8 (acesso padrão à versão vigente), R13 (simples de usar).
- **Inclua os Importantes que forem baratos** dado o desenho (ex.: R4 marcar cancelada, R9 papéis/permissões básicos, R11 registro de incidentes de versão). Não force os que exigirem muito.
- **Deixe os Desejáveis para depois**, exceto se saírem de graça.
- Alguns requisitos foram marcados no documento com **⚑ (a confirmar com a obra)**. Eles ainda podem mudar. Implemente-os com a interpretação atual, mas **isole essas partes no código** (bem separadas, fáceis de ajustar) e liste-as num `PENDENCIAS.md` para revisão.

**Regra de ouro:** cada tela e cada função deve rastrear a um requisito. Se algo não atende a um R do documento, não construa nesta rodada — anote como ideia futura.

---

## 4. Fora de escopo (não construa)

A direção definiu explicitamente. Não implemente, nem "de brinde":

- Gestão financeira ou controle de custos de obra.
- Aprovação regulatória ou protocolo junto a órgãos externos.
- Gerenciamento de cronograma / planejamento de tarefas.
- Edição de arquivos BIM/CAD dentro do sistema (o sistema **versiona e distribui** os arquivos; não os edita).
- **Chat / mensageria entre pessoas.** Cuidado com esta: notificação automática de que *uma versão mudou* está **dentro** do escopo (R5). O que está fora é conversa livre entre usuários. Não construa um chat.

---

## 5. Diretrizes de implementação

- **Simplicidade acima de sofisticação.** Toda decisão técnica se resolve a favor do mais simples de usar e manter. Sem framework pesado se um leve resolve.
- **Persistência:** para o protótipo, use o armazenamento mais simples que permita os dados sobreviverem entre sessões (um banco leve embutido, ou arquivos locais). Estruture o acesso a dados numa camada separada, para trocar por um banco real depois sem reescrever a aplicação.
- **Dados de teste (seed):** popule o sistema com dados fictícios que contem a história do diagnóstico, para a validação com a equipe ser concreta. Use estes:
  - Projeto **"Pavimentação — Praça do Ginásio"** com 4 revisões: R00 (emissão inicial, **cancelada**), R01 (compatibilização com drenagem, superada), R02 (revisão de cotas, superada), **R03 (remoção da calçada no trecho leste — VIGENTE)**. Este é o caso âncora.
  - Mais 3 projetos de apoio (Câmara Municipal, Escola Norte, UBS Centro) com uma ou duas revisões cada, todos vigentes.
  - Papéis de usuário: Engenheiro, Arquiteta, Orçamentista, Contratos, CEO (ver R9). Sem senha real no protótipo — um seletor de "entrar como" já basta para demonstrar papéis.
- **O fluxo do caso da pavimentação precisa funcionar ponta a ponta**, porque é ele que será demonstrado: publicar a R03 → sistema notifica a obra (R5) → obra abre, vê o que mudou (R02→R03) → confirma ciência (R6) → fica registrado quem viu e quando.
- **Acessível no celular.** Layout responsável; a obra confere versão no canteiro pelo telefone (R10, desejável — pelo menos não quebre no mobile).
- **Idioma:** toda a interface em **português do Brasil**. Escreva os textos do ponto de vista de quem usa (obra, projetista), não do sistema. Evite jargão técnico na tela.
- **Nome na tela:** o projeto técnico se chama `controle-versoes`, mas o nome exibido ao usuário ainda não está decidido (será escolhido com a equipe no piloto). Use um nome de exibição provisório simples (ex.: "Controle de Versões") e **centralize esse texto num único ponto do código** (uma constante ou config), para trocar depois sem caçar em várias telas.
- **Qualidade mínima sem exagero:** foco em funcionar e ser claro. Não gaste tempo em animações ou polimento visual nesta rodada — isso vem depois da validação.

---

## 6. Entregáveis desta rodada

1. `AVALIACAO.md` — a análise "ferramenta pronta vs. construir" com recomendação (item 1). **Primeiro de tudo.**
2. O protótipo funcional rodando localmente, com os dados de teste populados.
3. `README.md` — o que é, a stack escolhida e por quê, como rodar localmente (passo a passo simples), e como está organizado o código.
4. `REQUISITOS-COBERTOS.md` — tabela ligando cada R do documento ao que foi implementado (feito / parcial / não nesta rodada).
5. `PENDENCIAS.md` — os itens marcados ⚑ que dependem da conversa com a obra, e qualquer decisão que você tomou por conta e que o usuário deveria revisar.

---

## 7. Como trabalhar

- Comece pelo `AVALIACAO.md` e **espere o aval** antes de codar (item 1).
- Depois, proponha em uma linha a stack e a estrutura, e siga.
- Trabalhe em passos pequenos e verificáveis; ao terminar cada parte, diga o que dá para testar.
- Se um requisito estiver ambíguo, **não invente regra de negócio** — registre a dúvida em `PENDENCIAS.md` e siga com a interpretação mais simples, deixando-a fácil de trocar.
- Não expanda o escopo. Se tiver uma boa ideia fora dos requisitos, anote em `PENDENCIAS.md` em vez de construir.

Objetivo final desta rodada, em uma frase: **algo funcional o suficiente para os 7 usarem por 15 minutos e dizerem "é isso" ou "faltou X" — barato de mudar, honesto sobre o que ainda não faz.**
