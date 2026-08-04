# Bancada 10

E-commerce de camisas de futebol atuais, retrôs, infantis e streetwear — para quem vive o futebol dentro e fora do
estádio.

> Este projeto vive isolado em `bancada-10/`, dentro do mesmo repositório do app **VagaHub** (raiz do repositório).
> São dois produtos completamente diferentes e independentes — nenhum arquivo fora desta pasta foi alterado, e nada
> aqui depende do código da VagaHub.

## Sumário

- [Tecnologias](#tecnologias)
- [Estrutura de pastas](#estrutura-de-pastas)
- [1. Instalação](#1-instalação)
- [2. Executando localmente (sem Supabase)](#2-executando-localmente-sem-supabase)
- [3. Configurando o Supabase](#3-configurando-o-supabase)
- [4. Criando o primeiro administrador](#4-criando-o-primeiro-administrador)
- [5. Mercado Pago (pagamentos)](#5-mercado-pago-pagamentos)
- [6. Cálculo de frete](#6-cálculo-de-frete)
- [7. Analytics](#7-analytics)
- [8. Identidade visual e logo oficial](#8-identidade-visual-e-logo-oficial)
- [9. Catálogo demonstrativo x catálogo real](#9-catálogo-demonstrativo-x-catálogo-real)
- [10. Painel administrativo](#10-painel-administrativo)
- [11. Publicando na Vercel](#11-publicando-na-vercel)
- [Checklist de testes](#checklist-de-testes)
- [Riscos e limitações conhecidas](#riscos-e-limitações-conhecidas)
- [Informações e credenciais ainda necessárias](#informações-e-credenciais-ainda-necessárias)

## Tecnologias

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres, Authentication, Storage) — client SDK + `@supabase/ssr`
- Lucide Icons
- Zod (validação de formulários e de payloads de API)
- Estrutura pronta para Mercado Pago (Pix, cartão, boleto)
- Deploy preparado para Vercel

## Estrutura de pastas

```
bancada-10/
├── public/
│   └── brand/                      # pasta reservada para os arquivos oficiais da logo B10
├── scripts/
│   └── createAdmin.ts              # cria/promove o primeiro admin do painel
├── supabase/
│   └── schema.sql                  # schema completo (tabelas, enums, RLS)
├── src/
│   ├── app/
│   │   ├── (home) page.tsx, layout.tsx, globals.css
│   │   ├── categoria/[slug]/       # listagem + filtros
│   │   ├── produto/[slug]/         # página de produto
│   │   ├── carrinho/, checkout/, pedido-confirmado/
│   │   ├── conta/                  # login, cadastro, dados, endereços, pedidos, favoritos, trocas
│   │   ├── admin/                  # painel administrativo protegido
│   │   ├── institucional/          # Quem Somos, FAQ, políticas etc.
│   │   ├── api/                    # checkout, newsletter, rastreamento, trocas
│   │   ├── sitemap.ts, robots.ts, not-found.tsx, error.tsx
│   │   └── placeholder-image/      # gerador de imagem placeholder do catálogo demo
│   ├── components/                 # ui/, layout/, home/, product/, catalog/, cart/, checkout/, account/, admin/
│   ├── lib/
│   │   ├── data/                   # catálogo, categorias, cupons, promoções e depoimentos DEMONSTRATIVOS
│   │   ├── supabase/               # clients browser/server/admin
│   │   ├── auth/                   # AuthProvider, hook de papel de admin
│   │   ├── cart/, favorites/       # contextos client (localStorage)
│   │   ├── shipping/               # cálculo de frete (placeholder) + ViaCEP
│   │   ├── mercadopago/            # criação de preferência de pagamento
│   │   ├── validators/, utils/     # zod schemas, máscaras, formatação
│   │   └── analytics/              # wrapper de eventos GA4/GTM/Meta Pixel
│   ├── types/                      # tipos de domínio + placeholder do Database do Supabase
│   └── middleware.ts               # refresh de sessão do Supabase
├── .env.example
└── next.config.js
```

## 1. Instalação

```bash
cd bancada-10
npm install
```

## 2. Executando localmente (sem Supabase)

```bash
npm run dev
```

Acesse `http://localhost:3000`. **O site funciona inteiro sem nenhuma configuração adicional**: catálogo
demonstrativo, carrinho, checkout (em modo demonstração, sem cobrar de verdade) e navegação completa. Login,
cadastro, área do cliente e painel administrativo mostram um aviso claro pedindo a configuração do Supabase, em vez
de quebrar.

## 3. Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. Em **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e rode. Isso cria todas as tabelas, enums e as
   políticas de Row Level Security (RLS) que isolam dados de cliente e protegem os campos internos do fornecedor.
3. Em **Project Settings → API**, copie a `Project URL`, a `anon public key` e a `service_role key`.
4. Copie o arquivo de exemplo e preencha:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # nunca exposto ao navegador — usado só em rotas server-side
   ```

5. Em **Authentication → Providers**, confirme que "Email" está habilitado.
6. Reinicie `npm run dev`. Login, cadastro, área do cliente e painel administrativo passam a funcionar de verdade.

> ⚠️ O código hoje consome o **catálogo demonstrativo estático** (`src/lib/data/products.ts`) na vitrine pública,
> mesmo com o Supabase configurado — ver [seção 9](#9-catálogo-demonstrativo-x-catálogo-real) para o passo de
> migração para produtos reais do banco.

## 4. Criando o primeiro administrador

Requer a `service_role key` (nunca rode isso no navegador):

```bash
npm run create-admin -- admin@bancada10.com.br "uma-senha-forte-temporaria"
```

Isso cria o usuário no Supabase Auth (ou reaproveita se já existir) e o registra em `admin_users` com `role: owner`.
Acesse `/admin/login` com essas credenciais.

## 5. Mercado Pago (pagamentos)

1. Crie uma aplicação em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers/panel/app).
2. Copie a **Public Key** e o **Access Token** (use as chaves de teste primeiro).
3. Preencha em `.env.local`:

   ```env
   NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=...
   MERCADO_PAGO_ACCESS_TOKEN=...
   ```

4. Sem essas variáveis, o checkout continua funcionando em **modo demonstração**: o pedido é validado e registrado
   normalmente (se o Supabase estiver configurado), mas nenhuma preferência de pagamento é criada — a confirmação
   deixa isso explícito na tela. Com as variáveis preenchidas, `src/lib/mercadopago/create-preference.ts` cria uma
   preferência real e redireciona o cliente para o checkout do Mercado Pago.
5. Falta implementar (fora do escopo desta entrega, por depender de infraestrutura do fornecedor de pagamento em
   produção): a rota de **webhook** `/api/mercadopago/webhook` que atualiza `orders.status` automaticamente quando o
   pagamento é aprovado — hoje a preferência já aponta para essa URL, mas o handler ainda precisa ser criado e
   validado com `MERCADO_PAGO_WEBHOOK_SECRET`.

## 6. Cálculo de frete

`src/lib/shipping/calculate.ts` tem um cálculo simples e local (sem chamar nenhuma API externa), suficiente para o
carrinho, a PDP e o checkout funcionarem de ponta a ponta. Para conectar uma transportadora real (Melhor Envio,
Correios, API do fornecedor):

1. Preencha `SHIPPING_PROVIDER`, `SHIPPING_API_KEY`, `SHIPPING_ORIGIN_ZIP_CODE` em `.env.local`.
2. Substitua o corpo de `calculateShipping` por uma chamada real à API escolhida, mantendo a mesma assinatura
   (`{ zipCode, subtotal } → ShippingOption[]`) para não quebrar quem já a consome (carrinho, checkout, API de
   checkout no servidor).

A busca de endereço por CEP (`src/lib/shipping/viacep.ts`) já usa o [ViaCEP](https://viacep.com.br/), gratuito e sem
chave — só preenche o formulário automaticamente, nunca bloqueia o preenchimento manual se falhar.

## 7. Analytics

Preencha em `.env.local` os IDs que já tiver — cada script só carrega se a variável correspondente existir
(`src/components/analytics/AnalyticsScripts.tsx`):

```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
NEXT_PUBLIC_GTM_CONTAINER_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GOOGLE_ADS_ID=
```

Eventos já disparados pelo código (`src/lib/analytics/events.ts`, `trackEvent(...)`): `view_item`, `add_to_cart`,
`begin_checkout`, `purchase`, `search`, `apply_coupon`, `whatsapp_click`.

## 8. Identidade visual e logo oficial

- Paleta oficial já aplicada em `tailwind.config.ts` (`ink` #141414, `bancada.red` #D71920, `bancada.off` #F4F0E8).
- O monograma B10 (com o "0" representando um campo de futebol visto de cima) está implementado como um SVG
  placeholder em `src/components/ui/Logo.tsx` — funcional, mas **não é a arte final da marca**.
- Assim que o material oficial existir, coloque os arquivos em `public/brand/` (instruções detalhadas em
  `public/brand/README.md`) e troque `Logo.tsx` para usá-los.

## 9. Catálogo demonstrativo x catálogo real

A vitrine pública (`/`, `/categoria/*`, `/produto/*`, `/lancamentos`, `/ofertas`, busca) consome hoje
`src/lib/data/products.ts` — **produtos e clubes fictícios**, claramente comentados no topo do arquivo, com imagens
geradas em `/placeholder-image` (nunca fotos externas ou protegidas).

O Supabase já tem a tabela `products` (e `product_variants`, `product_images`) pronta para o catálogo real, e o
painel admin (`/admin/produtos`) já grava nela — incluindo **importação por CSV**
(`/admin/produtos/importar`, com botão para baixar o modelo). O que falta para a vitrine pública passar a ler do
banco em vez do arquivo estático:

1. Cadastrar o catálogo real (manualmente, por CSV, ou pela futura integração com o fornecedor).
2. Trocar as chamadas a `src/lib/data/products.ts` nas páginas públicas por consultas ao Supabase (`select` nas
   tabelas `products`/`product_variants`/`product_images`, com paginação/filtros equivalentes aos hoje calculados em
   memória por `src/lib/catalog/filter.ts`).

Isso foi deixado como um passo deliberado e não automático — importar um catálogo real exige revisão humana de
preços, estoque, imagens e principalmente do campo `licensing` (nunca apresentar um produto não licenciado como
oficial).

## 10. Painel administrativo

`/admin` (protegido por login + tabela `admin_users`, ver seção 4): produtos (+ importação CSV), pedidos (status,
transportadora, rastreio), clientes, fornecedores, cupons, promoções, banners, depoimentos (aprovação) e um resumo
de configurações da loja. A maior parte das telas grava direto no Supabase pelo client do navegador — protegido pelas
políticas de RLS em `supabase/schema.sql` (só quem tem linha ativa em `admin_users` pode escrever nessas tabelas,
mesmo com a `anon key` pública).

A arquitetura já está pronta para uma futura integração com catálogo/API de um fornecedor específico (tabela
`suppliers`, campos `supplier_id`/`supplier_internal_code` em `products` e `orders`) — **essa integração em si não
foi implementada**, por não haver documentação de nenhuma API de fornecedor real para seguir.

## 11. Publicando na Vercel

Este repositório tem dois projetos independentes (VagaHub na raiz, Bancada 10 em `bancada-10/`). Ao importar na
Vercel:

1. Import o repositório normalmente.
2. Em **Root Directory**, selecione `bancada-10`.
3. O framework (Next.js) é detectado automaticamente — não é necessário `vercel.json`.
4. Cadastre as variáveis de `.env.local` em **Settings → Environment Variables** (Production e Preview).
5. Configure `NEXT_PUBLIC_SITE_URL` com o domínio final antes de gerar o sitemap definitivo.

## Checklist de testes

- [x] Home no computador e no celular (hero, benefícios, categorias, produtos, seção retrô, promoção, depoimentos,
      Instagram, newsletter).
- [x] Busca (`/busca?q=...`).
- [x] Filtros de categoria (clube, liga, temporada, tamanho, versão, manga, cor, linha, retrô/atual, preço,
      disponibilidade) e gaveta de filtros no mobile.
- [x] Produto com variações (tamanho obrigatório, guia de medidas, transparência de licenciamento).
- [x] Personalização (nome/número validados, aviso de regra de troca).
- [x] Carrinho (quantidade, remoção, cupom, barra de frete grátis condicional).
- [x] Cupom (`BEMVINDO10`, `FRETEGRATIS` — ver `src/lib/data/coupons.ts`).
- [x] Checkout completo (identificação, CPF, endereço com busca automática por CEP, frete, pagamento, revisão,
      termos) até a página de confirmação.
- [x] Login, cadastro, recuperação de senha (com aviso claro quando o Supabase não está configurado).
- [x] Área do cliente (dados pessoais, endereços, pedidos, favoritos, solicitação de troca).
- [x] Rastreamento de pedido por protocolo + e-mail/CPF, sem expor dados internos do fornecedor.
- [x] Painel administrativo (produtos, importação CSV, pedidos, cupons, promoções, banners, depoimentos,
      fornecedores, clientes).
- [x] Links do rodapé (todas as páginas institucionais obrigatórias).
- [x] `npm run build` e `npm run lint` sem erros.
- [x] Página 404 e página de erro genérica.

## Riscos e limitações conhecidas

- **Status HTTP de `notFound()` em rodadas locais (`next start`)**: para uma categoria inexistente
  (`/categoria/algo-que-nao-existe`), a resposta local pode vir com status `200` em vez de `404`, mesmo mostrando a
  página "não encontrada" correta — comportamento conhecido do App Router para rotas que dependem de `searchParams`
  (o caso de `/categoria/[slug]`, por causa dos filtros). Para produto (`/produto/[slug]`, que não depende de
  `searchParams`) o status `404` já sai correto localmente, com `dynamicParams = false`. Em ambos os casos, a Vercel
  corrige isso automaticamente na camada de edge antes de entregar a resposta — vale reconferir com `curl -I` num
  deploy de preview antes de confiar 100% neste ponto em outro provedor de hospedagem.
- **Webhook do Mercado Pago não implementado** — ver [seção 5](#5-mercado-pago-pagamentos).
- **Vitrine pública ainda lê o catálogo demonstrativo estático**, não a tabela `products` do Supabase — ver
  [seção 9](#9-catálogo-demonstrativo-x-catálogo-real).
- **Sem integração real com API/catálogo de fornecedor** — só a estrutura de dados para isso existe.
- **Depoimentos, banners e promoções do painel admin ainda não estão conectados à renderização pública** (a home
  usa os arquivos estáticos em `src/lib/data/`) — o CRUD no Supabase já funciona e é o próximo passo natural para
  ligar a renderização a eles.
- **`src/types/database.ts` é um placeholder (`any`)** até os tipos reais serem gerados via
  `npx supabase gen types typescript`.

## Informações e credenciais ainda necessárias

- Arquivos oficiais da logo (ver [seção 8](#8-identidade-visual-e-logo-oficial)).
- Projeto Supabase (URL + chaves).
- Credenciais do Mercado Pago (produção).
- CNPJ, razão social, endereço e telefone fixo reais (não inventados em nenhum lugar do código).
- Número de WhatsApp oficial (`NEXT_PUBLIC_WHATSAPP_NUMBER`).
- IDs de GA4 / GTM / Meta Pixel / Google Ads.
- Fornecedor(es) de dropshipping e, se houver, documentação de uma API/catálogo deles para integração futura.
- Fotos reais dos produtos (Storage do Supabase) para substituir os placeholders gerados em `/placeholder-image`.
