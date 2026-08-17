# Promav — Gestão de projetos

Sistema interno da Promav (construtora, 8 pessoas) para **acompanhar as
mudanças de cada projeto e garantir que elas cheguem em quem executa**:

> toda mudança relevante vira uma **orientação** — com título, data, descrição
> e quem vai fazer — que automaticamente vira uma **atividade** no quadro e
> **avisa** a equipe da obra. Fica registrado quem viu e quando.

O nome exibido ("Promav") mora num único lugar: `NOME_EXIBICAO` em
[src/config.js](src/config.js).

> **Vai mexer no código?** Comece por
> [PARA-DESENVOLVEDORES.md](PARA-DESENVOLVEDORES.md).
> **Quer saber o que foi decidido e o que está em aberto?**
> [PENDENCIAS.md](PENDENCIAS.md) e
> [REQUISITOS-COBERTOS.md](REQUISITOS-COBERTOS.md).

---

## Como rodar

Precisa de **Node.js 22.5 ou mais novo**. Na primeira vez numa máquina nova,
instale as dependências do frontend:

```bash
npm --prefix frontend install
```

(Para rodar o `npm run test:ui` nessa máquina, uma vez só:
`npx --prefix frontend playwright install chromium` — baixa o navegador do
teste.)

Depois, para usar o sistema:

```bash
npm run app:build
```

```bash
node servidor.js
```

Abra **http://localhost:3000**. Na primeira execução ele cria sozinho os dados
de teste. O terminal também imprime o endereço da rede do escritório, separando
o que serve do que é VPN/máquina virtual.

Para recomeçar do zero (**pare o servidor antes**, Ctrl+C):

```bash
npm run recomecar
```

Para conferir que o servidor está inteiro — 200 verificações automáticas
(API + backup), sem tocar nos dados da demonstração:

```bash
npm test
```

Para conferir o frontend de verdade — 6 cenários no navegador, sobre o build
real, num banco descartável:

```bash
npm run test:ui
```

Para tirar uma cópia do banco agora (uma sai sozinha a cada 6 horas com o
servidor no ar, para `dados/backups/`):

```bash
npm run backup
```

### Para desenvolver o frontend

```bash
npm run app
```

Sobe o Vite em `http://localhost:5173` com recarga automática, repassando
`/api` para o servidor em `:3000` (deixe o `node servidor.js` rodando ao lado).
O `npm run app:build` compila para `dist/`, que o servidor serve sozinho.

### Se não subir

| O que aparece | O que fazer |
|---|---|
| "O Node.js instalado é antigo demais" | Instale a LTS de [nodejs.org](https://nodejs.org) e **feche e reabra o terminal**. |
| "Não encontrei os arquivos do sistema" | O terminal está noutra pasta. Abra-o na pasta do `servidor.js`. |
| "A porta 3000 já está ocupada" | O sistema já roda em outra janela — use aquela. |
| A raiz mostra "o aplicativo ainda não foi compilado" | Falta o build: `npm run app:build`. |
| `'node' não é reconhecido` | Node.js não está instalado nesta máquina. |

---

## O que o sistema faz

Entrando como pessoas diferentes (o seletor no rodapé da barra lateral — no
protótipo não há senha):

**Na tela inicial**
- as **notificações**: mudanças que você ainda não confirmou, compromissos que
  marcaram para você, atividades em que você foi marcado;
- os **projetos ativos** em que você trabalha, com busca por nome ou código;
- o **calendário da semana**: clicar num dia marca reunião ou visita técnica —
  e coordenação e direção marcam para qualquer pessoa, caindo direto na
  agenda dela.

**Na página do projeto**
- as **informações atuais**: a última orientação publicada, com quem confirmou
  que viu (e quem falta), o selo de aval quando mexe em orçamento/prazo, e o
  botão "Confirmo que vi";
- **publicar uma mudança** (engenharia, arquitetura, coordenação e direção):
  ela vira atividade no quadro e avisa a equipe, num ato só;
- o **histórico** em dropdown, para comparar com orientações antigas — útil
  quando o cliente pede em reunião algo que altera o projeto;
- o **andamento** (o que fiz, dificuldade, dúvida em aberto) e a **ficha**
  (cliente, contrato, prazos, pasta no Drive, caminho de rede com copiar,
  equipe, e a placa ⚑ para avisar a coordenação de cadastro errado).

**Na aba Atividades**
- o **quadro** (Não iniciado → Em execução → Revisão → Finalizado), arrastável
  com mouse; as datas de início e fim são do sistema, nunca digitadas.

**Em Aprovações** (só CEO e coordenação)
- a fila de mudanças que mexem em orçamento ou prazo. O aval é **registro, não
  portão**: o trabalho não espera por ele.

### As regras que seguram tudo

- **Equipe é uma lista com dois usos:** quem está nela vê o projeto E é avisado
  quando ele muda. Quem não está, nem vê, nem recebe — inclusive quem saiu.
- **Publicar é um ato triplo:** grava a orientação, cria a atividade, avisa a
  equipe. Não existe "esquecer de avisar".
- **Editar uma orientação reabre a ciência de todos** — se o texto mudou,
  "eu vi" precisa ser dito de novo.
- Confirmar ciência **registra, mas não bloqueia** ninguém de trabalhar.

---

## A stack, e por quê

| Peça | Escolha | Motivo |
|---|---|---|
| Servidor | Node.js puro (`node:http`), **zero dependências** | roda em qualquer máquina/hospedagem; não apodrece parado |
| Banco | SQLite embutido (`node:sqlite`) | um arquivo; backup automático a cada 6 h (`dados/backups/`) |
| API | JSON em `/api/*` (30 rotas) | contrato limpo para o frontend e para as verificações |
| Frontend | **React + Vite** (`frontend/`) | decisão de 13/08/2026, seguindo o modelo visual aprovado; é o padrão que o time de TI vai encontrar no mercado |
| Visual | a paleta do **logotipo oficial** sobre a estrutura do modelo "Promav App" | preto #201E1F e dourado #A68E71, medidos da imagem do logo; Plus Jakarta Sans |

**O custo declarado do React:** `frontend/` tem `node_modules`, build e
dependências para acompanhar — exatamente o que o servidor evita. A troca foi
consciente: interface rica (calendário, quadro, janelas) e familiaridade para
quem vai manter. O servidor continua sem nenhuma dependência.

**Foco no desktop do escritório** (decisão de 13/08/2026). O layout não quebra
em janela estreita, mas o celular não é prioridade nesta fase.

---

## Como o código está organizado

```
servidor.js            confere o ambiente, serve /api/* e o build de dist/
iniciar.bat            atalho de dois cliques no Windows
src/
  config.js            nome exibido, porta, caminhos
  persistencia/
    banco.js           conexão e esquema do SQLite   ┐ os únicos dois
    repositorio.js     todas as consultas            ┘ arquivos com SQL
    seed.js            dados de teste (o caso da pavimentação)
  regras/              as decisões de negócio, uma por arquivo
  api/                 as 30 rotas JSON, por área
ferramentas/           backup manual e o servidor do smoke test
frontend/              o aplicativo React (Vite)
  src/telas/           Início, Projeto, Quadro, Aprovações
  smoke/               os 6 cenários de navegador (npm run test:ui)
verificacao/           as 200 verificações (npm test)
dados/                 criado ao rodar: banco.db e backups/
dist/                  o build do frontend (gerado; fora do git)
```

Três regras de organização:

1. **Só `banco.js` e `repositorio.js` conhecem SQL.** Trocar de banco depois é
   reescrever esses dois arquivos.
2. **`src/regras/` guarda o que a empresa pode mudar de ideia** — quem vê o quê,
   quem publica, quem aprova, o vocabulário do cadastro. Um arquivo por regra,
   com o porquê escrito ao lado.
3. **O frontend não decide nada de negócio.** A API manda os rótulos prontos e
   os "pode fazer" calculados; o React só pinta e chama.

---

## Limites conhecidos

Ditos abertamente, para ninguém confundir protótipo com sistema pronto:

- **Não há senha.** O "entrar como" existe para demonstrar os papéis. O login
  com a conta Google está decidido e espera a hospedagem (ver PENDENCIAS).
  Enquanto isso, o cookie de sessão é **assinado** (não dá para forjar uma
  identidade sem passar pela troca, que fica registrada: quem era, quem
  virou, de que endereço), virar quem aprova pede confirmação, e o cookie
  morre com o navegador (atenção: o "continuar de onde parei" do Chrome pode
  restaurá-lo). Ciência e aval valem como fluxo, não como prova.
- **O aviso não sai por e-mail ainda.** O texto do modelo e o remetente já
  estão no código; o envio depende da hospedagem.
- **Roda numa máquina só.** O backup local é automático (a cada 6 horas, em
  `dados/backups/`, mais um snapshot de despedida antes do `recomecar`); o
  que ainda falta é o destino FORA do disco — a pasta do Drive para desktop
  (variável `PASTA_BACKUP_ESPELHO`) ou a hospedagem.
- **Os nomes são reais, o histórico é fictício** — montado para a demonstração.
- **O sistema não mede mais retrabalho.** O registro de incidentes (R11) foi
  removido em 13/08/2026 por decisão de produto — ver o aviso em
  [REQUISITOS-COBERTOS.md](REQUISITOS-COBERTOS.md).
