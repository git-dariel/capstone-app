import React from "react";
import { MainLayout } from "@/components";
import { InventoryRecordsContent } from "@/components/organisms";

export const InventoryRecordsPage: React.FC = () => {
  return (
    <MainLayout>
      <InventoryRecordsContent />
    </MainLayout>
  );
};
