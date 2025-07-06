import React from "react";
import { cn } from "@/lib/utils";

interface ContactCardProps {
  title: string;
  description: string;
  contactInfo: string;
  availability?: string;
  urgent?: boolean;
  icon: React.ReactNode;
  className?: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  title,
  description,
  contactInfo,
  availability,
  urgent = false,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border p-4 sm:p-6",
        urgent ? "border-red-200 bg-red-50" : "border-gray-200",
        className
      )}
    >
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div
          className={cn(
            "p-2 sm:p-3 rounded-lg flex-shrink-0",
            urgent ? "bg-red-100 text-red-600" : "bg-primary-50 text-primary-700"
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-base sm:text-lg font-semibold mb-2",
              urgent ? "text-red-900" : "text-gray-900"
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-xs sm:text-sm leading-relaxed mb-3",
              urgent ? "text-red-800" : "text-gray-600"
            )}
          >
            {description}
          </p>
          <div className="space-y-2">
            <div
              className={cn(
                "font-semibold text-base sm:text-lg break-all",
                urgent ? "text-red-900" : "text-primary-700"
              )}
            >
              {contactInfo}
            </div>
            {availability && (
              <div className={cn("text-xs sm:text-sm", urgent ? "text-red-700" : "text-gray-500")}>
                {availability}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
