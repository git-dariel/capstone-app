import React from "react";
import { MainLayout } from "@/components";
import { StudentDashboardContent } from "@/components/organisms";

export const StudentDashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <StudentDashboardContent />
    </MainLayout>
  );
};
