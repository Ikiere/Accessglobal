import React from "react";
import { HiOutlineCheck, HiOutlineBell, HiOutlineChevronRight } from "react-icons/hi2";
import { SimpleNotification, Sidebar } from "../components";
import { Link } from "react-router-dom";

const Notifications: React.FC = () => {
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
              <span className="font-semibold text-gray-900 dark:text-white">Notifications</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              System Notifications & Alerts
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Real-time audit log of database activities, security alerts, and checkout events.
            </p>
          </div>

          <button
            onClick={() => alert("All notifications marked as read")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.08] text-gray-700 dark:text-gray-300 font-semibold text-xs border border-gray-200 dark:border-white/[0.08] transition-all shadow-sm"
          >
            <HiOutlineCheck className="text-base text-emerald-500" />
            <span>Mark All as Read</span>
          </button>
        </div>

        {/* Notifications list */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/[0.04]">
            <SimpleNotification
              username="johndoe"
              imgSrc="/src/assets/random user 1.jpg"
              date="Today 4:20pm"
              hoursAgo="15 mins ago"
              action="placed order #ord-892 for $1,299.00"
            />
            <SimpleNotification
              username="markkwik"
              imgSrc="/src/assets/random user 2.jpg"
              date="Today 3:15pm"
              hoursAgo="1 hour ago"
              action="reviewed Titanium Pro Edition Smartphone (5 stars)"
            />
            <SimpleNotification
              username="security_vault"
              imgSrc="/src/assets/random user 3.jpg"
              date="Today 1:00pm"
              hoursAgo="3 hours ago"
              action="verified AES-256-GCM cipher integrity for Supabase connection"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
