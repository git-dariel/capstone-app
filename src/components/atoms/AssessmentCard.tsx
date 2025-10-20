import React from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface AssessmentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "anxiety" | "depression" | "stress" | "suicide" | "checklist";
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  cooldownMessage?: string;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
  className,
  disabled = false,
  cooldownMessage,
}) => {
  const getColorClasses = (color: "anxiety" | "depression" | "stress" | "suicide" | "checklist", disabled: boolean) => {
    const baseClasses = disabled
      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
      : "hover:shadow-lg transform hover:-translate-y-1";

    if (disabled) return baseClasses;

    switch (color) {
      case "anxiety":
        return `${baseClasses} border-red-200 hover:border-red-300 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-150`;
      case "depression":
        return `${baseClasses} border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150`;
      case "stress":
        return `${baseClasses} border-yellow-200 hover:border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-150`;
      case "suicide":
        return `${baseClasses} border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150`;
      case "checklist":
        return `${baseClasses} border-green-200 hover:border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-150`;
      default:
        return `${baseClasses} border-gray-200 hover:border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100`;
    }
  };

  const getIconColor = (color: "anxiety" | "depression" | "stress" | "suicide" | "checklist", disabled: boolean) => {
    if (disabled) return "text-gray-400";

    switch (color) {
      case "anxiety":
        return "text-red-600";
      case "depression":
        return "text-blue-600";
      case "stress":
        return "text-yellow-600";
      case "suicide":
        return "text-purple-600";
      case "checklist":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "w-full p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 text-left",
        getColorClasses(color, disabled),
        className
      )}
    >
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className={cn("p-2 sm:p-3 rounded-lg bg-white/80", getIconColor(color, disabled))}>
          {disabled && cooldownMessage ? <Clock className="w-6 h-6" /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-base sm:text-lg font-semibold mb-1 sm:mb-2",
              disabled ? "text-gray-500" : "text-gray-900"
            )}
          >
            {title}
          </h3>
          <p className={cn("text-xs sm:text-sm leading-relaxed", disabled ? "text-gray-400" : "text-gray-600")}>
            {disabled && cooldownMessage ? cooldownMessage : description}
          </p>
        </div>
      </div>
    </button>
  );
};
