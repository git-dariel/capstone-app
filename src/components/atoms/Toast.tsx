import React, { useEffect, useState } from "react";
import { CheckCircle, X, AlertCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 shadow-green-100";
      case "error":
        return "bg-red-50 border-red-200 text-red-800 shadow-red-100";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 shadow-yellow-100";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100";
      default:
        return "bg-white border-gray-200 text-gray-800 shadow-gray-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "w-full shadow-lg rounded-lg border pointer-events-auto transition-all duration-300 transform relative",
        getToastStyles(),
        isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium break-words">{title}</p>
            {message && <p className="mt-1 text-sm opacity-90 break-words">{message}</p>}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }>;
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed inset-x-4 top-4 sm:right-4 sm:left-auto sm:max-w-sm z-[9999] pointer-events-none">
      <div className="flex flex-col space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};
