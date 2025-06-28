import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User",
  fallback = "U",
  className = "",
}) => {
  return (
    <div className={cn("relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full", className)}>
      {src ? (
        <img src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-600">
          {fallback}
        </div>
      )}
    </div>
  );
};
