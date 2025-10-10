import { Logo, NotificationIcon } from "@/components/atoms";
import { UserDropdown } from "@/components/molecules/UserDropdown";
import React from "react";
import { useNavigate } from "react-router-dom";

export const TopNavigation: React.FC = () => {
  const navigate = useNavigate();

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

          {/* User Dropdown - Always visible */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};
