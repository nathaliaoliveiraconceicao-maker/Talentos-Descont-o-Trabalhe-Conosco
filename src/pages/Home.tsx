import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { useTenant } from '@/context/TenantContext';

const STEPS = [
  {
    icon: ClipboardList,
    title: '1. Preencha seus dados',
    description: 'Conte um pouco sobre você, sua disponibilidade e experiência profissional.',
  },
  {
    icon: Users,
    title: '2. Nossa equipe analisará seu perfil',
    description: 'A equipe de recrutamento avalia as informações enviadas com cuidado.',
  },
  {
    icon: UserCheck,
    title: '3. Convocação para entrevista',
    description: 'Os candidatos selecionados serão chamados para a próxima etapa.',
  },
];

export function Home() {
  const { tenant, settings } = useTenant();

  return (
    <div>
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(to bottom, ${tenant.primaryColor}, ${tenant.primaryColor}cc, ${tenant.primaryColor}99)`,
        }}
      >
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide">
            Banco de Talentos {tenant.name}
          </span>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
            {settings.heroTitle}
          </h1>
          <p className="max-w-xl text-base text-white/90 sm:text-lg">{settings.heroSubtitle}</p>
          <Link
            to={`/${tenant.slug}/candidatura`}
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold shadow-lg transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: tenant.secondaryColor, color: '#ffffff' }}
          >
            Quero me candidatar
          </Link>
        </div>
        <div className="pointer-events-none absolute -bottom-10 left-0 right-0 h-20 bg-neutral-50 [clip-path:ellipse(70%_100%_at_50%_100%)]" />
      </section>

      <section className="container-page py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-neutral-800 sm:text-3xl">Como funciona o processo</h2>
          <p className="mt-2 text-neutral-500">
            Simples, rápido e transparente — do cadastro até a chamada para entrevista.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title} className="text-center transition-shadow hover:shadow-card-hover">
              <CardBody className="flex flex-col items-center gap-3 py-8">
                <span
                  className="rounded-full p-3"
                  style={{ backgroundColor: `${tenant.primaryColor}1a`, color: tenant.primaryColor }}
                >
                  <step.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="font-bold text-neutral-800">{step.title}</h3>
                <p className="text-sm text-neutral-500">{step.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-xl2 border border-brand-yellow-300 bg-brand-yellow-50 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow-700" aria-hidden="true" />
          <p className="text-sm text-brand-yellow-900">{settings.initialMessage}</p>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white py-12">
        <div className="container-page flex flex-col items-center gap-3 text-center">
          <ShieldCheck className="h-6 w-6" style={{ color: tenant.primaryColor }} aria-hidden="true" />
          <p className="max-w-xl text-sm text-neutral-500">
            Seus dados são usados exclusivamente para processos de recrutamento e seleção da {tenant.name}.
            Consulte nossa{' '}
            <Link
              to={`/${tenant.slug}/politica-de-privacidade`}
              className="font-medium underline"
              style={{ color: tenant.primaryColor }}
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
