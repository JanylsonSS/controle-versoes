# Onde hospedar o sistema

> Material para apresentar à direção. A decisão fica para depois da
> apresentação do protótipo.

---

## A decisão, em uma frase

Hoje o sistema roda num computador só, ligado à mão. Para virar ferramenta de
trabalho, ele precisa de um lugar onde fique **ligado o tempo todo e acessível
pela internet** — inclusive do celular no canteiro. São quatro caminhos, de
R$ 0 a cerca de R$ 700 por ano.

## O que o sistema precisa desse lugar

Sem termo técnico, é isto:

1. **Ficar ligado sempre.** Se sair do ar num sábado, a obra não confere a versão
   e volta ao WhatsApp — que é justamente o que estamos tentando eliminar.
2. **Ser aberto pela internet**, com endereço seguro (o cadeado do navegador),
   para funcionar no canteiro.
3. **Não perder os dados.** O sistema guarda um arquivo com todas as revisões,
   quem confirmou ciência e os registros de retrabalho. Esse arquivo não pode
   sumir num reinício.
4. **Ser atualizável pelos estagiários** sem virar um projeto a cada ajuste.

---

## Opção 1 — Serviço de publicação automática

*Exemplos: Render, Railway, Fly.io*

**Como funciona:** o código fica guardado no GitHub. Quando os estagiários salvam
uma versão nova, o serviço percebe e publica sozinho, em poucos minutos.

| Vantagens | Desvantagens |
|---|---|
| Não existe servidor para administrar — nem atualização de sistema, nem configuração de segurança | Custo mensal fixo, mesmo em mês parado |
| O endereço seguro (cadeado) sai automático | Depende de uma empresa de fora continuar existindo e mantendo o preço |
| Publicar uma correção leva minutos e é feito por quem já mexe no código | Menos controle: o que o serviço não oferecer, não tem como forçar |
| Se o sistema travar, ele sobe de novo sozinho | Exige contratar o **plano pago** (ver a pegadinha adiante) |

**Custo:** cerca de **R$ 30 a 60 por mês** — R$ 360 a 720 por ano.
**Esforço dos estagiários:** baixo. Configuração inicial de umas 2 horas; depois, quase nada.

---

## Opção 2 — Servidor virtual próprio (VPS)

*Exemplos: Hetzner, Contabo, Hostinger, DigitalOcean*

**Como funciona:** a empresa aluga um computador na internet e instala tudo nele.

| Vantagens | Desvantagens |
|---|---|
| Mais barato que a opção 1 | **Tudo é responsabilidade da empresa:** atualização de segurança, certificado, monitoramento |
| Controle total — dá para instalar o que quiser | Se sair do ar de madrugada, alguém precisa perceber e resolver |
| Não prende a empresa a um fornecedor específico | Configuração inicial mais longa e mais técnica |
| Bom aprendizado para os estagiários de Sistemas | Quando os estagiários saírem, o conhecimento sai junto |

**Custo:** cerca de **R$ 25 a 50 por mês** — R$ 300 a 600 por ano.
**Esforço dos estagiários:** médio e **contínuo**. É a diferença principal para a opção 1.

---

## Opção 3 — Computador do próprio escritório

**Como funciona:** o sistema roda numa máquina da empresa, e um programa gratuito
(Cloudflare Tunnel) abre o acesso pela internet.

| Vantagens | Desvantagens |
|---|---|
| Custo de hospedagem zero | **Depende do computador ficar ligado.** Alguém desligou na sexta, a obra fica sem consulta no sábado |
| Os dados nunca saem da empresa | Depende da internet do escritório — se cair, o canteiro fica sem acesso |
| Não depende de fornecedor nenhum | Se o disco desse computador queimar, os dados vão junto (a menos que o backup esteja mesmo funcionando) |
| Serve bem para testar antes de decidir | Ruim para uma ferramenta que se propõe a ser a fonte única da verdade |

**Custo:** **R$ 0** de hospedagem (usa energia e um computador que já existe).
**Esforço dos estagiários:** médio a alto — e o risco não é técnico, é humano.

---

## Opção 4 — Nuvem grande

*Google Cloud, AWS, Azure*

**Como funciona:** a mesma infraestrutura usada por empresas grandes.

| Vantagens | Desvantagens |
|---|---|
| Combina com o Google Workspace que a empresa já usa | **Desproporcional para 10 pessoas e 4 obras** |
| Escala sem limite se a empresa crescer muito | Cobrança por uso, difícil de prever — a conta pode surpreender |
| Serviços prontos para tudo | Exigiria trocar o banco atual por um banco pago, subindo custo e complexidade |
| | A configuração é a mais técnica das quatro |

**Custo:** variável e difícil de estimar — depende de configuração.
**Esforço dos estagiários:** alto.

---

## Comparação lado a lado

| | Custo por ano | Fica sempre no ar? | Trabalho dos estagiários | Risco principal |
|---|---|---|---|---|
| **1. Publicação automática** | R$ 360–720 | Sim | **Baixo** | Depender de fornecedor de fora |
| **2. Servidor próprio** | R$ 300–600 | Sim, se cuidarem | Médio e contínuo | Ninguém perceber que caiu |
| **3. Computador do escritório** | R$ 0 | **Não garantido** | Médio-alto | Alguém desligar a máquina |
| **4. Nuvem grande** | Variável | Sim | Alto | Custo imprevisível |

---

## ⚠️ A pegadinha do plano gratuito

Render e Railway têm plano grátis, e é tentador. Mas nele:

- o sistema **dorme** depois de alguns minutos sem uso — quem abrir no canteiro
  espera meio minuto para a tela carregar, e vai desistir;
- o disco é **apagado a cada publicação** — as confirmações de ciência e os
  registros de retrabalho somem.

Para este sistema, o plano gratuito não serve. Se a escolha for a opção 1, tem
que ser o plano pago.

---

## Recomendação

**Opção 1 — serviço de publicação automática, plano pago.**

Três motivos:

1. **A manutenção é o ponto fraco desta escolha inteira.** A empresa optou por
   construir sob medida com dois estagiários mantendo. A opção 1 é a que menos
   pede deles: não há servidor para administrar, e publicar uma correção é
   salvar o código.
2. **A diferença de preço para a opção 2 é pequena** — algo como R$ 10 a 20 por
   mês — e o que se compra com ela é justamente o trabalho recorrente que a
   empresa não tem quem faça.
3. **A opção 3 contradiz o objetivo.** Um sistema que existe para ser a fonte
   única da verdade não pode depender de alguém não ter desligado um computador.

**Para colocar em perspectiva:** a hospedagem custa por ano menos do que um único
retrabalho por versão errada. Quando o custo real da pavimentação for levantado
com a obra, vale colocar os dois números lado a lado na mesma tela.
*(O valor que aparece hoje no protótipo é fictício — não use na apresentação
como se fosse real.)*

---

## O que essa decisão destrava

Três coisas dependem dela e estão paradas até lá:

1. **Login com a conta Google da Promav.** O Google exige registrar um endereço
   fixo de retorno, e esse endereço só existe depois de escolher onde hospedar.
2. **Teste de verdade no celular no canteiro**, com internet real em vez da rede
   do escritório.
3. **Backup automático do banco para o Google Drive** — depende de onde o sistema
   estiver rodando.

---

## Se a empresa crescer

A recomendação vale para o tamanho de hoje: 10 pessoas, 4 obras. Se em dois ou
três anos forem dezenas de obras simultâneas e uma equipe de TI própria, vale
reabrir a discussão — tanto para migrar para servidor próprio quanto para
reconsiderar uma plataforma pronta de mercado, como está discutido em
[AVALIACAO.md](AVALIACAO.md).
