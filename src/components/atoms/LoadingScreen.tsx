import React from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children?: React.ReactNode;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading,
  message = "Loading...",
  size = "lg",
  className,
  children,
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-4 p-8",
      className
    )}>
      <LoadingSpinner size={size} variant="lottie" />
      <p className="text-sm text-gray-600 font-medium">{message}</p>
    </div>
  );
};

// For overlay loading (e.g., over tables)
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = "Loading...",
  size = "md",
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size={size} variant="lottie" />
            <p className="text-sm text-gray-600 font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};