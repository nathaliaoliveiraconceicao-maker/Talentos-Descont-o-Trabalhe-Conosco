import { Card, CardBody } from '@/components/ui/Card';
import { useTenant } from '@/context/TenantContext';

export function PrivacyPolicy() {
  const { tenant, settings } = useTenant();

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-2xl font-bold text-neutral-800 sm:text-3xl">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {tenant.name} · Última atualização: {new Date(settings.updatedAt).toLocaleDateString('pt-BR')}
      </p>

      <Card className="mt-8">
        <CardBody className="prose prose-sm max-w-none space-y-5 py-6 text-neutral-700">
          <section>
            <p>{settings.privacyPolicyText}</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-800">1. Quais dados coletamos</h2>
            <p>
              Coletamos apenas as informações necessárias para o processo de recrutamento e seleção:
              dados de identificação e contato, cidade e bairro, área de interesse, disponibilidade,
              experiência profissional, escolaridade, respostas sobre seu perfil profissional e,
              opcionalmente, o currículo enviado. Não solicitamos fotografia, religião, estado civil,
              quantidade de filhos, orientação política ou qualquer informação não relacionada à
              triagem profissional.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-800">2. Finalidade do tratamento</h2>
            <p>
              Os dados fornecidos são utilizados exclusivamente para processos de recrutamento,
              seleção e formação de banco de talentos da {tenant.name}. Não vendemos nem utilizamos
              suas informações para fins de publicidade ou compartilhamos com terceiros fora dessa
              finalidade.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-800">3. Armazenamento e segurança</h2>
            <p>
              As informações são armazenadas em ambiente protegido (Firebase), com acesso restrito à
              equipe de recrutamento da {tenant.name}, autenticada e autorizada para esse fim.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-800">4. Retenção e exclusão</h2>
            <p>
              Os dados de candidatos incluídos no banco de talentos são mantidos por até{' '}
              {settings.talentPoolRetentionMonths} meses, podendo ser revisados periodicamente. Você
              pode solicitar a exclusão dos seus dados a qualquer momento entrando em contato com a
              nossa equipe.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-800">5. Seus direitos (LGPD)</h2>
            <p>
              Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a
              confirmar a existência de tratamento, acessar, corrigir e solicitar a exclusão dos seus
              dados pessoais, bem como revogar seu consentimento a qualquer momento.
            </p>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
