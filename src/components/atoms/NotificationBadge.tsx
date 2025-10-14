import React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
  badgeClassName?: string;
  showZero?: boolean;
  maxCount?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onClick,
  className,
  iconClassName,
  badgeClassName,
  showZero = false,
  maxCount = 99,
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const shouldShowBadge = showZero || count > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
      aria-label={`Notifications (${count} unread)`}
    >
      <Bell
        className={cn(
          "w-5 h-5 text-gray-600 dark:text-gray-400",
          count > 0 && "text-blue-600 dark:text-blue-400",
          iconClassName
        )}
      />

      {shouldShowBadge && (
        <span
          className={cn(
            "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1",
            "bg-red-500 text-white text-xs font-medium",
            "rounded-full flex items-center justify-center",
            "animate-pulse",
            count === 0 && "bg-gray-400",
            badgeClassName
          )}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
};
