import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks";
import { InventoryService } from "@/services";

interface InventoryGuardProps {
  children: React.ReactNode;
}

export const InventoryGuard: React.FC<InventoryGuardProps> = ({ children }) => {
  const { student, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasInventory, setHasInventory] = useState(false);

  useEffect(() => {
    const checkInventory = async () => {
      if (!isAuthenticated() || !student?.id) {
        setLoading(false);
        return;
      }

      try {
        const inventoryExists = await InventoryService.hasInventory(student.id);
        setHasInventory(inventoryExists);
      } catch (error) {
        console.error("Error checking inventory:", error);
        // If there's an error checking inventory, allow access (fail open)
        setHasInventory(true);
      } finally {
        setLoading(false);
      }
    };

    checkInventory();
  }, [student, isAuthenticated]);

  // Show loading spinner while checking inventory
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

  // If user doesn't have student data, skip inventory check
  if (!student?.id) {
    return <>{children}</>;
  }

  // If user is a student and hasn't completed inventory, redirect to inventory page
  if (!hasInventory) {
    return <Navigate to="/inventory" replace />;
  }

  // User has completed inventory, render children
  return <>{children}</>;
};
