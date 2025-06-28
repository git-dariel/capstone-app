import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "blue" | "red" | "yellow" | "green" | "purple";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  className = "",
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

  return (
    <div
      className={cn(
        "bg-white rounded-lg border shadow-sm p-6 transition-all hover:shadow-md",
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className={cn("w-12 h-12 flex items-center justify-center", iconColorClasses[color])}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
