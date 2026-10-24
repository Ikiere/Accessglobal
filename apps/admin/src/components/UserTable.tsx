import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiOutlinePencil, HiOutlineEye } from "react-icons/hi";
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
      <div className="py-12 text-center dark:text-gray-400 text-gray-600">
        Loading registered users from backend...
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
            User
          </th>
          <th scope="col" className="py-2 pl-0 pr-8 font-semibold table-cell">
            Email address
          </th>
          <th scope="col" className="py-2 pl-0 pr-8 font-semibold table-cell">
            Role
          </th>
          <th
            scope="col"
            className="py-2 pl-0 pr-8 font-semibold table-cell lg:pr-20"
          >
            Joined
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
        {users.map((item) => (
          <tr key={item.id}>
            <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
              <div className="flex items-center gap-x-4">
                <img
                  src={item.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name)}`}
                  alt=""
                  className="h-8 w-8 rounded-full bg-gray-800 object-cover"
                />
                <div className="truncate text-sm font-medium leading-6 dark:text-whiteSecondary text-blackPrimary">
                  {item.name}
                </div>
              </div>
            </td>
            <td className="py-4 pl-0 pr-4 table-cell pr-8">
              <div className="font-mono text-sm leading-6 dark:text-gray-400 text-gray-500">
                {item.email}
              </div>
            </td>
            <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                item.role === 'admin'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : item.role === 'manager'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                {item.role}
              </span>
            </td>
            <td className="py-4 pl-0 pr-8 text-sm leading-6 dark:text-gray-400 text-gray-500 table-cell lg:pr-20">
              {new Date(item.createdAt).toLocaleDateString()}
            </td>
            <td className="py-4 pl-0 pr-4 text-right text-sm leading-6 dark:text-whiteSecondary text-blackPrimary table-cell pr-6 lg:pr-8">
              <div className="flex gap-x-1 justify-end">
                <Link
                  to={`/users/${item.id}`}
                  className="dark:bg-blackPrimary bg-whiteSecondary dark:text-whiteSecondary text-blackPrimary border border-gray-600 w-8 h-8 block flex justify-center items-center cursor-pointer hover:border-gray-400"
                  title="View User"
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

export default UserTable;
