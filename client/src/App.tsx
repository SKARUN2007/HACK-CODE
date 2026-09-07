import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { VerificationPage } from './pages/VerificationPage';
import { MySubmissionsPage } from './pages/MySubmissionsPage';
import { QRResolvePage } from './pages/QRResolvePage';
import { AdminQRPage } from './pages/AdminQRPage';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { AuthorityTrustViewPage } from './pages/AuthorityTrustViewPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { PendingReportsPage } from './pages/PendingReportsPage';
import { ProjectIntelligencePage } from './pages/ProjectIntelligencePage';
import { MyAssignedCasesPage } from './pages/MyAssignedCasesPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { AdminSecurityPage } from './pages/AdminSecurityPage';
import { ReportCivicIssuePage } from './pages/ReportCivicIssuePage';
import { MyCivicReportsPage } from './pages/MyCivicReportsPage';
import { AdminAuthoritiesPage } from './pages/AdminAuthoritiesPage';
import { CivicIntelligenceMapPage } from './pages/CivicIntelligenceMapPage';
import { InspectorRoutePlannerPage } from './pages/InspectorRoutePlannerPage';
import { MyInspectionRoutesPage } from './pages/MyInspectionRoutesPage';
import { InspectionRouteHistoryPage } from './pages/InspectionRouteHistoryPage';
import { ContractorDashboard } from './pages/ContractorDashboard';
import { ContractorProgressUploadPage } from './pages/ContractorProgressUploadPage';
import { User } from './types';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('makkalsaantru_user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLoginSuccess = (user: User, token: string) => {
    setUser(user);
    localStorage.setItem('makkalsaantru_user', JSON.stringify(user));
    localStorage.setItem('makkalsaantru_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('makkalsaantru_user');
    localStorage.removeItem('makkalsaantru_token');
  };

  return (
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar userRole={user?.role} onLogout={handleLogout} />
          <NetworkStatusBanner />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/contractor" element={<ContractorDashboard />} />
              <Route path="/contractor/projects/:id/progress/new" element={<ContractorProgressUploadPage />} />
              <Route path="/citizen" element={<CitizenDashboard />} />
              <Route path="/citizen/report" element={<ReportCivicIssuePage />} />
              <Route path="/citizen/reports" element={<MyCivicReportsPage />} />
              <Route path="/citizen/pending" element={<PendingReportsPage />} />
              <Route path="/citizen/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/citizen/projects/:id/verify" element={<VerificationPage />} />
              <Route path="/citizen/submissions" element={<MySubmissionsPage />} />
              <Route path="/citizen/qr-resolve" element={<QRResolvePage />} />
              <Route path="/authority" element={<AuthorityDashboard />} />
              <Route path="/authority/civic-map" element={<CivicIntelligenceMapPage />} />
              <Route path="/authority/inspection-routes" element={<InspectorRoutePlannerPage />} />
              <Route path="/authority/my-routes" element={<MyInspectionRoutesPage />} />
              <Route path="/authority/inspection-routes/history" element={<InspectionRouteHistoryPage />} />
              <Route path="/authority/projects/:id" element={<ProjectIntelligencePage />} />
              <Route path="/authority/evidence/:id" element={<AuthorityTrustViewPage />} />
              <Route path="/authority/my-cases" element={<MyAssignedCasesPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/authorities" element={<AdminAuthoritiesPage />} />
              <Route path="/admin/projects/:id/verification-code" element={<AdminQRPage />} />
              <Route path="/admin/audit" element={<AdminAuditPage />} />
              <Route path="/admin/security" element={<AdminSecurityPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
