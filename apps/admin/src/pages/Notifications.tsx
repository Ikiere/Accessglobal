import React, { useState, useEffect } from "react";
import {
  HiOutlineCheck,
  HiOutlineBell,
  HiOutlineChevronRight,
  HiOutlineShoppingBag,
  HiOutlineStar,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import { Sidebar } from "../components";
import { Link } from "react-router-dom";
import { api, OrderItem, ReviewItem, ProductItem, UserItem } from "../services/api";

interface DynamicNotification {
  id: string;
  type: "order" | "review" | "product" | "user";
  username: string;
  avatar: string;
  action: string;
  timestamp: string;
  relativeTime: string;
  link: string;
  status?: string;
  isRead?: boolean;
}

const formatRelativeTime = (dateStr?: string): string => {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ${Math.floor(diffSec / 3600) === 1 ? "hour" : "hours"} ago`;
  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const formatNotificationDate = (dateStr?: string): string => {
  if (!dateStr) return "Today";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<DynamicNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | "order" | "review" | "product" | "user">("all");
  const [allRead, setAllRead] = useState<boolean>(false);

  const fetchDynamicNotifications = async () => {
    setLoading(true);
    try {
      const [orderRes, reviewRes, prodRes, userRes] = await Promise.allSettled([
        api.getOrders(),
        api.getReviews(),
        api.getProducts(),
        api.getUsers(),
      ]);

      const items: DynamicNotification[] = [];

      // 1. Dynamic Orders
      if (orderRes.status === "fulfilled" && orderRes.value.orders) {
        orderRes.value.orders.forEach((o: OrderItem) => {
          const userHandle = o.customerName
            ? o.customerName.toLowerCase().replace(/[^a-z0-9]/g, "")
            : (o.customerEmail || "customer").split("@")[0];
          items.push({
            id: `order-${o.id}`,
            type: "order",
            username: userHandle || "customer",
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(o.customerName || userHandle)}`,
            action: `placed order #${o.id.slice(0, 8)} for $${Number(o.total).toFixed(2)} (${o.status})`,
            timestamp: formatNotificationDate(o.createdAt),
            relativeTime: formatRelativeTime(o.createdAt),
            link: "/orders",
            status: o.status,
          });
        });
      }

      // 2. Dynamic Reviews
      if (reviewRes.status === "fulfilled" && reviewRes.value.reviews) {
        reviewRes.value.reviews.forEach((r: ReviewItem) => {
          const userHandle = r.userName
            ? r.userName.toLowerCase().replace(/[^a-z0-9]/g, "")
            : (r.userEmail || "verified_buyer").split("@")[0];
          items.push({
            id: `review-${r.id}`,
            type: "review",
            username: userHandle || "verified_buyer",
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.userName || userHandle)}`,
            action: `reviewed ${r.productName} (${r.rating} stars): "${(r.comment || "").slice(0, 60)}${r.comment && r.comment.length > 60 ? "..." : ""}"`,
            timestamp: formatNotificationDate(r.createdAt),
            relativeTime: formatRelativeTime(r.createdAt),
            link: "/reviews",
            status: r.status,
          });
        });
      }

      // 3. Dynamic Products
      if (prodRes.status === "fulfilled" && prodRes.value.products) {
        prodRes.value.products.slice(0, 6).forEach((p: ProductItem) => {
          const workshop = p.manufacturer
            ? p.manufacturer.toLowerCase().replace(/[^a-z0-9]/g, "_")
            : "accessglobal";
          items.push({
            id: `product-${p.id}`,
            type: "product",
            username: workshop,
            avatar: p.mainImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(p.title)}`,
            action: `published product "${p.title}" to catalog under ${p.category} ($${Number(p.price).toFixed(2)})`,
            timestamp: "Recently",
            relativeTime: "Active in catalog",
            link: "/products",
          });
        });
      }

      // 4. Dynamic Users
      if (userRes.status === "fulfilled" && userRes.value.users) {
        userRes.value.users.slice(0, 5).forEach((u: UserItem) => {
          const userHandle = u.name
            ? u.name.toLowerCase().replace(/[^a-z0-9]/g, "")
            : (u.email || "user").split("@")[0];
          items.push({
            id: `user-${u.id}`,
            type: "user",
            username: userHandle,
            avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || userHandle)}`,
            action: `registered account ${u.email} (${(u.role || "user").toUpperCase()} privileges)`,
            timestamp: formatNotificationDate(u.createdAt),
            relativeTime: formatRelativeTime(u.createdAt),
            link: "/users",
          });
        });
      }

      setNotifications(items);
    } catch {
      // Fallback empty
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamicNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const getBadgeIcon = (type: DynamicNotification["type"]) => {
    switch (type) {
      case "order":
        return <HiOutlineShoppingBag className="text-emerald-500" />;
      case "review":
        return <HiOutlineStar className="text-amber-500" />;
      case "product":
        return <HiOutlineTag className="text-indigo-500" />;
      case "user":
        return <HiOutlineUser className="text-[#124330] dark:text-emerald-400" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBF8F3] dark:bg-[#0a0e17] text-gray-900 dark:text-gray-100 transition-colors">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 overflow-y-auto">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200/80 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <Link to="/" className="hover:text-[#124330] dark:hover:text-emerald-400 transition-colors">
                Dashboard
              </Link>
              <HiOutlineChevronRight className="text-xs" />
              <span className="font-semibold text-gray-900 dark:text-white">Notifications</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <span>Dynamic Activity Feed</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live Database
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Synchronized event audit stream populated directly from PostgreSQL orders, reviews, and catalog updates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDynamicNotifications}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.08] text-gray-700 dark:text-gray-300 font-semibold text-xs border border-gray-200 dark:border-white/[0.08] transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Refresh database events"
            >
              <HiOutlineArrowPath className={`text-base ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setAllRead(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#124330] hover:bg-[#0c2e21] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
            >
              <HiOutlineCheck className="text-base text-emerald-400" />
              <span>{allRead ? "All Events Cleared" : "Mark All as Read"}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-gray-200/60 dark:border-white/[0.06] text-xs">
          {[
            { key: "all", label: "All Events", count: notifications.length },
            { key: "order", label: "Orders", count: notifications.filter((n) => n.type === "order").length },
            { key: "review", label: "Reviews", count: notifications.filter((n) => n.type === "review").length },
            { key: "product", label: "Catalog", count: notifications.filter((n) => n.type === "product").length },
            { key: "user", label: "Customers", count: notifications.filter((n) => n.type === "user").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                filter === tab.key
                  ? "bg-[#124330] text-white shadow-xs"
                  : "bg-white dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200/80 dark:border-white/[0.08]"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Activity List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/[0.08] shadow-sm">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <HiOutlineArrowPath className="w-8 h-8 text-[#124330] dark:text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Fetching real-time audit records from PostgreSQL database...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto text-gray-400">
                <HiOutlineBell className="text-2xl" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                No activity records found
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                No database records match the selected filter. As storefront customers place orders and submit reviews, dynamic event cards will render here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center justify-between py-4 px-2 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] rounded-xl transition-colors gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={notif.avatar}
                        alt={notif.username}
                        className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-white/[0.1] bg-gray-100 dark:bg-white/[0.05]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(notif.username)}`;
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-[#111827] shadow-xs text-xs border border-gray-100 dark:border-white/[0.1]">
                        {getBadgeIcon(notif.type)}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-900 dark:text-gray-100 leading-snug">
                        <span className="font-bold text-[#124330] dark:text-emerald-400">@{notif.username}</span>{" "}
                        <span>{notif.action}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                        <span>{notif.timestamp}</span>
                        <span>•</span>
                        <span className="capitalize">{notif.type}</span>
                        {notif.status && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 font-mono">
                              {notif.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 hidden sm:inline">
                      {notif.relativeTime}
                    </span>
                    {!allRead && (
                      <span className="w-2 h-2 rounded-full bg-[#124330] dark:bg-emerald-400"></span>
                    )}
                    <Link
                      to={notif.link}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                      title="Inspect record in console"
                    >
                      <HiOutlineArrowTopRightOnSquare className="text-sm" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
