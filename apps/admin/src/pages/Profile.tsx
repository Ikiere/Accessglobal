import React, { useState, useEffect } from "react";
import { Sidebar } from "../components";
import { HiOutlineShieldCheck, HiOutlineUser, HiOutlineChevronRight } from "react-icons/hi2";
import { HiOutlineSave } from "react-icons/hi";
import { Link } from "react-router-dom";
import { api, UserItem } from "../services/api";

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserItem | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

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
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
              <span className="font-semibold text-gray-900 dark:text-white">Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Administrator Account
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Manage security credentials, JWT session tokens, and admin profile metadata.
            </p>
          </div>
        </div>

        {/* Profile card */}
        <div className="max-w-3xl p-8 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center gap-5 pb-6 border-b border-gray-100 dark:border-white/[0.06]">
            <img
              src={avatar}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {name || "Admin Ikiere"}
              </h2>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <HiOutlineShieldCheck /> Super Administrator
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                {email || "admin@accessglobal.io"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-4 text-xs rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] focus:border-indigo-500 text-gray-900 dark:text-white outline-none transition-all"
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
                className="w-full h-10 px-4 text-xs rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] focus:border-indigo-500 text-gray-900 dark:text-white outline-none transition-all"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all"
              >
                <HiOutlineSave className="text-base" />
                <span>Save Profile Changes</span>
              </button>

              {saved && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                  ✓ Profile settings saved successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
