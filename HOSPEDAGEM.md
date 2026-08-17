# Onde hospedar o sistema

> Material para apresentar à direção. A decisão fica para depois da
> apresentação do protótipo.
>
> **Nota da migração (14/08/2026):** o sistema agora tem um frontend em React
> que precisa ser compilado no deploy — `npm run build` faz tudo (instala as
> dependências do frontend e compila; depois é só `node servidor.js`). Isso
> **não muda a recomendação** — os serviços de publicação automática (opção 1)
> detectam e rodam o `npm run build` padrão; na VPS (opção 2) são duas linhas
> a mais no script de deploy.

---

## A decisão, em uma frase

Hoje o sistema roda num computador só, ligado à mão. Para virar ferramenta de
trabalho, ele precisa de um lugar onde fique **ligado o tempo todo e acessível
pela internet** — e que, quando o celular voltar ao escopo, alcance também o
canteiro. São quatro caminhos, de R$ 0 a cerca de R$ 720 por ano — só a
nuvem grande, a quarta, não tem teto previsível.

## O que o sistema precisa desse lugar

Sem termo técnico, é isto:

1. **Ficar ligado sempre.** Se sair do ar num sábado, a equipe não confere a
   orientação mais recente e volta ao WhatsApp — que é justamente o que
   estamos tentando eliminar.
2. **Ser aberto pela internet**, com endereço seguro (o cadeado do navegador),
   para funcionar fora do escritório.
3. **Não perder os dados.** O sistema guarda um banco de dados com todas
   as orientações, quem confirmou ciência e o andamento de cada obra. Esse
   banco não pode sumir num reinício.
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
| Custo de hospedagem zero | **Depende do computador ficar ligado.** Alguém desligou na sexta, a equipe fica sem consulta no sábado |
| Os dados nunca saem da empresa | Depende da internet do escritório — se ela cair, o acesso de fora cai junto |
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
| Combina com o Google que a empresa já usa (Drive, Gmail) | **Desproporcional para 8 usuários e 4 obras** |
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

- o sistema **dorme** depois de alguns minutos sem uso — quem abrir espera
  meio minuto para a tela carregar, e vai desistir;
- o disco é **apagado a cada publicação** — as orientações e as confirmações
  de ciência somem.

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
2. **A diferença de preço para a opção 2 é pequena** — algo como R$ 5 a 10 por
   mês — e o que se compra com ela é justamente o trabalho recorrente que a
   empresa não tem quem faça.
3. **A opção 3 contradiz o objetivo.** Um sistema que existe para ser a fonte
   única da verdade não pode depender de alguém não ter desligado um computador.

**Para colocar em perspectiva:** a hospedagem custa por ano menos do que um
único serviço refeito por informação velha — o caso da pavimentação que
motivou o sistema. O custo real daquele episódio ainda não foi levantado com
a obra (é pergunta em aberto em [PENDENCIAS.md](PENDENCIAS.md)); quando for,
vale colocar os dois números lado a lado.

---

## O que essa decisão destrava

Três coisas dependem dela e estão paradas até lá — a mesma lista da Parte 3
do [PENDENCIAS.md](PENDENCIAS.md):

1. **Login com a conta Google (R16).** O Google exige registrar um endereço
   fixo de retorno, e esse endereço só existe depois de escolher onde hospedar.
2. **Envio do e-mail de aviso (R18).** O texto está pronto no código; o canal
   de envio e o endereço do link "abrir no sistema" esperam a decisão.
3. **O destino final do backup automático.** A cópia periódica local já
   existe (a cada 6 horas, dentro do sistema); para onde ela desemboca fora
   do disco depende de onde o sistema estiver rodando.

---

## Se a empresa crescer

A recomendação vale para o tamanho de hoje: 10 pessoas na empresa, 8 delas
com conta no sistema, 4 obras. Se em dois ou
três anos forem dezenas de obras simultâneas e uma equipe de TI própria, vale
reabrir a discussão — tanto para migrar para servidor próprio quanto para
reconsiderar uma plataforma pronta de mercado, como está discutido em
[AVALIACAO.md](AVALIACAO.md).
