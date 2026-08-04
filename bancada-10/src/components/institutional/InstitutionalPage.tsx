import { Breadcrumb } from '@/components/catalog/Breadcrumb'

export function InstitutionalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: title }]} />
      <h1 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">{title}</h1>
      <div className="prose-b10 mt-6 max-w-2xl">{children}</div>
    </div>
  )
}
