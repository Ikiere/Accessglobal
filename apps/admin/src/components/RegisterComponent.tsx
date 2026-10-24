import React, { useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { api } from "../services/api";

const RegisterComponent: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Please fill in all fields (password must be at least 6 characters).");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.register(name.trim(), email.trim(), password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[500px] dark:bg-gray-900 bg-white flex flex-col justify-between items-center py-10 px-8 rounded-xl shadow-xl max-sm:w-[95%]">
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
        <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
          <FaShieldAlt className="text-4xl" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl dark:text-whiteSecondary text-blackPrimary font-bold">
            Create Admin Account
          </h2>
          <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">
            AccessGlobal Unified Infrastructure Console
          </p>
        </div>

        {error && (
          <div className="w-full p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 dark:text-gray-300 text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alexander Vance"
              className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-gray-50 dark:text-white text-black text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 dark:text-gray-300 text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@vanguard.com"
              className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-gray-50 dark:text-white text-black text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 dark:text-gray-300 text-gray-700">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-gray-50 dark:text-white text-black text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          <span>{loading ? "Registering..." : "Create Account & Login"}</span>
          <FaArrowRight className="text-xs" />
        </button>

        <p className="dark:text-gray-400 text-gray-700 text-sm flex gap-1 items-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-500 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterComponent;