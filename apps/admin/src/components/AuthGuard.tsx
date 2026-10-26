import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, SetupStatus } from "../services/api";
import { FaShieldAlt } from "react-icons/fa";
import { HiOutlineArrowPath } from "react-icons/hi2";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(true);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<boolean>(false);

  const checkAccess = async () => {
    setLoading(true);
    setBackendError(false);
    try {
      const status = await api.getSetupStatus();
      setSetupStatus(status);
      setIsAuthenticated(api.isAuthenticated());
    } catch (err) {
      console.warn("[AuthGuard] Setup status check failed:", err);
      setBackendError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
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

  // If backend service is down or unreachable
  if (backendError) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4 max-w-md">
          <h3 className="text-sm font-semibold mb-1">Backend Connection Unavailable</h3>
          <p className="text-xs text-rose-300">
            Could not reach the AccessGlobal API gateway. Please ensure the backend server is running on port 5000.
          </p>
        </div>
        <button
          onClick={checkAccess}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <HiOutlineArrowPath />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // 1. If system requires first-time setup or Supabase is disconnected, strictly redirect to setup wizard
  if (!setupStatus || setupStatus.requiresSetup || !setupStatus.supabaseConfigured) {
    return <Navigate to="/setup" replace />;
  }

  // 2. If unauthenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
