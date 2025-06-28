import React from "react";
import { Avatar } from "@/components/atoms";
import { cn } from "@/lib/utils";

interface AnnouncementCardProps {
  title: string;
  description: string;
  date: string;
  category: string;
  categoryColor?: "blue" | "green" | "purple" | "orange";
  avatar?: string;
  className?: string;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  title,
  description,
  date,
  category,
  categoryColor = "blue",
  avatar,
  className = "",
}) => {
  const categoryColors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800",
  };

  return (
    <div
      className={cn("flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors", className)}
    >
      <Avatar src={avatar} fallback="A" className="mt-1" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{title}</h3>
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2",
              categoryColors[categoryColor]
            )}
          >
            {category}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{description}</p>

        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
};
