import React from "react";
import { HiOutlineShieldCheck, HiOutlineSignal } from "react-icons/hi2";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200/80 dark:border-white/[0.06] bg-white/50 dark:bg-[#0a0e17]/60 backdrop-blur-sm py-5 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            AccessGlobal Enterprise
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <HiOutlineSignal className="text-sm" /> All Systems Operational
          </span>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
          <span className="hidden sm:inline flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
            <HiOutlineShieldCheck className="text-sm" /> AES-256 Vault Active
          </span>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/supabase-settings" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Database Settings
          </Link>
          <Link to="/help-desk" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Documentation
          </Link>
          <span className="text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} AccessGlobal Technologies Inc.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
