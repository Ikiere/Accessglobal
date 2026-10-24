import React from "react";
import { CategoryTable, Sidebar } from "../components";
import { Link } from "react-router-dom";
import {
  HiOutlinePlus,
  HiOutlineChevronRight,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";

const Categories: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0a0e17] text-gray-900 dark:text-gray-100 transition-colors">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 overflow-y-auto">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
              <HiOutlineChevronRight className="text-xs" />
              <span className="font-semibold text-gray-900 dark:text-white">Categories</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Catalog Categories
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Organize products, manage navigation hierarchy, and group inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.08] text-gray-700 dark:text-gray-300 font-semibold text-xs border border-gray-200 dark:border-white/[0.08] transition-all shadow-sm"
            >
              <HiOutlineArrowDownTray className="text-base" />
              <span>Export</span>
            </button>

            <Link
              to="/categories/create-category"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <HiOutlinePlus className="text-base" />
              <span>Add Category</span>
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm mb-2">
          <div className="relative w-full sm:w-80">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              placeholder="Search category name or slug..."
              className="w-full h-9 pl-9 pr-4 text-xs rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] focus:border-indigo-500 text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* Categories Data Table */}
        <CategoryTable />
      </main>
    </div>
  );
};

export default Categories;
