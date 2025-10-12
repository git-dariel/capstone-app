import React, { useState } from "react";

interface AvatarProps {
  src?: string;
  fallback: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, fallback, className = "" }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden border-2 border-gray-200 ${className}`}>
      {src && !imageError ? (
        <img src={src} alt="Avatar" className="w-full h-full rounded-full object-cover" onError={handleImageError} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-primary-700 font-bold text-inherit">{fallback}</span>
        </div>
      )}
    </div>
  );
};
