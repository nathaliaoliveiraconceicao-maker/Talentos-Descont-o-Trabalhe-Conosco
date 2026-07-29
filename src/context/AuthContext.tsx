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
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('E-mail ou senha inválidos. Verifique seus dados e tente novamente.');
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
