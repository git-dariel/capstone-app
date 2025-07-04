import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, initialized, loading } = useAuth();

  // Show loading spinner while authentication state is being initialized
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Only redirect after auth state is fully initialized
  if (isAuthenticated()) {
    // Redirect authenticated users to home
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
