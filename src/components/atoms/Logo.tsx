import React from "react";
import PUPLogo from "../../assets/PUPLogo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={PUPLogo}
        alt="Polytechnic University of the Philippines"
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
};
