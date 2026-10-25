import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, SetupStatus } from "../services/api";
import { FaShieldAlt } from "react-icons/fa";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(true);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        const status = await api.getSetupStatus();
        if (!isMounted) return;
        setSetupStatus(status);

        // Check local token presence
        const authed = api.isAuthenticated();
        setIsAuthenticated(authed);
      } catch (err) {
        console.warn("[AuthGuard] Setup status check failed, defaulting to protected:", err);
        // Fallback: If backend is unreachable or error, consider setup present and check local auth
        setSetupStatus({ isInstalled: true, requiresSetup: false, supabaseConfigured: false });
        setIsAuthenticated(api.isAuthenticated());
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white px-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute p-3 rounded-full bg-indigo-500/10 text-indigo-400">
            <FaShieldAlt className="text-xl animate-pulse" />
          </div>
        </div>
        <h3 className="mt-6 text-sm font-semibold tracking-wide text-gray-200">
          AccessGlobal Enterprise Guard
        </h3>
        <p className="mt-1 text-xs font-mono text-gray-500">
          Verifying security certificates & installation status...
        </p>
      </div>
    );
  }

  // 1. If system requires first-time setup, redirect to onboarding wizard
  if (setupStatus && setupStatus.requiresSetup) {
    return <Navigate to="/setup" replace />;
  }

  // 2. If unauthenticated, strictly block dashboard access and redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
