import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl sm:max-w-2xl max-w-[95vw]",
    xl: "max-w-4xl",
    full: "max-w-none w-full h-full",
  };

  const containerClasses =
    size === "full"
      ? "flex h-full w-full p-0 items-stretch justify-stretch"
      : "flex min-h-full items-center justify-center p-2 sm:p-4 overflow-y-auto";

  const modalClasses =
    size === "full"
      ? "relative w-full h-full bg-white shadow-xl transform transition-all flex flex-col"
      : cn(
          "relative w-full bg-white rounded-lg shadow-xl transform transition-all flex flex-col max-h-[95vh] sm:max-h-[90vh] my-2 sm:my-8",
          sizeClasses[size]
        );

  const headerClasses =
    size === "full"
      ? "flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0"
      : "flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0";

  const contentClasses = 
    size === "full" 
      ? "flex-1 overflow-y-auto" 
      : "px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-1";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm transition-all" onClick={onClose} />

      {/* Modal */}
      <div className={containerClasses}>
        <div className={modalClasses} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={headerClasses}>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Content */}
          <div className={contentClasses}>{children}</div>
        </div>
      </div>
    </div>
  );
};
