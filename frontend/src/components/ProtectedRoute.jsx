import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ 
  children, 
  adminOnly = false,
  superAdminOnly = false,
  deptAdminOnly = false 
}) {
  const { user, loading, isAdmin, isSuperAdmin, isDeptAdmin } = useAuth();
  const location = useLocation();

  // If user navigates back using browser <- button after logout, prevent restoring cached state
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted && !user) {
        window.location.replace('/');
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">AUTHENTICATING SESSION...</p>
        </div>
      </div>
    );
  }

  // 1. Strict unauthenticated check: if not logged in, NO ACCESS allowed!
  if (!user) {
    const targetLogin = (superAdminOnly || deptAdminOnly || adminOnly) ? '/admin-login' : '/login';
    return <Navigate to={targetLogin} replace state={{ from: location }} />;
  }

  // 2. Role authorization checks
  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  if (deptAdminOnly && !isDeptAdmin) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return children;
}
