import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiOutlineEye } from "react-icons/hi";
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
      <div className="py-12 text-center dark:text-gray-400 text-gray-600">
        Loading live orders from backend...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 my-4">
        {error}
      </div>
    );
  }

  return (
    <table className="mt-6 w-full whitespace-nowrap text-left max-lg:block max-lg:overflow-x-scroll">
      <colgroup>
        <col className="w-full sm:w-4/12" />
        <col className="lg:w-4/12" />
        <col className="lg:w-2/12" />
        <col className="lg:w-1/12" />
        <col className="lg:w-1/12" />
      </colgroup>
      <thead className="border-b border-white/10 text-sm leading-6 dark:text-whiteSecondary text-blackPrimary">
        <tr>
          <th
            scope="col"
            className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
          >
            Customer & ID
          </th>
          <th scope="col" className="py-2 pl-0 pr-8 font-semibold table-cell">
            Status
          </th>
          <th scope="col" className="py-2 pl-0 pr-8 font-semibold table-cell">
            Total
          </th>
          <th
            scope="col"
            className="py-2 pl-0 pr-8 font-semibold table-cell lg:pr-20"
          >
            Date
          </th>
          <th
            scope="col"
            className="py-2 pl-0 pr-4 text-right font-semibold table-cell sm:pr-6 lg:pr-8"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {orders.map((item) => (
          <tr key={item.id}>
            <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
              <div className="flex items-center gap-x-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                  {item.customerName.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium dark:text-whiteSecondary text-blackPrimary">
                    {item.customerName}
                  </div>
                  <div className="text-xs font-mono dark:text-gray-400 text-gray-500">
                    {item.id} • {item.customerEmail}
                  </div>
                </div>
              </div>
            </td>
            <td className="py-4 pl-0 pr-4 table-cell pr-8">
              <select
                value={item.status}
                onChange={(e) =>
                  handleStatusChange(item.id, e.target.value as OrderItem["status"])
                }
                className={`text-xs px-2.5 py-1 rounded font-semibold border ${
                  item.status === "Delivered"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : item.status === "Processing"
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    : item.status === "Cancelled"
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                } bg-transparent outline-none cursor-pointer`}
              >
                <option value="Processing" className="dark:bg-zinc-900 text-black dark:text-white">Processing</option>
                <option value="Delivered" className="dark:bg-zinc-900 text-black dark:text-white">Delivered</option>
                <option value="Pending" className="dark:bg-zinc-900 text-black dark:text-white">Pending</option>
                <option value="Cancelled" className="dark:bg-zinc-900 text-black dark:text-white">Cancelled</option>
              </select>
            </td>
            <td className="py-4 pl-0 pr-4 text-sm leading-6 dark:text-emerald-400 text-emerald-600 font-semibold">
              ${Number(item.total).toFixed(2)}
            </td>
            <td className="py-4 pl-0 pr-8 text-sm leading-6 dark:text-gray-400 text-gray-500 table-cell lg:pr-20">
              {new Date(item.createdAt).toLocaleDateString()}
            </td>
            <td className="py-4 pl-0 pr-4 text-right text-sm leading-6 dark:text-whiteSecondary text-blackPrimary table-cell pr-6 lg:pr-8">
              <div className="flex gap-x-1 justify-end">
                <Link
                  to={`/orders/1`}
                  className="dark:bg-blackPrimary bg-whiteSecondary dark:text-whiteSecondary text-blackPrimary border border-gray-600 w-8 h-8 block flex justify-center items-center cursor-pointer hover:border-gray-400"
                  title="View Order Details"
                >
                  <HiOutlineEye className="text-lg" />
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTable;
