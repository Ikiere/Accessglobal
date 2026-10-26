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
  HiOutlineCircleStack,
  HiOutlineCommandLine,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
  HiOutlineArrowPath
} from "react-icons/hi2";
import { api, SetupStatus } from "../services/api";

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Navigation: Step 1 (Connect Supabase), Step 2 (SQL Tables), Step 3 (Create Admin)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isVerifyingStatus, setIsVerifyingStatus] = useState<boolean>(true);

  // Supabase Credentials State
  const [projectUrl, setProjectUrl] = useState<string>("");
  const [anonKey, setAnonKey] = useState<string>("");
  const [serviceRoleKey, setServiceRoleKey] = useState<string>("");
  const [showServiceKey, setShowServiceKey] = useState<boolean>(false);
  const [connectionString, setConnectionString] = useState<string>("");
  const [showDirectConn, setShowDirectConn] = useState<boolean>(false);
  const [projectRef, setProjectRef] = useState<string>("");

  // Testing & Connection State
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Step 2: Database Tables & Schema State
  const [schemaSql, setSchemaSql] = useState<string>("");
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [isDeployingSql, setIsDeployingSql] = useState<boolean>(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [isVerifyingTables, setIsVerifyingTables] = useState<boolean>(false);
  const [tableStatus, setTableStatus] = useState<{
    categories: boolean;
    products: boolean;
    orders: boolean;
    users: boolean;
    reviews: boolean;
  }>({
    categories: false,
    products: false,
    orders: false,
    users: false,
    reviews: false
  });
  const [allTablesReady, setAllTablesReady] = useState<boolean>(false);

  // Step 3: Admin Account State
  const [adminName, setAdminName] = useState<string>("");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState<boolean>(false);
  const [adminCreatedSuccess, setAdminCreatedSuccess] = useState<boolean>(false);

  // 1. Initial State Check:
  // If Supabase is already configured AND admin user is created (isInstalled = true),
  // wizard is sealed and redirects immediately.
  // If Supabase is NOT connected, or if disconnected, user remains here.
  useEffect(() => {
    let mounted = true;
    const checkState = async () => {
      try {
        const status: SetupStatus = await api.getSetupStatus();
        if (!mounted) return;

        if (status.isInstalled) {
          // Already fully installed: wizard is sealed
          navigate(api.isAuthenticated() ? "/" : "/login", { replace: true });
          return;
        }

        // If Supabase is already connected but tables/admin are incomplete:
        if (status.supabaseConfigured) {
          if (status.projectUrl) setProjectUrl(status.projectUrl);
          if (status.projectRef) setProjectRef(status.projectRef);

          if (status.tablesReady) {
            setAllTablesReady(true);
            if (status.tablesStatus) setTableStatus(status.tablesStatus);
            // Tables are ready, take user directly to admin creation step
            setCurrentStep(3);
          } else {
            // Supabase connected, take user to tables step
            setCurrentStep(2);
            if (status.tablesStatus) setTableStatus(status.tablesStatus);
          }
        }
      } catch (err) {
        console.warn("[OnboardingWizard] Backend status check error:", err);
      } finally {
        if (mounted) setIsVerifyingStatus(false);
      }
    };

    checkState();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Load SQL schema
  useEffect(() => {
    api.getSupabaseSchema()
      .then((res) => setSchemaSql(res.sql))
      .catch((err) => console.warn("Could not preload SQL schema:", err));
  }, []);

  // Probing tables when in Step 2
  useEffect(() => {
    if (currentStep === 2) {
      checkTables();
    }
  }, [currentStep]);

  const checkTables = async () => {
    setIsVerifyingTables(true);
    try {
      const probe = await api.verifyTables();
      setTableStatus(probe.tables);
      setAllTablesReady(probe.allReady);
    } catch (err) {
      console.warn("Table probe error:", err);
    } finally {
      setIsVerifyingTables(false);
    }
  };

  // Step 1: Test Supabase connection
  const handleTestConnection = async () => {
    if (!projectUrl.trim() || (!anonKey.trim() && !serviceRoleKey.trim())) {
      setTestResult({
        success: false,
        message: "Please enter your Supabase Project URL and at least one API key."
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setConnectError(null);

    try {
      const keyToTest = serviceRoleKey.trim() || anonKey.trim();
      const res = await api.testSupabase(projectUrl.trim(), keyToTest);
      setTestResult({
        success: res.success,
        message: res.message
      });
      if (res.projectRef) {
        setProjectRef(res.projectRef);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to reach Supabase project."
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Step 1: Save & Connect Supabase
  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectUrl.trim() || !anonKey.trim()) {
      setConnectError("Supabase Project URL and Anon Key are required.");
      return;
    }

    setIsConnecting(true);
    setConnectError(null);

    try {
      const res = await api.connectSupabase({
        url: projectUrl.trim(),
        anonKey: anonKey.trim(),
        serviceRoleKey: serviceRoleKey.trim() || undefined,
        connectionString: connectionString.trim() || undefined
      });

      if (res.projectRef) {
        setProjectRef(res.projectRef);
      }
      if (res.tablesStatus) {
        setTableStatus(res.tablesStatus);
      }
      if (res.tablesReady) {
        setAllTablesReady(true);
      }

      // Advance to Step 2: SQL tables
      setCurrentStep(2);
    } catch (err: any) {
      setConnectError(err.message || "Failed to connect to Supabase.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Step 2: Copy Schema SQL
  const handleCopySchema = () => {
    if (!schemaSql) return;
    navigator.clipboard.writeText(schemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Step 2: Execute SQL automatically (if direct connection string available)
  const handleDeploySql = async () => {
    if (!schemaSql) return;
    setIsDeployingSql(true);
    setDeployError(null);

    try {
      const res = await api.executeSql(schemaSql, connectionString.trim() || undefined);
      if (res.tablesReady) {
        setAllTablesReady(true);
      }
      await checkTables();
    } catch (err: any) {
      setDeployError(err.message || "Failed to execute PostgreSQL script directly. Use the Supabase SQL Editor option.");
    } finally {
      setIsDeployingSql(false);
    }
  };

  // Step 3: Create Admin Account
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminName.trim() || adminName.trim().length < 2) {
      setAdminError("Administrator name must be at least 2 characters.");
      return;
    }
    if (!adminEmail.trim() || !adminEmail.includes("@")) {
      setAdminError("Please provide a valid administrator email address.");
      return;
    }
    if (!adminPassword || adminPassword.length < 6) {
      setAdminError("Administrator password must be at least 6 characters.");
      return;
    }
    if (adminPassword !== confirmPassword) {
      setAdminError("Password confirmation does not match.");
      return;
    }

    setIsCreatingAdmin(true);

    try {
      await api.createAdmin({
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword
      });

      setAdminCreatedSuccess(true);

      // Per user specification:
      // "so the it will take the user to the create admin so the user can signup as admin before he can login"
      // After admin creation, redirect to login page after a brief notification
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            justRegistered: true,
            email: adminEmail.trim().toLowerCase()
          }
        });
      }, 1800);
    } catch (err: any) {
      setAdminError(err.message || "Failed to create administrator account.");
      setIsCreatingAdmin(false);
    }
  };

  if (isVerifyingStatus) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white px-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute p-3 rounded-full bg-indigo-500/10 text-indigo-400">
            <HiOutlineServer className="text-xl animate-pulse" />
          </div>
        </div>
        <h3 className="mt-6 text-sm font-semibold tracking-wide text-gray-200">
          AccessGlobal Enterprise Setup
        </h3>
        <p className="mt-1 text-xs font-mono text-gray-500">
          Checking system initialization & Supabase connection state...
        </p>
      </div>
    );
  }

  const supabaseEditorUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
    : "https://supabase.com/dashboard";

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-3xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-medium mb-3">
            <HiOutlineShieldCheck className="text-sm" />
            <span>Enterprise Installation Wizard · Zero Hacker Exposure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            AccessGlobal Setup Console
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
            Configure your dedicated Supabase database, deploy PostgreSQL schema tables, and provision your master administrator account.
          </p>
        </div>

        {/* Wizard Step Progression Bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {/* Step 1 Pill */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              currentStep === 1
                ? "bg-indigo-600/15 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10"
                : currentStep > 1
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-white/[0.02] border-white/[0.06] text-gray-500"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                  currentStep === 1
                    ? "bg-indigo-600 text-white"
                    : currentStep > 1
                    ? "bg-emerald-500 text-white"
                    : "bg-white/[0.06] text-gray-400"
                }`}
              >
                {currentStep > 1 ? <HiOutlineCheckCircle className="text-base" /> : "1"}
              </div>
              <div className="text-left">
                <span className="block text-xs font-semibold">1. Connect Supabase</span>
                <span className="text-[10px] text-gray-400 hidden sm:block">Encrypted Vault</span>
              </div>
            </div>
          </div>

          {/* Step 2 Pill */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              currentStep === 2
                ? "bg-indigo-600/15 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10"
                : currentStep > 2
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-white/[0.02] border-white/[0.06] text-gray-500"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                  currentStep === 2
                    ? "bg-indigo-600 text-white"
                    : currentStep > 2
                    ? "bg-emerald-500 text-white"
                    : "bg-white/[0.06] text-gray-400"
                }`}
              >
                {currentStep > 2 ? <HiOutlineCheckCircle className="text-base" /> : "2"}
              </div>
              <div className="text-left">
                <span className="block text-xs font-semibold">2. SQL Tables</span>
                <span className="text-[10px] text-gray-400 hidden sm:block">PostgreSQL Schema</span>
              </div>
            </div>
          </div>

          {/* Step 3 Pill */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              currentStep === 3
                ? "bg-indigo-600/15 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10"
                : adminCreatedSuccess
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-white/[0.02] border-white/[0.06] text-gray-500"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                  currentStep === 3
                    ? "bg-indigo-600 text-white"
                    : adminCreatedSuccess
                    ? "bg-emerald-500 text-white"
                    : "bg-white/[0.06] text-gray-400"
                }`}
              >
                {adminCreatedSuccess ? <HiOutlineCheckCircle className="text-base" /> : "3"}
              </div>
              <div className="text-left">
                <span className="block text-xs font-semibold">3. Create Admin</span>
                <span className="text-[10px] text-gray-400 hidden sm:block">Signup & Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Main Card */}
        <div className="bg-[#0b0e14]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative">
          
          {/* ========================================================================= */}
          {/* STEP 1: CONNECT SUPABASE                                                  */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleConnectSupabase} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <HiOutlineCircleStack className="text-indigo-400" />
                    <span>Connect Supabase Database</span>
                  </h2>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AES-256-GCM Vault
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Supabase is the single source of truth for all dashboard telemetry, products, orders, and users.
                  Your API keys are encrypted immediately with a master salt and never exposed to the client browser.
                </p>
              </div>

              {/* Error Banner */}
              {connectError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <HiOutlineXCircle className="text-lg shrink-0 text-rose-400" />
                  <span>{connectError}</span>
                </div>
              )}

              {/* Test Connection Banner */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                    testResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {testResult.success ? (
                    <HiOutlineCheckBadge className="text-lg shrink-0 text-emerald-400" />
                  ) : (
                    <HiOutlineXCircle className="text-lg shrink-0 text-rose-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Fields */}
              <div className="space-y-4">
                {/* Project URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Supabase Project URL <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      placeholder="https://your-project-id.supabase.co"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Found in your Supabase Dashboard under Project Settings → API
                  </span>
                </div>

                {/* Anon Public Key */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Supabase Anon / Public Key <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Service Role Secret Key */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <HiOutlineKey className="text-amber-400" />
                      <span>Service Role Key (Secret)</span>
                      <span className="text-[10px] text-amber-400 font-mono font-normal">
                        (Recommended for full RLS access)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowServiceKey(!showServiceKey)}
                      className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {showServiceKey ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                      <span>{showServiceKey ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showServiceKey ? "text" : "password"}
                      value={serviceRoleKey}
                      onChange={(e) => setServiceRoleKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role)"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Stored strictly inside the server-side AES-256 vault. Never transmitted to client browsers.
                  </span>
                </div>

                {/* Optional Direct PostgreSQL connection */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectConn(!showDirectConn)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <HiOutlineCommandLine />
                    <span>{showDirectConn ? "Hide Direct PostgreSQL URI" : "Add Direct PostgreSQL URI (For 1-click auto migration)"}</span>
                  </button>

                  {showDirectConn && (
                    <div className="mt-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <label className="block text-xs font-semibold text-gray-300">
                        PostgreSQL Connection String (Optional)
                      </label>
                      <input
                        type="password"
                        value={connectionString}
                        onChange={(e) => setConnectionString(e.target.value)}
                        placeholder="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <span className="text-[11px] text-gray-500 block">
                        Allows the wizard in Step 2 to deploy tables directly to PostgreSQL without copying/pasting SQL into the Supabase editor.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  disabled={isTesting || !projectUrl}
                  onClick={handleTestConnection}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-gray-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  <HiOutlineArrowPath className={`text-sm ${isTesting ? "animate-spin" : ""}`} />
                  <span>{isTesting ? "Testing Reachability..." : "Test Connection"}</span>
                </button>

                <button
                  type="submit"
                  disabled={isConnecting || !projectUrl || !anonKey}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  <span>{isConnecting ? "Encrypting & Connecting..." : "Save & Proceed to Tables"}</span>
                  <HiOutlineArrowRight className="text-sm" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: POSTGRESQL TABLES & SCHEMA                                        */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <HiOutlineServer className="text-indigo-400" />
                    <span>PostgreSQL Database Architecture & Tables</span>
                  </h2>
                  <span
                    className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                      allTablesReady
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {allTablesReady ? "All Tables Active" : "Action Required"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  AccessGlobal requires 5 core PostgreSQL tables with Row-Level Security policies.
                  You can deploy them automatically or paste the SQL schema into the Supabase SQL Editor.
                </p>
              </div>

              {/* Table Live Verification Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { name: "categories", label: "Categories", ready: tableStatus.categories },
                  { name: "products", label: "Products", ready: tableStatus.products },
                  { name: "orders", label: "Orders", ready: tableStatus.orders },
                  { name: "users", label: "Users", ready: tableStatus.users },
                  { name: "reviews", label: "Reviews", ready: tableStatus.reviews },
                ].map((t) => (
                  <div
                    key={t.name}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      t.ready
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : "bg-white/[0.02] border-white/[0.06] text-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {t.ready ? (
                        <HiOutlineCheckBadge className="text-lg text-emerald-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>
                    <span className="block text-xs font-semibold text-white">{t.label}</span>
                    <span className="text-[10px] font-mono block mt-0.5">
                      {t.ready ? "Active" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Error Banner */}
              {deployError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <HiOutlineXCircle className="text-lg shrink-0 text-rose-400" />
                  <span>{deployError}</span>
                </div>
              )}

              {/* Deployment Actions Box */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Method 1: Supabase Web SQL Editor (Recommended)
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Copy the pre-configured SQL script and run it in your Supabase project with one click.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleCopySchema}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <HiOutlineClipboardDocumentCheck className="text-sm" />
                      <span>{copiedSql ? "Copied SQL!" : "Copy SQL Script"}</span>
                    </button>

                    <a
                      href={supabaseEditorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/[0.1]"
                    >
                      <span>Open SQL Editor</span>
                      <HiOutlineArrowTopRightOnSquare className="text-sm" />
                    </a>
                  </div>
                </div>

                {/* Auto deploy if connection string was entered */}
                {connectionString && (
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-300">
                        Method 2: Automatic Direct Migration
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Deploy directly through backend using configured PostgreSQL URI.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isDeployingSql}
                      onClick={handleDeploySql}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <HiOutlineCommandLine className="text-sm" />
                      <span>{isDeployingSql ? "Deploying Tables..." : "Deploy Tables Now"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation and Verify */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <HiOutlineArrowLeft className="text-sm" />
                  <span>Back to Credentials</span>
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isVerifyingTables}
                    onClick={checkTables}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <HiOutlineArrowPath className={`text-sm ${isVerifyingTables ? "animate-spin" : ""}`} />
                    <span>{isVerifyingTables ? "Probing Tables..." : "Re-Verify Tables"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!allTablesReady}
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Proceed to Admin Account</span>
                    <HiOutlineArrowRight className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CREATE ADMIN ACCOUNT                                              */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <HiOutlineUserCircle className="text-indigo-400" />
                    <span>Create Master Administrator</span>
                  </h2>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Supabase PostgreSQL Table
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Signup your first administrator account. This user will be saved directly into your Supabase database
                  with full executive permissions before you sign in.
                </p>
              </div>

              {/* Error Banner */}
              {adminError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <HiOutlineXCircle className="text-lg shrink-0 text-rose-400" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Success Banner */}
              {adminCreatedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-3 animate-pulse">
                  <HiOutlineCheckBadge className="text-2xl text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">Administrator Account Initialized!</span>
                    <span>Redirecting you to the sign in page to log in as admin...</span>
                  </div>
                </div>
              )}

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Administrator Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Administrator Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@yourdomain.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-300">
                        Password <span className="text-rose-400">*</span>
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
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Confirm Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <HiOutlineArrowLeft className="text-sm" />
                  <span>Back to Tables</span>
                </button>

                <button
                  type="submit"
                  disabled={isCreatingAdmin || adminCreatedSuccess}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  <span>{isCreatingAdmin ? "Saving to Supabase..." : "Create Admin Account & Finalize Setup"}</span>
                  <HiOutlineArrowRight className="text-sm" />
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
