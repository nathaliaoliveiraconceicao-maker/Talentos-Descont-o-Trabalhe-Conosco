import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/router/ProtectedRoute';

// Páginas públicas
import { Home } from '@/pages/Home';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { ApplicationForm } from '@/pages/Application/ApplicationForm';
import { Confirmation } from '@/pages/Application/Confirmation';

// Páginas administrativas (RH)
import { AdminIndexRedirect } from '@/pages/admin/AdminIndexRedirect';
import { Login } from '@/pages/admin/Login';
import { Dashboard } from '@/pages/admin/Dashboard';
import { CandidatesList } from '@/pages/admin/CandidatesList';
import { CandidateDetail } from '@/pages/admin/CandidateDetail';
import { Reports } from '@/pages/admin/Reports';
import { TalentPool } from '@/pages/admin/TalentPool';
import { Settings } from '@/pages/admin/Settings';

import { NotFound } from '@/pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/candidatura" element={<ApplicationForm />} />
            <Route path="/candidatura/confirmacao" element={<Confirmation />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
          </Route>

          {/* "/admin" apenas redireciona para login ou dashboard conforme a sessão */}
          <Route path="/admin" element={<AdminIndexRedirect />} />

          {/* Login do RH — fora do ProtectedRoute, senão nunca seria alcançável */}
          <Route path="/admin/login" element={<Login />} />

          {/* Rotas administrativas protegidas (exigem login + active + role admin/rh) */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/candidatos" element={<CandidatesList />} />
            <Route path="/admin/candidatos/:id" element={<CandidateDetail />} />
            <Route path="/admin/relatorios" element={<Reports />} />
            <Route path="/admin/banco-de-talentos" element={<TalentPool />} />
            <Route path="/admin/configuracoes" element={<Settings />} />
          </Route>

          {/* Curinga de "página não encontrada" — sempre por último */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
