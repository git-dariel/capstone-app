import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components";
import { MainContent } from "@/components/organisms";
import { useAuth } from "@/hooks";
import { ConsentService } from "@/services";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, student } = useAuth();

  // Check consent status when component mounts
  useEffect(() => {
    const checkConsent = async () => {
      // Only check for student users
      if (user?.type === "student" && student?.id) {
        try {
          const hasConsent = await ConsentService.hasConsent(student.id);
          if (!hasConsent) {
            console.log("Student needs to complete consent, redirecting...");
            navigate("/consent", { replace: true });
          }
        } catch (error) {
          console.error("Error checking consent:", error);
          // Continue to home page if consent check fails
        }
      }
    };

    checkConsent();
  }, [user, student, navigate]);

  return (
    <MainLayout>
      <MainContent />
    </MainLayout>
  );
};
