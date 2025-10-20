import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "blue" | "red" | "yellow" | "green" | "purple";
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  className = "",
  onClick,
  clickable = false,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    red: "bg-red-50 border-red-200",
    yellow: "bg-yellow-50 border-yellow-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  const CardComponent = clickable ? "button" : "div";

  return (
    <CardComponent
      onClick={clickable ? onClick : undefined}
      className={cn(
        "bg-white rounded-lg border shadow-sm p-4 sm:p-5 transition-all hover:shadow-md w-full text-left h-full flex flex-col min-h-[120px]",
        colorClasses[color],
        clickable && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )}
    >
      <div className="flex items-start justify-between flex-1">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              "w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center flex-shrink-0 rounded-lg",
              iconColorClasses[color],
              color === "blue" && "bg-blue-100",
              color === "red" && "bg-red-100", 
              color === "yellow" && "bg-yellow-100",
              color === "green" && "bg-green-100",
              color === "purple" && "bg-purple-100"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </CardComponent>
  );
};
