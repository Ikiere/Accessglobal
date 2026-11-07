import React, { useState, useRef } from "react";
import {
  HiOutlinePhoto,
  HiOutlineArrowUpTray,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineLink,
  HiOutlineArrowPath,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
}

/**
 * Optimizes an uploaded file on an HTML5 canvas:
 * Resizes down to maxWidth (1200px) and compresses to lightweight WebP/JPEG data URL.
 */
const optimizeImageFile = (file: File, maxWidth = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If it's an SVG, read directly as data URL without rasterizing
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Prefer webp, fallback to jpeg
        try {
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData.startsWith("data:image/webp")) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback
        }
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = "",
  onChange,
  label = "Product Image",
  helperText = "Upload high-resolution photography or provide a verified CDN/Unsplash link.",
  placeholder = "https://images.unsplash.com/...",
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Selected file is not an image. Please provide a PNG, JPG, WebP, or SVG.");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setError("File exceeds 12 MB limit. Please choose a smaller image.");
      return;
    }

    try {
      setProcessing(true);
      const optimizedDataUrl = await optimizeImageFile(file);
      onChange(optimizedDataUrl);
    } catch (err: any) {
      setError(err?.message || "Failed to process image file.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleClear = () => {
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-gray-900 dark:text-white tracking-wide">
            {label}
          </label>
          {helperText && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {helperText}
            </p>
          )}
        </div>

        {/* Mode switch */}
        <div className="inline-flex items-center p-0.5 bg-gray-100 dark:bg-white/[0.06] rounded-lg border border-gray-200/80 dark:border-white/[0.08] text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              activeTab === "upload"
                ? "bg-white dark:bg-[#111827] text-[#124330] dark:text-emerald-400 shadow-xs font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <HiOutlineArrowUpTray className="text-xs" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              activeTab === "url"
                ? "bg-white dark:bg-[#111827] text-[#124330] dark:text-emerald-400 shadow-xs font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <HiOutlineLink className="text-xs" />
            <span>Direct URL</span>
          </button>
        </div>
      </div>

      {/* Main input area */}
      {activeTab === "upload" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center ${
            dragOver
              ? "border-[#124330] dark:border-emerald-500 bg-[#124330]/5 dark:bg-emerald-500/10"
              : "border-gray-300 dark:border-white/[0.12] hover:border-[#124330]/60 dark:hover:border-emerald-500/60 bg-gray-50/50 dark:bg-white/[0.02]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] shadow-xs flex items-center justify-center text-[#124330] dark:text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
            {processing ? (
              <HiOutlineArrowPath className="text-xl animate-spin" />
            ) : (
              <HiOutlineArrowUpTray className="text-xl" />
            )}
          </div>

          <p className="text-xs font-bold text-gray-900 dark:text-white">
            {processing ? "Compressing & Optimizing..." : "Click or drag & drop image file to upload"}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            PNG, JPG, WebP, SVG, AVIF up to 12 MB (Auto-optimized for high-DPI storefront displays)
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <HiOutlineLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="url"
              value={value}
              onChange={(e) => {
                setError(null);
                onChange(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full h-11 pl-10 pr-4 text-xs rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#124330] dark:focus:border-emerald-500 font-mono transition-all"
            />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Supports Unsplash, Cloudinary, AWS S3, or any publicly accessible HTTPS image endpoint.
          </p>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs">
          <HiOutlineExclamationCircle className="text-base shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Preview Banner */}
      {value && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-white/[0.08] shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/[0.1] shrink-0">
              <img
                src={value}
                alt="Product preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                <HiOutlineCheck className="text-emerald-500 text-sm" />
                <span>Image Attached</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs sm:max-w-md font-mono mt-0.5">
                {value.startsWith("data:")
                  ? `Manual File Upload (${Math.round((value.length * 3) / 4 / 1024)} KB)`
                  : value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] transition-all"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all"
              title="Remove image"
            >
              <HiOutlineTrash className="text-base" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
