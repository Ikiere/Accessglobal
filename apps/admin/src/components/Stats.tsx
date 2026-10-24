import React, { useState, useEffect } from "react";
import SingleStats from "./SingleStats";
import { api, DashboardStats } from "../services/api";

const Stats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch((err) => console.warn("Failed to fetch live stats:", err));
  }, []);

  const totalRevenue = stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : "$99,825";
  const totalOrders = stats?.totalOrders ? String(stats.totalOrders) : "56";
  const totalProducts = stats?.totalProducts ? String(stats.totalProducts) : "24";

  return (
    <div>
      <div className="flex items-center justify-between mb-7 mr-6 max-sm:flex-col max-sm:items-start gap-2">
        <h2 className="text-3xl dark:text-whiteSecondary text-blackPrimary font-bold">
          Store Operations & Financials
        </h2>
        {stats && (
          <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
            stats.supabaseConnected
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-blue-500/10 border-blue-500/30 text-blue-400"
          }`}>
            {stats.supabaseConnected ? "⚡ Powered by Supabase" : "🔒 Local Resilient Vault"}
          </span>
        )}
      </div>
      <div className="flex justify-start gap-x-20 max-[1800px]:flex-wrap gap-y-10 mr-1 max-[1352px]:gap-x-10 max-[1050px]:mr-5">
        <SingleStats title="Active Orders" value={totalOrders} />
        <SingleStats title="Catalog Products" value={totalProducts} />
        <SingleStats title="Gross Volume" value={totalRevenue} />
      </div>
    </div>
  );
};

export default Stats;
