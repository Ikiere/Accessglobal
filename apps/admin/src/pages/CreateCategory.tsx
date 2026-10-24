import React, { useState } from "react";
import { HiOutlineSave } from "react-icons/hi";
import { Sidebar } from "../components";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const CreateCategory: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80");
  const [parentCategory, setParentCategory] = useState("/");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createCategory({
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        imageUrl: imageUrl.trim(),
        parentCategory: parentCategory.trim() || "/",
        productsNumber: 0
      });
      navigate("/categories");
    } catch (err: any) {
      setError(err.message || "Failed to create category");
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
                Add new category
              </h2>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                Categories are synced with the backend API and Supabase schema.
              </p>
            </div>
            <div className="flex gap-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="dark:bg-whiteSecondary bg-blackPrimary text-white dark:text-black font-semibold px-6 py-2.5 rounded text-base hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <HiOutlineSave className="text-xl" />
                <span>{submitting ? "Publishing..." : "Publish Category"}</span>
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
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  placeholder="e.g. Gaming & VR"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Slug / URL identifier
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. gaming-and-vr"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Parent Category
                </label>
                <input
                  type="text"
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  placeholder="/"
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Category Image
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-whiteSecondary text-blackPrimary">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border dark:border-gray-700 border-gray-300 dark:bg-zinc-800 bg-white dark:text-white text-black outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="border dark:border-gray-700 border-gray-300 rounded-lg p-4 dark:bg-zinc-800/40 bg-gray-50 flex flex-col items-center justify-center">
                <span className="text-xs font-semibold dark:text-gray-400 text-gray-500 mb-3 uppercase tracking-wider">
                  Image Preview
                </span>
                <img
                  src={imageUrl}
                  alt="Category Preview"
                  className="w-48 h-48 object-cover rounded-lg shadow-md border dark:border-gray-700 border-gray-200"
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

export default CreateCategory;
