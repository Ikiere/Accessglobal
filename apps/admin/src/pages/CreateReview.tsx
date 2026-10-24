import React, { useState } from "react";
import { HiOutlineSave } from "react-icons/hi";
import { Sidebar } from "../components";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const CreateReview: React.FC = () => {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("Titanium Pro Edition Smartphone 256GB");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !userName.trim() || !userEmail.trim() || !comment.trim()) {
      setError("Please fill in reviewer name, email, product, and review feedback.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createReview({
        productId: "prod-1",
        productName: productName.trim(),
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        rating: parseInt(rating, 10),
        comment: comment.trim(),
        status: "approved"
      });
      navigate("/reviews");
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
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
                Add New Review
              </h2>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                Customer feedback will be verified and stored in backend & Supabase.
              </p>
            </div>
            <div className="flex gap-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="dark:bg-whiteSecondary bg-blackPrimary text-white dark:text-black font-semibold px-6 py-2.5 rounded text-base hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <HiOutlineSave className="text-xl" />
                <span>{submitting ? "Publishing..." : "Publish Review"}</span>
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
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Reviewer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Reviewer Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="s.jenkins@meridian.com"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                Rating (1 to 5 Stars)
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars - Good)</option>
                <option value="3">⭐⭐⭐ (3 Stars - Average)</option>
                <option value="2">⭐⭐ (2 Stars - Poor)</option>
                <option value="1">⭐ (1 Star - Terrible)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                Review Comments & Experience <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share specific details about product durability, build quality, and delivery speed..."
                className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReview;