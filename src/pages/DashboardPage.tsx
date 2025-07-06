import React from "react";
import { MainLayout } from "@/components";
import { DashboardContent } from "@/components/organisms";

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <DashboardContent />
    </MainLayout>
  );
};
