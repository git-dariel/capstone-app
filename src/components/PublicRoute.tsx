import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    // Redirect authenticated users to home
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
