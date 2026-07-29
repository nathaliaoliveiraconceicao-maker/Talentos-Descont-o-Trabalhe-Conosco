import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { Home } from '@/pages/Home';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { ApplicationForm } from '@/pages/Application/ApplicationForm';
import { Confirmation } from '@/pages/Application/Confirmation';
import { Login } from '@/pages/admin/Login';
import { AdminIndexRedirect } from '@/pages/admin/AdminIndexRedirect';
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
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/candidatura" element={<ApplicationForm />} />
            <Route path="/candidatura/confirmacao" element={<Confirmation />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
          </Route>

          <Route path="/admin" element={<AdminIndexRedirect />} />
          <Route path="/admin/login" element={<Login />} />
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
            <Route path="/admin/banco-talentos" element={<TalentPool />} />
            <Route path="/admin/configuracoes" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
