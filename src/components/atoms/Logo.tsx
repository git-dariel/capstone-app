import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center">
        <div className="w-6 h-6 bg-white rounded-full"></div>
      </div>
    </div>
  );
}; 