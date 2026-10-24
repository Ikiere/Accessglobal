import React, { useState } from "react";
import { HiOutlineSave } from "react-icons/hi";
import { Sidebar } from "../components";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [status, setStatus] = useState<"Processing" | "Delivered" | "Cancelled" | "Pending">("Processing");
  const [total, setTotal] = useState("499.00");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [shippingAddress, setShippingAddress] = useState("");
  const [itemTitle, setItemTitle] = useState("ApexBook Pro 16-inch M-Max Chip");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim() || !total) {
      setError("Please fill in customer name, email, shipping address, and total.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        status,
        total: parseFloat(total),
        paymentMethod,
        shippingAddress: shippingAddress.trim(),
        items: [
          {
            productId: "prod-1",
            title: itemTitle.trim() || "Electronic Device",
            price: parseFloat(total),
            quantity: 1,
            imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300"
          }
        ]
      });
      navigate("/orders");
    } catch (err: any) {
      setError(err.message || "Failed to create order");
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
                Add new order
              </h2>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                Order records are securely stored on the backend and synced to Supabase.
              </p>
            </div>
            <div className="flex gap-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="dark:bg-whiteSecondary bg-blackPrimary text-white dark:text-black font-semibold px-6 py-2.5 rounded text-base hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <HiOutlineSave className="text-xl" />
                <span>{submitting ? "Publishing..." : "Publish Order"}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="pb-8 pt-8 grid grid-cols-2 gap-x-10 max-xl:grid-cols-1 max-xl:gap-y-10">
            <div className="space-y-6">
              <h3 className="text-xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Customer Information
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alexander Vance"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Customer Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. alex@vanguard.com"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="100 Montgomery St, Suite 400, San Francisco, CA"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Order & Payment Details
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Purchased Item Description
                </label>
                <input
                  type="text"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                    Total Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                    Fulfillment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Wire Transfer">Corporate Wire Transfer</option>
                  <option value="Apple Pay">Apple Pay</option>
                  <option value="Crypto">Crypto (USDC / USDT)</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
