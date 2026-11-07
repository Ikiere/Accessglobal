import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { api } from "../services/api";

export const LoginComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = (location.state as any) || {};
  const [email, setEmail] = useState<string>(stateData.email || "admin@accessglobal.com");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Administrative Card */}
      <div className="bg-white border border-[#E5DAC9] rounded-2xl p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(18,67,48,0.07)] relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Header with Official Site Logo */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#124330] flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#1A5B42]/40">
              {/* Official Site Logo Icon */}
              <svg
                width="36"
                height="36"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path d="M7 23L16 9L25 23H20L16 16.5L12 23H7Z" fill="#fbfaf8" />
                <circle cx="16" cy="11" r="1.5" fill="#fbfaf8" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#121516]">
              Administrator Sign In
            </h1>
            <p className="text-xs text-[#57625B] mt-1.5 leading-relaxed">
              AccessGlobal Central Command &amp; Operations Portal
            </p>
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
            <span>Encrypted 256-bit Session · Hardware Security Verified</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;
