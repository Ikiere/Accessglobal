import React, { useState } from "react";
import { HiOutlineSave } from "react-icons/hi";
import { Sidebar } from "../components";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "user">("user");
  const [status, setStatus] = useState<"active" | "suspended" | "pending">("active");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in user name and email address.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createUser({
        name: name.trim(),
        email: email.trim(),
        role,
        status,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`
      });
      navigate("/users");
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-auto border-t border-blackSecondary border-1 flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="dark:bg-blackPrimary bg-whiteSecondary w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="pb-8 border-b border-gray-800 flex justify-between items-center max-sm:flex-col max-sm:gap-5">
            <div>
              <h2 className="text-3xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Add new user
              </h2>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                Creates an institutional account synchronized with backend and Supabase.
              </p>
            </div>
            <div className="flex gap-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="dark:bg-whiteSecondary bg-blackPrimary text-white dark:text-black font-semibold px-6 py-2.5 rounded text-base hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <HiOutlineSave className="text-xl" />
                <span>{submitting ? "Publishing..." : "Publish User"}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="pb-8 pt-8 max-w-2xl space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. elena@geneva-capital.ch"
                className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                >
                  <option value="user">User / Customer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending Verification</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
