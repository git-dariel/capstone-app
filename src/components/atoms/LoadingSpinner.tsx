import React from "react";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import catMarkLoadingAnimation from "@/assets/cat Mark loading.json";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "lottie" | "fallback";
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24", 
  lg: "w-32 h-32",
  xl: "w-48 h-48"
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  className,
  variant = "lottie"
}) => {
  // Fallback spinner component
  const FallbackSpinner = () => (
    <div 
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  // If variant is fallback, show fallback spinner
  if (variant === "fallback") {
    return <FallbackSpinner />;
  }

  // Default to Lottie animation
  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <Lottie
        animationData={catMarkLoadingAnimation}
        className={cn("object-contain", sizeClasses[size])}
        loop={true}
        autoplay={true}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice'
        }}
      />
    </div>
  );
};