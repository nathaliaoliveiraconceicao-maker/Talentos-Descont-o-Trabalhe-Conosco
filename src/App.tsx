import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { TenantProvider } from '@/context/TenantContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { ProtectedRoute, SuperAdminRoute } from '@/router/ProtectedRoute';

// Plataforma
import { PlatformLanding } from '@/pages/PlatformLanding';
import { NotFound } from '@/pages/NotFound';

// Portal público de cada tenant ("/{slug}/...")
import { Home } from '@/pages/Home';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { ApplicationForm } from '@/pages/Application/ApplicationForm';
import { Confirmation } from '@/pages/Application/Confirmation';

// Painel do cliente ("/app/...")
import { AdminIndexRedirect } from '@/pages/admin/AdminIndexRedirect';
import { Login } from '@/pages/admin/Login';
import { Dashboard } from '@/pages/admin/Dashboard';
import { CandidatesList } from '@/pages/admin/CandidatesList';
import { CandidateDetail } from '@/pages/admin/CandidateDetail';
import { Reports } from '@/pages/admin/Reports';
import { TalentPool } from '@/pages/admin/TalentPool';
import { Settings } from '@/pages/admin/Settings';

// Painel da plataforma ("/superadmin/...")
import { SuperAdminIndexRedirect } from '@/pages/superadmin/SuperAdminIndexRedirect';
import { SuperAdminLogin } from '@/pages/superadmin/Login';
import { SuperAdminDashboard } from '@/pages/superadmin/Dashboard';
import { TenantsList } from '@/pages/superadmin/TenantsList';
import { TenantDetail } from '@/pages/superadmin/TenantDetail';
import { Plans } from '@/pages/superadmin/Plans';
import { Subscriptions } from '@/pages/superadmin/Subscriptions';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Raiz da plataforma (não pertence a nenhum tenant) */}
          <Route path="/" element={<PlatformLanding />} />
          <Route path="/nao-encontrado" element={<NotFound />} />

          {/* Portal público de cada cliente, identificado pelo slug */}
          <Route path="/:slug" element={<TenantProvider><PublicLayout /></TenantProvider>}>
            <Route index element={<Home />} />
            <Route path="candidatura" element={<ApplicationForm />} />
            <Route path="candidatura/confirmacao" element={<Confirmation />} />
            <Route path="politica-de-privacidade" element={<PrivacyPolicy />} />
          </Route>

          {/* Painel do cliente */}
          <Route path="/app" element={<AdminIndexRedirect />} />
          <Route path="/app/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/candidatos" element={<CandidatesList />} />
            <Route path="/app/candidatos/:id" element={<CandidateDetail />} />
            <Route path="/app/relatorios" element={<Reports />} />
            <Route path="/app/banco-de-talentos" element={<TalentPool />} />
            <Route path="/app/configuracoes" element={<Settings />} />
          </Route>

          {/* Painel da plataforma (superadmin) */}
          <Route path="/superadmin" element={<SuperAdminIndexRedirect />} />
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route
            element={
              <SuperAdminRoute>
                <SuperAdminLayout />
              </SuperAdminRoute>
            }
          >
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/superadmin/clientes" element={<TenantsList />} />
            <Route path="/superadmin/clientes/:tenantId" element={<TenantDetail />} />
            <Route path="/superadmin/planos" element={<Plans />} />
            <Route path="/superadmin/assinaturas" element={<Subscriptions />} />
          </Route>

          {/* Curinga de "página não encontrada" — sempre por último */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
