# VagaHub — Todas as suas contratações em um só lugar.

Plataforma SaaS multi-tenant (multiempresa) de recrutamento, comercializada por
assinatura: pré-candidatura, triagem, relatórios e banco de talentos, personalizável
para qualquer negócio (varejo, serviços, escolas, indústria etc.). Cada cliente tem seu próprio portal público de
candidatura, painel de RH, candidatos, relatórios, critérios de pontuação e identidade
visual — tudo isolado dos demais clientes, dentro de **uma única base de código, um
único deploy e um único projeto Firebase**.

Identidade visual e nome do produto definidos em `vagahub_apresentacao.pdf`: paleta
azul-marinho/azul vibrante/lilás/coral (sem verde/amarelo como base), tipografia
Poppins (títulos) + Inter (interface), ícones lineares.

> ⚠️ Este repositório foi desenvolvido com **dados fictícios**. Nenhuma informação real
> de candidatos foi utilizada durante o desenvolvimento.

## Sumário

- [Tecnologias](#tecnologias)
- [Arquitetura multi-tenant](#arquitetura-multi-tenant)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [1. Instalação](#1-instalação)
- [2. Configuração do Firebase](#2-configuração-do-firebase)
- [3. Executando localmente](#3-executando-localmente)
- [4. Criando o primeiro superadmin da plataforma](#4-criando-o-primeiro-superadmin-da-plataforma)
- [5. Cadastrando um novo cliente (mercado)](#5-cadastrando-um-novo-cliente-mercado)
- [6. Convite e criação de usuários de um cliente](#6-convite-e-criação-de-usuários-de-um-cliente)
- [Identidade visual e remoção da logo do cliente](#identidade-visual-e-remoção-da-logo-do-cliente)
- [7. Migrando os dados do Descontão (single-tenant → multi-tenant)](#7-migrando-os-dados-do-descontão-single-tenant--multi-tenant)
- [8. Populando dados fictícios para teste](#8-populando-dados-fictícios-para-teste)
- [9. Publicando a aplicação](#9-publicando-a-aplicação)
- [10. Planos e limites de uso](#10-planos-e-limites-de-uso)
- [11. Assinatura, bloqueio e inadimplência](#11-assinatura-bloqueio-e-inadimplência)
- [12. Segurança](#12-segurança)
- [13. Painel do cliente (`/app`)](#13-painel-do-cliente-app)
- [14. Painel do superadmin (`/superadmin`)](#14-painel-do-superadmin-superadmin)
- [15. Sistema de pontuação](#15-sistema-de-pontuação)
- [16. Estrutura final das coleções do Firestore](#16-estrutura-final-das-coleções-do-firestore)
- [17. Testes de regras (Firebase Emulator Suite)](#17-testes-de-regras-firebase-emulator-suite)
- [Checklist final de testes](#checklist-final-de-testes)
- [Riscos e etapas pendentes](#riscos-e-etapas-pendentes)

## Tecnologias

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Firebase (Authentication, Firestore, Storage, App Check) — **client SDK apenas**,
  sem backend/Cloud Functions próprio
- Recharts (gráficos do dashboard/relatórios)
- Lucide Icons
- `firebase-admin` (scripts administrativos Node, nunca no frontend)
- `@firebase/rules-unit-testing` + Firebase Emulator Suite (testes de regras)

## Arquitetura multi-tenant

- **`tenantId` == `slug`**: o ID do documento `tenants/{tenantId}` é sempre igual ao
  slug público (`/mercado-primavera` → `tenants/mercado-primavera`). Isso evita uma
  consulta pública para resolver slug → tenantId (que exigiria permissão de `list` em
  `tenants`, abrindo brecha para enumerar clientes).
- **Todo dado de um cliente vive em subcoleções de `tenants/{tenantId}`**: usuários,
  candidatos, vagas, avaliações, histórico de status, pontuação, configurações e log de
  auditoria. Nada de um cliente é gravado fora da sua própria árvore.
- **Papéis** (`tenants/{tenantId}/users/{uid}`): `owner`, `admin`, `rh`, `viewer` — só
  enxergam e operam o próprio tenant. **Superadmins** (`platformAdmins/{uid}`) vivem
  fora de qualquer tenant e acessam todos.
- **`userIndex/{uid} → { tenantId }`**: índice usado só no login, para descobrir a qual
  tenant um uid pertence sem precisar de `collectionGroup` queries nem expor a lista de
  usuários.
- **Isolamento é reforçado pelas Firestore/Storage Rules**, não apenas pela UI — ver
  [Segurança](#12-segurança).

## Estrutura de pastas

```
├── public/
│   ├── favicon.svg                 # emblema VagaHub (só o ícone)
│   ├── vagahub-logo.svg            # logo da PLATAFORMA (emblema + wordmark, não de um cliente)
│   └── tenants/
│       └── descontao-logo.svg      # logo do tenant Descontão
├── scripts/
│   ├── firebaseAdmin.ts            # inicialização do Firebase Admin SDK
│   ├── createSuperAdmin.ts         # cria o primeiro superadmin da plataforma
│   ├── createAdmin.ts              # (legado) cria usuário na coleção antiga "admins"
│   ├── migrateToTenant.ts          # migra o Descontão para tenants/descontao
│   └── seedMockData.ts             # popula candidatos fictícios (coleções legadas)
├── tests/
│   └── rules/runAll.mjs            # testes de isolamento das Rules no Emulator Suite
├── src/
│   ├── components/
│   │   ├── admin/                  # componentes da ficha/lista de candidatos
│   │   ├── layout/                 # Header, Footer, Logo (única marca gráfica da
│   │   │                             plataforma), AdminLayout, SuperAdminLayout, PublicLayout
│   │   └── ui/                     # componentes reutilizáveis (Button, Card, Input…)
│   ├── context/                    # AuthContext, TenantContext, FormContext
│   ├── data/                       # listas estáticas (seed de áreas, escolaridade)
│   ├── hooks/                      # useLocalStorage, useCandidates, useTenantJobs
│   ├── lib/                        # firebase.ts, tenantApi, plansApi, superAdminApi,
│   │                                 tenantUsersApi (convite/gestão de usuários),
│   │                                 candidatesApi, adminApi, settingsApi, auditLog,
│   │                                 scoring, csvExport, validators, masks
│   ├── pages/
│   │   ├── Application/            # formulário de 9 etapas + confirmação (por tenant)
│   │   ├── admin/                  # painel do cliente: login, esqueci-senha, dashboard,
│   │   │                             candidatos, ficha, relatórios, banco de talentos,
│   │   │                             usuários, configurações
│   │   └── superadmin/             # painel do superadmin: clientes, planos, assinaturas
│   ├── router/                     # ProtectedRoute (tenant) e SuperAdminRoute
│   └── types/                      # tenant, plan, admin, candidate
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
- Uma **chave de conta de serviço** do Firebase (para os scripts administrativos —
  criação de superadmin, migração, seed)

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
   - **App Check** (opcional, mas recomendado — ver [Segurança](#12-segurança)).
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
   VITE_DEFAULT_RETENTION_MONTHS=24   # opcional, ver seção 10
   VITE_RECAPTCHA_SITE_KEY=...        # App Check — opcional, ver seção de Segurança
   ```

5. Publique as regras de segurança (requer o [Firebase CLI](https://firebase.google.com/docs/cli)):

   ```bash
   npm install -g firebase-tools
   firebase login
   cp .firebaserc.example .firebaserc   # e edite com o ID do seu projeto
   firebase deploy --only firestore:rules,storage:rules
   ```

   > ⚠️ **Isto precisa ser repetido manualmente toda vez que `firestore.rules` ou
   > `storage.rules` mudar.** Publicar/mergear código no GitHub e o deploy da
   > Vercel **não** atualizam as regras do Firebase — são sistemas totalmente
   > independentes. Esquecer este passo depois de alterar as regras é
   > silencioso: o app continua funcionando para quem já tinha acesso, mas
   > qualquer leitura/escrita nova que as regras atuais (desatualizadas) não
   > cubram passa a falhar com `permission-denied` — o que, em telas como
   > `TenantProvider`, aparece para o visitante como um genérico "Página não
   > encontrada", sem nenhuma pista visual do motivo real (o erro completo é
   > logado no console do navegador, então sempre confira lá primeiro se uma
   > página que "deveria existir" está caindo em 404).

## 3. Executando localmente

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

- Landing da plataforma: `http://localhost:5173/`
- Portal público de um cliente: `http://localhost:5173/{slug}` (ex.: `/cliente01`)
- Formulário de candidatura: `http://localhost:5173/{slug}/candidatura`
- Painel do cliente (RH): `http://localhost:5173/app` (redireciona para `/app/login` ou
  `/app/dashboard`, conforme a sessão)
- Painel do superadmin: `http://localhost:5173/superadmin` (idem, para
  `/superadmin/login` ou `/superadmin/dashboard`)

## 4. Criando o primeiro superadmin da plataforma

O painel `/superadmin` não tem tela de autocadastro — isso evitaria que qualquer
visitante virasse superadmin. O primeiro (e qualquer) superadmin é criado por um script
Node com o **Firebase Admin SDK**.

1. No Console do Firebase, vá em **Configurações do projeto > Contas de serviço** e
   clique em **Gerar nova chave privada**. Salve o `.json` baixado como
   `serviceAccountKey.json` na raiz do projeto (já está no `.gitignore`; nunca deve ser
   commitado), **ou** defina `GOOGLE_APPLICATION_CREDENTIALS` apontando para o arquivo.
2. Rode:

   ```bash
   npm run create-superadmin
   ```

3. Informe nome, e-mail e senha. O script cria o usuário no Firebase Authentication e o
   documento `platformAdmins/{uid}` com `active: true`.
4. Acesse `/superadmin/login` com essas credenciais.

## 5. Cadastrando um novo cliente (mercado)

Feito inteiramente pela interface, como superadmin:

1. Acesse `/superadmin/clientes` → **Cadastrar cliente**.
2. Informe nome, slug (URL pública, gerado automaticamente a partir do nome mas
   editável), e-mail de contato e o plano inicial.
3. Isso cria `tenants/{slug}` (ativo, em período de teste — `subscriptionStatus:
   "trial"`), semeia `tenants/{slug}/settings/general` com textos padrão e
   `tenants/{slug}/jobs` com uma lista inicial de cargos (editável depois).
4. O portal público do cliente já fica no ar em `/{slug}` — mas sem nenhum usuário
   ainda, é preciso criar o primeiro (próximo passo).

## 6. Convite e criação de usuários de um cliente

**O admin/superadmin nunca define, vê, armazena ou envia a senha de um usuário de
cliente.** Toda criação de usuário (o primeiro de um tenant, ou os seguintes) é um
**convite**: a pessoa convidada recebe um e-mail e cria a própria senha antes do
primeiro acesso.

### Como o convite funciona por dentro (sem backend próprio)

O Firebase Authentication não tem um e-mail nativo de "convite" — só verificação de
e-mail, redefinição de senha e alteração de e-mail. O mecanismo usado aqui, e que é o
padrão real para esse cenário com apenas o client SDK, é:

1. A conta é criada no Firebase Authentication (via um app Firebase **secundário e
   temporário**, que não afeta a sessão de quem está convidando) com uma senha
   **aleatória, gerada com `crypto.randomUUID()` e descartada imediatamente** — ela
   nunca é exibida, retornada, logada ou gravada em lugar nenhum, e ninguém (nem quem
   convidou) tem como recuperá-la depois.
2. Em seguida, o app chama `sendPasswordResetEmail` para o mesmo e-mail — esse é,
   funcionalmente, o e-mail de convite: a pessoa nunca teve senha para "redefinir",
   mas o link funciona igual, e ela define a senha pela primeira vez ali.
3. `tenants/{tenantId}/users/{uid}` é gravado com `invitationStatus: "pending"`,
   `invitedAt`, `invitedBy` e `invitationSentAt`.
4. Quando a pessoa clica no link e cria a senha, ela é redirecionada para
   `/app/login`, onde faz login normalmente.
5. No primeiro login sem bloqueios, o app atualiza `invitationStatus` para
   `"accepted"`, preenche `passwordConfiguredAt` e `firstLoginAt`, e passa a atualizar
   `lastLoginAt` em todo login seguinte (`recordLoginBookkeeping` em
   `src/lib/tenantUsersApi.ts`).

Ver `src/lib/tenantUsersApi.ts` (`inviteTenantUser`, `resendInvite`, `cancelInvite`,
`toggleUserActive`, `changeUserRole`) para a implementação completa.

### Criar o primeiro usuário de um tenant (superadmin)

No cadastro de um cliente novo (`/superadmin/clientes` → **Cadastrar cliente**), o
formulário já pede nome, e-mail e papel (`owner` ou `admin`) do **primeiro
responsável** — o convite é enviado automaticamente assim que o tenant é criado, sem
pedir senha em nenhum momento. A tela `/superadmin/clientes/{tenantId}` mostra nome,
e-mail, papel, status do convite, data de envio, data de aceitação e último acesso de
cada usuário do cliente.

### Convidar usuários seguintes

Pelo painel do próprio cliente, em `/app/usuarios` (visível a qualquer usuário, mas
só `owner`/`admin` veem o botão **Convidar usuário**), ou pelo superadmin em
`/superadmin/clientes/{tenantId}` → **Convidar usuário**. Em ambos os casos, o convite
respeita o limite `maxUsers` do plano do cliente.

### Reenviar convite

Botão **Reenviar convite** (ícone de envelope) na lista de usuários — reenvia o
mesmo e-mail de definição de senha, atualiza `invitationSentAt` e registra
`invite_resent` em `auditLogs`. Não cria uma conta nova nem duplica o usuário. Para um
usuário que **já** tem senha definida (`invitationStatus: "accepted"`), o mesmo botão
vira "enviar link de redefinição de senha" — é a forma de o admin ajudar alguém que
esqueceu a senha sem nunca vê-la.

### Cancelar convite

Botão **Cancelar convite** (só aparece para convites `pending`) — define
`invitationStatus: "canceled"`. A pessoa não consegue mais entrar (mensagem "Este
convite não está mais ativo…" em `/app/login`) até que um novo convite seja enviado.
**O usuário nunca é excluído automaticamente.**

### Ativar/desativar e alterar papel

Botões **Desativar/Reativar usuário** (`toggleUserActive`) e alteração de papel
(`changeUserRole`, disponível via edição direta do documento por ora — sem seletor
dedicado na lista) — ambos preservam o histórico do usuário e registram o evento em
`auditLogs`.

### Redefinir senha de um usuário já existente

Qualquer pessoa pode pedir sua própria redefinição em `/app/esqueci-senha` — o app
sempre mostra a mesma mensagem neutra, sem confirmar nem negar se a conta existe. Um
admin também pode disparar isso por outra pessoa usando o mesmo botão **Reenviar
convite/redefinição** descrito acima. **Isso nunca é exigido** de quem já acessa
normalmente — só acontece quando alguém (o próprio usuário ou um admin em nome dele)
pede explicitamente.

### Vinculando uma conta que já existe em outro contexto (caso raro)

O SDK do navegador não consegue buscar o UID de uma conta do Firebase Authentication
pelo e-mail (só o Admin SDK pode, por design de privacidade do Firebase). Na prática:
- Reenviar convite para alguém do **mesmo tenant** funciona sempre (o UID já está em
  `tenants/{tenantId}/users`).
- Convidar um e-mail que já tem conta no Authentication **em outro tenant, ou
  órfã**, faz `inviteTenantUser` retornar um erro explicando a situação. Para
  resolver, rode localmente (nunca no navegador):

  ```bash
  npm run link-existing-user -- <email> <tenantId> <role>
  ```

  Isso só cria o vínculo (`tenants/{tenantId}/users/{uid}` + `userIndex/{uid}`) —
  nunca define nem altera a senha da pessoa. Se ela ainda não tiver senha nessa
  conta, envie um convite normalmente depois (botão "Reenviar convite").

### Configuração manual necessária no Firebase Console

O texto do e-mail de convite/redefinição (assunto, corpo, botão) é controlado pelo
**modelo de e-mail do Firebase**, que o client SDK não consegue personalizar via
código — é preciso editar manualmente em **Firebase Console → Authentication →
Templates (Modelos) → Password reset (Redefinição de senha)**:

- **Assunto sugerido**: "Crie sua senha de acesso à VagaHub"
- **Corpo sugerido**: mencionar que a pessoa foi convidada para acessar a VagaHub e
  gerenciar os processos seletivos da empresa (nome do tenant), com um botão "Criar
  minha senha" e um aviso para ignorar o e-mail caso não reconheça o convite.
- **URL de ação (action URL)**: o app já passa `url: '<origin>/app/login'` em todo
  `sendPasswordResetEmail`/convite — confirme em **Authentication → Settings →
  Authorized domains** que o domínio de produção (`vagahub.vercel.app`) está
  autorizado, senão o link do e-mail falha.

Sem essa configuração manual, o convite ainda funciona (o link leva à página padrão
de redefinição de senha do Firebase, e depois redireciona para `/app/login`), só não
tem o texto/marca customizados descritos acima.

### Compatibilidade com usuários já existentes

Contas criadas antes deste fluxo (ex.: `supermercadodescontao.patricia@gmail.com`)
não têm `invitationStatus` gravado — em todo o app isso é tratado como
`"accepted"` (nunca como bloqueado por um campo que nunca existiu nelas). O UID, o
e-mail e o histórico de acesso dessas contas nunca são alterados por este fluxo.

## Identidade visual e remoção da logo do cliente

A plataforma **não exibe mais logomarca de nenhuma empresa cliente**, em lugar nenhum
(portal público, formulário, confirmação, painel do cliente, dashboard, relatórios,
ficha do candidato, e-mails, superadmin, cartões/listagens de tenants etc.). A única
marca gráfica exibida em toda a aplicação é a **logo da VagaHub** (`<Logo />`,
`public/vagahub-logo.svg`); cada empresa é identificada apenas pelo **nome em texto**
configurado no tenant (`tenant.name`, com fallback `"Empresa"` se algum dia estiver
vazio — hoje o campo é obrigatório na criação do tenant). Não há avatar com iniciais,
círculo com letra, ícone simulando logo nem imagem institucional automática.

O que foi alterado:
- `src/components/layout/Header.tsx` — mostra `<Logo />` (VagaHub) + `tenant.name` em
  texto, em vez do antigo `<TenantLogo />` (removido).
- `src/pages/admin/Settings.tsx` — removido o campo "URL do logotipo" da seção
  Identidade visual; mantido nome público e cores.
- `storage.rules` — `tenants/{tenantId}/branding/{fileName}` agora nega **toda**
  escrita (`allow write: if false`), ou seja, não é mais possível enviar/trocar um
  logotipo de cliente pela interface, mesmo por engenharia reversa da UI.
- `firestore.rules` — `logoUrl` foi removido da lista de campos que o próprio tenant
  pode autoeditar em `tenants/{tenantId}`.

O que foi **preservado por compatibilidade** (nenhum dado apagado):
- O campo `logoUrl` continua existindo no tipo `Tenant` (`src/types/tenant.ts`,
  marcado `@deprecated`) e no documento Firestore de tenants que já tinham um valor
  gravado (ex.: `tenants/cliente01.logoUrl`, herdado da migração do Descontão) — só
  não é mais lido nem gravável pela UI.
- Nenhum arquivo em `tenants/{tenantId}/branding/` no Storage é excluído
  automaticamente. Se algum tenant já tiver enviado um arquivo ali antes desta
  mudança, ele continua existindo e publicamente legível (a regra de leitura
  permanece `allow read: if true`) até ser removido **manualmente** pelo Console do
  Firebase Storage, depois de validar que nada mais depende dele — não há prazo nem
  automação para essa limpeza.

## 7. Migrando os dados do Descontão (single-tenant → multi-tenant)

O Descontão era o único cliente antes desta versão, com dados nas coleções
top-level antigas (`admins`, `candidates`, `statusHistory`, `evaluations`,
`scoringSettings`). O script `scripts/migrateToTenant.ts` copia tudo para
`tenants/descontao/...`.

```bash
npm run migrate-descontao
```

O que ele faz (idempotente — seguro rodar mais de uma vez):

1. Cria `tenants/descontao` se ainda não existir (nome, cores, `logoUrl` apontando para
   `/tenants/descontao-logo.svg`, plano `legacy`, assinatura `active`).
2. Copia `admins/{uid}` → `tenants/descontao/users/{uid}` + `userIndex/{uid}`.
3. Copia `candidates/{id}` → `tenants/descontao/candidates/{id}` (adiciona `tenantId`) —
   **incluindo o currículo no Storage**, de `resumes/...` para
   `tenants/descontao/candidates/{id}/resume/...` (com um novo token de download),
   porque as novas Storage Rules negam por padrão qualquer caminho fora de
   `tenants/{tenantId}/...`.
4. Copia `evaluations/{id}` → `tenants/descontao/evaluations/{id}`.
5. Copia `statusHistory/{id}` → `tenants/descontao/statusHistory/{id}`.
6. Copia `scoringSettings/current` (pesos) → `tenants/descontao/scoringSettings/default`
   e `scoringSettings/retention` → `tenants/descontao/settings/general` (mesclado com os
   textos padrão do portal, que o Descontão não tinha antes).
7. Semeia `tenants/descontao/jobs` com os cargos padrão.
8. Grava um relatório em `migrations/migrateToTenant_descontao` e imprime um resumo no
   terminal (quantos usuários/candidatos/currículos/avaliações/históricos foram
   migrados, e quais currículos falharam, se algum).

**O script nunca apaga as coleções antigas.** Elas ficam bloqueadas para o app (as
novas `firestore.rules` negam leitura/escrita do cliente nelas), mas continuam no banco
como origem/backup. Depois de conferir o relatório e validar que `/app` está 100%
funcional com os dados migrados, a remoção é **manual**, pelo Console do Firebase.

## 8. Populando dados fictícios para teste

```bash
npm run seed
```

> Este script ainda popula as coleções **legadas** (top-level), não um tenant
> específico — use-o só para gerar massa de dados de teste e depois rodar
> `npm run migrate-descontao`, ou adapte-o para escrever direto em
> `tenants/{tenantId}/candidates` se quiser popular um tenant novo diretamente.

## 9. Publicando a aplicação

### Opção A — Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Opção B — Vercel

1. Importe o repositório em [vercel.com](https://vercel.com/).
2. O arquivo `vercel.json` já configura o build (`npm run build`) e o diretório de saída
   (`dist`), com reescrita de rotas para suportar o React Router (necessário para as
   rotas dinâmicas `/{slug}`, `/app/*` e `/superadmin/*`).
3. Cadastre as variáveis de ambiente do `.env` no painel do projeto na Vercel
   (Settings > Environment Variables).

## 10. Planos e limites de uso

A coleção `plans` (gerenciada em `/superadmin/planos`) define, por plano:
`maxUsers`, `maxBranches`, `maxCandidatesPerMonth` e feature flags
(`reportsEnabled`, `csvExportEnabled`, `scoringEnabled`, `talentBankEnabled`,
`customDomainEnabled`).

O que **é** validado nesta versão:
- Limite de usuários (`maxUsers`) — checado em `createTenantUser` antes de criar um
  novo usuário para o cliente.

`VITE_DEFAULT_RETENTION_MONTHS` (variável de ambiente, opcional, padrão 24) define o
prazo inicial de retenção do banco de talentos usado ao **semear um tenant novo**
(`createTenant` em `src/lib/tenantApi.ts`) — não é um valor por tenant em si, é só o
ponto de partida; cada cliente continua podendo ajustar o próprio prazo depois em
`/app/configuracoes`. As demais variáveis herdadas de configurações antigas
(`VITE_COMPANY_NAME`) não fazem mais sentido no modelo multi-tenant — o nome de cada
empresa já é um campo do Firestore (`tenants/{tenantId}.name`), editável por tenant.

O que **não** é validado automaticamente ainda (ver
[Riscos e etapas pendentes](#riscos-e-etapas-pendentes)):
- `maxCandidatesPerMonth` — não pode ser aplicado com segurança no formulário público
  sem um backend, porque um visitante não autenticado não tem permissão de leitura no
  Firestore para contar candidaturas existentes antes de enviar a sua. Hoje é apenas um
  número de referência (visível ao superadmin via `countCandidatesForTenant`), não um
  bloqueio automático.
- `maxBranches`, `customDomainEnabled` — campos existem no modelo de dados, mas ainda
  não há funcionalidade de filiais/domínio customizado implementada para checar contra
  eles.

## 11. Assinatura, bloqueio e inadimplência

Cada tenant tem `subscriptionStatus`: `trial`, `active`, `past_due`, `suspended` ou
`canceled`, controlado manualmente pelo superadmin em `/superadmin/assinaturas` ou na
página do cliente. Quando `suspended`, `canceled` ou `active: false`:

- As **Firestore Rules** bloqueiam ações administrativas de escrita (alterar status,
  avaliações, exclusões) para usuários do próprio cliente — `tenantIsOperational()` em
  `firestore.rules`.
- A **leitura continua liberada** (o RH ainda enxerga os dados, só não consegue
  operá-los).
- O **superadmin nunca é bloqueado** — pode sempre reativar ou corrigir algo.
- **Nenhum dado é apagado automaticamente** por inadimplência — o bloqueio é reversível
  a qualquer momento reativando a assinatura.

## 12. Segurança

- **Firestore Rules / Storage Rules**: isolamento total por tenant — ver
  [Estrutura final das coleções](#16-estrutura-final-das-coleções-do-firestore) e os
  comentários em `firestore.rules`/`storage.rules`. Resumo dos pontos centrais:
  - Um usuário só lê/altera dentro de `tenants/{tenantId}/...` quando possui um
    documento **ativo** em `tenants/{tenantId}/users/{uid}`.
  - `platformAdmins/{uid}` ativo acessa qualquer tenant.
  - A área pública só pode **criar** uma candidatura no tenant indicado pela URL — nunca
    ler, listar, editar ou excluir (nem a própria candidatura), evitando enumeração de
    dados de outros candidatos.
  - `tenants/{tenantId}` é legível publicamente por `get` (necessário para o portal
    carregar nome/logo/cores pelo slug), mas **não listável** — impede descobrir todos
    os clientes da plataforma por força bruta.
  - Coleções legadas (`admins`, `candidates`, `statusHistory`, `evaluations`,
    `scoringSettings`, `jobAreas`) ficam com `allow read, write: if false` para o
    cliente — só acessíveis via Admin SDK (scripts), que ignora as regras.
- **Sem `serviceAccountKey` no frontend**: todas as operações privilegiadas (criar
  superadmin, migrar dados, seed, vincular usuário existente) rodam em scripts Node
  (`scripts/`) usando o Admin SDK, nunca no código que roda no navegador.
  `serviceAccountKey.json`/`serviceAccountKey.json.json`/`*serviceAccount*.json`,
  `.env` e `.env.*` (exceto `.env.example`) estão no `.gitignore` e nunca devem ser
  commitados.
- **Nenhuma senha de cliente passa pelo admin/superadmin**: ver
  [Convite e criação de usuários de um cliente](#6-convite-e-criação-de-usuários-de-um-cliente).
  A senha nunca é armazenada no Firestore, nunca aparece em log, nunca é enviada por
  e-mail/WhatsApp/tela — só a própria pessoa a define, pelo link oficial do Firebase
  Authentication. A criação/edição de `tenants/{tenantId}/users/{uid}` é sempre
  validada pelas Firestore Rules (owner/admin do próprio tenant ou superadmin), nunca
  apenas pelo cliente.
- **Firebase App Check**: opcional, ativado automaticamente se
  `VITE_RECAPTCHA_SITE_KEY` estiver definida em `.env` (ver `src/lib/firebase.ts`).
  Requer configuração manual no **Console do Firebase > App Check > Apps > Web >
  reCAPTCHA v3** (gera a site key) — sem essa variável, o app funciona normalmente,
  apenas sem essa camada extra de proteção contra bots/uso indevido da API fora do
  app. Para testar localmente sem uma site key real, gere um token de depuração (ver
  comentários em `.env.example`) e defina `VITE_APPCHECK_DEBUG_TOKEN`.
- **Logs de auditoria**: ações administrativas relevantes (mudança de status,
  avaliação, exclusão de candidato, atualização de identidade visual/textos/pontuação,
  ações do superadmin sobre um cliente) gravam um evento em
  `tenants/{tenantId}/auditLogs` (`src/lib/auditLog.ts`) — coleção somente-leitura para
  quem gerencia o tenant (`owner`/`admin`) e para o superadmin; nunca impede a ação
  principal caso o log falhe. Não há uma tela dedicada para visualizar esses logs nesta
  versão — consulte pelo Console do Firebase.
- **Testes automatizados de Rules**: ver [seção 17](#17-testes-de-regras-firebase-emulator-suite).

## 13. Painel do cliente (`/app`)

Painel usado pelo RH/administração de **um** cliente para analisar as pré-candidaturas
recebidas pelo próprio portal.

- **`/app/login`** — login por e-mail/senha, com link "Esqueci minha senha" e aviso
  para quem recebeu um convite. Após autenticar, o sistema resolve o tenant do
  usuário via `userIndex/{uid}` e verifica `tenants/{tenantId}/users/{uid}`: o acesso
  só é liberado se `active == true`, o convite não estiver `canceled` e a empresa
  estiver operacional (ativa e assinatura não suspensa/cancelada) — cada bloqueio tem
  uma mensagem específica. Uma conta autenticada mas sem vínculo a nenhum tenant (nem
  superadmin) vê "Acesso não autorizado".
- **`/app/esqueci-senha`** — pede o e-mail e envia o link de redefinição pelo Firebase;
  sempre mostra a mesma mensagem neutra, sem confirmar nem negar se a conta existe.
- **`/app/dashboard`** — cards com total de candidatos, por status, últimos 7 dias e mês
  atual, além de gráficos por função, bairro, experiência e disponibilidade — tudo
  restrito ao próprio tenant.
- **`/app/candidatos`** — busca unificada e filtros (status, área, bairro,
  disponibilidade, primeiro emprego, experiência, data, pontuação mínima); 5 opções de
  ordenação.
- **`/app/candidatos/:id`** — ficha completa, avaliação do RH, histórico de status,
  botão de WhatsApp com mensagem pronta (template configurável por tenant — ver
  Configurações), download de currículo, impressão, favoritar e **exclusão de dados
  mediante solicitação (LGPD)**.
- **`/app/relatorios`** — filtro por período, taxas de conversão, gráficos e exportação
  em CSV (padrão x completa, essa última incluindo avaliações/observações internas).
- **`/app/banco-de-talentos`** — candidatos com status "Banco de talentos", com aviso de
  proximidade do prazo de retenção (configurável) e opção de reativar ou excluir.
- **`/app/usuarios`** — lista os usuários do próprio tenant com status do convite
  (pendente/aceito/cancelado), data de envio e último acesso. `owner`/`admin` podem
  convidar (**Convidar usuário**), reenviar convite/link de redefinição, cancelar
  convite, copiar o link do portal de acesso e ativar/desativar usuários — sempre
  restrito ao próprio tenant e ao limite de usuários do plano. Ver
  [seção 6](#6-convite-e-criação-de-usuários-de-um-cliente).
- **`/app/configuracoes`** — customização do próprio tenant:
  - **Identidade visual**: nome público e cor primária/secundária. **Não há mais
    upload/URL de logomarca da empresa** — a plataforma exibe sempre a logo da
    VagaHub, e cada empresa é identificada só pelo nome público em texto (ver
    [Identidade visual e remoção da logo do cliente](#identidade-visual-e-remoção-da-logo-do-cliente)).
  - **Textos do portal**: título/subtítulo de destaque, aviso inicial, texto da política
    de privacidade, prazo de retenção do banco de talentos, mensagens de WhatsApp
    (padrão e de convite para entrevista, com placeholders `{{nome}}`, `{{empresa}}`,
    `{{data}}`, `{{horario}}`, `{{local}}`).
  - **Áreas de interesse (cargos)**: lista editável (ativar/desativar/adicionar/excluir)
    usada no formulário público deste tenant.
  - **Pesos do sistema de pontuação**.
  - **Exclusão de dados por solicitação (LGPD)**: busca + exclusão manual.

## 14. Painel do superadmin (`/superadmin`)

Painel usado pela equipe da plataforma para administrar todos os clientes.

- **`/superadmin/login`** — acesso restrito a quem tem documento ativo em
  `platformAdmins/{uid}`.
- **`/superadmin/dashboard`** — total de clientes (por status de assinatura) e total de
  candidatos em toda a plataforma (contagem eficiente via `getCountFromServer`, sem
  baixar documentos).
- **`/superadmin/clientes`** — lista com busca; cadastro de novo cliente.
- **`/superadmin/clientes/:tenantId`** — dados do cliente (nome, razão social, contato),
  plano, status de assinatura, vencimento, ativar/suspender, e a lista de usuários do
  cliente (nome, e-mail, papel, status do convite, data de envio, data de aceitação,
  último acesso) com as mesmas ações de convite/reenvio/cancelamento/ativação do
  painel do cliente — ver [seção 6](#6-convite-e-criação-de-usuários-de-um-cliente).
- **`/superadmin/planos`** — CRUD dos planos (limites e feature flags); botão para
  semear os 3 planos padrão (Starter/Pro/Enterprise) na primeira configuração.
- **`/superadmin/assinaturas`** — visão focada em assinatura: status, vencimento (com
  aviso de "vence em breve"/"vencido") e alteração rápida de status.

## 15. Sistema de pontuação

A pontuação (`src/lib/scoring.ts`) é calculada automaticamente no envio da candidatura,
com pesos configuráveis por tenant em `/app/configuracoes`:

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

> Como as áreas de vaga agora são definidas por cada tenant (não uma lista fixa), o
> critério "experiência na área escolhida" usa correspondência por palavra-chave no
> texto da área de maior interesse (`hasExperienceInArea` em `scoring.ts`) em vez de um
> mapeamento direto por ID de área — uma simplificação conhecida, ver
> [Riscos e etapas pendentes](#riscos-e-etapas-pendentes).

A pontuação é exibida apenas como **apoio à triagem** — a decisão final sobre cada
candidato deve sempre ser tomada por um recrutador humano.

## 16. Estrutura final das coleções do Firestore

```
tenants/{tenantId}                         # tenantId == slug
  ├── users/{uid}                          # owner | admin | rh | viewer
  ├── candidates/{candidateId}
  ├── jobs/{jobId}                         # áreas de interesse (cargos) do tenant
  ├── evaluations/{id}                     # log imutável de avaliações do RH
  ├── statusHistory/{id}                   # log imutável de mudanças de status
  ├── scoringSettings/default              # pesos do sistema de pontuação
  ├── settings/general                     # textos do portal, retenção, WhatsApp
  └── auditLogs/{id}                       # log imutável de ações administrativas

platformAdmins/{uid}                       # superadmins da plataforma (fora de tenants)
userIndex/{uid}                            # { tenantId } — índice uid -> tenant (login)
plans/{planId}                             # planos de assinatura
migrations/{docId}                         # bookkeeping do script de migração

# Coleções legadas (pré multi-tenant), preservadas só como origem para a migração,
# bloqueadas para o cliente (allow read, write: if false):
admins/{uid}
candidates/{id}
statusHistory/{id}
evaluations/{id}
scoringSettings/{docId}
jobAreas/{id}
```

Campos principais por coleção:

| Coleção | Campos principais |
| --- | --- |
| `tenants/{tenantId}` | `tenantId`, `slug`, `name`, `legalName`, `logoUrl` (⚠️ legado, não usado pela UI — ver seção de identidade visual), `primaryColor`, `secondaryColor`, `email`, `phone`, `address`, `city`, `state`, `active`, `planId`, `subscriptionStatus`, `subscriptionStartedAt`, `subscriptionEndsAt`, `createdAt`, `updatedAt` |
| `tenants/{t}/users/{uid}` | `uid`, `tenantId`, `email`, `name`, `role` (`owner`\|`admin`\|`rh`\|`viewer`), `active`, `invitationStatus` (`pending`\|`accepted`\|`expired`\|`canceled`, opcional — ausente = tratado como `accepted`), `invitedAt`, `invitedBy`, `invitationSentAt`, `passwordConfiguredAt`, `firstLoginAt`, `lastLoginAt`, `createdAt`, `updatedAt` |
| `tenants/{t}/candidates/{id}` | `tenantId`, `personal`, `contact` (+`whatsappDigits`), `interest`, `availability`, `experience`, `education`, `profile`, `resume`, `consent`, `protocol`, `status`, `score`, `scoreBreakdown`, `createdAt`, `updatedAt`, `evaluation` |
| `tenants/{t}/jobs/{id}` | `id`, `label`, `active` |
| `tenants/{t}/statusHistory/{id}` | `candidateId`, `status`, `previousStatus`, `changedAt`, `changedBy`, `changedByUid`, `note` |
| `tenants/{t}/evaluations/{id}` | `candidateId`, campos da avaliação, `updatedBy`, `updatedAt` |
| `tenants/{t}/scoringSettings/default` | `weights`, `updatedAt`, `updatedBy` |
| `tenants/{t}/settings/general` | `heroTitle`, `heroSubtitle`, `initialMessage`, `privacyPolicyText`, `talentPoolRetentionMonths`, `whatsappGenericMessage`, `whatsappInterviewMessage`, `updatedAt`, `updatedBy` |
| `tenants/{t}/auditLogs/{id}` | `actorUid`, `actorName`, `action`, `targetType`, `targetId`, `details`, `createdAt`. Ações do fluxo de convite: `user_invited`, `invite_resent`, `password_reset_requested_by_admin`, `invite_canceled`, `user_activated`, `user_deactivated`, `role_changed`, além das já existentes (`brand_updated`, `portal_settings_updated`, `scoring_weights_updated`, `candidate_deleted`, ações do superadmin etc.) |
| `platformAdmins/{uid}` | `uid`, `email`, `name`, `active`, `createdAt` |
| `userIndex/{uid}` | `tenantId` |
| `plans/{planId}` | `planId`, `name`, `price`, `billingPeriod`, `maxUsers`, `maxBranches`, `maxCandidatesPerMonth`, `reportsEnabled`, `csvExportEnabled`, `scoringEnabled`, `talentBankEnabled`, `customDomainEnabled`, `active` |

Nenhum índice composto do Firestore é necessário: todas as consultas usadas são de
campo único (`orderBy('createdAt')`, `where('candidateId', '==', …)`, etc.);
filtros, buscas, ordenações e relatórios são calculados no cliente sobre a lista
completa de candidatos do tenant. `firestore.indexes.json` permanece vazio.

## 17. Testes de regras (Firebase Emulator Suite)

```bash
npm run test:rules
```

Sobe os emuladores de Firestore e Storage, roda `tests/rules/runAll.mjs` contra eles
(sem tocar no projeto real) e derruba os emuladores ao final. A suíte cobre os pontos
mais sensíveis do isolamento entre clientes: candidato público só cria (nunca lê/lista);
`tenants` é legível por `get` mas não por `list`; um tenant nunca lê/escreve dados de
outro; papel `rh` não lista usuários (ação de `owner`/`admin`); superadmin acessa
qualquer tenant; coleções legadas seguem bloqueadas; assinatura suspensa bloqueia
escrita do cliente mas nunca do superadmin, e nunca bloqueia leitura; upload de
currículo é público mas download/exclusão são restritos ao tenant dono; logotipo é
público para leitura mas não para escrita.

> ⚠️ **Limitação conhecida do Storage Emulator**: nas versões testadas, o motor de
> regras do emulador de Storage não avalia de forma confiável
> `firestore.get()`/`firestore.exists()` dentro de `storage.rules` (o recurso de
> "Cross-Service Rules"). Isso faz o teste "RH do tenant A pode baixar o currículo do
> próprio tenant" ser reportado como aviso (⚠), não como aprovado — os testes de
> **negação** (tenant errado, visitante público) continuam válidos porque uma chamada
> não avaliada também resulta em `false`, que é o resultado esperado nesses casos. Antes
> de confiar 100% no isolamento de currículos, valide manualmente esse caso específico
> contra um projeto Firebase real (fazer login como um usuário do tenant e confirmar que
> o download do próprio currículo funciona) — ver checklist abaixo.

## Checklist final de testes

**Fluxo público (por tenant)**
- [ ] `/{slug}` carrega com a identidade visual (nome, logo, cores) do tenant correto.
- [ ] `/{slug}` com um slug inexistente mostra "não encontrado", não quebra a aplicação.
- [ ] Tenant com `active: false` mostra "portal indisponível" em vez do formulário.
- [ ] As 9 etapas do formulário navegam corretamente (avançar/voltar); áreas de
      interesse exibidas são as cadastradas para aquele tenant, não uma lista fixa.
- [ ] Recarregar a página no meio do formulário mantém os dados preenchidos (chave de
      rascunho isolada por tenant, no localStorage).
- [ ] Upload de currículo aceita PDF/DOC/DOCX/JPG/PNG e recusa arquivos grandes/inválidos.
- [ ] Envio duplicado (mesmo e-mail/telefone, mesmo navegador, curto período) avisa antes
      de enviar de novo.
- [ ] Página de confirmação exibe o protocolo; Política de Privacidade usa os textos
      configurados para aquele tenant.

**Painel do cliente (`/app`)**
- [ ] `/app` redireciona para `/app/login` (sem sessão) ou `/app/dashboard` (com sessão).
- [ ] Login com credenciais inválidas mostra mensagem específica (não genérica).
- [ ] Conta sem vínculo a nenhum tenant ativo vê "Acesso não autorizado".
- [ ] Dashboard, lista de candidatos, ficha, relatórios e banco de talentos mostram
      **somente** dados do tenant do usuário logado.
- [ ] Alterar status/avaliação grava no histórico e no log de auditoria
      (`tenants/{tenantId}/auditLogs`, conferível pelo Console).
- [ ] Mensagem de WhatsApp usa o template configurado em Configurações (com
      `{{nome}}`/`{{empresa}}`/`{{data}}`/`{{horario}}`/`{{local}}` substituídos).
- [ ] Configurações: identidade visual, textos do portal, áreas de interesse e pesos de
      pontuação são salvos e refletem no portal público/próximas candidaturas.
- [ ] Exclusão de dados (LGPD) funciona pela ficha e pela busca em Configurações.
- [ ] Tenant com assinatura suspensa: leitura continua funcionando, mas ações de escrita
      (mudar status, avaliar, excluir) são bloqueadas pelas regras.

**Convite e primeiro acesso**
- [ ] Convidar um e-mail novo cria a conta, envia o e-mail e mostra a mensagem de
      confirmação exata ("Convite enviado para…").
- [ ] Convidar um e-mail já cadastrado no mesmo tenant reenvia o convite em vez de
      duplicar o usuário.
- [ ] Convidar um e-mail que já existe em outro tenant mostra o erro explicando
      `npm run link-existing-user`, em vez de falhar silenciosamente.
- [ ] Reenviar convite atualiza `invitationSentAt` sem criar conta nova.
- [ ] Cancelar convite bloqueia o login com a mensagem exata, sem excluir o usuário.
- [ ] Criar a senha pelo link do e-mail e logar redireciona para `/app/dashboard`,
      marca `invitationStatus: "accepted"`, preenche `passwordConfiguredAt`/`firstLoginAt`.
- [ ] Login seguinte atualiza `lastLoginAt` sem re-executar o bookkeeping de primeiro acesso.
- [ ] Usuário `active: false` vê a mensagem exata de acesso desativado.
- [ ] Empresa suspensa/inativa mostra a mensagem exata de acesso suspenso, mesmo com
      usuário ativo e convite aceito.
- [ ] `/app/esqueci-senha` sempre mostra a mesma mensagem neutra, com e-mail existente
      ou não.
- [ ] `supermercadodescontao.patricia@gmail.com` continua logando normalmente, sem
      nenhum bloqueio novo (sem `invitationStatus` gravado = tratado como aceito).

**Identidade visual (sem logo de cliente)**
- [ ] Nenhuma tela lista acima exibe logo, avatar com iniciais ou ícone de marca do
      cliente — só a logo da VagaHub e o nome da empresa em texto.
- [ ] Um tenant sem nenhum dado de marca configurado ainda renderiza corretamente
      (layout não quebra na ausência de logo).

**Painel do superadmin (`/superadmin`)**
- [ ] `/superadmin` redireciona corretamente conforme sessão.
- [ ] Cadastrar cliente cria `tenants/{slug}` com settings e jobs padrão já semeados, e
      `/{slug}` fica acessível publicamente.
- [ ] Criar usuário respeita o limite `maxUsers` do plano do cliente.
- [ ] Alterar plano/assinatura/ativo reflete imediatamente no painel do cliente afetado.
- [ ] Um usuário comum (não-superadmin) não consegue acessar nenhuma rota `/superadmin/*`.

**Isolamento entre clientes (crítico)**
- [ ] Um usuário do tenant A, autenticado, **não consegue** acessar dados do tenant B
      (testar via `/app/candidatos/:id` trocando o ID de um candidato de outro tenant na
      URL — deve dar erro de permissão, não mostrar os dados).
- [ ] `npm run test:rules` passa sem falhas (além do aviso conhecido do emulador de
      Storage, documentado acima).

**Geral**
- [ ] `npm run build` conclui sem erros de TypeScript ou imports quebrados.
- [ ] `npm run lint` sem erros.
- [ ] Regras do Firestore/Storage publicadas no projeto Firebase de produção.
- [ ] Nenhum segredo (`serviceAccountKey.json`, `.env`) commitado no repositório.

## Riscos e etapas pendentes

- **Limite de candidaturas por mês (`maxCandidatesPerMonth`) não é bloqueado
  automaticamente**: o formulário público não tem permissão de leitura no Firestore
  para contar candidaturas existentes antes de enviar a sua (por design, para não abrir
  brecha de enumeração). Hoje esse número é só informativo no painel do superadmin.
  Solução completa exigiria uma Cloud Function (com Admin SDK) fazendo essa checagem no
  servidor — fora do escopo deste projeto, que não usa backend próprio.
- **App Check requer configuração manual** no Console do Firebase (gerar a site key do
  reCAPTCHA v3) — o código já está pronto (`src/lib/firebase.ts`), mas não pode ser
  ativado sem essa etapa manual, então continua desligado até alguém configurar
  `VITE_RECAPTCHA_SITE_KEY`.
- **Storage Emulator não valida de forma confiável o isolamento de currículos em
  testes automatizados** (ver seção 17) — validar manualmente contra um projeto real
  antes de confiar 100% nesse ponto específico, mesmo com o teste passando.
- **Critério de "experiência na área"** na pontuação usa correspondência por
  palavra-chave (não um mapeamento exato por ID de área), porque as áreas de vaga agora
  são definidas livremente por cada tenant — pode gerar falsos negativos/positivos em
  áreas com nomes muito diferentes do esperado (ver `hasExperienceInArea` em
  `src/lib/scoring.ts`).
- **Sem tela dedicada para visualizar o log de auditoria** — os eventos são gravados
  (`tenants/{tenantId}/auditLogs`), mas só consultáveis hoje pelo Console do Firebase;
  uma tela no painel do cliente/superadmin ficaria para uma próxima iteração.
- **`maxBranches` e `customDomainEnabled`** existem no modelo de planos mas não têm
  funcionalidade correspondente implementada ainda (múltiplas filiais por cliente,
  domínio customizado por tenant).
- **`npm run seed` ainda popula as coleções legadas**, não um tenant específico — útil
  só combinado com `npm run migrate-descontao`, ou precisa ser adaptado manualmente para
  popular um tenant novo diretamente em `tenants/{tenantId}/candidates`.
- **`scripts/createAdmin.ts` (legado)** ainda escreve na coleção antiga `admins/{uid}`,
  não em `tenants/{tenantId}/users` — mantido só para compatibilidade com o fluxo antigo
  de migração; o caminho recomendado para criar/convidar usuários de um cliente é
  sempre o painel do superadmin/cliente (seção 6) ou, para o próprio superadmin,
  `npm run create-superadmin`.
- **Alterar o papel (`role`) de um usuário** hoje só tem função pronta
  (`changeUserRole` em `src/lib/tenantUsersApi.ts`) mas sem um seletor dedicado na
  lista de `/app/usuarios`/`/superadmin/clientes/:tenantId` — editar diretamente pelo
  Console do Firebase ou estender a UI é o caminho por ora.
- **Texto do e-mail de convite depende de configuração manual** no Firebase Console
  (Authentication → Templates → Password reset) — sem isso, o convite ainda funciona,
  mas com o texto/assunto padrão do Firebase em vez do sugerido para a VagaHub. Ver
  [seção 6](#6-convite-e-criação-de-usuários-de-um-cliente).
- **`expired` (status de convite) não é definido automaticamente por nenhum job** —
  o valor existe no tipo (`InvitationStatus`) e na UI, mas nada marca um convite
  `pending` antigo como `expired` sozinho (o link de redefinição do Firebase expira
  por conta própria depois de um tempo, mas o Firestore continua mostrando
  `"pending"` até alguém cancelar/reenviar). Uma Cloud Function agendada resolveria
  isso — fora do escopo deste projeto, que não usa backend próprio.
