import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components";
import { MainContent } from "@/components/organisms";
import { useAuth } from "@/hooks";
import { ConsentService, InventoryService } from "@/services";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, student } = useAuth();

  // Check consent and inventory status when component mounts
  useEffect(() => {
    const checkCompletionStatus = async () => {
      // Only check for student users
      if (user?.type === "student" && student?.id) {
        try {
          // Check consent first
          const hasConsent = await ConsentService.hasConsent(student.id);
          if (!hasConsent) {
            console.log("Student needs to complete consent, redirecting...");
            navigate("/consent", { replace: true });
            return;
          }

          // If consent is complete, check inventory
          const hasInventory = await InventoryService.hasInventory(student.id);
          if (!hasInventory) {
            console.log("Student needs to complete inventory, redirecting...");
            navigate("/inventory", { replace: true });
            return;
          }

          console.log("Both consent and inventory completed, staying on home page");
        } catch (error) {
          console.error("Error checking completion status:", error);
          // Continue to home page if checks fail
        }
      }
    };

    checkCompletionStatus();
  }, [user, student, navigate]);

  return (
    <MainLayout>
      <MainContent />
    </MainLayout>
  );
};
