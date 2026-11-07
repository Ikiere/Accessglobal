import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCircleStack,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { api } from "../services/api";
import { isSupabaseConfigured, saveSupabaseConfig, SUPABASE_URL, SUPABASE_ANON_KEY } from "../services/supabaseClient";

export const LoginComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = (location.state as any) || {};
  const [email, setEmail] = useState<string>(stateData.email || "admin@accessglobal.com");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(isSupabaseConfigured());

  // Quick Supabase Settings Drawer Toggle
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [configUrl, setConfigUrl] = useState<string>(SUPABASE_URL);
  const [configAnonKey, setConfigAnonKey] = useState<string>(SUPABASE_ANON_KEY);
  const [configSavedNotice, setConfigSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    setSupabaseConnected(isSupabaseConfigured());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email address and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.login(email.trim().toLowerCase(), password);
      const from = stateData?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.message || "Invalid credentials. Please verify your administrator email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configUrl.trim() || !configAnonKey.trim()) {
      setError("Supabase Project URL and Anon Key are required.");
      return;
    }
    saveSupabaseConfig(configUrl.trim(), configAnonKey.trim());
    setSupabaseConnected(true);
    setConfigSavedNotice("Supabase credentials updated! You can now log in.");
    setTimeout(() => {
      setShowConfigModal(false);
      setConfigSavedNotice(null);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Administrative Card */}
      <div className="bg-white border border-[#E5DAC9] rounded-2xl p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(18,67,48,0.07)] relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Header */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#124330] text-[#34D399] flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#1A5B42]">
              <HiOutlineShieldCheck className="text-3xl" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#121516]">
              Administrator Sign In
            </h1>
            <p className="text-xs text-[#57625B] mt-1.5 leading-relaxed">
              AccessGlobal Central Command &amp; Operations Portal
            </p>

            {/* Supabase Connection Status Pill */}
            <div className="pt-3 flex items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium border ${
                  supabaseConnected
                    ? "bg-[#E9F2ED] text-[#124330] border-[#124330]/20"
                    : "bg-[#FFF4E5] text-[#9A3412] border-[#FED7AA]"
                }`}
              >
                <HiOutlineCircleStack className="text-xs" />
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    supabaseConnected ? "bg-[#124330] animate-pulse" : "bg-[#EA580C]"
                  }`}
                />
                <span>
                  {supabaseConnected ? "Supabase Cloud: Connected" : "Supabase: Keys Pending"}
                </span>
              </span>

              {/* Quick Config Button */}
              <button
                type="button"
                onClick={() => setShowConfigModal(!showConfigModal)}
                title="Configure Supabase Project Keys"
                className="p-1 rounded-lg text-[#57625B] hover:text-[#124330] hover:bg-[#FBF8F3] transition-colors"
                aria-label="Supabase configuration"
              >
                <HiOutlineCog6Tooth className="text-sm" />
              </button>
            </div>
          </div>

          {/* Just Registered Notice */}
          {stateData.justRegistered && (
            <div className="p-3.5 rounded-xl bg-[#E9F2ED] border border-[#124330]/30 text-[#124330] text-xs flex items-center gap-2.5">
              <HiOutlineCheckBadge className="text-lg shrink-0" />
              <span>Administrator account confirmed! Please sign in with your credentials.</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <HiOutlineXCircle className="text-base shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#121516] mb-1.5 tracking-wide">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#57625B]">
                  <HiOutlineEnvelope className="text-base" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@accessglobal.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF8F3] border border-[#E5DAC9] text-sm text-[#121516] placeholder-[#57625B]/50 focus:outline-none focus:border-[#124330] focus:ring-1 focus:ring-[#124330] transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#121516] tracking-wide">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#57625B] hover:text-[#124330] flex items-center gap-1 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#57625B]">
                  <HiOutlineLockClosed className="text-base" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF8F3] border border-[#E5DAC9] text-sm text-[#121516] placeholder-[#57625B]/50 focus:outline-none focus:border-[#124330] focus:ring-1 focus:ring-[#124330] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#124330] hover:bg-[#1A5B42] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? "Authenticating Session..." : "Sign In to Admin Portal"}</span>
            <HiOutlineArrowRight className="text-sm" />
          </button>

          {/* Security Stamp */}
          <div className="pt-2 text-center text-[11px] text-[#57625B] border-t border-[#E5DAC9] flex items-center justify-center gap-1.5">
            <HiOutlineShieldCheck className="text-sm text-[#124330]" />
            <span>Direct Supabase BaaS · RLS &amp; JWT Security Engine</span>
          </div>
        </form>
      </div>

      {/* Supabase Key Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5DAC9] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#121516] mb-1">
              Supabase Project Connection
            </h3>
            <p className="text-xs text-[#57625B] mb-5 leading-relaxed">
              Enter your Supabase URL and Anon Key to connect directly without touching configuration files.
            </p>

            {configSavedNotice && (
              <div className="p-3 mb-4 rounded-xl bg-[#E9F2ED] text-[#124330] text-xs font-semibold">
                {configSavedNotice}
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#121516] mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  required
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] border border-[#E5DAC9] text-xs font-mono text-[#121516] focus:outline-none focus:border-[#124330]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#121516] mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="text"
                  required
                  value={configAnonKey}
                  onChange={(e) => setConfigAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] border border-[#E5DAC9] text-xs font-mono text-[#121516] focus:outline-none focus:border-[#124330]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#57625B] hover:text-[#124330]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#124330] hover:bg-[#1A5B42] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save &amp; Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginComponent;
