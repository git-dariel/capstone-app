import React from "react";
import { MainLayout } from "@/components/layout";
import { InventoryInsightsContent } from "@/components/organisms";

export const InventoryInsightsPage: React.FC = () => {
  return (
    <MainLayout>
      <InventoryInsightsContent />
    </MainLayout>
  );
};