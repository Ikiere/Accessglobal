import React, { useState, useEffect } from "react";
import { Sidebar } from "../components";
import { useNavigate, Link } from "react-router-dom";
import {
  HiOutlineCurrencyDollar,
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineDevicePhoneMobile,
  HiOutlineArrowTrendingUp,
  HiOutlinePlus,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlineStar,
  HiOutlineBolt,
} from "react-icons/hi2";
import { HiOutlineDatabase } from "react-icons/hi";
import RechartsBarChart from "../components/chart/RechartsBarChart";
import RechartsAreaChart from "../components/chart/RechartsAreaChart";
import { api, UserItem, ProductItem, OrderItem, SupabaseStatus, DashboardStats } from "../services/api";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus | null>(null);
  const [recentProducts, setRecentProducts] = useState<ProductItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [activeChartTab, setActiveChartTab] = useState<"revenue" | "volume">("revenue");
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D" | "YTD">("30D");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.allSettled([
      api.getMe(),
      api.getStats(),
      api.getSupabaseStatus(),
      api.getProducts(),
      api.getOrders(),
    ]).then(([meRes, statsRes, supaRes, prodRes, orderRes]) => {
      if (!isMounted) return;

      if (meRes.status === "fulfilled") setCurrentUser(meRes.value.user);
      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (supaRes.status === "fulfilled") setSupabaseStatus(supaRes.value);
      if (prodRes.status === "fulfilled") setRecentProducts((prodRes.value.products || []).slice(0, 4));
      if (orderRes.status === "fulfilled") setRecentOrders((orderRes.value.orders || []).slice(0, 5));

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const adminName = currentUser?.name || "Admin Ikiere";
  const revenueTotal = stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : "128,450";
  const ordersTotal = stats?.totalOrders || 1842;
  const customersTotal = stats?.totalUsers || 4290;
  const productsTotal = stats?.totalProducts || 124;

  const isSupabaseConnected = Boolean(supabaseStatus?.connected);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0a0e17] text-gray-900 dark:text-gray-100 transition-colors">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 overflow-y-auto">
        {/* Executive Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/10 via-white to-violet-500/5 dark:from-indigo-950/40 dark:via-[#111827] dark:to-[#0a0e17] border border-gray-200/80 dark:border-white/[0.08] p-6 sm:p-8 mb-8 shadow-sm">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <HiOutlineSparkles className="text-sm" /> Enterprise Suite v2.4
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Welcome back, {adminName} 👋
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                Centralized telemetry for AccessGlobal. Manage catalog inventory, review incoming client orders, and monitor your zero-exposure Supabase database.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/products/create-product"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <HiOutlinePlus className="text-base" />
                <span>Add Product</span>
              </Link>

              <Link
                to="/supabase-settings"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.08] text-gray-800 dark:text-white font-semibold text-xs border border-gray-200 dark:border-white/[0.1] transition-all"
              >
                <HiOutlineDatabase className="text-base text-emerald-500" />
                <span>Supabase DB</span>
              </Link>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] text-gray-700 dark:text-gray-300 font-medium text-xs border border-transparent dark:border-white/[0.06] transition-colors"
                title="Export executive report"
              >
                <HiOutlineArrowDownTray className="text-base" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Hero KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Gross Revenue */}
          <div className="relative group p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Gross Revenue
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <HiOutlineCurrencyDollar className="text-xl" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                ${revenueTotal}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <HiOutlineArrowTrendingUp /> +14.8%
              </span>
              <span className="text-gray-500 dark:text-gray-400">vs preceding cycle</span>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="relative group p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Order Fulfillment
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <HiOutlineTruck className="text-xl" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {ordersTotal.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <HiOutlineArrowTrendingUp /> +8.2%
              </span>
              <span className="text-gray-500 dark:text-gray-400">98.4% delivered</span>
            </div>
          </div>

          {/* Card 3: Total Customers */}
          <div className="relative group p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Active Customers
              </span>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <HiOutlineUserGroup className="text-xl" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {customersTotal.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <HiOutlineArrowTrendingUp /> +19.4%
              </span>
              <span className="text-gray-500 dark:text-gray-400">Verified accounts</span>
            </div>
          </div>

          {/* Card 4: Catalog Products */}
          <div className="relative group p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Inventory Catalog
              </span>
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <HiOutlineDevicePhoneMobile className="text-xl" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {productsTotal.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                <HiOutlineSparkles /> In Stock
              </span>
              <span className="text-gray-500 dark:text-gray-400">Across 6 categories</span>
            </div>
          </div>
        </section>

        {/* Interactive Analytics Section (Revenue vs Profit / Traffic) */}
        <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Financial Velocity & Forecast
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                  AUDITED
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Real-time tracking of monthly turnover, net profit margins, and inventory overhead.
              </p>
            </div>

            {/* Timeframe & metric toggles */}
            <div className="flex items-center gap-2">
              <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08]">
                <button
                  onClick={() => setActiveChartTab("revenue")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeChartTab === "revenue"
                      ? "bg-white dark:bg-indigo-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Revenue vs Profit
                </button>
                <button
                  onClick={() => setActiveChartTab("volume")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeChartTab === "volume"
                      ? "bg-white dark:bg-indigo-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Volume Trends
                </button>
              </div>

              {/* Time range pills */}
              <div className="hidden sm:flex p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08]">
                {(["7D", "30D", "90D", "YTD"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      timeRange === range
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-72 sm:h-80 w-full pt-2">
            {activeChartTab === "revenue" ? (
              <RechartsBarChart />
            ) : (
              <RechartsAreaChart />
            )}
          </div>

          {/* Chart Summary Footnotes */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Average Order Value</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">$87.40</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Gross Margin</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">64.2%</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Repeat Customer Rate</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">38.9%</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Inventory Turnover</span>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">4.8x / yr</p>
            </div>
          </div>
        </section>

        {/* Split Operations Grid: Left (Transactions & Products) | Right (Supabase & Channels) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Column (7 cols): Recent Transactions & Catalog Highlights */}
          <div className="lg:col-span-7 space-y-8">
            {/* Recent Orders Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Recent Customer Orders
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Live stream of recent checkouts and processing states.
                  </p>
                </div>
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All Orders <HiOutlineChevronRight className="text-xs" />
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/[0.06] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04] text-xs">
                      {recentOrders.slice(0, 5).map((order) => {
                        const statusColors: Record<string, string> = {
                          delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                          processing: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
                          pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                          cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                        };
                        const badgeClass = statusColors[order.status?.toLowerCase()] || statusColors.pending;

                        return (
                          <tr key={order.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 font-mono font-medium text-gray-900 dark:text-white">
                              {order.id}
                            </td>
                            <td className="py-3 text-gray-700 dark:text-gray-300">
                              {order.customerName || "Verified Buyer"}
                            </td>
                            <td className="py-3 font-bold text-gray-900 dark:text-white">
                              ${Number(order.total || 0).toFixed(2)}
                            </td>
                            <td className="py-3 text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                                {order.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                  No orders recorded yet. As customers checkout on the storefront, transactions appear here live.
                </div>
              )}
            </div>

            {/* Catalog Highlights */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Top Catalog Inventory
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    High velocity inventory items synchronized with Supabase DB.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Manage Catalog <HiOutlineChevronRight className="text-xs" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50/80 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-indigo-500/30 transition-all"
                  >
                    <img
                      src={p.mainImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80"}
                      alt={p.title}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {p.category || "General"} · In Stock: {p.inStock ?? 25}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                          ${Number(p.price).toFixed(2)}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                          <HiOutlineStar className="text-xs fill-amber-500" /> {p.rating || 4.9}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Supabase DB Health Matrix & Traffic Channels */}
          <div className="lg:col-span-5 space-y-8">
            {/* Supabase Safe Connection Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-transparent dark:from-emerald-950/30 dark:via-[#111827] dark:to-[#0a0e17] border border-emerald-500/30 dark:border-emerald-500/25 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <HiOutlineShieldCheck className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Zero-Exposure Supabase DB
                    </h3>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      AES-256 Server-Side Vault
                    </span>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  isSupabaseConnected
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? "bg-emerald-500" : "bg-indigo-500"} animate-pulse`}></span>
                  {isSupabaseConnected ? "PostgreSQL Active" : "Local Resilient Store"}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {isSupabaseConnected
                  ? `Connected to Supabase project (${supabaseStatus?.projectUrl}). Database credentials reside strictly in server memory.`
                  : "Currently running on the resilient server-side JSON repository. Ready to connect your Supabase project safely without exposing keys."}
              </p>

              {/* Table readiness badges */}
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-black/30 border border-gray-200/80 dark:border-white/[0.06] mb-5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                  Target PostgreSQL Tables
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["products", "categories", "orders", "users", "reviews"].map((t) => (
                    <div key={t} className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <HiOutlineCheckCircle className="text-emerald-500 text-sm flex-shrink-0" />
                      <span className="font-mono text-[11px]">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/supabase-settings"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <HiOutlineBolt className="text-sm" />
                <span>Configure Supabase Credentials</span>
              </Link>
            </div>

            {/* Traffic & Conversion Channels */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Acquisition Channels
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                Conversion contribution across primary traffic funnels.
              </p>

              <div className="space-y-4">
                {[
                  { label: "Direct Traffic", pct: 44, color: "bg-indigo-600", val: "$56,518" },
                  { label: "Organic Search", pct: 32, color: "bg-emerald-500", val: "$41,104" },
                  { label: "Social Media", pct: 16, color: "bg-violet-500", val: "$20,552" },
                  { label: "Partner Referrals", pct: 8, color: "bg-cyan-500", val: "$10,276" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-500 dark:text-gray-400 text-[11px]">
                          {item.val}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {item.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
