import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, userInfo, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Basic front-end check
  if (!userInfo?.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">403 Forbidden</h2>
          <p className="text-slate-500 mb-6">您没有权限访问管理后台</p>
          <a href="/workbench" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">返回业务端</a>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};
