/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  /** Prazo padrão (meses) de retenção usado ao semear um tenant novo. Ver tenantApi.ts. */
  readonly VITE_DEFAULT_RETENTION_MONTHS?: string;
  /** Site key (v3) do reCAPTCHA usada pelo Firebase App Check. Ver README. */
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  /** Token de depuração do App Check, só para localhost (nunca em produção). */
  readonly VITE_APPCHECK_DEBUG_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
