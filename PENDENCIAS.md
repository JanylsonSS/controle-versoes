# PENDÊNCIAS E DECISÕES

O registro do que foi decidido (com data e porquê), do que eu decidi sozinho e
merece revisão, e do que continua em aberto. Atualizado em 14/08/2026, ao fim
da migração para React.

---

## Parte 1 — O pivô de 13/08/2026 (a decisão-mãe)

Definido pela coordenação: **a mudança de projeto não é um arquivo, é uma
orientação** — "mudou o orçamento", "mudou a estrutura" — com título, data,
descrição e quem vai fazer. Consequências, todas implementadas:

| Decisão | O que significa |
|---|---|
| Fim das revisões numeradas | Não existe mais R00→R03 nem "versão vigente"; a orientação mais recente é a que vale, e o histórico serve para comparar |
| Orientação → atividade | Publicar cria automaticamente o cartão no quadro, em nome de quem vai fazer |
| Ciência sem bloqueio | "Confirmo que vi" registra e cobra (destaque após 2 dias), mas não trava ninguém — reverteu a decisão anterior de trancar o arquivo |
| Aval sem portão | Mudança de orçamento/prazo entra na fila do CEO/coordenação, mas o trabalho não espera; negar exige motivo registrado |
| Upload removido | O sistema não guarda arquivo; a ficha aponta o Drive (link) e o `G:\` (caminho com copiar) |
| **Retrabalho removido** | ver o alerta abaixo |
| Agenda entra | Reunião e visita técnica no calendário da tela inicial; coordenação marca para os outros |
| React + Vite | Frontend novo com o visual do modelo "Promav App"; foco no desktop, celular adiado |

### ⚠️ A consequência que precisa voltar à mesa da direção

**O sistema não mede mais retrabalho (R11).** Era o número que o CEO definiu
como métrica de sucesso ("menos revisões de retrabalho, menos horas
refazendo") e a linha de base das metas trimestrais. A remoção foi decisão de
produto do pivô — legítima, mas **as metas ficaram sem instrumento**. Antes do
piloto, a direção precisa dizer: as metas mudam, ou a medição volta noutra
forma?

---

## Parte 2 — Decisões anteriores que continuam valendo

- **Equipe é uma lista com dois usos** (quem vê + quem é avisado), montada
  pela coordenação no cadastro; coordenação e direção veem tudo.
- **Ninguém aprova a própria orientação** — a coordenação publica e aprova,
  então sem essa trava o aval viraria formalidade.
- **E-mails da equipe** cadastrados. ⚑ A conta do Micael existe como
  `micaias.promav@gmail.com` (nome certo, conta com grafia errada) — o sistema
  guarda a que funciona; trocar no seed se recriarem.
- **Rafaela** segue só com o primeiro nome no cadastro, e só consulta.
- **Contas são Gmail comuns, não Workspace** — o login Google não poderá
  restringir por domínio: será uma lista de 8 contas mantida à mão (risco
  operacional registrado: remover quem sair da empresa é passo manual).
- **A letra `G:` do Drive é por máquina** — conferir com o TI se é igual em
  todas antes de confiar no caminho de rede.
- **Modelo do e-mail de aviso** aprovado e guardado em
  `src/regras/aviso-email.js` (adaptado ao modelo de orientações no pivô),
  remetente `engenharia.promav@gmail.com`.
- **O quadro de atividades (R25)** entrou por pedido da coordenação ainda no
  modelo antigo, antes do pivô; o pivô o promoveu a destino automático de
  cada orientação publicada.

---

## Parte 3 — Travadas por decisão externa

### Onde hospedar (decide a direção — [HOSPEDAGEM.md](HOSPEDAGEM.md))

A recomendação continua o PaaS pago com deploy por GitHub. **Nota nova da
migração:** o deploy agora tem um passo de build (`npm run app:build`) — os
PaaS fazem isso sozinhos a partir do `package.json`.

Três coisas esperam por essa decisão:

1. **Login com a conta Google (R16)** — precisa do endereço fixo de retorno.
2. **Envio do e-mail de aviso (R18)** — texto pronto, falta o canal.
3. **Backup automático do banco** — cópia periódica de `dados/banco.db` para o
   Drive. O GitHub não cobre isso: guarda código, não dados.

---

## Parte 4 — Decisões que tomei nesta migração, a revisar

1. **A página do conjunto de obras não voltou** (R22 ficou parcial). O campo
   existe e o formulário sugere nomes; a tela que listava as obras do conjunto
   morreu com o HTML antigo. Voltar se alguém sentir falta.
2. **Sem cookie, o sistema abre como o Álvaro** (primeiro do seed). É o
   "entrar como" do protótipo; vira 401 quando o login entrar. Documentado no
   código.
3. **Agenda: cada um vê só a própria; a coordenação vê a de todos** (é ela que
   marca). Desmarcar pode: o participante, quem marcou, ou a coordenação.
4. **A lateral atualiza a cada troca de tela** (projetos e contador de
   aprovações). Sem atualização "ao vivo" — para 8 pessoas, recarregar na
   navegação basta.
5. **O frontend não tem teste automatizado.** As 177 verificações cobrem a
   API; o frontend se verifica manualmente pelo roteiro. Se o time de TI
   quiser, o caminho natural é Playwright — decisão deles.
6. **Sem numeração visível de orientação.** Nem "nº 7": o histórico ordena por
   data. Se a equipe sentir falta de um jeito de se referir a uma orientação
   ("aquela de 05/06"), reavaliar.

---

## Parte 5 — Perguntas em aberto

1. **As metas da direção sem o R11** — ver Parte 1. A mais importante.
2. **Quanto custou de verdade a pavimentação?** O número fictício que o
   protótipo exibia (R$ 18.400 / 24 h) saiu junto com o retrabalho — o
   sistema não guarda mais valor nenhum. Mas a pergunta continua: era a
   linha de base — conversa com a obra, pendente desde o início.
3. **A fórmula do prazo mínimo** (antecedência entre publicar uma mudança e
   ela virar serviço) ficou órfã do modelo antigo, mas a pergunta continua
   válida para orientações. As 6 perguntas de calibração seguem no
   [APRESENTACAO.md](APRESENTACAO.md).
4. **Sobreposição quadro × andamento**: continuam existindo duas formas de
   dizer "estou fazendo" (o cartão e o commit). Decidir no piloto qual
   sobrevive, ou se amarram.
5. **Dúvida em aberto deveria avisar alguém?** Hoje destaca na página e
   depende de alguém entrar para ver.
6. **Sinal e aparelho no canteiro** — pendente desde o documento original;
   voltou a importar só quando o celular voltar ao escopo.

---

## Parte 6 — Ideias anotadas, não construídas

- Painel simples para a direção (nº de orientações por obra, tempo médio até
  a ciência) — barato depois que houver uso real.
- Exportar a ciência de uma orientação em PDF, para anexar a contrato.
- Filtros da listagem por tipo e local (o pedido original menciona; a busca
  por nome já existe e os campos já vêm no JSON).
- Notificação de dúvida em aberto (ver Parte 5.5).
