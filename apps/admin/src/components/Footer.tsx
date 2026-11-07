import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0a0e17] py-5 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            AccessGlobal Enterprise Operations
          </span>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/help-desk" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Documentation &amp; Runbooks
          </Link>
          <span className="text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} AccessGlobal Technologies Inc. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
