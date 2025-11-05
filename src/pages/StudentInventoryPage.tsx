import React from "react";
import { MainLayout } from "@/components";
import { StudentInventoryContent } from "@/components/organisms";

export const StudentInventoryPage: React.FC = () => {
  return (
    <MainLayout>
      <StudentInventoryContent />
    </MainLayout>
  );
};
