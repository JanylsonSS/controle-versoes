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

**Desde 17/08 existe um candidato:** o painel de indicadores (R12) mede o que
evita o erro em vez de quanto ele custou — tempo até a ciência, pendências
por obra e por pessoa, fila de aval. A pergunta à direção vira: esses números
servem de metas novas, ou o retrabalho volta a ser medido de outro jeito?

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
- **Pacote de proteção pré-piloto (17/08/2026):** backup local automático
  (a cada 6 h + despedida do `recomecar`; falta só o destino fora do disco),
  rastro de toda troca de sessão (tabela `trocas_de_sessao`), cookie que
  morre com o navegador, confirmação para virar quem aprova, e smoke test
  do frontend (6 cenários Playwright, `npm run test:ui`). O código está no
  GitHub desde 17/08: repositório **privado** `JanylsonSS/controle-versoes`
  (a conta do estagiário de TI que mantém o sistema) — todo `git push` é
  backup do código.
- ⚠️ **Sem login, ciência e aval valem como fluxo, não como prova**: a
  sessão é trocável (registrada, mas trocável). Dizer isso à direção antes
  do piloto; vira prova quando o login (R16) chegar.

---

## Parte 3 — Travadas por decisão externa

### Onde hospedar (decide a direção — [HOSPEDAGEM.md](HOSPEDAGEM.md))

A recomendação continua o PaaS pago com deploy por GitHub. **Nota nova da
migração:** o deploy agora tem um passo de build (`npm run app:build`) — os
PaaS fazem isso sozinhos a partir do `package.json`.

Três coisas esperam por essa decisão:

1. **Login com a conta Google (R16)** — precisa do endereço fixo de retorno.
2. **Envio do e-mail de aviso (R18)** — texto pronto, falta o canal.
3. **O destino final do backup automático** — a cópia periódica local JÁ
   existe (a cada 6 h, `dados/backups/`); para onde ela vai fora do disco
   (a pasta do Drive via `PASTA_BACKUP_ESPELHO`, ou o serviço de
   hospedagem) depende de onde o sistema rodar. O GitHub não cobre isso:
   guarda código, não dados.

---

## Parte 4 — Decisões que tomei nesta migração, a revisar

1. ~~A página do conjunto de obras não voltou~~ **Voltou em 17/08** (R22
   completo): o valor na ficha vira link e a página lista as obras
   correlatas, com o R19 valendo (obra de equipe alheia é só contagem).
2. **Sem cookie, o sistema abre como o Álvaro** (primeiro do seed). É o
   "entrar como" do protótipo; vira 401 quando o login entrar. Documentado no
   código.
3. **Agenda: cada um vê só a própria; coordenação e direção veem a de todos**
   (são quem marca para os outros). Desmarcar pode: o participante, quem
   marcou, a coordenação ou a direção.
4. **A lateral atualiza a cada troca de tela** (projetos e contador de
   aprovações). Sem atualização "ao vivo" — para 8 pessoas, recarregar na
   navegação basta.
5. **O frontend tem só o smoke test** (6 cenários Playwright desde 17/08:
   publicar → confirmar → aprovar, o arrastar do quadro, a agenda). As 218
   verificações cobrem API + backup. Cobertura decente do frontend continua
   decisão do time de TI.
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
7. **O prazo da ciência é um chute.** Os 2 dias de `DIAS_PARA_COBRAR_CIENCIA`
   (`src/regras/ciencia.js`) esperam calibração com a equipe — pergunta P3
   do roteiro de apresentação.
8. **A agenda acabou de nascer.** Reunião e visita técnica bastam, ou falta
   um terceiro tipo? Quem mais, além de coordenação e direção, precisa
   marcar para os outros? (P9 e P10 do roteiro.)
9. **Só existem dois aprovadores** (direção e coordenação) e ninguém aprova
   a própria orientação — com os dois fora, ou um deles sendo o autor, o
   aval espera. Aceitável? (P14 do roteiro.)

---

## Parte 6 — Ideias anotadas, não construídas

- Painel simples para a direção (nº de orientações por obra, tempo médio até
  a ciência) — barato depois que houver uso real.
- Exportar a ciência de uma orientação em PDF, para anexar a contrato.
- Filtros da listagem por tipo e local (o pedido original menciona; a busca
  por nome já existe e os campos já vêm no JSON).
- Notificação de dúvida em aberto (ver Parte 5.5).
- Uma tela (ou rota) para ler o rastro das trocas de sessão — hoje a tabela
  `trocas_de_sessao` só se lê abrindo o SQLite na mão (e o campo `quando`
  está em UTC: 21h30 de terça em Fortaleza aparece como quarta).
