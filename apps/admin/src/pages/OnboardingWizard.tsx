import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineServer,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineKey,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineClipboardDocumentCheck,
  HiOutlineExclamationTriangle,
  HiOutlineCircleStack,
  HiOutlineCpuChip,
} from "react-icons/hi2";
import { api, SetupStatus, SupabaseStatus } from "../services/api";

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isVerifyingStatus, setIsVerifyingStatus] = useState<boolean>(true);

  // Supabase Configuration State
  const [projectUrl, setProjectUrl] = useState<string>("");
  const [anonKey, setAnonKey] = useState<string>("");
  const [serviceRoleKey, setServiceRoleKey] = useState<string>("");
  const [useSandbox, setUseSandbox] = useState<boolean>(false);
  const [showServiceKey, setShowServiceKey] = useState<boolean>(false);

  // Supabase Live Verification State
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [connectionMessage, setConnectionMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [tableStatus, setTableStatus] = useState<SupabaseStatus["tablesStatus"] | null>(null);
  const [schemaSql, setSchemaSql] = useState<string>("");
  const [showSchemaModal, setShowSchemaModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Admin Account State
  const [adminName, setAdminName] = useState<string>("");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Final Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // 1. Check if installation has already been completed. If so, seal the wizard permanently.
  useEffect(() => {
    let mounted = true;
    const verifySystemState = async () => {
      try {
        const status: SetupStatus = await api.getSetupStatus();
        if (!mounted) return;
        if (status.isInstalled) {
          // If already installed, the wizard should NEVER be accessible again
          navigate(api.isAuthenticated() ? "/" : "/login", { replace: true });
          return;
        }
      } catch (err) {
        console.warn("[OnboardingWizard] Could not read status, continuing in setup mode:", err);
      } finally {
        if (mounted) setIsVerifyingStatus(false);
      }
    };

    verifySystemState();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Load Schema SQL for reference
  useEffect(() => {
    api.getSupabaseSchema()
      .then((res) => setSchemaSql(res.sql))
      .catch((err) => console.warn("Could not preload SQL schema:", err));
  }, []);

  const handleTestConnection = async () => {
    if (!projectUrl || (!serviceRoleKey && !anonKey)) {
      setConnectionMessage({
        success: false,
        text: "Please provide a valid Supabase Project URL and API Key.",
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionMessage(null);
    try {
      const keyToTest = serviceRoleKey || anonKey;
      const result = await api.testSupabase(projectUrl.trim(), keyToTest.trim());
      setConnectionMessage({
        success: result.success,
        text: result.message,
      });

      // Probe tables
      const status = await api.getSupabaseStatus();
      setTableStatus(status.tablesStatus);
    } catch (err: any) {
      setConnectionMessage({
        success: false,
        text: err.message || "Failed to reach Supabase project.",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleCopySchema = () => {
    if (!schemaSql) return;
    navigator.clipboard.writeText(schemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const validateStep2 = (): boolean => {
    if (useSandbox) return true;
    if (!projectUrl || !anonKey) {
      setConnectionMessage({
        success: false,
        text: "Project URL and Anon Key are required to connect Supabase.",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    setSubmissionError(null);
    if (!adminName.trim() || adminName.trim().length < 2) {
      setSubmissionError("Please provide an administrator name (at least 2 characters).");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail.trim())) {
      setSubmissionError("Please enter a valid administrator email address.");
      return false;
    }
    if (adminPassword.length < 6) {
      setSubmissionError("Password must be at least 6 characters long.");
      return false;
    }
    if (adminPassword !== confirmPassword) {
      setSubmissionError("Passwords do not match. Please re-enter.");
      return false;
    }
    return true;
  };

  const handleCompleteSetup = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      await api.completeSetup({
        supabase: useSandbox
          ? undefined
          : {
              url: projectUrl.trim(),
              anonKey: anonKey.trim(),
              serviceRoleKey: serviceRoleKey.trim() || undefined,
            },
        admin: {
          name: adminName.trim(),
          email: adminEmail.trim(),
          password: adminPassword,
        },
        useSandbox,
      });

      // Setup succeeded and auto-logged in. Redirect to executive dashboard.
      navigate("/", { replace: true });
    } catch (err: any) {
      setSubmissionError(err.message || "Setup execution failed. Please verify configurations.");
      setIsSubmitting(false);
    }
  };

  if (isVerifyingStatus) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-mono text-gray-400 uppercase tracking-widest">
          Inspecting System Installation Readiness...
        </p>
      </div>
    );
  }

  const steps = [
    { number: 1, label: "Preflight", icon: HiOutlineCpuChip },
    { number: 2, label: "Database", icon: HiOutlineCircleStack },
    { number: 3, label: "Admin Account", icon: HiOutlineUserCircle },
    { number: 4, label: "Deployment", icon: HiOutlineShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col justify-between selection:bg-indigo-500/30 font-sans">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-600/40 to-purple-800/0 blur-[130px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-emerald-600/30 to-cyan-800/0 blur-[130px]" />
      </div>

      {/* Top Bar Header */}
      <header className="relative z-10 w-full border-b border-white/[0.06] bg-black/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <HiOutlineServer className="text-xl text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">AccessGlobal</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Initial Setup
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Enterprise SaaS Deployment Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Wizard Active · Sealed Post-Install</span>
          </div>
        </div>
      </header>

      {/* Wizard Content Body */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 py-10 flex flex-col justify-center">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/[0.08] -z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 -z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.number;
              const isPast = currentStep > s.number;

              return (
                <div key={s.number} className="flex flex-col items-center gap-2 relative z-10">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 font-semibold text-xs ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20"
                        : isPast
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "bg-white/[0.04] border border-white/[0.1] text-gray-500"
                    }`}
                  >
                    {isPast ? <HiOutlineCheckCircle className="text-lg" /> : <Icon className="text-base" />}
                  </div>
                  <span
                    className={`text-[11px] font-medium tracking-wide ${
                      isActive ? "text-indigo-400 font-semibold" : isPast ? "text-emerald-400" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="bg-[#0b0e14]/90 border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* STEP 1: PREFLIGHT */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  Welcome to AccessGlobal
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  This one-time installation wizard prepares your database connections, initializes the security vault,
                  and provisions your master administrator account.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="text-sm font-semibold text-white">AES-256 Vault</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Zero client-side credential exposure. Secrets are encrypted using PBKDF2 and hardware-accelerated GCM ciphers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="text-sm font-semibold text-white">Supabase Realtime</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Direct integration with PostgreSQL. Real-time websockets stream order, product, and telemetry changes instantaneously.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="text-sm font-semibold text-white">Permanent Seal</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Once completed, the onboarding route is locked forever to prevent unauthorized administrative re-provisioning.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-3">
                <HiOutlineShieldCheck className="text-xl text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200/90 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold block mb-0.5">High-Security Architecture</strong>
                  Your database service_role key will remain strictly on the backend. Client browsers will only receive the public anon key for subscriptions with Row Level Security.
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <span>Begin Installation</span>
                  <HiOutlineArrowRight className="text-base" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DATABASE CONNECTION */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Supabase Database Setup</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Connect your Supabase project to enable real-time PostgreSQL synchronization.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSchemaModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-gray-300 border border-white/[0.1] transition-colors flex items-center gap-1.5"
                >
                  <HiOutlineCircleStack className="text-sm text-indigo-400" />
                  <span>View SQL Schema</span>
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Storage Mode</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {useSandbox
                      ? "Using resilient local JSON store. No cloud database required for initial testing."
                      : "Connecting directly to your Supabase PostgreSQL cloud project."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseSandbox(!useSandbox)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    useSandbox
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {useSandbox ? "Mode: Local Sandbox" : "Mode: Supabase Cloud"}
                </button>
              </div>

              {!useSandbox ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Supabase Project URL <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Anon Public Key <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Used safely in client browsers for real-time channels.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-300">
                        Service Role Key <span className="text-gray-500 text-[11px]">(Recommended for server-side CRUD)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowServiceKey(!showServiceKey)}
                        className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        {showServiceKey ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                        <span>{showServiceKey ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                    <input
                      type={showServiceKey ? "text" : "password"}
                      value={serviceRoleKey}
                      onChange={(e) => setServiceRoleKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                    <p className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
                      <HiOutlineLockClosed />
                      <span>Encrypted with AES-256-GCM. Never transmitted to client browsers.</span>
                    </p>
                  </div>

                  {/* Test Connection Button & Result */}
                  <div className="pt-2 flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={isTestingConnection}
                      onClick={handleTestConnection}
                      className="w-fit px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <HiOutlineKey className="text-indigo-400" />
                      <span>{isTestingConnection ? "Testing Connection..." : "Test Connection & Schema"}</span>
                    </button>

                    {connectionMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs border ${
                          connectionMessage.success
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {connectionMessage.text}
                      </div>
                    )}

                    {tableStatus && (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                          PostgreSQL Table Readiness
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                          {(["products", "categories", "orders", "users", "reviews"] as const).map((table) => {
                            const isReady = tableStatus[table];
                            return (
                              <div
                                key={table}
                                className={`px-2.5 py-1.5 rounded-lg border text-center text-xs font-mono font-medium ${
                                  isReady
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                }`}
                              >
                                {table}: {isReady ? "READY" : "MISSING"}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center space-y-3">
                  <HiOutlineExclamationTriangle className="text-3xl text-amber-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-amber-200">Local Sandbox Mode Selected</h4>
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                    The admin panel will operate with local resilient file storage. You can connect your live Supabase credentials at any time later in Settings.
                  </p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <HiOutlineArrowLeft />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) {
                      setCurrentStep(3);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <span>Continue to Admin Account</span>
                  <HiOutlineArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MASTER ADMIN ACCOUNT */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Create Master Administrator</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Provision the primary super admin account. This account will have full privileges to manage products, categories, orders, and system settings.
                </p>
              </div>

              {submissionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {submissionError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Administrator Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Super Administrator"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Administrator Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@accessglobal.io"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-300">
                        Admin Password <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                      </button>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Confirm Password <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-gray-400 space-y-1">
                  <p className="font-semibold text-gray-300">Security Assurances:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Passwords hashed with standard 10-round salted BCrypt</li>
                    <li>Synchronized with Supabase <code className="text-indigo-400">users</code> table if connected</li>
                    <li>Issued cryptographically signed JSON Web Token (JWT) session upon completion</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <HiOutlineArrowLeft />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep3()) {
                      setCurrentStep(4);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <span>Review & Finalize</span>
                  <HiOutlineArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FINALIZATION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Finalize & Seal Deployment</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Review configuration parameters before committing. Once finalized, this onboarding wizard will be sealed permanently.
                </p>
              </div>

              {submissionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {submissionError}
                </div>
              )}

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-gray-500 block">Database Provider</span>
                    <span className="text-sm font-semibold text-white">
                      {useSandbox ? "Local Resilient Store" : "Supabase PostgreSQL Cloud"}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold ${
                      useSandbox
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {useSandbox ? "Local Sandbox" : "Cloud Connected"}
                  </span>
                </div>

                {!useSandbox && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-[11px] font-mono uppercase text-gray-500 block">Project Endpoint</span>
                    <span className="text-xs font-mono text-indigo-400 break-all">{projectUrl}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-gray-500 block">Primary Super Administrator</span>
                    <span className="text-sm font-semibold text-white">{adminName}</span>
                    <span className="text-xs font-mono text-gray-400 block">{adminEmail}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Role: super_admin
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                  <HiOutlineCheckCircle className="text-xl text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-200/90 leading-relaxed">
                    <strong>Zero-Downtime Initialization:</strong> Upon clicking "Complete Setup & Launch Dashboard", credentials will be encrypted in the server vault, the admin user will be provisioned, and you will be securely authenticated into the executive command center.
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/[0.06]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <HiOutlineArrowLeft />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCompleteSetup}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-xl shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Finalizing Installation..." : "Complete Setup & Launch Dashboard"}</span>
                  <HiOutlineShieldCheck className="text-lg" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SQL Schema Script Modal */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0d1117] border border-white/[0.1] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white">Supabase PostgreSQL Schema</h3>
                <p className="text-xs text-gray-400">
                  Run this SQL in your Supabase SQL Editor if you are creating new tables from scratch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 font-mono text-[11px] text-gray-300 bg-black/50 p-4 rounded-xl border border-white/[0.05] my-4 leading-relaxed">
              <pre>{schemaSql || "-- Loading schema..."}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <span className="text-[11px] text-gray-500">Includes RLS policies and indexes.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <HiOutlineClipboardDocumentCheck className="text-base" />
                  <span>{copiedSql ? "Copied SQL!" : "Copy SQL Script"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSchemaModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] bg-black/40 backdrop-blur-md px-6 py-4 text-center">
        <p className="text-xs text-gray-500 font-mono">
          AccessGlobal Security Engineering · Military-Grade AES-256 Vault Architecture
        </p>
      </footer>
    </div>
  );
};

export default OnboardingWizard;
