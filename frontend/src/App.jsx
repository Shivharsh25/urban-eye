import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Citizen Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import CitizenReportPage from './pages/CitizenReportPage';
import CitizenReportsPage from './pages/CitizenReportsPage';
import CitizenTrackingPage from './pages/CitizenTrackingPage';
import UserProfilePage from './pages/UserProfilePage';
import CitizenMapPage from './pages/CitizenMapPage';
import CitizenAlertsPage from './pages/CitizenAlertsPage';
import CitizenActivityPage from './pages/CitizenActivityPage';
import CitizenSettingsPage from './pages/CitizenSettingsPage';
import CitizenSupportPage from './pages/CitizenSupportPage';
import CitizenLayout from './layouts/CitizenLayout';

// Command Centre Authentication & Public Application
import AdminLoginPage from './pages/AdminLoginPage';
import DeptAdminApplyPage from './pages/DeptAdminApplyPage';

// Super Admin Portal Pages & Layout
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboardPage from './pages/superadmin/SuperAdminDashboardPage';
import SuperAdminDepartmentsPage from './pages/superadmin/SuperAdminDepartmentsPage';
import SuperAdminRequestsPage from './pages/superadmin/SuperAdminRequestsPage';
import SuperAdminAdminsPage from './pages/superadmin/SuperAdminAdminsPage';
import SuperAdminAllReportsPage from './pages/superadmin/SuperAdminAllReportsPage';
import SuperAdminAIConfigPage from './pages/superadmin/SuperAdminAIConfigPage';
import SuperAdminUsersPage from './pages/superadmin/SuperAdminUsersPage';
import SuperAdminAuditLogsPage from './pages/superadmin/SuperAdminAuditLogsPage';

// Department Admin Portal Pages & Layout
import DepartmentAdminLayout from './layouts/DepartmentAdminLayout';
import DeptAdminDashboardPage from './pages/deptadmin/DeptAdminDashboardPage';
import DeptAdminReportsPage from './pages/deptadmin/DeptAdminReportsPage';
import DeptAdminInProgressPage from './pages/deptadmin/DeptAdminInProgressPage';
import DeptAdminResolvedPage from './pages/deptadmin/DeptAdminResolvedPage';
import DeptAdminTeamsPage from './pages/deptadmin/DeptAdminTeamsPage';
import DeptAdminAnalyticsPage from './pages/deptadmin/DeptAdminAnalyticsPage';
import DeptAdminNotificationsPage from './pages/deptadmin/DeptAdminNotificationsPage';

import { ErrorBoundary } from './components/ErrorBoundary';

function HomeRedirect() {
  const { isSuperAdmin, isDeptAdmin } = useAuth();
  if (isSuperAdmin) return <Navigate to="/super-admin" replace />;
  if (isDeptAdmin) return <Navigate to="/dept-admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC3XzCS017KU681EYAZ1E3j5BwRV49ETHU';

export default function App() {
  return (
    <APIProvider apiKey={API_KEY}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
          <BrowserRouter>
            <ErrorBoundary>
            <Routes>
            {/* Public Auth & Application Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/apply-dept-admin" element={<DeptAdminApplyPage />} />

            {/* Citizen Routes (PROTECTED - 100% PRESERVED) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenDashboardPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenReportPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenReportsPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenReportsPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracking"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenTrackingPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <UserProfilePage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenMapPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenAlertsPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenActivityPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenSettingsPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <CitizenLayout>
                    <CitizenSupportPage />
                  </CitizenLayout>
                </ProtectedRoute>
              }
            />

            {/* Super Admin Command Center Routes */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <SuperAdminLayout>
                    <SuperAdminDashboardPage />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <SuperAdminLayout>
                    <SuperAdminDashboardPage />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/departments"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <SuperAdminLayout>
                    <SuperAdminDepartmentsPage />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/requests"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <SuperAdminLayout>
                    <SuperAdminRequestsPage />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/admins"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <SuperAdminLayout>
                    <SuperAdminAdminsPage />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/reports"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <SuperAdminLayout>
                    <SuperAdminAllReportsPage />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/ai-config"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <SuperAdminLayout>
                    <SuperAdminAIConfigPage />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/users"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <SuperAdminLayout>
                    <SuperAdminUsersPage />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/audit-logs"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <SuperAdminLayout>
                    <SuperAdminAuditLogsPage />
                  </SuperAdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Department Admin Command Center Routes */}
            <Route
              path="/dept-admin"
              element={
                <ProtectedRoute deptAdminOnly={true}>
                  <DepartmentAdminLayout>
                    <DeptAdminDashboardPage />
                  </DepartmentAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dept-admin/dashboard"
              element={
                <ProtectedRoute deptAdminOnly={true}>
                  <DepartmentAdminLayout>
                    <DeptAdminDashboardPage />
                  </DepartmentAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dept-admin/reports"
              element={
                <ProtectedRoute deptAdminOnly={true}>
                  <DepartmentAdminLayout>
                    <DeptAdminReportsPage />
                  </DepartmentAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dept-admin/in-progress"
              element={
                <ProtectedRoute deptAdminOnly={true}>
                  <DepartmentAdminLayout>
                    <DeptAdminInProgressPage />
                  </DepartmentAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dept-admin/resolved"
              element={
                <ProtectedRoute deptAdminOnly={true}>
                  <DepartmentAdminLayout>
                    <DeptAdminResolvedPage />
                  </DepartmentAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dept-admin/teams"
              element={
                <ProtectedRoute deptAdminOnly={true}>
                  <DepartmentAdminLayout>
                    <DeptAdminTeamsPage />
                  </DepartmentAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dept-admin/analytics"
              element={
                <ProtectedRoute deptAdminOnly={true}>
                  <DepartmentAdminLayout>
                    <DeptAdminAnalyticsPage />
                  </DepartmentAdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dept-admin/notifications"
              element={
                <ProtectedRoute deptAdminOnly={true}>
                  <DepartmentAdminLayout>
                    <DeptAdminNotificationsPage />
                  </DepartmentAdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Default Index Route */}
            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  </AuthProvider>
</APIProvider>
  );
}
