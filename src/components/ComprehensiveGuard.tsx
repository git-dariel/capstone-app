import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks";
import { ConsentService, InventoryService } from "@/services";

interface ComprehensiveGuardProps {
  children: React.ReactNode;
}

export const ComprehensiveGuard: React.FC<ComprehensiveGuardProps> = ({ children }) => {
  const { student, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [hasInventory, setHasInventory] = useState(false);

  useEffect(() => {
    const checkCompletionStatus = async () => {
      if (!isAuthenticated() || !student?.id) {
        setLoading(false);
        return;
      }

      try {
        // Check both consent and inventory completion in parallel
        const [consentExists, inventoryExists] = await Promise.all([
          ConsentService.hasConsent(student.id),
          InventoryService.hasInventory(student.id),
        ]);

        setHasConsent(consentExists);
        setHasInventory(inventoryExists);
      } catch (error) {
        console.error("Error checking completion status:", error);
        // If there's an error checking, allow access (fail open)
        setHasConsent(true);
        setHasInventory(true);
      } finally {
        setLoading(false);
      }
    };

    checkCompletionStatus();
  }, [student, isAuthenticated]);

  // Show loading spinner while checking status
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

  // If user doesn't have student data, skip completion checks
  if (!student?.id) {
    return <>{children}</>;
  }

  // If user is a student and hasn't completed consent, redirect to consent page
  if (!hasConsent) {
    return <Navigate to="/consent" replace />;
  }

  // If user has completed consent but not inventory, redirect to inventory page
  if (!hasInventory) {
    return <Navigate to="/inventory" replace />;
  }

  // User has completed both consent and inventory, render children
  return <>{children}</>;
};
