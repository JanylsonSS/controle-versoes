# controle-versoes (Promav)

> ⚠️ **EM MIGRAÇÃO (13–14/08/2026), passo 2 concluído.** O domínio virou
> **orientações** (mudança com título, data, descrição e responsável, que
> vira atividade sozinha), a camada web é uma **API JSON** (`src/api/`) e o
> frontend é **React + Vite** (`frontend/`), com o visual do modelo Promav.
>
> **Como rodar hoje:**
> ```
> npm run app:build     # compila o frontend para dist/ (1ª vez: npm install em frontend/)
> node servidor.js      # sobe tudo em http://localhost:3000
> ```
> Para desenvolver o frontend com recarga automática: `npm run app` (Vite em
> :5173, com a API em :3000 rodando ao lado). `npm test` verifica a API.
> **As seções antigas deste README sobre telas HTML seguem desatualizadas** e
> serão reescritas ao fim da migração.

Sistema de gestão de projetos de uma construtora de 8 pessoas. O nome exibido
("Promav") mora num único lugar: `NOME_EXIBICAO` em [src/config.js](src/config.js).

> **Vai mexer no código?** Comece por
> [PARA-DESENVOLVEDORES.md](PARA-DESENVOLVEDORES.md) — arquitetura, modelo de
> dados, onde mexer para cada tipo de mudança, e as armadilhas que já custaram
> tempo.

> **Isto é um protótipo para validação, não o sistema de produção.**
> O que ele faz e o que ele ainda não faz está em
> [REQUISITOS-COBERTOS.md](REQUISITOS-COBERTOS.md). O que já foi decidido, os
> requisitos novos e o que ainda falta definir estão em
> [PENDENCIAS.md](PENDENCIAS.md). A discussão de comprar pronto vs. construir
> está em [AVALIACAO.md](AVALIACAO.md), e as opções de onde hospedar em
> [HOSPEDAGEM.md](HOSPEDAGEM.md).

---

## Como rodar

Precisa apenas do **Node.js 22.5 ou mais novo** instalado. Nada mais — sem
`npm install`, sem `node_modules`.

**No Windows:** dê dois cliques em `iniciar.bat`.

**Em qualquer sistema**, pelo terminal aberto **dentro da pasta do projeto**:

```bash
node servidor.js
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:3000`).
Na primeira execução ele cria sozinho os dados de teste.

Para começar do zero, apagando tudo o que foi feito na demonstração
(**pare o servidor antes**, com Ctrl+C):

```bash
npm run recomecar
```

Para conferir que o sistema está inteiro — 251 verificações automáticas, em uns
20 segundos, sem tocar nos dados da demonstração:

```bash
npm test
```

### Se não subir

O sistema tenta explicar sozinho o que houve. Os três casos comuns:

| O que aparece | O que fazer |
|---|---|
| "O Node.js instalado é antigo demais" | Instale a versão LTS de [nodejs.org](https://nodejs.org). **Feche e reabra o terminal** depois — sem isso ele continua enxergando a versão antiga. |
| "Não encontrei os arquivos do sistema" | O terminal está em outra pasta. Abra-o dentro da pasta que contém o `servidor.js`. |
| "A porta 3000 já está ocupada" | O sistema já está rodando em outra janela. Use aquela, ou feche-a com Ctrl+C. |

Se aparecer `node: command not found` ou `'node' não é reconhecido`, o Node.js
não está instalado nesta máquina.

### Abrir no celular

Ao subir, o terminal imprime o endereço de rede sob **"No celular (mesma rede
Wi-Fi)"**. Com o celular na mesma Wi-Fi do computador, esse endereço abre o
sistema no telefone — é assim que se demonstra a conferência de versão no
canteiro.

O computador quase sempre tem **mais de um endereço**, e só um serve. Por isso o
sistema separa: o que funciona aparece sob "No celular", e os de VPN, Docker ou
máquina virtual aparecem embaixo de "Ignore estes". Usar o endereço errado é a
causa nº 1 de "o celular não abre".

**Se mesmo com o endereço certo não abrir**, na ordem:

| Causa | O que fazer |
|---|---|
| **VPN ligada** no computador | Desligue. Muitas (NordVPN, ProtonVPN…) bloqueiam o acesso entre aparelhos da mesma rede. |
| **Firewall do Windows** | Na primeira vez, o Windows pergunta se libera o Node. Se você clicou em "Cancelar", libere em *Firewall do Windows → Permitir um aplicativo* → Node.js, marcando **Rede privada**. |
| **Redes diferentes** | O celular pode estar na rede de visitante, ou em 4G. Confira que é a mesma Wi-Fi. |
| **Rede de visitante isola aparelhos** | Muitos roteadores de escritório impedem que aparelhos se enxerguem. Aí só trocando de rede. |

---

## A stack, e por quê

| Peça | Escolha | Motivo |
|---|---|---|
| Linguagem / servidor | Node.js puro (`node:http`) | Já vem instalado em qualquer máquina de escritório e roda em qualquer hospedagem barata |
| Banco | SQLite embutido (`node:sqlite`) | Um arquivo só. Backup é copiar o arquivo. Sem servidor de banco para administrar |
| Telas | HTML gerado no servidor | Funciona em qualquer celular, inclusive os fracos do canteiro; sem tela branca esperando carregar |
| Estilo | um arquivo CSS | Sem compilação |
| **Dependências** | **nenhuma** | ver abaixo |

**Por que zero dependências.** A avaliação apontou que o maior risco desta opção
não é construir — é manter, numa empresa sem TI. Um projeto sem dependências não
tem `npm install` que quebra, não tem pacote que sai do ar, não tem atualização
de segurança para acompanhar e não apodrece parado. Daqui a dois anos, `node
servidor.js` ainda vai subir. Isso valeu mais do que a conveniência de um
framework — o sistema é pequeno o bastante para não precisar de um.

**O que isso custa.** Sem framework, o roteamento e a leitura de formulários são
escritos à mão — cerca de 60 linhas, na seção "Encanamento" de
[src/web/roteador.js](src/web/roteador.js). É código simples, mas é código nosso
para manter. Se um dia o sistema crescer muito além destes requisitos, trocar
por Express é meia hora de trabalho.

---

## Como o código está organizado

```
servidor.js                  sobe o servidor
src/
  config.js                  nome exibido, porta, caminhos  ← trocar o nome AQUI
  persistencia/
    banco.js                 conexão e esquema do SQLite    ┐ os únicos dois
    repositorio.js           todas as consultas             ┘ arquivos com SQL
    seed.js                  dados de teste (a história do diagnóstico)
    pdf-exemplo.js           gera os PDFs fictícios da demonstração
  regras/
    papeis.js                R9  — quem pode publicar, aprovar e cadastrar
    visibilidade.js          R19 — quem vê qual projeto
    notificacao.js           R5  — quem é avisado
    ciencia.js               R6  — como funciona a ciência e o que ela trava
    cadastro.js              R21 — situação e tipo de obra (o vocabulário)
    aprovacao.js             R17 — o que é alteração grande e quem dá o aval
    atividades.js            R25 — colunas do quadro e as datas automáticas
    aviso-email.js           R18 — o modelo do e-mail (envio ainda não existe)
  web/
    roteador.js              as rotas
    html.js                  escapar texto, formatar datas e valores
    paginas/                 uma tela por arquivo
publico/                     estilo.css, copiar.js e quadro.js
verificacao/                 as 251 verificações automáticas (npm test)
dados/                       criado ao rodar: banco.db + arquivos enviados
```

Três decisões de organização que valem explicar:

1. **Só `banco.js` e `repositorio.js` conhecem SQL.** As telas pedem dados ao
   repositório e não sabem onde eles estão guardados. Trocar SQLite por um banco
   de verdade depois é reescrever esses dois arquivos — nada mais.

2. **`src/regras/` guarda as decisões de negócio que ainda podem mudar.** Cada
   regra é um arquivo, com o motivo da escolha escrito ao lado. Quando a equipe
   mudar de ideia, a alteração é nesse arquivo e em mais nenhum.

   Vale destacar uma: **a equipe do projeto é uma lista só, com dois usos** —
   ela decide quem *vê* o projeto (`visibilidade.js`) e quem é *avisado* quando
   ele muda (`notificacao.js`). Assim é impossível alguém enxergar um projeto e
   não receber aviso dele, ou o contrário.

3. **Uma tela por arquivo em `web/paginas/`.** Cada arquivo começa dizendo quais
   requisitos aquela tela atende.

---

## O que dá para fazer no sistema

Entrando como pessoas diferentes pelo seletor no topo (é assim que os papéis são
demonstrados — no protótipo não há senha):

- **cadastrar e corrigir um projeto** (cliente, contrato, prazo, situação, tipo,
  link da pasta no Drive) e **definir quem trabalha nele** — só a coordenação e a
  direção (R1, R19, R21)
- **agrupar obras correlatas** num conjunto, para ver todas num lugar só (R22)
- **ver qual versão vale** em cada projeto, sem clicar em nada (R1, R2, R8)
- **abrir o arquivo da versão vigente** com um toque (R1, R8)
- **publicar uma revisão nova** — engenharia, arquitetura, coordenação e direção
  (R3, R9)
- **aprovar alteração grande** — se a revisão muda orçamento ou prazo, ela só
  passa a valer depois do aval da direção ou da coordenação, e ninguém aprova a
  própria (R17)
- **ver apenas os projetos em que você trabalha** — quem não está na equipe nem
  enxerga, nem é avisado (R19)
- **ser avisado automaticamente** quando alguém publica no seu projeto (R5)
- **confirmar que viu** uma versão, ficando registrado quem e quando — **sem
  confirmar, o arquivo não abre** (R6)
- **registrar o andamento do trabalho** — o que fiz, onde travei, que dúvida
  ficou — sem que isso vire uma versão nova (R23)
- **acompanhar as atividades num quadro** arrastável (Não iniciado · Em execução
  · Revisão · Finalizado), na aba Atividades do projeto (R25)
- **navegar o histórico** — versões antigas ficam marcadas como tal, e abrir uma
  delas fica registrado (R3, R8)
- **marcar uma versão como cancelada**, com motivo (R4)
- **registrar retrabalho** causado por versão errada, com custo e horas (R11)

---

## Roteiro para demonstrar em 15 minutos

Os dados de teste já contam a história do diagnóstico. O sistema abre como
**Álvaro Abrantes (Engenharia)**.

> O histórico dos dados de teste é **fictício** — quem publicou o quê e quem
> confirmou foi montado para a demonstração. Vale dizer isso à equipe na
> abertura, para ninguém levar a mal aparecer como quem não confirmou.

1. **A tela inicial.** A Pavimentação da Praça do Ginásio aparece primeiro,
   porque tem uma versão nova que ele ainda não viu. A versão vigente (R03) está
   escrita ali, sem precisar procurar.
2. **Abrir a Pavimentação.** No topo: *"Execute por esta — R03: removida a
   calçada no trecho leste"*. Logo abaixo, **3 de 5 confirmaram que viram** — e
   os dois que faltam são justamente a engenharia. É a falha que custou o
   serviço, agora visível.
3. **Rolar a mesma tela.** No fim: o retrabalho de 18/06, R$ 18.400 e 24 horas
   refazendo, ligado à R02 — a versão pela qual a obra estava trabalhando.
   *(Este valor ainda é fictício — ver [PENDENCIAS.md](PENDENCIAS.md).)*
4. **Clicar em "Confirmo que vi a R03".** Passa a 4 de 5, com data e hora.
   Perguntar à equipe: *isso resolveria o "eu não fui avisado"?*
5. **Abrir a R02 no histórico.** A tela inteira avisa que aquela versão não vale
   e oferece o caminho de volta. E registra quem abriu.
6. **Trocar para Lya Melo (Arquitetura) e publicar uma R04.** Antes de publicar,
   a tela mostra quem será avisado. Depois de publicar, **trocar de volta para
   Álvaro** — o aviso já está lá.
7. **Trocar para Micael Machado (Orçamento)** e tentar publicar: o sistema
   recusa. Publicar é de quem projeta.
8. **Abrir o mesmo endereço no celular** e refazer o passo 2.

As perguntas que valem levar: *o aviso deveria ir para todo mundo ou só para
quem tem a ver com aquele projeto? O que conta como "alteração grande" que
precisa do aval do CEO ou da Thayna? Quanto tempo a obra leva para absorver uma
mudança?* Todas estão em [PENDENCIAS.md](PENDENCIAS.md).

---

## Limites conhecidos deste protótipo

Ditos abertamente, para ninguém confundir protótipo com sistema pronto:

- **Não há senha.** O seletor "você está como" existe para demonstrar papéis. O
  login com a conta Google da Promav já está decidido, mas depende da escolha de
  hospedagem — ver [HOSPEDAGEM.md](HOSPEDAGEM.md).
- **O aviso não sai por e-mail ainda.** O texto do modelo e a conta remetente
  estão guardados no código; falta o envio, que depende da hospedagem.
- **O aviso não sai do sistema.** Ele aparece dentro do próprio sistema; não vai
  por e-mail nem por WhatsApp. A decisão de por onde avisar depende da conversa
  com a obra — ver [PENDENCIAS.md](PENDENCIAS.md).
- **Roda em um computador só**, sem hospedagem e sem backup automático. O R14
  (confiável e sempre disponível) não está atendido nesta rodada.
  ⚠️ **O GitHub sozinho não resolve isso:** ele versiona o código, mas não guarda
  o banco (`dados/banco.db`) nem os arquivos de projeto. O backup do banco
  precisa ser uma cópia diária para o Drive da empresa.
- **Os arquivos ficam em `dados/arquivos`.** Já foi decidido que, em produção,
  eles vão para o Google Drive compartilhado que a empresa já usa, e o sistema
  guarda só o controle e o link.
- **As pessoas são reais; o histórico é fictício.** Quem publicou o quê, quem
  confirmou e quando foi montado para a demonstração. Os R$ 18.400 e as 24 horas
  da pavimentação também — esse número precisa vir da obra.
