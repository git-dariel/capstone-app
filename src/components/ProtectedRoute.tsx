import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, initialized, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being initialized
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  // Only redirect after auth state is fully initialized
  if (!isAuthenticated()) {
    // Redirect to signin with the current location to return after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
