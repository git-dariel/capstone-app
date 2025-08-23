import React from "react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  userId: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  avatar?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  name,
  lastMessage,
  timestamp,
  unreadCount = 0,
  avatar,
  isActive = false,
  onClick,
  className,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      return "now";
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      if (days < 7) {
        return `${days}d`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        "hover:bg-gray-50",
        isActive && "bg-primary-50 border border-primary-200",
        className
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar
          src={avatar}
          fallback={name.charAt(0)}
          className={cn("w-12 h-12", unreadCount > 0 && "ring-2 ring-primary-500 ring-offset-2")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4
            className={cn(
              "text-sm font-medium truncate",
              isActive ? "text-primary-700" : "text-gray-900",
              unreadCount > 0 && "font-semibold"
            )}
          >
            {name}
          </h4>
          {timestamp && (
            <span
              className={cn(
                "text-xs flex-shrink-0 ml-2",
                unreadCount > 0 ? "text-primary-600 font-medium" : "text-gray-500"
              )}
            >
              {formatTime(timestamp)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <p
            className={cn(
              "text-sm truncate",
              unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-500"
            )}
          >
            {lastMessage || "No messages yet"}
          </p>

          {/* Unread count badge */}
          {unreadCount > 0 && (
            <div className="flex-shrink-0 ml-2">
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
