import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi2";
import { api, OrderItem } from "../services/api";

const OrderTable: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrders();
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message || "Failed to load orders from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: OrderItem["status"]) => {
    try {
      await api.updateOrderStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Fetching real-time orders from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm my-4 flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={loadOrders}
          className="text-xs font-semibold underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-gray-300 dark:border-white/[0.1] my-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          No customer orders recorded
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          When transactions complete on the customer storefront, they appear here instantly.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200/80 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#111827] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200/80 dark:border-white/[0.06] text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Customer & Order ID</th>
              <th className="py-3.5 px-4">Fulfillment Status</th>
              <th className="py-3.5 px-4">Total Amount</th>
              <th className="py-3.5 px-4">Date Placed</th>
              <th className="py-3.5 px-6 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04] text-xs">
            {orders.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-500/30 flex-shrink-0">
                      {item.customerName ? item.customerName.slice(0, 2).toUpperCase() : "AG"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.customerName || "Verified Buyer"}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.id} · {item.customerEmail}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value as OrderItem["status"])
                    }
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border outline-none cursor-pointer transition-all ${
                      item.status === "Delivered"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : item.status === "Processing"
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                        : item.status === "Cancelled"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    } dark:bg-[#1f2937]`}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>

                <td className="py-4 px-4 font-bold text-gray-900 dark:text-white text-sm">
                  ${Number(item.total).toFixed(2)}
                </td>

                <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                <td className="py-4 px-6 text-right">
                  <Link
                    to={`/orders/1`}
                    className="inline-flex p-2 rounded-lg text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                    title="View Order Details"
                  >
                    <HiOutlineEye className="text-base" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
