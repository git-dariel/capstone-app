import { Avatar, Logo } from "@/components/atoms";
import { useAuth } from "@/hooks";
import React from "react";

export const TopNavigation: React.FC = () => {
  const { user } = useAuth();

  // Get the first letter of user's firstName for avatar
  const avatarLetter = user?.person?.firstName?.charAt(0).toUpperCase() || "U";

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo Section - Always visible */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Logo />
          <span className="text-lg md:text-xl font-semibold text-gray-900">Bloom</span>
        </div>

        {/* Right Side - Responsive */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Avatar - Always visible */}
          <Avatar fallback={avatarLetter} className="h-8 w-8 md:h-10 md:w-10" />
        </div>
      </div>
    </header>
  );
};
