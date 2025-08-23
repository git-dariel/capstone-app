import React from "react";
import { Bell, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationIconProps {
  type?: "bell" | "message";
  count?: number;
  onClick?: () => void;
  className?: string;
  title?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  type = "bell",
  count = 0,
  onClick,
  className,
  title,
}) => {
  const Icon = type === "message" ? MessageSquare : Bell;
  const hasNotification = count > 0;

  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "relative p-2 rounded-lg transition-colors",
        "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        className
      )}
    >
      <Icon className="h-5 w-5" />
      {hasNotification && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
};
