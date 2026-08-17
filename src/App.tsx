import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { WorkbenchPage } from './pages/WorkbenchPage';
import { MarketPage } from './pages/MarketPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { LoginPage } from './pages/LoginPage';

// Profile Pages
import { ProfileLayout } from './pages/profile/ProfileLayout';
import { ProfileOverviewPage } from './pages/profile/ProfileOverviewPage';
import { EditProfilePage } from './pages/profile/EditProfilePage';
import { RecommendationsPage } from './pages/profile/RecommendationsPage';
import { FavoritesPage } from './pages/profile/FavoritesPage';
import { ReportsPage } from './pages/profile/ReportsPage';
import { PreferencesPage } from './pages/profile/PreferencesPage';
import { SecurityPage } from './pages/profile/SecurityPage';

// Admin Pages
import { AdminRoute } from './components/auth/AdminRoute';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAIUsagePage } from './pages/admin/AdminAIUsagePage';
import { AdminModelsPage } from './pages/admin/AdminModelsPage';
import { AdminTaxonomyPage } from './pages/admin/AdminTaxonomyPage';
import { AdminRecommendationsPage } from './pages/admin/AdminRecommendationsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAIPage } from './pages/admin/AdminAIPage';
import { AdminPromptsPage } from './pages/admin/AdminPromptsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminRolesPage } from './pages/admin/AdminRolesPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminVersionsPage } from './pages/admin/AdminVersionsPage';
import { AdminStatusPage } from './pages/admin/AdminStatusPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { SettingsProvider } from './contexts/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="workbench" element={<WorkbenchPage />} />
              <Route path="market" element={<MarketPage />} />
              <Route path="architecture" element={<ArchitecturePage />} />
              
              {/* Profile Routes */}
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfileLayout />
                </ProtectedRoute>
              }>
                <Route index element={<ProfileOverviewPage />} />
                <Route path="edit" element={<EditProfilePage />} />
                <Route path="recommendations" element={<RecommendationsPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="preferences" element={<PreferencesPage />} />
                <Route path="security" element={<SecurityPage />} />
              </Route>
            </Route>

            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              
              <Route path="models" element={<AdminModelsPage />} />
              <Route path="taxonomy" element={<AdminTaxonomyPage />} />
              
              <Route path="recommendations" element={<AdminRecommendationsPage />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              
              <Route path="ai" element={<AdminAIPage />} />
            <Route path="ai/usage" element={<AdminAIUsagePage />} />
              <Route path="prompts" element={<AdminPromptsPage />} />
              
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="roles" element={<AdminRolesPage />} />
              
              <Route path="audit" element={<AdminAuditPage />} />
              <Route path="versions" element={<AdminVersionsPage />} />
              <Route path="status" element={<AdminStatusPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
    </SettingsProvider>
  );
}
