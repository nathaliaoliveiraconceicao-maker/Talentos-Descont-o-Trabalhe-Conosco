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
│   │   └── admin/                  # login, dashboard, lista, ficha, configurações
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
- Área administrativa: `http://localhost:5173/admin`

## 4. Criando o primeiro administrador

Os administradores **não se cadastram pela interface** — isso evita que qualquer
pessoa se auto-promova a administrador. A criação é feita por um script Node com o
**Firebase Admin SDK**, que tem privilégios elevados.

1. No Console do Firebase, vá em **Configurações do projeto > Contas de serviço** e
   clique em **Gerar nova chave privada**. Um arquivo `.json` será baixado.
2. Salve esse arquivo como `serviceAccountKey.json` na raiz do projeto (ele já está no
   `.gitignore` e nunca deve ser commitado), **ou** defina a variável de ambiente
   `GOOGLE_APPLICATION_CREDENTIALS` apontando para o caminho do arquivo.
3. Rode o script interativo:

   ```bash
   npm run create-admin
   ```

4. Informe nome, e-mail e senha temporária. O script cria o usuário no Firebase
   Authentication e o documento correspondente em `admins/{uid}` no Firestore
   (com `active: true`).
5. Acesse `/admin` com o e-mail e senha cadastrados.

## 5. Cadastrando outros administradores

Basta rodar `npm run create-admin` novamente quantas vezes forem necessárias — cada
execução cria um novo administrador independente. Para revogar o acesso de alguém sem
excluir a conta, edite o campo `active` do documento em `admins/{uid}` no Firestore
para `false` (as regras de segurança exigem `active == true` para acesso administrativo).

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

Substitua o arquivo `public/logo-placeholder.svg` pela logomarca oficial do
Supermercado Descontão (mantendo o mesmo nome de arquivo), ou aponte o componente
`src/components/layout/Logo.tsx` para um novo arquivo dentro de `public/`. Formatos
recomendados: SVG (preferencial) ou PNG com fundo transparente.

## 9. Segurança e LGPD

- **`firestore.rules`**: candidatos (não autenticados) só podem **criar** uma
  pré-candidatura — nunca ler, alterar ou excluir dados. Somente administradores
  autenticados (com documento em `admins/{uid}` e `active: true`) podem ler, atualizar
  status/avaliações e excluir candidatos. O documento de administrador nunca pode ser
  criado ou editado pelo cliente — apenas via Admin SDK.
- **`storage.rules`**: candidatos podem enviar (`create`) o currículo respeitando tipo e
  tamanho de arquivo; a leitura e exclusão dos arquivos ficam restritas a usuários
  autenticados (ou seja, administradores — candidatos nunca possuem contas no Firebase
  Authentication neste sistema).
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

**Área administrativa**
- [ ] `/admin` exige login; usuários não autenticados são redirecionados.
- [ ] Login com credenciais inválidas exibe mensagem de erro clara.
- [ ] Dashboard exibe os cards de estatísticas e os 4 gráficos corretamente.
- [ ] Lista de candidatos exibe todos os candidatos cadastrados.
- [ ] Filtros (nome, data, bairro, área, disponibilidade, primeiro emprego,
      experiência em supermercado, pontuação, status) funcionam individualmente e em
      combinação.
- [ ] Ordenação (recentes, pontuação, nome, experiência) funciona.
- [ ] Ficha do candidato exibe todas as seções de dados corretamente.
- [ ] Botão do WhatsApp abre o chat com mensagem pré-preenchida (sem enviar automaticamente).
- [ ] Alteração de status atualiza o histórico de status.
- [ ] Agendamento de entrevista salva data/horário e muda o status.
- [ ] Avaliação do recrutador (nota, observações, responsável) é salva.
- [ ] Marcar/desmarcar como favorito funciona.
- [ ] Download do currículo funciona quando anexado.
- [ ] Impressão da ficha (`Imprimir ficha`) oculta os botões de ação.
- [ ] Configurações: pesos de pontuação são salvos e refletem em novos cálculos.
- [ ] Configurações: prazo de retenção é salvo.
- [ ] Configurações: busca e exclusão de dados (LGPD) funciona e é irreversível.
- [ ] Logout funciona e redireciona para a tela de login.

**Geral**
- [ ] Layout responsivo em telas de celular, tablet e desktop.
- [ ] Navegação por teclado (Tab/Enter/Esc) funciona nos formulários e modais.
- [ ] Contraste de cores adequado (verde/amarelo sobre fundo branco/neutro).
- [ ] `npm run build` conclui sem erros de TypeScript.
- [ ] Regras do Firestore/Storage publicadas no projeto Firebase de produção.
