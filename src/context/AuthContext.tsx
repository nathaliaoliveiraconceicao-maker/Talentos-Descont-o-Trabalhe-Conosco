import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getPlatformAdmin, getTenantUser, getUserIndex } from '@/lib/adminApi';
import { getTenant } from '@/lib/tenantApi';
import { recordLoginBookkeeping } from '@/lib/tenantUsersApi';
import { isTenantOperational } from '@/types/tenant';
import type { AdminUser, PlatformAdmin } from '@/types/admin';

/**
 * Motivo pelo qual um usuário autenticado (Firebase Auth ok) ainda não pode
 * entrar no painel. `null` significa "sem problema, pode entrar".
 */
export type AuthIssue = 'inactive' | 'invitation_canceled' | 'tenant_suspended' | null;

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;

  /** Usuário da plataforma (acesso a todos os tenants). */
  platformAdmin: PlatformAdmin | null;
  isSuperAdmin: boolean;

  /** Usuário de um tenant específico (RH/admin/owner/viewer daquele cliente). */
  admin: AdminUser | null;
  tenantId: string | null;
  authIssue: AuthIssue;
  /** true quando autenticado, ativo, vinculado a um tenant e sem nenhum bloqueio. */
  isAuthorized: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Traduz o código de erro do Firebase Auth em uma mensagem específica —
 * essencial para diagnosticar problemas de login (ex.: "auth/user-not-found"
 * normalmente significa que existe um documento de usuário no Firestore mas
 * a conta correspondente nunca foi criada no Firebase Authentication).
 */
function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code ?? '';
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Não existe uma conta com esse e-mail e senha no Firebase Authentication.';
    case 'auth/wrong-password':
      return 'Senha incorreta para este e-mail.';
    case 'auth/invalid-email':
      return 'Formato de e-mail inválido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada no Firebase Authentication.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com o Firebase. Verifique sua internet e tente novamente.';
    case 'auth/invalid-api-key':
      return 'Configuração do Firebase inválida (VITE_FIREBASE_API_KEY). Verifique o arquivo .env.';
    default:
      return `E-mail ou senha inválidos.${code ? ` (${code})` : ''}`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformAdmin, setPlatformAdmin] = useState<PlatformAdmin | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [authIssue, setAuthIssue] = useState<AuthIssue>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setPlatformAdmin(null);
      setAdmin(null);
      setTenantId(null);
      setAuthIssue(null);

      if (firebaseUser) {
        try {
          const platform = await getPlatformAdmin(firebaseUser.uid);
          if (platform) {
            setPlatformAdmin(platform);
          } else {
            const index = await getUserIndex(firebaseUser.uid);
            if (index?.tenantId) {
              const [tenantUser, tenant] = await Promise.all([
                getTenantUser(index.tenantId, firebaseUser.uid),
                getTenant(index.tenantId),
              ]);
              setAdmin(tenantUser);
              setTenantId(index.tenantId);

              if (tenantUser) {
                // Documentos antigos (ex.: a usuária Patrícia) não têm
                // invitationStatus — tratamos como 'accepted', nunca como
                // bloqueado por um campo que nunca existiu neles.
                const invitationStatus = tenantUser.invitationStatus ?? 'accepted';
                if (!tenantUser.active) {
                  setAuthIssue('inactive');
                } else if (invitationStatus === 'canceled') {
                  setAuthIssue('invitation_canceled');
                } else if (tenant && !isTenantOperational(tenant)) {
                  setAuthIssue('tenant_suspended');
                } else {
                  recordLoginBookkeeping(index.tenantId, firebaseUser.uid, {
                    invitationStatus: tenantUser.invitationStatus,
                    passwordConfiguredAt: tenantUser.passwordConfiguredAt,
                    firstLoginAt: tenantUser.firstLoginAt,
                  }).catch((err) => console.error('[AuthContext] Falha ao registrar bookkeeping de login:', err));
                }
              }
            }
          }
        } catch {
          // mantém tudo nulo — o usuário verá a tela de "acesso não autorizado"
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(authErrorMessage(err));
      throw new Error('auth-failed');
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isSuperAdmin = !!platformAdmin && platformAdmin.active === true;
  const isAuthorized = !!admin && admin.active === true && authIssue === null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        platformAdmin,
        isSuperAdmin,
        admin,
        tenantId,
        authIssue,
        isAuthorized,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
}
