import { Avatar, Logo, NotificationIcon } from "@/components/atoms";
import { useAuth } from "@/hooks";
import React from "react";
import { useNavigate } from "react-router-dom";

export const TopNavigation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get the first letter of user's firstName for avatar
  const avatarLetter = user?.person?.firstName?.charAt(0).toUpperCase() || "U";

  const handleMessagesClick = () => {
    navigate("/messages");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo Section - Always visible */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Logo />
          <span className="text-base md:text-xl font-semibold text-gray-900">Guidance Center</span>
        </div>

        {/* Right Side - Responsive */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Message notification */}
          <NotificationIcon
            type="message"
            onClick={handleMessagesClick}
            title="Messages"
            className="hidden sm:block"
          />

          {/* Avatar - Always visible */}
          <Avatar fallback={avatarLetter} className="h-8 w-8 md:h-10 md:w-10" />
        </div>
      </div>
    </header>
  );
};
