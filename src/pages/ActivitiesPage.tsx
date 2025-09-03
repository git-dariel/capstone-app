import React from "react";
import { MainLayout } from "@/components";
import { ActivitiesContent } from "@/components/organisms";

export const ActivitiesPage: React.FC = () => {
  return (
    <MainLayout>
      <ActivitiesContent />
    </MainLayout>
  );
};
