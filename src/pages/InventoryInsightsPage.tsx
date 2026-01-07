import React from "react";
import { MainLayout } from "@/components/layout";
import { SimplifiedInventoryInsightsContent } from "@/components/organisms";

export const InventoryInsightsPage: React.FC = () => {
  return (
    <MainLayout>
      <SimplifiedInventoryInsightsContent />
    </MainLayout>
  );
};
