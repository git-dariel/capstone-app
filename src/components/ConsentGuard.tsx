import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks";
import { ConsentService } from "@/services";

interface ConsentGuardProps {
  children: React.ReactNode;
}

export const ConsentGuard: React.FC<ConsentGuardProps> = ({ children }) => {
  const { student, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      if (!isAuthenticated() || !student?.id) {
        setLoading(false);
        return;
      }

      try {
        const consentExists = await ConsentService.hasConsent(student.id);
        setHasConsent(consentExists);
      } catch (error) {
        console.error("Error checking consent:", error);
        // If there's an error checking consent, allow access (fail open)
        setHasConsent(true);
      } finally {
        setLoading(false);
      }
    };

    checkConsent();
  }, [student, isAuthenticated]);

  // Show loading spinner while checking consent
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  // If user is not authenticated, let ProtectedRoute handle it
  if (!isAuthenticated()) {
    return <>{children}</>;
  }

  // If user doesn't have student data, skip consent check
  if (!student?.id) {
    return <>{children}</>;
  }

  // If user is a student and hasn't completed consent, redirect to consent page
  if (!hasConsent) {
    return <Navigate to="/consent" replace />;
  }

  // User has completed consent, render children
  return <>{children}</>;
};
