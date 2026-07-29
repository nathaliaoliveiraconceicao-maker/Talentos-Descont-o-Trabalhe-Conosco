import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Archive, LayoutDashboard, LineChart, LogOut, Menu, Settings, Users, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/candidatos', label: 'Candidatos', icon: Users },
  { to: '/admin/relatorios', label: 'Relatórios', icon: LineChart },
  { to: '/admin/banco-talentos', label: 'Banco de Talentos', icon: Archive },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  rh: 'RH',
};

export function AdminLayout() {
  const { admin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const displayName = admin?.name ?? user?.email ?? 'Usuário';

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-neutral-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
          <Logo className="h-8" />
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
                    ? 'bg-brand-blue-100 text-brand-blue-800'
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
          {admin?.role && (
            <p className="text-xs text-neutral-400">{ROLE_LABELS[admin.role] ?? admin.role}</p>
          )}
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </button>
            <Logo className="h-7 lg:hidden" />
          </div>
          <div className="hidden items-center gap-2 text-sm text-neutral-600 lg:flex">
            <span className="font-medium text-neutral-800">{displayName}</span>
            {admin?.role && (
              <span className="rounded-full bg-brand-blue-100 px-2.5 py-0.5 text-xs font-semibold text-brand-blue-800">
                {ROLE_LABELS[admin.role] ?? admin.role}
              </span>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
