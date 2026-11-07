import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { FaShieldAlt } from "react-icons/fa";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated());
    setLoading(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white px-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-[#124330] animate-spin" />
          <div className="absolute p-3 rounded-full bg-[#124330]/20 text-emerald-400">
            <FaShieldAlt className="text-xl animate-pulse" />
          </div>
        </div>
        <h3 className="mt-6 text-sm font-semibold tracking-wide text-gray-200">
          AccessGlobal Enterprise Guard
        </h3>
        <p className="mt-1 text-xs font-mono text-gray-500">
          Verifying security certificates & session credentials...
        </p>
      </div>
    );
  }

  // If unauthenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
