import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  position?: "left" | "right";
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
  position = "right",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle visibility and animation states
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure the element is in DOM before starting animation
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Keep visible during closing animation
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: "max-w-sm w-full",
    md: "max-w-md w-full",
    lg: "max-w-lg w-full",
    xl: "max-w-2xl w-full",
  };

  const positionClasses = {
    left: "left-0",
    right: "right-0",
  };

  const slideClasses = {
    left: isAnimating ? "translate-x-0" : "-translate-x-full",
    right: isAnimating ? "translate-x-0" : "translate-x-full",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={cn("fixed inset-y-0 flex", positionClasses[position])}>
        <div
          className={cn(
            "relative bg-white shadow-2xl transform flex flex-col h-full border-l border-gray-200",
            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            sizeClasses[size],
            slideClasses[position],
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0 transition-all duration-300 delay-100",
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            )}
          >
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-1 rounded-full hover:bg-gray-100 hover:scale-110"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div
            className={cn(
              "flex-1 overflow-y-auto px-6 py-4 pb-6 transition-all duration-500 delay-200",
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
