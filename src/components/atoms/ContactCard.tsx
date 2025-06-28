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
        "bg-white rounded-lg shadow-sm border p-6",
        urgent ? "border-red-200 bg-red-50" : "border-gray-200",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <div
          className={cn(
            "p-3 rounded-lg",
            urgent ? "bg-red-100 text-red-600" : "bg-teal-50 text-teal-600"
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className={cn("text-lg font-semibold mb-2", urgent ? "text-red-900" : "text-gray-900")}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed mb-3",
              urgent ? "text-red-800" : "text-gray-600"
            )}
          >
            {description}
          </p>
          <div className="space-y-2">
            <div className={cn("font-semibold text-lg", urgent ? "text-red-900" : "text-teal-600")}>
              {contactInfo}
            </div>
            {availability && (
              <div className={cn("text-sm", urgent ? "text-red-700" : "text-gray-500")}>
                {availability}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
