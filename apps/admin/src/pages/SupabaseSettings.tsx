import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components';
import { api, SupabaseStatus } from '../services/api';
import { HiOutlineDatabase, HiOutlineShieldCheck, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineRefresh, HiOutlineClipboardCopy, HiOutlineExternalLink } from 'react-icons/hi';
import { AiOutlineSafetyCertificate } from 'react-icons/ai';

export const SupabaseSettings: React.FC = () => {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [url, setUrl] = useState<string>('');
  const [anonKey, setAnonKey] = useState<string>('');
  const [serviceRoleKey, setServiceRoleKey] = useState<string>('');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [testing, setTesting] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getSupabaseStatus();
      setStatus(data);
      if (data.projectUrl) {
        setUrl(data.projectUrl);
      }
    } catch (err: any) {
      console.error('Failed to load Supabase status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async () => {
    try {
      const { sql } = await api.getSupabaseSchema();
      setSchemaSql(sql);
    } catch (err) {
      console.error('Failed to fetch SQL schema:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchSchema();
  }, []);

  const handleTestConnection = async () => {
    if (!url.trim() || (!anonKey.trim() && !serviceRoleKey.trim())) {
      setTestResult({ success: false, message: 'Please enter your Supabase Project URL and at least one API key.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const keyToTest = serviceRoleKey.trim() || anonKey.trim();
      const res = await api.testSupabase(url.trim(), keyToTest);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setBanner({ type: 'error', text: 'Supabase URL and Anon Key are required.' });
      return;
    }
    setConnecting(true);
    setBanner(null);
    try {
      const res = await api.connectSupabase({
        url: url.trim(),
        anonKey: anonKey.trim(),
        serviceRoleKey: serviceRoleKey.trim() || undefined
      });
      setBanner({ type: 'success', text: res.message });
      await fetchStatus();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to connect Supabase.' });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Supabase? The backend will revert to the local resilient vault.')) {
      return;
    }
    try {
      await api.disconnectSupabase();
      setBanner({ type: 'success', text: 'Supabase disconnected. Switched to local resilient store.' });
      setUrl('');
      setAnonKey('');
      setServiceRoleKey('');
      setTestResult(null);
      await fetchStatus();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to disconnect.' });
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0a0e17] text-gray-900 dark:text-gray-100 transition-colors">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-sm">
              <HiOutlineDatabase className="text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Safe Supabase Database Integration
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <AiOutlineSafetyCertificate className="text-emerald-500 text-base" />
                Zero Public Key Leakage: Credentials reside strictly in the server-side AES-256-GCM vault.
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice Banner */}
        <div className="p-5 mb-8 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 flex items-start gap-4">
          <HiOutlineShieldCheck className="text-blue-500 text-3xl shrink-0 mt-0.5" />
          <div className="text-sm dark:text-blue-200 text-blue-900 leading-relaxed">
            <strong className="block text-base mb-1 font-semibold">How Safe Supabase Connection Works:</strong>
            Users connect their Supabase project without exposing sensitive credentials to the public. The frontend never sees or interacts with your <code className="bg-black/20 px-1 py-0.5 rounded text-blue-400">service_role</code> secret key or database connection string. All queries are securely routed through authenticated backend endpoints, which enforce rate limits and input sanitization before communicating server-to-server with Supabase.
          </div>
        </div>

        {banner && (
          <div className={`p-4 mb-6 rounded-lg border ${
            banner.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {banner.text}
          </div>
        )}

        {/* Top Cards: Status & Table Readiness */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Status Card */}
          <div className="lg:col-span-2 p-6 rounded-xl border dark:border-gray-800 border-gray-200 dark:bg-zinc-900 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold dark:text-whiteSecondary text-blackPrimary flex items-center gap-2">
                Connection Status
              </h2>
              <button
                onClick={fetchStatus}
                className="text-sm flex items-center gap-1 dark:text-gray-400 text-gray-600 hover:text-emerald-500"
                title="Refresh Status"
              >
                <HiOutlineRefresh className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg dark:bg-zinc-800/50 bg-gray-50 border dark:border-zinc-700/50 border-gray-200">
                <span className="text-xs uppercase font-medium dark:text-gray-400 text-gray-500">Gateway State</span>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${status?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="font-semibold text-base dark:text-white text-gray-900">
                    {status?.connected ? 'Connected to Supabase Cloud' : 'Local Fallback Vault Mode'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg dark:bg-zinc-800/50 bg-gray-50 border dark:border-zinc-700/50 border-gray-200">
                <span className="text-xs uppercase font-medium dark:text-gray-400 text-gray-500">Storage Provider</span>
                <div className="mt-2 font-semibold text-base dark:text-white text-gray-900 capitalize">
                  {status?.source === 'vault' ? 'Encrypted Server Vault (AES-256)' : status?.source === 'env' ? 'Backend Environment File' : 'Local JSON Data Store'}
                </div>
              </div>

              <div className="p-4 rounded-lg dark:bg-zinc-800/50 bg-gray-50 border dark:border-zinc-700/50 border-gray-200">
                <span className="text-xs uppercase font-medium dark:text-gray-400 text-gray-500">Connected Project URL</span>
                <div className="mt-2 font-mono text-sm dark:text-emerald-400 text-emerald-600 truncate">
                  {status?.projectUrl || 'Not configured'}
                </div>
              </div>

              <div className="p-4 rounded-lg dark:bg-zinc-800/50 bg-gray-50 border dark:border-zinc-700/50 border-gray-200">
                <span className="text-xs uppercase font-medium dark:text-gray-400 text-gray-500">Service Role Protection</span>
                <div className="mt-2 font-semibold text-sm flex items-center gap-1.5 dark:text-white text-gray-900">
                  {status?.hasServiceRoleKey ? (
                    <span className="text-emerald-400 flex items-center gap-1"><HiOutlineCheckCircle /> Enabled & Encrypted</span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1"><HiOutlineXCircle /> Anon key only</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table Readiness Card */}
          <div className="p-6 rounded-xl border dark:border-gray-800 border-gray-200 dark:bg-zinc-900 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold dark:text-whiteSecondary text-blackPrimary mb-4">
                Supabase Tables Status
              </h2>
              <div className="space-y-3">
                {Object.entries(status?.tablesStatus || { products: false, categories: false, orders: false, users: false, reviews: false }).map(([table, ready]) => (
                  <div key={table} className="flex justify-between items-center text-sm">
                    <span className="capitalize dark:text-gray-300 text-gray-700 font-medium">{table}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      ready ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                    }`}>
                      {ready ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />} {ready ? 'Ready' : 'Not Created'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t dark:border-gray-800 border-gray-200 text-xs dark:text-gray-400 text-gray-500">
              * Tables can be initialized using the SQL script below.
            </div>
          </div>

        </div>

        {/* Credentials Form */}
        <div className="p-6 rounded-xl border dark:border-gray-800 border-gray-200 dark:bg-zinc-900 bg-white shadow-sm mb-8">
          <h2 className="text-xl font-bold dark:text-whiteSecondary text-blackPrimary mb-2">
            Configure Supabase Credentials
          </h2>
          <p className="text-sm dark:text-gray-400 text-gray-600 mb-6">
            Enter your project details from your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-500 underline inline-flex items-center gap-1">Supabase Project Settings &rarr; API <HiOutlineExternalLink /></a>.
          </p>

          <form onSubmit={handleConnect} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                Supabase Project URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-gray-50 dark:text-white text-black outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                Supabase Anon / Public Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-gray-50 dark:text-white text-black outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-whiteSecondary text-blackPrimary">
                Supabase Service Role Key <span className="text-xs text-emerald-400 font-normal">(Recommended for full admin CRUD)</span>
              </label>
              <p className="text-xs dark:text-gray-400 text-gray-500 mb-2">
                🔒 Safe Storage: This secret key is encrypted immediately on the backend with AES-256-GCM. It is never transmitted back to the browser.
              </p>
              <input
                type="password"
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role secret)"
                className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-gray-50 dark:text-white text-black outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
              />
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg border text-sm ${
                testResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {testResult.message}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-6 py-2.5 rounded-lg border border-gray-600 text-sm font-semibold dark:text-white text-black hover:border-emerald-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
              >
                {testing ? 'Testing Connectivity...' : 'Test Connection'}
              </button>

              <button
                type="submit"
                disabled={connecting}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {connecting ? 'Saving & Encrypting...' : 'Save & Connect Supabase'}
              </button>

              {status?.connected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-6 py-2.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-colors"
                >
                  Disconnect Supabase
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SQL Schema Migration Box */}
        <div className="p-6 rounded-xl border dark:border-gray-800 border-gray-200 dark:bg-zinc-900 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold dark:text-whiteSecondary text-blackPrimary">
                Automated Database Schema (SQL)
              </h2>
              <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                Copy and run this in your Supabase SQL Editor to initialize all tables, RLS policies, and indexes.
              </p>
            </div>
            <button
              onClick={copySql}
              className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <HiOutlineClipboardCopy /> {copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
            </button>
          </div>

          <pre className="p-4 rounded-lg bg-black text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 border border-gray-800">
            {schemaSql || '-- Loading SQL script...'}
          </pre>
        </div>

      </main>
    </div>
  );
};

export default SupabaseSettings;
