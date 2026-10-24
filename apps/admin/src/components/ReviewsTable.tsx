import React, { useState, useEffect } from "react";
import { HiStar } from "react-icons/hi";
import { api, ReviewItem } from "../services/api";

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 0; i < rating; i++) {
    stars.push(<HiStar key={i} className="text-yellow-500 inline" />);
  }
  return stars;
};

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
      <div className="py-12 text-center dark:text-gray-400 text-gray-600">
        Loading customer reviews from backend...
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
            Reviewer
          </th>
          <th scope="col" className="py-2 pl-0 pr-8 font-semibold table-cell">
            Rating
          </th>
          <th scope="col" className="py-2 pl-0 pr-8 font-semibold table-cell">
            Product & Feedback
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
            Status
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {reviews.map((item) => (
          <tr key={item.id}>
            <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
              <div className="flex items-center gap-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                  {item.userName.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium dark:text-whiteSecondary text-blackPrimary">
                    {item.userName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.userEmail}
                  </div>
                </div>
              </div>
            </td>
            <td className="py-4 pl-0 pr-4 table-cell pr-8">
              <div className="flex items-center gap-x-1">
                {renderStars(item.rating)}
                <span className="text-xs font-semibold ml-1 dark:text-whiteSecondary text-blackPrimary">
                  ({item.rating}.0)
                </span>
              </div>
            </td>
            <td className="py-4 pl-0 pr-4 text-sm leading-6 dark:text-whiteSecondary text-blackPrimary max-w-sm">
              <div className="font-semibold text-xs text-emerald-400">
                {item.productName}
              </div>
              <div className="text-xs truncate dark:text-gray-300 text-gray-600 mt-0.5">
                "{item.comment}"
              </div>
            </td>
            <td className="py-4 pl-0 pr-8 text-sm leading-6 dark:text-gray-400 text-gray-500 table-cell lg:pr-20">
              {new Date(item.createdAt).toLocaleDateString()}
            </td>
            <td className="py-4 pl-0 pr-4 text-right text-xs leading-6 font-semibold uppercase pr-6 lg:pr-8">
              <span className={`px-2 py-0.5 rounded-full ${
                item.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReviewsTable;
