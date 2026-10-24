import React from "react";
import {
  HiOutlineHome,
  HiOutlineDevicePhoneMobile,
  HiOutlineTag,
  HiOutlineTruck,
  HiOutlineStar,
  HiOutlineInformationCircle,
  HiOutlineUser,
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBell,
} from "react-icons/hi2";
import { HiOutlineDatabase } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSidebar } from "../features/dashboard/dashboardSlice";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const Sidebar: React.FC = () => {
  const { isSidebarOpen } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout();
    navigate("/login");
  };

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-3.5 px-3.5 py-2.5 mx-2 my-0.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 font-semibold shadow-sm"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.04]"
    }`;

  const sidebarClass: string = isSidebarOpen
    ? "sidebar-open"
    : "sidebar-closed";

  return (
    <aside className="relative flex-shrink-0 z-30">
      <div
        className={`w-64 h-screen xl:sticky xl:top-0 max-xl:fixed max-xl:top-0 max-xl:left-0 xl:translate-x-0 ${sidebarClass} flex flex-col justify-between dark:bg-[#0b0f19] bg-white border-r border-gray-200/80 dark:border-white/[0.06] transition-transform duration-300 ease-in-out`}
      >
        {/* Top header & branding */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 py-4">
          <div className="flex items-center justify-between px-5 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-sm">
                AG
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  AccessGlobal
                </span>
                <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>
            <button
              onClick={() => dispatch(setSidebar())}
              aria-label="Close sidebar"
              className="xl:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05]"
            >
              <HiOutlineXMark className="text-lg" />
            </button>
          </div>

          {/* Navigation sections */}
          <nav className="space-y-6">
            {/* Main Overview */}
            <div>
              <p className="px-5 mb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                Main
              </p>
              <NavLink to="/" end className={({ isActive }) => navItemClass(isActive)}>
                <HiOutlineHome className="text-lg" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/supabase-settings" className={({ isActive }) => navItemClass(isActive)}>
                <HiOutlineDatabase className="text-lg text-emerald-500" />
                <span className="flex items-center justify-between flex-1">
                  <span>Supabase DB</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Safe
                  </span>
                </span>
              </NavLink>
            </div>

            {/* Commerce Management */}
            <div>
              <p className="px-5 mb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                Commerce
              </p>
              <NavLink to="/products" className={({ isActive }) => navItemClass(isActive)}>
                <HiOutlineDevicePhoneMobile className="text-lg" />
                <span>Products</span>
              </NavLink>

              <NavLink to="/categories" className={({ isActive }) => navItemClass(isActive)}>
                <HiOutlineTag className="text-lg" />
                <span>Categories</span>
              </NavLink>

              <NavLink to="/orders" className={({ isActive }) => navItemClass(isActive)}>
                <HiOutlineTruck className="text-lg" />
                <span>Orders</span>
              </NavLink>
            </div>

            {/* Customers & Engagement */}
            <div>
              <p className="px-5 mb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                Customers
              </p>
              <NavLink to="/users" className={({ isActive }) => navItemClass(isActive)}>
                <HiOutlineUser className="text-lg" />
                <span>Users & Roles</span>
              </NavLink>

              <NavLink to="/reviews" className={({ isActive }) => navItemClass(isActive)}>
                <HiOutlineStar className="text-lg" />
                <span>Reviews</span>
              </NavLink>

              <NavLink to="/notifications" className={({ isActive }) => navItemClass(isActive)}>
                <HiOutlineBell className="text-lg" />
                <span>Notifications</span>
              </NavLink>
            </div>

            {/* System */}
            <div>
              <p className="px-5 mb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                System
              </p>
              <NavLink to="/help-desk" className={({ isActive }) => navItemClass(isActive)}>
                <HiOutlineInformationCircle className="text-lg" />
                <span>Documentation</span>
              </NavLink>
            </div>
          </nav>
        </div>

        {/* Bottom card & session info */}
        <div className="p-3 border-t border-gray-200/80 dark:border-white/[0.06] space-y-2">
          {/* Supabase safe vault pill */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-indigo-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <HiOutlineShieldCheck className="text-emerald-500 text-xs" /> AES-256 Vault
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Zero Public Exposure</span>
              </div>
            </div>
          </div>

          {/* Logout / Switch Session */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <HiOutlineArrowRightOnRectangle className="text-sm" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
