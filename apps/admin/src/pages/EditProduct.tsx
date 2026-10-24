import React, { useState, useEffect } from "react";
import { Sidebar } from "../components";
import { HiOutlineSave } from "react-icons/hi";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Smartphones & Mobile");
  const [price, setPrice] = useState("0");
  const [inStock, setInStock] = useState("1");
  const [manufacturer, setManufacturer] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { product } = await api.getProduct(id);
        setTitle(product.title);
        setDescription(product.description || "");
        setCategory(product.category);
        setPrice(String(product.price));
        setInStock(String(product.inStock));
        setManufacturer(product.manufacturer || "");
        setMainImage(product.mainImage || "");
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title.trim() || !price) {
      setError("Please fill in title and price.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.updateProduct(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        inStock: parseInt(inStock, 10),
        manufacturer: manufacturer.trim(),
        mainImage: mainImage.trim()
      });
      navigate("/products");
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-auto border-t border-blackSecondary border-1 flex dark:bg-blackPrimary bg-whiteSecondary">
        <Sidebar />
        <div className="dark:bg-blackPrimary bg-whiteSecondary w-full min-h-screen py-20 text-center dark:text-gray-400 text-gray-600">
          Loading product details...
        </div>
      </div>
    );
  }

  return (
    <div className="h-auto border-t border-blackSecondary border-1 flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="dark:bg-blackPrimary bg-whiteSecondary w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="pb-8 border-b border-gray-800 flex justify-between items-center max-sm:flex-col max-sm:gap-5">
            <div>
              <h2 className="text-3xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Edit product
              </h2>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                Updates will be securely synced with backend and Supabase.
              </p>
            </div>
            <div className="flex gap-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="dark:bg-whiteSecondary bg-blackPrimary text-white dark:text-black font-semibold px-6 py-2.5 rounded text-base hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <HiOutlineSave className="text-xl" />
                <span>{submitting ? "Saving..." : "Update Product"}</span>
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
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Category
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
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

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

            <div className="space-y-6">
              <h3 className="text-xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Product Image
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Image URL
                </label>
                <input
                  type="url"
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="border dark:border-gray-700 border-gray-300 rounded-lg p-4 dark:bg-zinc-800/40 bg-gray-50 flex flex-col items-center justify-center">
                <span className="text-xs font-semibold dark:text-gray-400 text-gray-500 mb-3 uppercase tracking-wider">
                  Image Preview
                </span>
                <img
                  src={mainImage || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600"}
                  alt="Preview"
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

export default EditProduct;
