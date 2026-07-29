import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getAdminByUid } from '@/lib/adminApi';
import type { AdminUser } from '@/types/admin';

interface AuthContextValue {
  user: User | null;
  admin: AdminUser | null;
  /** true quando o usuário está autenticado, ativo e com papel admin ou rh. */
  isAuthorized: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

function isAuthorizedAdmin(admin: AdminUser | null): boolean {
  return !!admin && admin.active === true && (admin.role === 'admin' || admin.role === 'rh');
}

/**
 * Traduz o código de erro do Firebase Auth em uma mensagem específica. Isso é
 * essencial para diagnosticar problemas de login: "auth/user-not-found", por
 * exemplo, normalmente significa que o documento em admins/{uid} foi criado no
 * Firestore, mas o usuário correspondente nunca foi criado no Firebase
 * Authentication (isso deve ser feito via `npm run create-admin`, não apenas
 * criando o documento no Firestore).
 */
function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code ?? '';
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Não existe uma conta com esse e-mail e senha no Firebase Authentication. Verifique se o usuário foi criado com "npm run create-admin" (criar apenas o documento em admins/{uid} no Firestore não é suficiente).';
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
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/invalid-api-key':
      return 'Configuração do Firebase inválida (VITE_FIREBASE_API_KEY). Verifique o arquivo .env.';
    default:
      return `E-mail ou senha inválidos.${code ? ` (${code})` : ''}`;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const adminDoc = await getAdminByUid(firebaseUser.uid);
          setAdmin(adminDoc);
        } catch {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
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

  return (
    <AuthContext.Provider
      value={{ user, admin, isAuthorized: isAuthorizedAdmin(admin), loading, error, login, logout }}
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
