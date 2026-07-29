import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, CreditCard, LayoutDashboard, LogOut, Menu, ReceiptText, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';

const NAV_ITEMS = [
  { to: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/superadmin/clientes', label: 'Clientes', icon: Building2 },
  { to: '/superadmin/planos', label: 'Planos', icon: CreditCard },
  { to: '/superadmin/assinaturas', label: 'Assinaturas', icon: ReceiptText },
];

export function SuperAdminLayout() {
  const { platformAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/superadmin/login', { replace: true });
  };

  const displayName = platformAdmin?.name ?? user?.email ?? 'Usuário';

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-neutral-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
          <div>
            <Logo className="h-7" />
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-brand-navy-600">
              Painel da plataforma
            </p>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-navy-100 text-brand-navy-800'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 p-4">
          <p className="truncate text-sm font-medium text-neutral-700">{displayName}</p>
          <p className="text-xs text-neutral-400">Superadmin</p>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <header className="flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <Logo className="h-7" />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
