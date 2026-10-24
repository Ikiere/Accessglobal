import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { api, ProductItem } from "../services/api";

const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts();
      setProducts(data.products);
    } catch (err: any) {
      setError(err.message || "Failed to load products from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Loading catalog inventory from server & Supabase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm my-4 flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={loadProducts}
          className="text-xs font-semibold underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-gray-300 dark:border-white/[0.1] my-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          No products currently in catalog
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Click "Add a product" to publish your first item to the store and Supabase.
        </p>
        <Link
          to="/products/create-product"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
        >
          <HiOutlineSparkles /> Create Product
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200/80 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#111827] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200/80 dark:border-white/[0.06] text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Product Details</th>
              <th className="py-3.5 px-4">Identifier / SKU</th>
              <th className="py-3.5 px-4">Availability</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04] text-xs">
            {products.map((item) => {
              const inStock = item.inStock === undefined || item.inStock > 0;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={
                          item.mainImage ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80"
                        }
                        alt={item.title}
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-white/[0.1] bg-white flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">
                          {item.category || "General Goods"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                    {item.slug || item.id}
                  </td>

                  <td className="py-4 px-4">
                    {inStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        In Stock ({item.inStock ?? 25})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Out of stock
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 font-bold text-gray-900 dark:text-white text-sm">
                    ${Number(item.price || 0).toFixed(2)}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/products/${item.id}`}
                        className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                        title="View / Edit Product"
                      >
                        <HiOutlinePencil className="text-base" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 rounded-lg text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete Product"
                      >
                        <HiOutlineTrash className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
