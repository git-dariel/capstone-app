import React from "react";
import { cn } from "@/lib/utils";

interface HelpCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const HelpCard: React.FC<HelpCardProps> = ({
  title,
  description,
  icon,
  onClick,
  className,
  children,
}) => {
  const CardWrapper = onClick ? "button" : "div";

  return (
    <CardWrapper
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left transition-all duration-200",
        onClick && "hover:shadow-md hover:border-teal-300 cursor-pointer",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-teal-50 rounded-lg text-teal-600">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
          {children}
        </div>
      </div>
    </CardWrapper>
  );
};
