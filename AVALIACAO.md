# AVALIAÇÃO — ferramenta pronta ou sistema sob medida?

> Análise pedida antes de escrever código. Base: os 15 requisitos do documento
> `Requisitos-Controle-de-Versao.docx` e a restrição da direção ("simples e dinâmico").
> Data: 04/08/2026.

---

## 1. O que realmente precisa ser decidido

A pergunta não é "existe ferramenta que guarda arquivo com versão?" — existem dezenas, e várias de graça.
A pergunta é: **existe ferramenta pronta, dentro do orçamento e do nível técnico de uma empresa de 7 pessoas
sem TI, que cubra os sete requisitos Essenciais ao mesmo tempo?**

Dos sete Essenciais, cinco são atendidos por quase qualquer coisa (R1 repositório, R3 histórico, R13 depende de
desenho, e parcialmente R2). Os que separam as opções são três:

| Requisito | Por que é o filtro |
|---|---|
| **R2** — versão vigente inequívoca | Não basta "o arquivo mais recente". Precisa de um estado explícito (vigente / superada / cancelada) que não dependa de alguém ter lido o nome do arquivo direito. |
| **R6** — confirmação de ciência registrada | É o requisito que responde ao "eu não fui avisado" da pavimentação. Exige registro de **quem** viu **o quê** e **quando**. Guardar arquivo não faz isso. |
| **R8** — acesso padrão à vigente | O caminho natural tem que levar à versão certa; abrir a antiga tem que exigir ato deliberado. Em pasta compartilhada, o caminho natural leva a *qualquer coisa*. |

R2, R6 e R8 são exatamente os três que falharam no caso âncora. Uma solução que não os cobre não resolve o
problema — apenas organiza melhor o mesmo erro.

---

## 2. As opções, avaliadas

Custos abaixo são **ordens de grandeza para 7 usuários**, para comparação relativa — precisam ser conferidos
com o fornecedor antes de virar decisão de compra.

### Opção A — Google Drive / OneDrive com convenção rígida de nomes e permissões

| | |
|---|---|
| **Cobre** | R1 ✅ · R3 ✅ (versões nativas) · R13 ✅ (todo mundo já sabe usar) · R9 ✅ (permissões de pasta) |
| **Não cobre** | **R2 ⚠️** só por convenção de nome (`..._R03_VIGENTE.pdf`) — volta a depender de disciplina humana · **R5 ⚠️** existe aviso de pasta, mas é genérico e ruidoso, não diz *o que mudou* · **R6 ❌** não existe · **R8 ❌** o padrão é "o que a pessoa achar"; e quem baixa cria uma cópia fora de controle |
| **Custo** | R$ 0 a ~R$ 40/usuário/mês (provavelmente já pago) |
| **Manutenção** | Técnica: quase nenhuma. Disciplinar: **alta e contínua** — alguém tem que policiar a convenção para sempre |
| **"Simples e dinâmico"** | Sim, é o mais simples de todos |

**Veredito honesto:** é praticamente o que a empresa já faz, com pasta em vez de WhatsApp. Barato e familiar,
mas falha justamente nos três requisitos que causaram o prejuízo. Continua sendo *possível* executar a versão
errada, e continua **impossível provar** que a obra foi avisada. É a opção que já foi testada pela realidade e
não segurou.

---

### Opção B — SharePoint / Microsoft 365 com aprovação de conteúdo + Power Automate

| | |
|---|---|
| **Cobre** | R1 ✅ · R2 ✅ (aprovação de conteúdo dá estado publicado/rascunho) · R3 ✅ · R4 ✅ · R5 ✅ (alertas) · **R6 ✅** (via fluxo no Power Automate + Lista de confirmações) · R9 ✅ · R14 ✅ (backup e disponibilidade da Microsoft) |
| **Não cobre bem** | **R8 ⚠️** dá para aproximar com vistas filtradas, mas a biblioteca continua navegável livremente · **R13 ❌** SharePoint é visualmente pesado; a tela padrão tem dezenas de comandos irrelevantes |
| **Custo** | ~R$ 60/usuário/mês (M365 Business Standard) → ~R$ 5.000/ano. Parte pode já estar paga |
| **Manutenção** | **Este é o problema.** O que faz o R6 funcionar é um fluxo do Power Automate. Quando ele quebrar — e fluxos quebram com mudança de licença, de coluna, de permissão — **não há ninguém em 7 pessoas que saiba consertar.** E ele quebra em silêncio: o aviso simplesmente para de sair, e ninguém percebe até o próximo retrabalho |
| **"Simples e dinâmico"** | Não. É a opção com maior risco de rejeição pela equipe |

**Veredito honesto:** tecnicamente cobre quase tudo e o custo é aceitável. É a alternativa pronta mais forte.
Mas troca "risco de esquecer de avisar" por "risco de um fluxo invisível parar de funcionar", e cobra em cima
disso uma interface que a equipe tende a abandonar. Só é boa se a empresa aceitar contratar alguém pontualmente
para manter o fluxo.

---

### Opção C — Nextcloud auto-hospedado

| | |
|---|---|
| **Cobre** | R1 ✅ · R3 ✅ · R9 ✅ · R2/R5 parcialmente (etiquetas e app de fluxo) |
| **Não cobre** | **R6 ❌** sem desenvolvimento · R8 ⚠️ · R14 ⚠️ passa a ser responsabilidade da empresa |
| **Custo** | Licença R$ 0 + servidor ~R$ 100/mês + **tempo de administrador** |
| **Manutenção** | A pior das opções para este cliente: atualização de servidor, certificado, backup, restauração — tudo vira problema de uma empresa que não tem TI |
| **"Simples e dinâmico"** | Para o usuário final, razoável. Para quem mantém, não |

**Veredito honesto:** economiza licença e paga em administração de servidor. Numa empresa de 7 pessoas sem TI,
isso é caro disfarçado de grátis. **Descartada.**

---

### Opção D — GED/EDMS de engenharia ou plataforma de gestão de obra
*(Autodesk Docs / Construction Cloud, Trimble Connect, Bentley ProjectWise, Procore, Sienge)*

| | |
|---|---|
| **Cobre** | **Tudo, com folga.** R1–R12 nativos, incluindo transmittal com rastreio de leitura (R5+R6), conjunto vigente (R2+R8), comparação entre revisões, app de campo (R10), indicadores (R12) |
| **Custo** | Faixa alta: ~US$ 60–90/usuário/mês na linha Autodesk Docs/ACC → **na ordem de R$ 25.000–35.000/ano** para 7 usuários. Procore e ProjectWise costumam ser mais caros ainda. Trimble Connect tem faixa gratuita/barata e é a exceção que vale cotar |
| **Manutenção** | Baixa — é do fornecedor. Ponto forte real |
| **"Simples e dinâmico"** | **Não.** São ferramentas desenhadas para construtoras com dezenas de obras e equipe de BIM. A equipe de 7 usaria talvez 10% das funções e pagaria por 100% — e, pior, teria que atravessar as outras 90% na tela todo dia |

**Veredito honesto:** é a categoria certa do problema, e resolveria. Mas a proporção não fecha: o custo anual é
da ordem de grandeza do próprio prejuízo que se quer evitar, e o excesso de função é risco **direto** contra o
R13, que é Essencial e é a condição de adoção posta pelo CEO. Faz sentido revisitar se a empresa crescer para
dezenas de obras simultâneas.

---

### Opção E — Construir sob medida (enxuto)

| | |
|---|---|
| **Cobre** | Exatamente os 15 requisitos e nada além. R2, R6 e R8 — os três filtros — são desenhados como o centro do sistema, não como adaptação |
| **Custo** | Desenvolvimento do protótipo: baixo (o escopo é pequeno: ~4 telas). Recorrente: hospedagem simples, na faixa de R$ 0–100/mês |
| **Manutenção** | **Este é o risco real da opção.** Sistema próprio precisa de alguém que o entenda. Numa empresa sem TI, isso é dependência de uma pessoa só |
| **"Simples e dinâmico"** | É a única opção em que isso é **decisão de projeto**, não sorte. A tela mostra o que a obra precisa e mais nada |
| **Ponto fraco** | R14 (confiabilidade e backup) passa a ser problema nosso |

---

## 3. Comparação direta nos três requisitos que decidem

| | R2 vigente inequívoca | R6 ciência registrada | R8 acesso padrão à vigente | R13 simples | Custo/ano |
|---|---|---|---|---|---|
| A · Drive/OneDrive + convenção | ⚠️ convenção | ❌ | ❌ | ✅ | ~R$ 0–3.400 |
| B · SharePoint + Power Automate | ✅ | ✅ frágil | ⚠️ | ❌ | ~R$ 5.000 |
| C · Nextcloud | ⚠️ | ❌ | ⚠️ | ⚠️ | ~R$ 1.200 + admin |
| D · EDMS de engenharia | ✅ | ✅ | ✅ | ❌ | ~R$ 25.000–35.000 |
| E · Sob medida enxuto | ✅ | ✅ | ✅ | ✅ | ~R$ 0–1.200 + manutenção |

O quadro mostra o essencial: **as opções que passam em R2+R6+R8 reprovam em R13 ou no custo; as que passam em
R13 e custo reprovam em R6 e R8.** No tamanho desta empresa, o cruzamento "cobre o que falhou" × "leve o
bastante para ser adotado" × "barato" está vazio entre as prontas.

---

## 4. Recomendação

**Construir sob medida — mas enxuto, e sem assumir a guarda dos arquivos pesados.**

Concretamente, o desenho recomendado para produção é híbrido:

- **Os arquivos** (DWG, PDF, IFC) continuam no Google Drive / OneDrive que a empresa já usa e já paga.
  Backup, disponibilidade e restauração (R14) ficam com o Google/Microsoft, que fazem isso melhor do que nós.
- **O sistema sob medida** guarda o que nenhuma dessas ferramentas guarda: qual revisão é a **vigente**, quais
  foram **superadas ou canceladas**, **quem publicou**, **quem foi avisado**, **quem confirmou ciência e
  quando**, e **o que mudou de uma revisão para a outra**. Mais o registro de incidentes (R11), que é a linha
  de base das metas do CEO.

Ou seja: não construímos mais um drive. Construímos a **camada de controle e de prova** que falta em cima do
drive que já existe.

**Por quê, em três razões:**

1. **O prejuízo veio de R6 e R8, e nenhuma opção pronta acessível os cobre.** Drive não registra ciência.
   SharePoint só registra através de um fluxo que ninguém na empresa saberá consertar. A única categoria pronta
   que resolve de verdade custa, por ano, algo próximo do prejuízo que se quer evitar.
2. **"Simples e dinâmico" é requisito Essencial, não preferência.** É a condição de adoção declarada pelo CEO,
   e o histórico da equipe (voltar para o WhatsApp) mostra que é real. Toda opção pronta que cobre R6 traz
   junto uma interface grande demais. Sob medida é a única em que a simplicidade é escolhida, não herdada.
3. **A escala favorece o sob medida.** 7 pessoas, ~4 projetos, poucas revisões por mês. O sistema necessário é
   pequeno — quatro telas. Nessa escala, licença recorrente de plataforma grande é desproporcional, e o custo
   de construir é baixo.

---

## 5. O que pode derrubar esta recomendação — e é honesto dizer agora

- **Quem mantém depois?** É a fraqueza real da opção E. Se a direção não tiver ninguém (interno ou contratado
  pontualmente) para manter o sistema, **a recomendação muda para a Opção B (SharePoint)**, que é frágil mas
  tem fornecedor por trás. Esta pergunta precisa ser respondida antes do piloto virar produção.
- **Se a empresa planeja crescer para dezenas de obras simultâneas** nos próximos 2–3 anos, a Opção D deixa de
  ser desproporcional e passa a ser o caminho. Vale cotar **Trimble Connect** especificamente, que tem faixa de
  entrada muito mais barata que Autodesk e Procore.
- **Custos citados são ordens de grandeza.** Antes de virar decisão de compra, cotar com fornecedor.
- **O protótipo desta rodada é protótipo.** Ele serve para os 7 usarem 15 minutos e dizerem "é isso" ou
  "faltou X". Não é o sistema de produção, e a decisão de produção deve ser retomada depois dessa validação —
  inclusive a de desistir de construir, se o piloto mostrar que uma pasta bem organizada já bastava.

---

## 6. Recomendação em uma frase

> Construir, mas o mínimo: uma camada leve e própria de **versão vigente + aviso + ciência registrada** sobre o
> armazenamento de arquivos que a empresa já tem — porque é exatamente essa camada que faltou na pavimentação, é
> ela que nenhuma ferramenta pronta acessível entrega, e é só ela que precisa ser construída.
