import React from "react";
import { Logo, SearchBar, NotificationBell, Avatar } from "@/components/atoms";

export const TopNavigation: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo />
          <span className="text-xl font-semibold text-gray-900">Bloom</span>
        </div>

        <div className="flex items-center space-x-4">
          <SearchBar />
          <NotificationBell hasNotification={true} />
          <Avatar fallback="D" />
        </div>
      </div>
    </header>
  );
};
