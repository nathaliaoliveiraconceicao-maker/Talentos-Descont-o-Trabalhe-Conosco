# Talentos Descontão — Trabalhe Conosco

Portal de pré-candidatura do **Supermercado Descontão**. Substitui a coleta inicial de
informações feita na entrevista presencial: o candidato preenche seus dados
antecipadamente (via QR Code, link na bio do Instagram ou WhatsApp) e a equipe de
recrutamento analisa, filtra e seleciona os melhores perfis antes de convocá-los.

> ⚠️ Este repositório foi desenvolvido com **dados fictícios**. Nenhuma informação real
> de candidatos foi utilizada durante o desenvolvimento.

## Sumário

- [Tecnologias](#tecnologias)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [1. Instalação](#1-instalação)
- [2. Configuração do Firebase](#2-configuração-do-firebase)
- [3. Executando localmente](#3-executando-localmente)
- [4. Criando o primeiro administrador](#4-criando-o-primeiro-administrador)
- [5. Cadastrando outros administradores](#5-cadastrando-outros-administradores)
- [6. Populando dados fictícios para teste](#6-populando-dados-fictícios-para-teste)
- [7. Publicando a aplicação](#7-publicando-a-aplicação)
- [8. Inserindo a logomarca oficial](#8-inserindo-a-logomarca-oficial)
- [9. Segurança e LGPD](#9-segurança-e-lgpd)
- [10. Sistema de pontuação](#10-sistema-de-pontuação)
- [11. Área administrativa (RH)](#11-área-administrativa-rh)
- [12. Coleções e campos do Firestore](#12-coleções-e-campos-do-firestore)
- [Checklist final de testes](#checklist-final-de-testes)

## Tecnologias

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Firebase (Authentication, Firestore, Storage)
- Recharts (gráficos do dashboard)
- Lucide Icons

## Estrutura de pastas

```
├── public/
│   ├── favicon.svg
│   └── logo-placeholder.svg        # área reservada para a logomarca oficial
├── scripts/
│   ├── firebaseAdmin.ts            # inicialização do Firebase Admin SDK
│   ├── createAdmin.ts              # cria administradores (Auth + Firestore)
│   └── seedMockData.ts             # popula candidatos fictícios para teste
├── src/
│   ├── components/
│   │   ├── admin/                  # componentes da ficha/lista de candidatos
│   │   ├── layout/                 # Header, Footer, Logo, AdminLayout, PublicLayout
│   │   └── ui/                     # componentes reutilizáveis (Button, Card, Input…)
│   ├── context/                    # AuthContext (admin) e FormContext (candidatura)
│   ├── data/                       # listas estáticas (áreas, escolaridade)
│   ├── hooks/                      # useLocalStorage, useCandidates
│   ├── lib/                        # firebase.ts, validators, masks, scoring, APIs
│   ├── pages/
│   │   ├── Application/            # formulário de 9 etapas + confirmação
│   │   └── admin/                  # login, dashboard, lista, ficha, relatórios,
│   │                                 banco de talentos, configurações
│   ├── router/                     # ProtectedRoute
│   └── types/                      # tipos TypeScript (candidate, admin)
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
├── vercel.json
└── .env.example
```

## Pré-requisitos

- Node.js 18 ou superior
- Uma conta no [Firebase](https://console.firebase.google.com/) com um projeto criado
- (Opcional, para os scripts de admin/seed) uma **chave de conta de serviço** do Firebase

## 1. Instalação

```bash
git clone <url-do-repositorio>
cd talentos-descontao
npm install
```

## 2. Configuração do Firebase

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com/).
2. Ative os produtos:
   - **Authentication** → método "E-mail/senha".
   - **Firestore Database** → modo produção.
   - **Storage**.
3. Em **Configurações do projeto > Geral > Seus apps**, crie um app Web e copie as
   credenciais.
4. Copie o arquivo de exemplo e preencha com suas credenciais:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

5. Publique as regras de segurança (requer o [Firebase CLI](https://firebase.google.com/docs/cli)):

   ```bash
   npm install -g firebase-tools
   firebase login
   cp .firebaserc.example .firebaserc   # e edite com o ID do seu projeto
   firebase deploy --only firestore:rules,storage:rules
   ```

## 3. Executando localmente

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

- Portal público: `http://localhost:5173/`
- Formulário de candidatura: `http://localhost:5173/candidatura`
- Área administrativa (RH): `http://localhost:5173/admin` (redireciona para
  `/admin/login` ou `/admin/dashboard`, conforme o estado de autenticação)

## 4. Criando o primeiro usuário do RH (administrador)

Os usuários administrativos **não se cadastram pela interface** — isso evita que
qualquer pessoa se auto-promova a administrador. A criação é feita por um script Node
com o **Firebase Admin SDK**, que tem privilégios elevados.

1. No Console do Firebase, vá em **Configurações do projeto > Contas de serviço** e
   clique em **Gerar nova chave privada**. Um arquivo `.json` será baixado.
2. Salve esse arquivo como `serviceAccountKey.json` na raiz do projeto (ele já está no
   `.gitignore` e nunca deve ser commitado), **ou** defina a variável de ambiente
   `GOOGLE_APPLICATION_CREDENTIALS` apontando para o caminho do arquivo.
3. Rode o script interativo:

   ```bash
   npm run create-admin
   ```

4. Informe nome, e-mail, senha temporária e escolha o **papel de acesso**
   (`admin` ou `rh`). O script cria o usuário no Firebase Authentication e o
   documento correspondente em `admins/{uid}` no Firestore, com `active: true`.
5. Acesse `/admin/login` com o e-mail e senha cadastrados.

> ⚠️ **Erro comum**: criar apenas o documento em `admins/{uid}` no Firestore (pelo
> Console) **não é suficiente** para o login funcionar — é preciso que exista também
> um usuário com esse e-mail/senha no **Firebase Authentication** (aba
> "Authentication > Users" no Console), com o UID do usuário **igual** ao ID do
> documento em `admins/`. Se você criou o documento manualmente e o login está
> retornando "Não existe uma conta com esse e-mail e senha...", é porque falta esse
> usuário no Authentication — use `npm run create-admin` (ele cria os dois de uma vez
> e vincula os UIDs corretamente) ou crie o usuário manualmente em Authentication e
> copie o UID gerado como ID do documento em `admins/`.

## 5. Cadastrando outros administradores/RH

Basta rodar `npm run create-admin` novamente quantas vezes forem necessárias — cada
execução cria um novo usuário administrativo independente, com o papel escolhido na
hora (`admin` ou `rh` — ambos têm o mesmo nível de acesso ao painel hoje; o campo
existe para permitir diferenciação futura). Para revogar o acesso de alguém sem
excluir a conta, edite o campo `active` do documento em `admins/{uid}` no Firestore
para `false` (as regras de segurança exigem `active == true` **e** `role` em
`['admin', 'rh']` para acesso administrativo).

> Se você já tinha administradores criados antes desta versão (sem o campo `role`),
> adicione manualmente `role: "admin"` ao documento correspondente em `admins/{uid}`
> no Firestore, ou rode `npm run create-admin` novamente com o mesmo e-mail — o script
> reaproveita a conta existente no Authentication e atualiza o documento no Firestore.

## 6. Populando dados fictícios para teste

Com a `serviceAccountKey.json` configurada (mesmo passo do item 4):

```bash
npm run seed
```

Isso cria 30 candidatos fictícios com nomes, bairros, áreas, disponibilidades,
experiências e status variados, prontos para testar o dashboard, os filtros e a ficha
do candidato.

## 7. Publicando a aplicação

### Opção A — Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Opção B — Vercel

1. Importe o repositório em [vercel.com](https://vercel.com/).
2. O arquivo `vercel.json` já configura o build (`npm run build`) e o diretório de saída
   (`dist`), com reescrita de rotas para suportar o React Router.
3. Cadastre as variáveis de ambiente do `.env` no painel do projeto na Vercel
   (Settings > Environment Variables).

## 8. Inserindo a logomarca oficial

O arquivo `public/logo-placeholder.svg` traz uma recriação aproximada da identidade
visual (cartão azul com carrinho, faixa vermelha "DESCONTÃO", texto preto
"SUPERMERCADO") — a paleta de cores do projeto (`tailwind.config.js`, cores
`brand.blue`, `brand.red`, `brand.yellow`) já foi ajustada para combinar com ela.
Substitua esse arquivo pelo arquivo oficial em alta resolução assim que disponível
(mantendo o nome `logo-placeholder.svg`), ou aponte o componente
`src/components/layout/Logo.tsx` para um novo arquivo dentro de `public/`. Formatos
recomendados: SVG (preferencial) ou PNG com fundo transparente.

## 9. Segurança e LGPD

- **`firestore.rules`**: candidatos (não autenticados) só podem **criar** uma
  pré-candidatura — nunca listar, ler, alterar ou excluir dados, nem os próprios.
  Somente usuários administrativos autenticados (com documento em `admins/{uid}`,
  `active: true` e `role` em `['admin', 'rh']`) podem ler, atualizar status/avaliações
  e excluir candidatos — o que também cobre o acesso a relatórios, já que eles usam a
  mesma coleção `candidates`. O documento de administrador nunca pode ser criado ou
  editado pelo cliente — apenas via Admin SDK.
- **`storage.rules`**: candidatos podem enviar (`create`) o currículo respeitando tipo e
  tamanho de arquivo; a leitura e exclusão dos arquivos ficam restritas a usuários
  autenticados (ou seja, administradores/RH — candidatos nunca possuem contas no
  Firebase Authentication neste sistema).
- **Política de Privacidade**: disponível em `/politica-de-privacidade`, com linguagem
  simplificada sobre finalidade do tratamento, retenção e direitos do titular.
- **Exclusão de dados por solicitação**: em `/admin/configuracoes`, um administrador
  pode buscar um candidato por nome, e-mail, telefone ou protocolo e excluir
  permanentemente seus dados e currículo.
- **Prazo de retenção**: configurável na mesma tela, para orientar revisões periódicas
  do banco de talentos.

## 10. Sistema de pontuação

A pontuação (`src/lib/scoring.ts`) é calculada automaticamente no envio da candidatura,
com pesos configuráveis pelo administrador em `/admin/configuracoes`:

| Critério | Pontos (padrão) |
| --- | --- |
| Fácil acesso ao local de trabalho | 1 |
| Disponibilidade em diferentes horários | 2 |
| Disponibilidade aos fins de semana | 2 |
| Experiência na área escolhida | 3 |
| Experiência em supermercado | 2 |
| Experiência com atendimento | 1 |
| Pode iniciar imediatamente | 1 |
| Currículo anexado | 1 |
| Respostas profissionais bem preenchidas | 1 |

A pontuação é exibida no painel apenas como **apoio à triagem** — a decisão final sobre
cada candidato deve sempre ser tomada por um recrutador humano, conforme aviso fixo no
dashboard.

## 11. Área administrativa (RH)

A área administrativa (`/admin/*`) é o painel usado pelo setor de RH para analisar as
pré-candidaturas recebidas.

- **`/admin/login`** — login por e-mail/senha. Após autenticar no Firebase, o sistema
  verifica o documento em `admins/{uid}`: o acesso só é liberado se `active == true` e
  `role` for `admin` ou `rh`. Uma conta autenticada mas sem permissão vê uma tela de
  "Acesso não autorizado" com opção de sair e tentar outra conta.
- **`/admin/dashboard`** — cards com total de candidatos, novas candidaturas, em
  análise, pré-selecionados, entrevistas agendadas, aprovados, banco de talentos, não
  selecionados, candidaturas dos últimos 7 dias e do mês atual, além de gráficos por
  função, bairro, experiência e disponibilidade.
- **`/admin/candidatos`** — tabela responsiva com busca unificada (nome, telefone,
  e-mail, bairro) e filtros por status, área, bairro, disponibilidade, primeiro
  emprego, experiência profissional, experiência em supermercado, fins de semana, data
  e pontuação mínima; ordenação por mais recentes/antigos, maior/menor pontuação e
  nome.
- **`/admin/candidatos/:id`** — ficha completa do candidato, com todas as respostas do
  formulário organizadas em seções, avaliação do RH (nota, observações, responsável,
  entrevista com data/horário/local/observações), histórico de status (com status
  anterior, novo status, data/hora, UID e nome de quem alterou), botão de WhatsApp com
  mensagem pronta (convite de entrevista quando já agendada, ou mensagem genérica caso
  contrário — nunca enviada automaticamente), download de currículo, impressão da
  ficha, favoritar e **exclusão de dados mediante solicitação do candidato (LGPD)**.
- **`/admin/relatorios`** — filtro por período (data de/até), taxas de pré-seleção,
  entrevista e aprovação, gráficos por status, área, bairro, escolaridade, experiência,
  primeiro emprego e disponibilidade, e exportação em **CSV**: a exportação padrão não
  inclui observações internas nem avaliações do RH; a exportação completa inclui esses
  dados restritos (use com cuidado).
- **`/admin/banco-de-talentos`** — lista apenas candidatos com status "Banco de talentos",
  com busca, tempo armazenado (baseado na última alteração de status) e destaque para
  quem está próximo do prazo de exclusão (calculado a partir do prazo configurado em
  `/admin/configuracoes`), com opção de reativar para um novo processo (volta o status
  para "Em análise") ou excluir conforme a política de retenção.
- **`/admin/configuracoes`** — pesos do sistema de pontuação, prazo de retenção do
  banco de talentos, e uma ferramenta geral de busca + exclusão de dados por
  solicitação (útil quando o RH não está com a ficha do candidato aberta).

Todas as telas têm estado de carregamento, estado vazio (quando ainda não há
candidatos) e mensagens de erro claras; ações críticas (excluir dados, alterar status)
pedem confirmação antes de executar.

## 12. Coleções e campos do Firestore

O formulário público grava tudo em `candidates`; as demais coleções guardam histórico,
avaliações e configurações. Nenhum campo existente foi renomeado nesta atualização —
apenas foram adicionados campos novos (compatíveis com documentos antigos, que
simplesmente não terão esses campos preenchidos até serem editados pelo RH).

| Coleção | Descrição | Campos principais |
| --- | --- | --- |
| `candidates` | Uma pré-candidatura por documento. | `personal`, `contact` (+`whatsappDigits`), `interest`, `availability`, `experience`, `education`, `profile`, `resume`, `consent`, `protocol`, `status`, `score`, `scoreBreakdown`, `createdAt`, `updatedAt`, `evaluation` (`recruiterNote`, `recruiterRating`, `interviewDate`, `interviewTime`, `interviewLocation`, `interviewNotes`, `responsibleName`, `isFavorite`) |
| `statusHistory` | Log imutável de mudanças de status. | `candidateId`, `status`, `previousStatus`, `changedAt`, `changedBy` (nome), `changedByUid`, `note` |
| `evaluations` | Log imutável de avaliações do RH (auditoria; o estado atual também fica em `candidates.evaluation`). | `candidateId`, campos da avaliação, `updatedBy`, `updatedAt` |
| `admins` | Usuários administrativos (RH/admin). | `uid`, `email`, `name`, `role` (`admin` \| `rh`), `active`, `createdAt` |
| `scoringSettings` | Documento `current` (pesos de pontuação) e `retention` (prazo de retenção do banco de talentos). | `weights`, `talentPoolRetentionMonths`, `updatedAt`, `updatedBy` |
| `jobAreas` | Reservada para expansão futura (hoje as áreas de vaga são uma lista estática em `src/data/jobAreas.ts`). | `id`, `label`, `active` |

Nenhum índice composto do Firestore é necessário: todas as consultas usadas
(`orderBy('createdAt')`, `where('contact.email', '==', …)`,
`where('contact.whatsappDigits', '==', …)`, `where('candidateId', '==', …)`) são de
campo único; filtros, buscas, ordenações e relatórios são todos calculados no cliente
sobre a lista completa de candidatos.

## Checklist final de testes

**Fluxo público**
- [ ] Página inicial carrega corretamente em desktop e mobile.
- [ ] Botão "Quero me candidatar" leva ao formulário.
- [ ] As 9 etapas do formulário navegam corretamente (avançar/voltar).
- [ ] Barra de progresso reflete a etapa atual.
- [ ] Validações obrigatórias impedem avanço com campos vazios/inválidos.
- [ ] Máscara de telefone e validação de e-mail funcionam.
- [ ] Recarregar a página no meio do formulário mantém os dados preenchidos.
- [ ] Ao selecionar "Não" em "já trabalhou antes", os campos de experiência somem.
- [ ] É possível adicionar/remover até 5 experiências profissionais.
- [ ] Upload de currículo aceita PDF/DOC/DOCX/JPG/PNG e recusa arquivos grandes/inválidos.
- [ ] Envio sem currículo funciona normalmente (campo opcional).
- [ ] As duas caixas de consentimento são obrigatórias para enviar.
- [ ] Modal de confirmação aparece antes do envio final.
- [ ] Envio duplicado (mesmo e-mail/telefone em curto período) exibe aviso.
- [ ] Página de confirmação exibe o número de protocolo gerado.
- [ ] Política de Privacidade está acessível pelo rodapé.

**Área administrativa (RH)**
- [ ] `/admin` redireciona para `/admin/login` (sem sessão) ou `/admin/dashboard` (com sessão).
- [ ] Rotas protegidas (`/admin/dashboard`, `/admin/candidatos`, `/admin/relatorios`,
      `/admin/banco-de-talentos`, `/admin/configuracoes`) redirecionam para `/admin/login`
      quando não autenticado.
- [ ] Login com credenciais inválidas exibe mensagem de erro clara.
- [ ] Conta autenticada sem documento em `admins` ativo (ou com `role` diferente de
      `admin`/`rh`) vê a tela de "Acesso não autorizado", não o painel.
- [ ] Estado de carregamento aparece durante a verificação de autenticação.
- [ ] Dashboard exibe todos os cards (incluindo "Não selecionados" e "No mês atual") e
      os 4 gráficos corretamente; mostra estado vazio sem candidatos.
- [ ] Lista de candidatos: busca unificada (nome/telefone/e-mail/bairro) e todos os
      filtros funcionam individualmente e em combinação; as 5 opções de ordenação
      funcionam.
- [ ] Ficha do candidato exibe todas as seções de dados corretamente.
- [ ] Botão do WhatsApp abre o chat com mensagem pré-preenchida (convite de entrevista
      quando já agendada, mensagem genérica caso contrário) — nunca envia automaticamente.
- [ ] Alteração de status atualiza o histórico (status anterior, novo status,
      data/hora, UID e nome do responsável).
- [ ] Agendamento de entrevista salva data/horário/local/observações e muda o status.
- [ ] Avaliação do RH (nota, observações internas, responsável) é salva.
- [ ] Marcar/desmarcar como favorito funciona.
- [ ] Download do currículo funciona quando anexado; impressão da ficha oculta os
      botões de ação.
- [ ] Exclusão de dados (LGPD) funciona tanto pela ficha do candidato quanto pela busca
      em Configurações, com confirmação antes de excluir.
- [ ] Relatórios: filtro de período afeta todos os números/gráficos; taxas de
      pré-seleção/entrevista/aprovação corretas; exportação CSV padrão baixa um
      arquivo sem observações/avaliações; exportação completa inclui esses campos.
- [ ] Banco de talentos: lista só candidatos com esse status; busca funciona; badge de
      "próximo do prazo" aparece corretamente; reativar volta o status para "Em
      análise"; excluir remove os dados.
- [ ] Configurações: pesos de pontuação são salvos e refletem em novos cálculos;
      prazo de retenção é salvo.
- [ ] Logout funciona e redireciona para `/admin/login`.

**Geral**
- [ ] Layout responsivo em telas de celular, tablet e desktop (testar especialmente a
      lista de candidatos e os relatórios no celular).
- [ ] Navegação por teclado (Tab/Enter/Esc) funciona nos formulários e modais.
- [ ] Contraste de cores adequado (azul/vermelho/amarelo sobre fundo branco/neutro).
- [ ] `npm run build` conclui sem erros de TypeScript ou imports quebrados.
- [ ] Regras do Firestore/Storage publicadas no projeto Firebase de produção, com o
      campo `role` presente em todos os documentos de `admins`.
