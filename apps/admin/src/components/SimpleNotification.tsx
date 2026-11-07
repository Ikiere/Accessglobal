import React from "react";

export interface SimpleNotificationProps {
  imgSrc?: string;
  username: string;
  date: string;
  hoursAgo: string;
  action: string;
}

const SimpleNotification: React.FC<SimpleNotificationProps> = ({
  imgSrc,
  username,
  date,
  hoursAgo,
  action,
}) => {
  const avatarUrl =
    imgSrc ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;

  return (
    <div className="flex items-center justify-between dark:bg-[#111827] bg-white py-4 px-4 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors rounded-xl">
      <div className="flex gap-3.5 items-center min-w-0">
        <img
          src={avatarUrl}
          alt={username}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-white/[0.08]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;
          }}
        />
        <div className="flex flex-col min-w-0">
          <p className="text-xs text-gray-900 dark:text-gray-100">
            <span className="font-bold text-[#124330] dark:text-emerald-400">@{username}</span>{" "}
            {action}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{date}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="w-2 h-2 bg-[#124330] dark:bg-emerald-400 rounded-full"></div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">{hoursAgo}</p>
      </div>
    </div>
  );
};

export default SimpleNotification;
