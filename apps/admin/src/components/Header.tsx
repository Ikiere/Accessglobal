import React, { useState, useEffect, useRef } from "react";
import {
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineBell,
  HiOutlineBars3,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronDown,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUser,
  HiOutlineCircleStack,
} from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSidebar } from "../features/dashboard/dashboardSlice";
import { Link, useNavigate } from "react-router-dom";
import { toggleDarkMode } from "../features/darkMode/darkModeSlice";
import { api, UserItem } from "../services/api";
import { realtime, RealtimeStatus } from "../services/supabaseRealtime";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { darkMode } = useAppSelector((state) => state.darkMode);

  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("disconnected");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch current profile
    const cached = api.getCurrentUser();
    if (cached) setCurrentUser(cached);

    api.getMe()
      .then((res) => {
        setCurrentUser(res.user);
        api.setCurrentUser(res.user);
      })
      .catch(() => {
        // Cached user used if getMe fails
      });

    // 2. Initialize Realtime service
    realtime.initialize();
    const unsub = realtime.onStatusChange((status) => {
      setRealtimeStatus(status);
    });

    // 3. Click outside handler for user dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsub();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate("/login", { replace: true });
  };

  const userName = currentUser?.name || "Administrator";
  const userEmail = currentUser?.email || "admin@accessglobal.io";
  const userRole = currentUser?.role ? currentUser.role.toUpperCase() : "SUPER ADMIN";
  const userAvatar = currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;

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

        {/* Right: Supabase Realtime pill, theme, notifications & user profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Realtime live badge */}
          <Link
            to="/supabase-settings"
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              realtimeStatus === "connected"
                ? "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : realtimeStatus === "connecting"
                ? "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {realtimeStatus === "connected" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  realtimeStatus === "connected"
                    ? "bg-emerald-500"
                    : realtimeStatus === "connecting"
                    ? "bg-amber-500"
                    : "bg-indigo-500"
                }`}
              />
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <HiOutlineCircleStack className="text-xs" />
              <span>
                {realtimeStatus === "connected"
                  ? "Supabase Realtime: Live"
                  : realtimeStatus === "connecting"
                  ? "Realtime: Syncing..."
                  : "Database: Local Sandbox"}
              </span>
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

          {/* User profile with dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
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
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/[0.1] shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-white/[0.06] mb-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{userName}</p>
                  <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                >
                  <HiOutlineUser className="text-sm text-gray-400" />
                  <span>Admin Profile</span>
                </Link>

                <Link
                  to="/supabase-settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                >
                  <HiOutlineCircleStack className="text-sm text-emerald-400" />
                  <span>Supabase Settings</span>
                </Link>

                <div className="my-1 border-t border-gray-100 dark:border-white/[0.06]" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <HiOutlineArrowRightOnRectangle className="text-sm" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
