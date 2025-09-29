import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface FullScreenLoadingProps {
  isLoading: boolean;
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  isLoading,
  message = "Loading...",
  size = "xl",
}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        <LoadingSpinner size={size} variant="lottie" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-800">{message}</p>
          <p className="text-sm text-gray-600 mt-1">Please wait...</p>
        </div>
      </div>
    </div>
  );
};