import React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  hasNotification?: boolean;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  hasNotification = false,
  className = "",
}) => {
  return (
    <button
      className={cn(
        "relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
        className
      )}
    >
      <Bell className="h-5 w-5" />
      {hasNotification && (
        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
      )}
    </button>
  );
};
