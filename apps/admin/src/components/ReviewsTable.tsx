import React, { useState, useEffect } from "react";
import { HiStar } from "react-icons/hi2";
import { api, ReviewItem } from "../services/api";

const ReviewsTable: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReviews();
      setReviews(data.reviews);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Loading customer reviews and sentiment ratings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm my-4 flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={loadReviews}
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
              <th className="py-3.5 px-6">Customer Reviewer</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Feedback & Item</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-6 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04] text-xs">
            {reviews.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs ring-1 ring-amber-500/25 flex-shrink-0">
                      {item.userName ? item.userName.slice(0, 2).toUpperCase() : "AG"}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.userName}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">
                        {item.userEmail}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <HiStar
                        key={i}
                        className={`text-sm ${
                          i < item.rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 ml-1.5">
                      {item.rating}.0
                    </span>
                  </div>
                </td>

                <td className="py-4 px-4 max-w-sm">
                  <div className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                    {item.productName}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px] line-clamp-1 mt-0.5 italic">
                    "{item.comment}"
                  </p>
                </td>

                <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                <td className="py-4 px-6 text-right">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      item.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewsTable;
