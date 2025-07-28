import React from "react";
import { MainLayout } from "@/components";
import { StudentsContent } from "@/components/organisms";

export const StudentsPage: React.FC = () => {
  return (
    <MainLayout>
      <StudentsContent />
    </MainLayout>
  );
};
