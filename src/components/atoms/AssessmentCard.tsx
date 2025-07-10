import React from "react";
import { cn } from "@/lib/utils";

interface AssessmentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "anxiety" | "depression" | "stress" | "suicide";
  onClick: () => void;
  className?: string;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
  className,
}) => {
  const getColorClasses = (color: "anxiety" | "depression" | "stress" | "suicide") => {
    switch (color) {
      case "anxiety":
        return "border-red-200 hover:border-red-300 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-150";
      case "depression":
        return "border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150";
      case "stress":
        return "border-yellow-200 hover:border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-150";
      case "suicide":
        return "border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150";
      default:
        return "border-gray-200 hover:border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100";
    }
  };

  const getIconColor = (color: "anxiety" | "depression" | "stress" | "suicide") => {
    switch (color) {
      case "anxiety":
        return "text-red-600";
      case "depression":
        return "text-blue-600";
      case "stress":
        return "text-yellow-600";
      case "suicide":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg transform hover:-translate-y-1",
        getColorClasses(color),
        className
      )}
    >
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className={cn("p-2 sm:p-3 rounded-lg bg-white/80", getIconColor(color))}>{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
};
