import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import CitizenReportPage from './pages/CitizenReportPage';
import CitizenReportsPage from './pages/CitizenReportsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAnnouncementsPage from './pages/AdminAnnouncementsPage';
import UserProfilePage from './pages/UserProfilePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import AdminLayout from './layouts/AdminLayout';
import CitizenLayout from './layouts/CitizenLayout';

import AdminLoginPage from './pages/AdminLoginPage';
import CitizenMapPage from './pages/CitizenMapPage';
import CitizenAlertsPage from './pages/CitizenAlertsPage';
import CitizenActivityPage from './pages/CitizenActivityPage';
import CitizenSettingsPage from './pages/CitizenSettingsPage';
import CitizenSupportPage from './pages/CitizenSupportPage';

function HomeRedirect() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
}
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export default function App() {
  return (
    <APIProvider apiKey={API_KEY}>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Citizen Routes */}
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

            {/* Admin-Only Command Center */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout>
                    <AdminDashboardPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout>
                    <AdminAnalyticsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout>
                    <AdminUsersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout>
                    <AdminAnnouncementsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout>
                    <AdminSettingsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Default Index Route */}
            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
    </APIProvider>
  );
}
