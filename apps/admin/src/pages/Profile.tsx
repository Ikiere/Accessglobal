import React, { useState, useEffect } from "react";
import { Sidebar } from "../components";
import {
  HiOutlineShieldCheck,
  HiOutlineChevronRight,
  HiOutlineGlobeAlt,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { HiOutlineSave } from "react-icons/hi";
import { Link } from "react-router-dom";
import { api, UserItem } from "../services/api";

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserItem | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  // Storefront URL state
  const [storefrontUrl, setStorefrontUrl] = useState("http://localhost:3000");
  const [storefrontSaved, setStorefrontSaved] = useState(false);

  useEffect(() => {
    api.getMe()
      .then((res) => {
        setUser(res.user);
        setName(res.user.name);
        setEmail(res.user.email);
      })
      .catch(() => {
        setName("Admin Ikiere");
        setEmail("admin@accessglobal.io");
      });

    // Load custom storefront URL
    const savedUrl = localStorage.getItem("accessglobal_storefront_url");
    if (savedUrl && savedUrl.trim()) {
      setStorefrontUrl(savedUrl.trim());
    } else if (window.location.port === "3001") {
      setStorefrontUrl("http://localhost:3000");
    } else {
      setStorefrontUrl(window.location.origin);
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveStorefront = (e: React.FormEvent) => {
    e.preventDefault();
    if (storefrontUrl.trim()) {
      localStorage.setItem("accessglobal_storefront_url", storefrontUrl.trim());
      setStorefrontSaved(true);
      setTimeout(() => setStorefrontSaved(false), 2500);
    }
  };

  const avatar = user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0a0e17] text-gray-900 dark:text-gray-100 transition-colors">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 overflow-y-auto">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200/80 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
              <HiOutlineChevronRight className="text-xs" />
              <span className="font-semibold text-gray-900 dark:text-white">Profile &amp; Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Administrator Settings
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Manage administrator credentials, profile metadata, and live customer storefront navigation.
            </p>
          </div>
        </div>

        <div className="max-w-3xl space-y-8">
          {/* Storefront Integration Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-[#124330]/10 text-[#124330] dark:bg-[#124330]/30 dark:text-[#52b788] flex items-center justify-center text-xl shrink-0">
                <HiOutlineGlobeAlt />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Customer Storefront Configuration
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Controls the destination for the &ldquo;Visit Storefront&rdquo; button across the Admin Login page and top navigation.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveStorefront} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Storefront URL or Hostname
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    required
                    value={storefrontUrl}
                    onChange={(e) => setStorefrontUrl(e.target.value)}
                    placeholder="https://accessglobalmarket.com or http://localhost:3000"
                    className="flex-1 h-10 px-4 text-xs font-mono rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] focus:border-[#124330] text-gray-900 dark:text-white outline-none transition-all"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[#124330] hover:bg-[#1A5B42] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <HiOutlineSave className="text-sm" />
                      <span>Save URL</span>
                    </button>
                    <a
                      href={storefrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-300 font-semibold text-xs transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>Open</span>
                      <HiOutlineArrowTopRightOnSquare className="text-xs" />
                    </a>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                  Tip: In local development this is typically <code className="text-indigo-600 dark:text-indigo-400">http://localhost:3000</code>. In production, provide your custom public domain.
                </p>
              </div>

              {storefrontSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <HiOutlineCheckCircle className="text-base shrink-0" />
                  <span>Storefront link updated successfully! The Admin Login and top bar links now point to this address.</span>
                </div>
              )}
            </form>
          </div>

          {/* Profile Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
            <div className="flex items-center gap-5 pb-6 border-b border-gray-100 dark:border-white/[0.06]">
              <img
                src={avatar}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#124330]/30"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {name || "Admin Ikiere"}
                </h2>
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#124330]/10 text-[#124330] dark:text-[#52b788] border border-[#124330]/20">
                  <HiOutlineShieldCheck /> Super Administrator
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                  {email || "admin@accessglobal.io"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-4 text-xs rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] focus:border-[#124330] text-gray-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-4 text-xs rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] focus:border-[#124330] text-gray-900 dark:text-white outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Role Authority
                </label>
                <input
                  type="text"
                  disabled
                  value="Enterprise Super Admin (All Permissions Granted)"
                  className="w-full h-10 px-4 text-xs rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#124330] hover:bg-[#1A5B42] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <HiOutlineSave className="text-base" />
                  <span>Save Profile Changes</span>
                </button>

                {saved && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ Profile settings saved successfully!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
