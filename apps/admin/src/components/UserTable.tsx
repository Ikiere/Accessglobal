import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineUser } from "react-icons/hi2";
import { api, UserItem } from "../services/api";

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || "Failed to load users from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Loading registered accounts and roles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm my-4 flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={loadUsers}
          className="text-xs font-semibold underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200/80 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#111827] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200/80 dark:border-white/[0.06] text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">User Profile</th>
              <th className="py-3.5 px-4">Email Address</th>
              <th className="py-3.5 px-4">Assigned Role</th>
              <th className="py-3.5 px-4">Date Registered</th>
              <th className="py-3.5 px-6 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04] text-xs">
            {users.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        item.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          item.name
                        )}`
                      }
                      alt={item.name}
                      className="h-9 w-9 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-white/[0.1] bg-gray-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">
                        ID: {item.id}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                  {item.email}
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      item.role === "admin"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        : item.role === "manager"
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {item.role}
                  </span>
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
                    to={`/users/${item.id}`}
                    className="inline-flex p-2 rounded-lg text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                    title="View User Details"
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

export default UserTable;
