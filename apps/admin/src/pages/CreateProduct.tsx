import React, { useState } from "react";
import { Sidebar } from "../components";
import { HiOutlineSave } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Smartphones & Mobile");
  const [price, setPrice] = useState("499.00");
  const [inStock, setInStock] = useState("1");
  const [manufacturer, setManufacturer] = useState("AccessTech");
  const [mainImage, setMainImage] = useState(
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !category) {
      setError("Please fill in all required fields (Title, Price, Category).");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createProduct({
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        inStock: parseInt(inStock, 10),
        manufacturer: manufacturer.trim() || "AccessTech",
        mainImage: mainImage.trim(),
        rating: 5.0,
        popularity: 50
      });
      navigate("/products");
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-auto border-t border-blackSecondary border-1 flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="hover:bg-blackPrimary bg-whiteSecondary w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="pb-8 border-b border-gray-800 flex justify-between items-center max-sm:flex-col max-sm:gap-5">
            <div>
              <h2 className="text-3xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Add new product
              </h2>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                Product will be safely stored in the backend & synced to Supabase.
              </p>
            </div>
            <div className="flex gap-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="dark:bg-whiteSecondary bg-blackPrimary text-white dark:text-black font-semibold px-6 py-2.5 rounded text-base hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <HiOutlineSave className="text-xl" />
                <span>{submitting ? "Publishing..." : "Publish Product"}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="pb-8 pt-8 grid grid-cols-2 gap-x-10 max-xl:grid-cols-1 max-xl:gap-y-10">
            {/* Left Column: Form Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ApexBook Pro 16-inch M-Max"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                >
                  <option value="Smartphones & Mobile">Smartphones & Mobile</option>
                  <option value="Laptops & Workstations">Laptops & Workstations</option>
                  <option value="Audio & Acoustics">Audio & Acoustics</option>
                  <option value="Wearables & Smartwatches">Wearables & Smartwatches</option>
                  <option value="Cameras & Optics">Cameras & Optics</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Manufacturer / Brand
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. AccessTech"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed technical specs and overview..."
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

              <h3 className="text-xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary pt-4">
                Pricing & Inventory
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                    Stock Status
                  </label>
                  <select
                    value={inStock}
                    onChange={(e) => setInStock(e.target.value)}
                    className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                  >
                    <option value="1">In Stock</option>
                    <option value="0">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Media Preview */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Product Image & Media
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Image URL
                </label>
                <input
                  type="url"
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="border dark:border-gray-700 border-gray-300 rounded-lg p-4 dark:bg-zinc-800/40 bg-gray-50 flex flex-col items-center justify-center">
                <span className="text-xs font-semibold dark:text-gray-400 text-gray-500 mb-3 uppercase tracking-wider">
                  Live Preview
                </span>
                <img
                  src={mainImage}
                  alt="Product Preview"
                  className="w-64 h-64 object-cover rounded-lg shadow-md border dark:border-gray-700 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600";
                  }}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
