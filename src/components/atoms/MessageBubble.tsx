import React from "react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwnMessage: boolean;
  senderName?: string;
  senderAvatar?: string;
  read?: boolean;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  isOwnMessage,
  senderName,
  senderAvatar,
  read = false,
  className,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 max-w-4xl",
        isOwnMessage ? "justify-end ml-auto" : "justify-start mr-auto",
        className
      )}
    >
      {/* Avatar for received messages */}
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          <Avatar src={senderAvatar} fallback={senderName?.charAt(0) || "U"} className="w-8 h-8" />
        </div>
      )}

      {/* Message content */}
      <div className={cn("flex flex-col gap-1", isOwnMessage ? "items-end" : "items-start")}>
        {/* Sender name for received messages */}
        {!isOwnMessage && senderName && (
          <span className="text-xs text-gray-500 px-3">{senderName}</span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "relative px-4 py-2 rounded-2xl max-w-xs sm:max-w-md break-words",
            isOwnMessage
              ? "bg-primary-600 text-white rounded-br-md"
              : "bg-gray-100 text-gray-900 rounded-bl-md",
            "shadow-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        {/* Timestamp and read status */}
        <div
          className={cn(
            "flex items-center gap-1 px-3",
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-xs text-gray-400">{formatTime(timestamp)}</span>
          {isOwnMessage && (
            <div className={cn("text-xs", read ? "text-primary-500" : "text-gray-400")}>
              {read ? "✓✓" : "✓"}
            </div>
          )}
        </div>
      </div>

      {/* Avatar for sent messages */}
      {isOwnMessage && (
        <div className="flex-shrink-0">
          <Avatar
            src={senderAvatar}
            fallback={senderName?.charAt(0) || "U"}
            className="w-8 h-8 bg-primary-100 text-primary-700"
          />
        </div>
      )}
    </div>
  );
};
