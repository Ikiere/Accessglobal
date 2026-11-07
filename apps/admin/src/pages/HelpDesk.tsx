import React, { useState } from "react";
import { Sidebar } from "../components";
import {
  HiOutlineChevronRight,
  HiOutlineMagnifyingGlass,
  HiOutlineBookOpen,
  HiOutlineCpuChip,
  HiOutlineShoppingBag,
  HiOutlinePhoto,
  HiOutlineShieldCheck,
  HiOutlineCircleStack,
  HiOutlineCommandLine,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineClipboardDocument,
  HiOutlineCheck,
} from "react-icons/hi2";
import { Link } from "react-router-dom";

interface DocTopic {
  id: string;
  category: string;
  title: string;
  badge?: string;
  summary: string;
  content: string[];
  codeSnippet?: string;
}

const DOC_TOPICS: DocTopic[] = [
  {
    id: "arch-sync",
    category: "Architecture & Synchronization",
    title: "Dual-Tier Platform Architecture & Live Storefront Sync",
    badge: "Core Architecture",
    summary: "How AccessGlobal orchestrates real-time catalog and order synchronization between the Admin Console and Storefront.",
    content: [
      "AccessGlobal operates as a modern monorepo separating customer storefront (apps/frontend) from executive operations (apps/admin) while sharing a unified PostgreSQL Supabase database.",
      "Any product, category, or stock update executed in the Admin Dashboard immediately commits to Supabase public tables (public.products, public.categories, public.orders).",
      "The storefront implements active tab visibility and window focus listeners. When an administrator creates or edits a product in Admin and toggles back to the Storefront tab, the catalog refreshes automatically without requiring a hard browser reload.",
      "If Supabase connectivity ever experiences network latency, both frontend and admin feature resilient client fallbacks to guarantee uninterrupted catalog availability.",
    ],
  },
  {
    id: "ebike-specs",
    category: "Product Management",
    title: "E-Bike Engineering Specifications & Direct Uploads",
    badge: "E-Bike Standard",
    summary: "Complete guide to configuring technical hardware specifications for electric transit vehicles and premium goods.",
    content: [
      "AccessGlobal products include dedicated support for deep technical specifications, specifically tailored for E-Bikes and micro-mobility vehicles.",
      "The E-Bike specifications module captures 10 vital parameters: Motor power (W/peak), Removable Battery capacity (Wh/Ah), Range per charge (miles/km), Top Speed class, Hydroformed Frame alloy, Hydraulic Disc Brakes, Gearing drivetrain, Puncture-resistant Tires, Max Payload capacity, and Fast Charging time.",
      "Specifications are stored in the PostgreSQL database as structured JSONB (public.products.specs) and simultaneously compiled into clean Markdown under the product description for full backwards compatibility.",
      "Storefront product detail pages automatically parse these specifications into specialized luxury engineering spec grids with iconography and unit badges.",
    ],
  },
  {
    id: "manual-image-upload",
    category: "Product Management",
    title: "Manual Product Image Upload & Asset Optimization",
    badge: "Media Engine",
    summary: "How to upload images from your local device or link high-resolution CDN assets with client-side canvas optimization.",
    content: [
      "The Product and Category management screens support two distinct image intake workflows: Manual File Upload and Direct Remote URL.",
      "Manual File Upload: Drag and drop or browse for any PNG, JPG, WebP, SVG, or AVIF file from your device up to 12 MB.",
      "Automatic In-Browser Compression: The console leverages an HTML5 Canvas pipeline that downscales oversized files to a maximum 1200px width/height and generates a lightweight WebP/JPEG data URL. This ensures instant thumbnail rendering and eliminates payload bloat in PostgreSQL.",
      "Direct Remote URL: Input verified HTTPS direct links from Unsplash, Cloudinary, AWS S3, or your workshop CDN with instant visual preview.",
    ],
  },
  {
    id: "order-lifecycle",
    category: "Fulfillment & Orders",
    title: "Order Fulfillment Lifecycle & Customer Records",
    badge: "Fulfillment",
    summary: "Managing customer purchases, shipping addresses, order status updates, and consignment tracking.",
    content: [
      "When a customer checks out on the storefront, an order record is created in public.orders with items, unit prices, total, and shipping address.",
      "The Admin Console provides comprehensive order monitoring via the Orders view (/orders) with status workflows: Processing → Shipped → Delivered → Cancelled.",
      "Customer data is linked via email to public.users and tracked in the dynamic Activity Feed with timestamped event logging.",
      "Orders can be filtered, printed as executive consignment invoices, or updated in real-time.",
    ],
  },
  {
    id: "auth-otp",
    category: "Security & Authentication",
    title: "OTP Security Architecture & Admin Access Control",
    badge: "Security Standard",
    summary: "Passwordless customer sign-in via Resend email OTP and administrative role enforcement via Supabase Auth.",
    content: [
      "Storefront Customer Authentication utilizes one-time email passcodes (OTP) dispatched through Resend API. This eliminates vulnerable shared passwords while ensuring verified email ownership.",
      "In development/testing environments, security OTP codes are auto-routed to the verified development address (esoweibi@gmail.com) and surfaced with 1-click UI auto-fill to prevent third-party email delivery blocks.",
      "Admin Console authentication is strictly gated by public.users (role = 'admin') and Supabase Auth. Sessions are cryptographically signed with JWTs.",
      "Row-Level Security (RLS) is enabled across all tables to enforce read/write permissions at the PostgreSQL kernel level.",
    ],
  },
  {
    id: "sql-runbook",
    category: "Database & Runbooks",
    title: "Supabase Setup Script Execution & Schema Runbooks",
    badge: "Database Runbook",
    summary: "Safe, idempotent database provisioning with supabase-setup.sql in the Supabase SQL Editor.",
    content: [
      "The database schema is defined in supabase-setup.sql in the project root. The script is completely idempotent: it uses IF NOT EXISTS and ON CONFLICT (slug) DO NOTHING, allowing safe repeated runs without data loss.",
      "To initialize or refresh your Supabase database: Open your Supabase Dashboard → SQL Editor → New Query → Paste supabase-setup.sql → Click 'Run'.",
      "The script provisions 5 core tables (products, categories, orders, users, reviews), enables pgcrypto, configures RLS policies, adds high-performance B-tree indexes, creates the auth trigger, and registers the initial admin user.",
    ],
    codeSnippet: `-- Example: Querying active product catalog with E-Bike specs
SELECT id, title, price, category, in_stock, specs
FROM public.products
ORDER BY created_at DESC;`,
  },
  {
    id: "storefront-custom-url",
    category: "Operations & Deployment",
    title: "Storefront Navigation & Environment Customization",
    badge: "Operations",
    summary: "Configuring custom domain storefront links and deploying frontend & admin on Vercel.",
    content: [
      "The 'Visit Storefront' shortcut in the Admin Header dynamically detects whether you are running locally (http://localhost:3000) or on production.",
      "You can customize your storefront redirect URL by storing accessglobal_storefront_url in your browser localStorage or configuring Vercel domain aliases.",
      "Both applications deploy independently on Vercel. Edge rewrite proxies in vercel.json ensure CORS-free communication with external APIs like Resend.",
    ],
    codeSnippet: `// Customizing Storefront URL from browser console
localStorage.setItem('accessglobal_storefront_url', 'https://your-custom-domain.com');`,
  },
];

const HelpDesk: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string>("arch-sync");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(DOC_TOPICS.map((t) => t.category)))];

  const filteredTopics = DOC_TOPICS.filter((t) => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  return (
    <div className="flex min-h-screen bg-[#FBF8F3] dark:bg-[#0a0e17] text-[#121516] dark:text-gray-100 transition-colors">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 overflow-y-auto">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5DAC9] dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#57625B] dark:text-gray-400 mb-1.5">
              <Link to="/" className="hover:text-[#124330] dark:hover:text-emerald-400 transition-colors">
                Dashboard
              </Link>
              <HiOutlineChevronRight className="text-xs" />
              <span className="font-semibold text-[#121516] dark:text-white">Help Desk &amp; Documentation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#121516] dark:text-white">
              Operations Documentation &amp; Technical Runbooks
            </h1>
            <p className="text-xs text-[#57625B] dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Engineering guides, catalog management playbooks, Supabase PostgreSQL runbooks, and security architectures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#124330]/10 text-[#124330] dark:bg-[#124330]/25 dark:text-[#52b788] border border-[#124330]/20">
              <HiOutlineBookOpen className="text-sm" /> Official Platform Guide v2.4
            </span>
          </div>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Search bar */}
          <div className="lg:col-span-8 relative">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture guides, E-Bike specifications, SQL runbooks, or image upload workflows..."
              className="w-full h-11 pl-10 pr-4 text-xs rounded-xl bg-white dark:bg-[#111827] border border-[#E5DAC9] dark:border-white/[0.08] text-gray-900 dark:text-white outline-none focus:border-[#124330] dark:focus:border-emerald-500 shadow-xs transition-all placeholder-gray-400"
            />
          </div>

          {/* Category Dropdown or quick pill count */}
          <div className="lg:col-span-4 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
            <span>Showing <b>{filteredTopics.length}</b> documented runbook modules</span>
          </div>
        </div>

        {/* Category Pills Outline */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-[#E5DAC9]/60 dark:border-white/[0.06] text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#124330] text-white shadow-xs"
                  : "bg-white dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-[#E5DAC9] dark:border-white/[0.08]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Documentation Content Grid (Outline on Left, Detailed Accordions on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Quick Outline Sidebar */}
          <div className="lg:col-span-4 space-y-3 sticky top-24">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5DAC9] dark:border-white/[0.08] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#124330] dark:text-emerald-400">
                <HiOutlineCommandLine className="text-base" />
                <span>Documentation Outline</span>
              </div>
              <nav className="flex flex-col space-y-1 text-xs">
                {DOC_TOPICS.map((topic, index) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setExpandedId(topic.id);
                      const el = document.getElementById(topic.id);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`flex items-start gap-2 text-left px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                      expandedId === topic.id
                        ? "bg-[#124330]/10 text-[#124330] dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-gray-400 shrink-0 mt-0.5">
                      0{index + 1}
                    </span>
                    <span className="line-clamp-1">{topic.title}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Support Badge */}
            <div className="p-4 rounded-2xl bg-[#E9F2ED] border border-[#124330]/20 text-[#124330] text-xs space-y-1.5">
              <p className="font-bold">Database Synchronized</p>
              <p className="text-[11px] leading-relaxed text-[#124330]/90">
                All records, images, and E-Bike specifications render dynamically from your live Supabase PostgreSQL schema.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Document Modules */}
          <div className="lg:col-span-8 space-y-5">
            {filteredTopics.map((topic) => {
              const isExpanded = expandedId === topic.id;
              return (
                <div
                  key={topic.id}
                  id={topic.id}
                  className="rounded-2xl bg-white dark:bg-[#111827] border border-[#E5DAC9] dark:border-white/[0.08] shadow-xs overflow-hidden transition-all"
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? "" : topic.id)}
                    className="w-full flex items-start justify-between p-6 text-left hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-mono">
                          {topic.category}
                        </span>
                        {topic.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#124330]/10 text-[#124330] dark:bg-emerald-500/15 dark:text-emerald-400 border border-[#124330]/20 dark:border-emerald-500/30">
                            {topic.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {topic.summary}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-300 shrink-0 mt-1">
                      {isExpanded ? (
                        <HiOutlineChevronUp className="text-base" />
                      ) : (
                        <HiOutlineChevronDown className="text-base" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-white/[0.06] space-y-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                      <div className="space-y-2.5">
                        {topic.content.map((paragraph, pIdx) => (
                          <p key={pIdx} className="leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {topic.codeSnippet && (
                        <div className="mt-4 rounded-xl overflow-hidden bg-[#0d1117] border border-white/[0.08] text-gray-200">
                          <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/[0.06] text-[11px] font-mono text-gray-400">
                            <span>Code Runbook</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(topic.codeSnippet!, topic.id)}
                              className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedSnippet === topic.id ? (
                                <>
                                  <HiOutlineCheck className="text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <HiOutlineClipboardDocument />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 text-[11px] font-mono overflow-x-auto text-emerald-300">
                            <code>{topic.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpDesk;
