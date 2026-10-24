import React, { useState, useEffect } from "react";
import {
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineBell,
  HiOutlineBars3,
  HiOutlineMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSidebar } from "../features/dashboard/dashboardSlice";
import { Link, useNavigate } from "react-router-dom";
import { toggleDarkMode } from "../features/darkMode/darkModeSlice";
import { api, UserItem } from "../services/api";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { darkMode } = useAppSelector((state) => state.darkMode);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.getMe()
      .then((res) => setCurrentUser(res.user))
      .catch(() => {
        // Fallback session
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userName = currentUser?.name || "Admin Ikiere";
  const userRole = currentUser?.role ? currentUser.role.toUpperCase() : "SUPER ADMIN";
  const userAvatar = currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-[#0a0e17]/85 border-b border-gray-200/80 dark:border-white/[0.06] transition-colors">
      <div className="flex items-center justify-between px-6 py-3.5 gap-4">
        {/* Left: Mobile hamburger & command search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={() => dispatch(setSidebar())}
            aria-label="Toggle navigation"
            className="xl:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05]"
          >
            <HiOutlineBars3 className="text-xl" />
          </button>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, orders, categories... (Press ↵)"
              className="w-full h-9 pl-9 pr-14 text-xs rounded-xl bg-gray-100/80 dark:bg-white/[0.04] border border-transparent focus:border-indigo-500/50 dark:focus:border-indigo-400/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-gray-400 bg-white dark:bg-white/[0.06] px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/[0.08] font-mono pointer-events-none">
              <span>⌘K</span>
            </div>
          </form>
        </div>

        {/* Right: Status pill, theme, notifications & user profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase status badge */}
          <Link
            to="/supabase-settings"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineShieldCheck className="text-sm" /> Safe Supabase Vault
            </span>
          </Link>

          {/* Dark mode toggle */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
          >
            {darkMode ? (
              <HiOutlineSun className="text-lg text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <HiOutlineMoon className="text-lg hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notifications link */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
          >
            <HiOutlineBell className="text-lg" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-[#0a0e17]"></span>
          </Link>

          {/* User profile dropdown pill */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/[0.06]"
          >
            <img
              src={userAvatar}
              alt={userName}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-white/[0.1]"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 leading-none">
                {userRole}
              </span>
            </div>
            <HiOutlineChevronDown className="text-xs text-gray-400 hidden sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
