import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey && import.meta.env.DEV) {
  console.warn(
    '[firebase] Variáveis de ambiente não encontradas. Copie ".env.example" para ".env" e preencha com os dados do seu projeto Firebase.'
  );
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firebase App Check — reduz o risco de bots/scripts fora do app chamarem a
// API do Firestore/Storage diretamente com a apiKey pública. Só é ativado se
// VITE_RECAPTCHA_SITE_KEY estiver definida (requer configuração manual no
// Console do Firebase > App Check, ver README); sem ela, o app funciona
// normalmente, apenas sem essa camada extra de proteção.
if (import.meta.env.VITE_APPCHECK_DEBUG_TOKEN && import.meta.env.DEV) {
  // Necessário para testar o App Check em localhost sem um token de
  // depuração, o SDK bloquearia o app pois localhost nunca passa no
  // reCAPTCHA. Nunca deve ser usado em produção — daí o guard de DEV.
  (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
}

if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
} else if (import.meta.env.DEV) {
  console.warn(
    '[firebase] VITE_RECAPTCHA_SITE_KEY não definida — App Check desativado. Veja o README para configurar.'
  );
}
