import React from "react";
import { Logo, SearchBar, NotificationBell, Avatar } from "@/components/atoms";
import { useAuth } from "@/hooks";

export const TopNavigation: React.FC = () => {
  const { user } = useAuth();

  // Get the first letter of user's firstName for avatar
  const avatarLetter = user?.person?.firstName?.charAt(0).toUpperCase() || "U";

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
          <Avatar fallback={avatarLetter} />
        </div>
      </div>
    </header>
  );
};
