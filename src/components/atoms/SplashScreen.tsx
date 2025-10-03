import React, { useState, useEffect } from "react";
import { FullScreenLoading } from "@/components/atoms";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 2000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Small delay to let any exit animation complete
      setTimeout(onComplete, 100);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-8">
        <FullScreenLoading 
          isLoading={true} 
          message="Welcome to Mental Health Assessment Platform"
          size="xl"
        />
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary-700">Loading your experience...</h1>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};