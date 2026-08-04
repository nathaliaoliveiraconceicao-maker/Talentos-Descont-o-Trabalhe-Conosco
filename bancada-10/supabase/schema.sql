-- ============================================================================
-- Bancada 10 — schema Supabase (Postgres)
-- ============================================================================
-- Como aplicar:
--   1. Crie um projeto em https://supabase.com/.
--   2. Cole este arquivo inteiro no SQL Editor do projeto e rode.
--   3. Preencha as variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
--      / SUPABASE_SERVICE_ROLE_KEY em .env.local (ver .env.example).
--   4. Gere os tipos TypeScript:
--        npx supabase gen types typescript --project-id <id> > src/types/database.ts
--
-- Este schema cobre o catálogo, pedidos, clientes, cupons/promoções,
-- depoimentos, banners, fornecedores e rastreamento. O código do site hoje
-- usa dados demonstrativos estáticos em src/lib/data/*; os nomes de coluna
-- abaixo foram pensados para bater com os tipos em src/lib/types.ts, para
-- facilitar a migração para o banco real quando o catálogo verdadeiro for
-- cadastrado.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type product_line as enum ('adulto', 'infantil', 'feminino');
create type product_version as enum ('jogador', 'torcedor');
create type sleeve_type as enum ('manga_curta', 'manga_longa');
create type shirt_kind as enum ('atual', 'retro');
create type licensing_status as enum (
  'oficial_licenciada',
  'versao_torcedor_licenciada',
  'versao_jogador_licenciada',
  'retro_licenciada',
  'alternativa_licenciada',
  'inspirada_nao_licenciada'
);
create type order_status as enum (
  'pagamento_pendente',
  'pagamento_aprovado',
  'em_separacao',
  'enviado_ao_fornecedor',
  'em_transito',
  'saiu_para_entrega',
  'entregue',
  'troca_solicitada',
  'cancelado'
);
create type payment_method as enum ('pix', 'credit_card', 'boleto');
create type coupon_type as enum ('percent', 'fixed', 'free_shipping');
create type admin_role as enum ('owner', 'catalog_manager', 'support');

-- ---------------------------------------------------------------------------
-- CATÁLOGO
-- ---------------------------------------------------------------------------
create table categories (
  slug text primary key,
  name text not null,
  description text not null default '',
  hero_image_url text,
  hero_image_alt text,
  competition_kind text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  contact_phone text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null default '',
  description text not null default '',
  care_instructions text[] not null default '{}',
  features text[] not null default '{}',
  competition_kind text not null,
  club text,
  league text,
  season text not null,
  line product_line not null default 'adulto',
  version product_version not null default 'torcedor',
  sleeve sleeve_type not null default 'manga_curta',
  kind shirt_kind not null default 'atual',
  color text not null default '',
  licensing licensing_status not null,
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2),
  pix_discount_percent numeric(5, 2) not null default 0,
  max_installments int not null default 1,
  personalization_available boolean not null default false,
  personalization_price_addon numeric(10, 2),
  badges text[] not null default '{}',
  category_slugs text[] not null default '{}',
  supplier_id uuid references suppliers (id),
  supplier_sku text,
  cost_price numeric(10, 2),
  processing_days int not null default 3,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_slugs_idx on products using gin (category_slugs);
create index products_active_idx on products (active);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  is_hover_image boolean not null default false,
  sort_order int not null default 0
);
create index product_images_product_id_idx on product_images (product_id);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  size text not null,
  sku text not null unique,
  stock int not null default 0 check (stock >= 0),
  unique (product_id, size)
);
create index product_variants_product_id_idx on product_variants (product_id);

-- ---------------------------------------------------------------------------
-- CLIENTES E ENDEREÇOS
-- ---------------------------------------------------------------------------
create table customers (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  cpf text,
  phone text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  label text default 'Principal',
  zip_code text not null,
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_customer_id_idx on addresses (customer_id);

create table wishlists (
  customer_id uuid not null references customers (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, product_id)
);

-- ---------------------------------------------------------------------------
-- CUPONS E PROMOÇÕES
-- ---------------------------------------------------------------------------
create table coupons (
  code text primary key,
  description text not null default '',
  type coupon_type not null,
  value numeric(10, 2) not null default 0,
  min_subtotal numeric(10, 2),
  active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit int,
  times_used int not null default 0,
  created_at timestamptz not null default now()
);

create table promotions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text not null default '',
  coupon_code text references coupons (code),
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PEDIDOS
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique,
  customer_id uuid references customers (id),
  customer_name text not null,
  customer_email text not null,
  customer_cpf text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  payment_method payment_method not null,
  subtotal numeric(10, 2) not null,
  discount numeric(10, 2) not null default 0,
  shipping_cost numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  status order_status not null default 'pagamento_pendente',
  coupon_code text references coupons (code),
  mercado_pago_payment_id text,
  -- Campos administrativos do fornecedor — NUNCA expor ao cliente via API
  -- pública. O endpoint de rastreamento do cliente deve selecionar apenas
  -- protocol/status/carrier/tracking_code/dispatched_at.
  supplier_id uuid references suppliers (id),
  supplier_internal_code text,
  internal_notes text,
  carrier text,
  tracking_code text,
  dispatched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_id_idx on orders (customer_id);
create index orders_protocol_idx on orders (protocol);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id),
  product_name text not null,
  size text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  personalization_name text,
  personalization_number text
);
create index order_items_order_id_idx on order_items (order_id);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  status order_status not null,
  note text,
  created_at timestamptz not null default now()
);
create index order_status_history_order_id_idx on order_status_history (order_id);

-- ---------------------------------------------------------------------------
-- CONTEÚDO (depoimentos, banners, newsletter)
-- ---------------------------------------------------------------------------
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  product_name text,
  verified_purchase boolean not null default false,
  is_demo boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  image_alt text not null default '',
  link_url text,
  placement text not null default 'home_hero',
  active boolean not null default true,
  sort_order int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz
);

create table newsletter_subscribers (
  email text primary key,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ADMINISTRAÇÃO
-- ---------------------------------------------------------------------------
create table admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  role admin_role not null default 'support',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FUNÇÃO AUXILIAR: é admin ativo?
-- ---------------------------------------------------------------------------
create or replace function is_active_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and active = true
  );
$$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table wishlists enable row level security;
alter table coupons enable row level security;
alter table promotions enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table testimonials enable row level security;
alter table banners enable row level security;
alter table newsletter_subscribers enable row level security;
alter table suppliers enable row level security;
alter table admin_users enable row level security;

-- Catálogo: leitura pública de itens ativos; escrita só admin.
create policy "catalog public read" on categories for select using (active = true or is_active_admin());
create policy "catalog admin write" on categories for all using (is_active_admin()) with check (is_active_admin());

create policy "products public read" on products for select using (active = true or is_active_admin());
create policy "products admin write" on products for all using (is_active_admin()) with check (is_active_admin());

create policy "product images public read" on product_images for select using (true);
create policy "product images admin write" on product_images for all using (is_active_admin()) with check (is_active_admin());

create policy "product variants public read" on product_variants for select using (true);
create policy "product variants admin write" on product_variants for all using (is_active_admin()) with check (is_active_admin());

-- Clientes: cada um só vê/edita o próprio registro; admin vê todos.
create policy "customers self read" on customers for select using (auth.uid() = id or is_active_admin());
create policy "customers self update" on customers for update using (auth.uid() = id or is_active_admin());
create policy "customers self insert" on customers for insert with check (auth.uid() = id);

create policy "addresses owner" on addresses for all
  using (customer_id = auth.uid() or is_active_admin())
  with check (customer_id = auth.uid() or is_active_admin());

create policy "wishlists owner" on wishlists for all
  using (customer_id = auth.uid() or is_active_admin())
  with check (customer_id = auth.uid() or is_active_admin());

-- Cupons/promoções: sem leitura pública direta (validação acontece no
-- servidor, com a service role) — só admin lê/edita pelo painel.
create policy "coupons admin only" on coupons for all using (is_active_admin()) with check (is_active_admin());
create policy "promotions public read active" on promotions for select using (active = true or is_active_admin());
create policy "promotions admin write" on promotions for all using (is_active_admin()) with check (is_active_admin());

-- Pedidos: cliente vê só os próprios; criação/gestão administrativa via
-- service role (rota /api/checkout, painel admin) ignora RLS.
create policy "orders owner read" on orders for select using (customer_id = auth.uid() or is_active_admin());
create policy "orders admin write" on orders for all using (is_active_admin()) with check (is_active_admin());

create policy "order items owner read" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_active_admin()))
);
create policy "order items admin write" on order_items for all using (is_active_admin()) with check (is_active_admin());

create policy "order status owner read" on order_status_history for select using (
  exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_active_admin()))
);
create policy "order status admin write" on order_status_history for all using (is_active_admin()) with check (is_active_admin());

-- Conteúdo: leitura pública do que está aprovado/ativo; escrita só admin.
create policy "testimonials public read approved" on testimonials for select using (approved = true or is_active_admin());
create policy "testimonials admin write" on testimonials for all using (is_active_admin()) with check (is_active_admin());

create policy "banners public read active" on banners for select using (active = true or is_active_admin());
create policy "banners admin write" on banners for all using (is_active_admin()) with check (is_active_admin());

-- Newsletter: qualquer um pode se inscrever (insert), ninguém lê a lista
-- exceto admin (evita vazar a base de e-mails).
create policy "newsletter insert" on newsletter_subscribers for insert with check (true);
create policy "newsletter admin read" on newsletter_subscribers for select using (is_active_admin());

-- Fornecedores e admins: só admin acessa — dados puramente internos.
create policy "suppliers admin only" on suppliers for all using (is_active_admin()) with check (is_active_admin());
create policy "admin users admin only" on admin_users for all using (is_active_admin()) with check (is_active_admin());

-- ---------------------------------------------------------------------------
-- VIEW pública de rastreamento (nunca expor colunas internas do fornecedor)
-- ---------------------------------------------------------------------------
create view public_order_tracking as
  select protocol, status, carrier, tracking_code, dispatched_at, created_at, customer_email, customer_cpf
  from orders;

comment on view public_order_tracking is
  'Usada pela página /rastrear-pedido — expõe só o necessário ao cliente (nunca supplier_id, supplier_internal_code, internal_notes, cost_price).';
