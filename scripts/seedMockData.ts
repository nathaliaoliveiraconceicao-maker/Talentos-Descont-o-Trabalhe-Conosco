/**
 * Popula o Firestore com candidatos fictícios para testar o painel administrativo.
 * Uso: npm run seed
 *
 * NUNCA utilize dados reais de candidatos neste script — apenas dados fictícios
 * para fins de demonstração e testes locais.
 */
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdmin } from './firebaseAdmin';

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elaine', 'Fábio', 'Gabriela', 'Hugo',
  'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nathan', 'Otávio',
  'Patrícia', 'Rafael', 'Sabrina', 'Thiago', 'Vitória',
];
const LAST_NAMES = [
  'Silva', 'Souza', 'Oliveira', 'Santos', 'Pereira', 'Costa', 'Ferreira',
  'Almeida', 'Ribeiro', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Araújo',
];
const NEIGHBORHOODS = [
  'Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'São José',
  'Santa Luzia', 'Cidade Alta', 'Parque das Flores', 'Bela Vista', 'Industrial',
];
const CITY = 'Descontópolis';
const AREAS = [
  'ajudante_acougue', 'acougueiro', 'padeiro', 'ajudante_padaria',
  'repositor_hortifruti', 'repositor', 'operador_caixa', 'fiscal_caixa',
  'administrativo', 'atendente_frios', 'conferente', 'estoquista',
];
const STATUSES = [
  'nova_candidatura', 'em_analise', 'pre_selecionado', 'entrevista_agendada',
  'aprovado', 'banco_talentos', 'nao_selecionado',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBool(probabilityTrue = 0.5): boolean {
  return Math.random() < probabilityTrue;
}

function yesNo(probabilityYes = 0.5): 'sim' | 'nao' {
  return randomBool(probabilityYes) ? 'sim' : 'nao';
}

function randomPastDate(daysAgoMax: number): string {
  const days = Math.floor(Math.random() * daysAgoMax);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function randomBirthDate(): string {
  const year = 1975 + Math.floor(Math.random() * 27); // 16 a ~50 anos
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const day = String(1 + Math.floor(Math.random() * 27)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function randomPhone(): string {
  const ddd = 10 + Math.floor(Math.random() * 89);
  const number = 900000000 + Math.floor(Math.random() * 99999999);
  return `(${ddd}) ${String(number).slice(0, 5)}-${String(number).slice(5)}`;
}

const TOTAL_MOCK_CANDIDATES = 30;

async function main() {
  initFirebaseAdmin();
  const db = getFirestore();
  const batch = db.batch();

  console.log(`\n=== Gerando ${TOTAL_MOCK_CANDIDATES} candidatos fictícios ===\n`);

  for (let i = 0; i < TOTAL_MOCK_CANDIDATES; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const hasWorkedBefore = yesNo(0.75);
    const mainArea = pick(AREAS);
    const createdAt = randomPastDate(45);
    const status = pick(STATUSES);

    const docRef = db.collection('candidates').doc();
    const emailSlug = `${firstName}.${lastName}${i}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    const candidate = {
      protocol: `DSC-TESTE-${1000 + i}`,
      personal: {
        fullName,
        birthDate: randomBirthDate(),
        cpf: '',
        city: CITY,
        neighborhood: pick(NEIGHBORHOODS),
        addressSummary: '',
        hasEasyAccess: pick(['sim', 'nao', 'parcialmente']),
        accessibilityNeeds: '',
      },
      contact: {
        whatsapp: randomPhone(),
        whatsappDigits: `55${Math.floor(10000000000 + Math.random() * 8999999999)}`,
        alternatePhone: '',
        email: `${emailSlug}@exemplo-fake.com`,
        contactPreference: pick(['whatsapp', 'ligacao', 'email']),
      },
      interest: {
        areas: [mainArea, pick(AREAS)],
        otherAreaDescription: '',
        mainAreaOfInterest: mainArea,
        acceptsOtherRole: yesNo(0.7),
        isFirstJob: hasWorkedBefore === 'sim' ? 'nao' : yesNo(0.6),
      },
      availability: {
        morning: randomBool(0.6),
        afternoon: randomBool(0.6),
        night: randomBool(0.3),
        fullTime: randomBool(0.4),
        saturdays: randomBool(0.6),
        sundays: randomBool(0.3),
        holidays: randomBool(0.3),
        shiftWork: randomBool(0.5),
        canStartImmediately: yesNo(0.6),
        estimatedStartDate: '',
        availableForOvertime: yesNo(0.5),
      },
      experience: {
        hasWorkedBefore,
        experiences: hasWorkedBefore === 'sim' ? [
          {
            id: `exp-${i}-1`,
            company: 'Empresa Fictícia LTDA',
            role: 'Atendente',
            startDate: '2022-01-01',
            endDate: '2023-06-01',
            isCurrentJob: false,
            activities: 'Atendimento ao público, organização de produtos e apoio no caixa.',
            leavingReason: 'Busca por novas oportunidades',
            referenceName: '',
            referencePhone: '',
            allowContactReference: false,
          },
        ] : [],
        workedInSupermarket: hasWorkedBefore === 'sim' ? yesNo(0.4) : 'nao',
        workedInRetail: hasWorkedBefore === 'sim' ? yesNo(0.5) : 'nao',
        hasCustomerServiceExperience: hasWorkedBefore === 'sim' ? yesNo(0.6) : 'nao',
        hasCashierExperience: hasWorkedBefore === 'sim' ? yesNo(0.4) : 'nao',
        hasRestockingExperience: hasWorkedBefore === 'sim' ? yesNo(0.3) : 'nao',
        hasStockExperience: hasWorkedBefore === 'sim' ? yesNo(0.3) : 'nao',
        hasButcherExperience: hasWorkedBefore === 'sim' ? yesNo(0.1) : 'nao',
        hasBakeryExperience: hasWorkedBefore === 'sim' ? yesNo(0.1) : 'nao',
        hasLeadershipExperience: hasWorkedBefore === 'sim' ? yesNo(0.2) : 'nao',
        mostExperiencedArea: hasWorkedBefore === 'sim' ? mainArea : '',
      },
      education: {
        educationLevel: pick(['medio_completo', 'medio_incompleto', 'superior_incompleto', 'fundamental_completo']),
        institution: '',
        technicalCourse: '',
        professionalCourses: '',
        certifications: '',
        basicComputerSkills: randomBool(0.5),
        officePackage: randomBool(0.3),
        posSystemsExperience: randomBool(0.2),
        otherSkills: '',
      },
      profile: {
        whyWorkHere: 'Quero fazer parte de uma equipe séria e crescer profissionalmente no varejo.',
        mainQualities: 'Pontualidade, proatividade e facilidade em trabalhar em equipe.',
        reactionToFeedback: 'Recebo bem e busco melhorar rapidamente.',
        helpingColleagueStory: 'Ajudei um colega a organizar o setor durante um dia de alto movimento.',
        goodServiceMeaning: 'Atender com atenção, respeito e agilidade.',
        dissatisfiedCustomerAction: 'Ouviria com calma e buscaria resolver ou chamaria um responsável.',
        futureExpectations: 'Crescer dentro da empresa e assumir mais responsabilidades.',
      },
      resume: null,
      consent: {
        confirmsTruthfulness: true,
        authorizesDataProcessing: true,
      },
      status,
      score: Math.floor(Math.random() * 14),
      scoreBreakdown: {},
      createdAt,
      updatedAt: createdAt,
      evaluation: {
        isFavorite: randomBool(0.15),
      },
    };

    batch.set(docRef, candidate);
  }

  await batch.commit();
  console.log(`✅ ${TOTAL_MOCK_CANDIDATES} candidatos fictícios criados com sucesso.\n`);
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro ao gerar dados fictícios:', error);
  process.exit(1);
});
