import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineServer,
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCircleStack,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { api } from "../services/api";

export const LoginComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = (location.state as any) || {};
  const [email, setEmail] = useState<string>(stateData.email || "");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSetup, setCheckingSetup] = useState<boolean>(true);

  // If system requires setup or Supabase is not connected, redirect directly to /setup!
  useEffect(() => {
    let mounted = true;
    api.getSetupStatus()
      .then((status) => {
        if (!mounted) return;
        if (status.requiresSetup || !status.supabaseConfigured) {
          navigate("/setup", { replace: true });
          return;
        }
        setCheckingSetup(false);
      })
      .catch((err) => {
        console.warn("[LoginComponent] Could not verify setup status:", err);
        setCheckingSetup(false);
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.login(email.trim().toLowerCase(), password);
      // Navigate to intended destination or executive dashboard
      const from = stateData?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your administrator email and password.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white px-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
        <span className="text-xs font-mono text-gray-400">Verifying Supabase connection...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container Card */}
      <div className="bg-[#0b0e14]/90 border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
              <HiOutlineServer className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Administrator Sign In
            </h2>
            <p className="text-xs text-gray-400">
              AccessGlobal Enterprise Management Portal
            </p>

            {/* Live Database Status Pill */}
            <div className="pt-1 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <HiOutlineCircleStack className="text-xs" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Cloud (Single Source of Truth)</span>
              </span>
            </div>
          </div>

          {/* Just Registered Notice */}
          {stateData.justRegistered && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <HiOutlineCheckBadge className="text-lg text-emerald-400 shrink-0" />
              <span>Administrator account created! Please sign in with your credentials.</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <HiOutlineXCircle className="text-base text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <HiOutlineEnvelope className="text-base" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <HiOutlineLockClosed className="text-base" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating Session..." : "Sign In to Admin Portal"}</span>
            <HiOutlineArrowRight className="text-sm" />
          </button>

          {/* Footer note */}
          <div className="pt-2 text-center text-[11px] text-gray-500 border-t border-white/[0.06]">
            <span>Military-Grade AES-256 Vault · Session Authenticated via JWT</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;