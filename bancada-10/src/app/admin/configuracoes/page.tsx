import { AdminShell } from '@/components/admin/AdminShell'
import { siteConfig, topBarMessages } from '@/lib/site-config'
import { FREE_SHIPPING_THRESHOLD, FREE_SHIPPING_CAMPAIGN_ACTIVE } from '@/lib/data/coupons'

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Configurações da loja</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Nesta primeira versão, as configurações abaixo vivem em código (
        <code>src/lib/site-config.ts</code>, <code>src/lib/data/coupons.ts</code>) e variáveis de ambiente (
        <code>.env.local</code>), não em uma tabela editável pelo painel. Isso evita inventar uma camada de
        configuração dinâmica sem necessidade real ainda — se o time preferir editar isso sem deploy no futuro, o
        próximo passo é criar uma tabela <code>store_settings</code> no Supabase e ler esses valores dela.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded border border-ink/10 bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Identidade e atendimento</h2>
          <dl className="mt-2 space-y-1 text-sm text-ink-muted">
            <div>Nome: {siteConfig.name}</div>
            <div>E-mail: {siteConfig.email}</div>
            <div>Horário: {siteConfig.serviceHours}</div>
            <div>WhatsApp configurado: {siteConfig.whatsappNumber ? 'sim' : 'não (ver NEXT_PUBLIC_WHATSAPP_NUMBER)'}</div>
          </dl>
        </div>

        <div className="rounded border border-ink/10 bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Frete grátis</h2>
          <dl className="mt-2 space-y-1 text-sm text-ink-muted">
            <div>Campanha ativa: {FREE_SHIPPING_CAMPAIGN_ACTIVE ? 'sim' : 'não'}</div>
            <div>Valor mínimo: R$ {FREE_SHIPPING_THRESHOLD.toFixed(2)}</div>
          </dl>
        </div>

        <div className="rounded border border-ink/10 bg-white p-4 sm:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Mensagens da barra superior</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
            {topBarMessages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  )
}
