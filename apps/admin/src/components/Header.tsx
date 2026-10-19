import React from 'react';
import { SearchIcon, BellIcon } from './Icons';

interface HeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNotificationClick: () => void;
  notificationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  searchQuery,
  onSearchChange,
  onNotificationClick,
  notificationCount,
}) => {
  return (
    <header className="admin-header">
      <div className="header-left">
        <h2 className="header-title">{title}</h2>
        <span className="header-crumb">AccessGlobal Admin Engine • Production US-East</span>
      </div>

      <div className="header-right">
        <div className="header-search">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search accounts, transactions, corridors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
            aria-label="Global search"
          />
          <kbd className="search-kbd">⌘K</kbd>
        </div>

        <button
          onClick={onNotificationClick}
          className="header-icon-btn"
          aria-label={`View ${notificationCount} notifications`}
          title="System notifications"
        >
          <BellIcon size={18} />
          {notificationCount > 0 && <span className="notification-dot">{notificationCount}</span>}
        </button>

        <div className="admin-profile">
          <div className="profile-avatar">
            <span>SV</span>
          </div>
          <div className="profile-info">
            <span className="profile-name">Sarah Vance</span>
            <span className="profile-role">Super Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
