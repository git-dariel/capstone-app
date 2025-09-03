import React from "react";
import { MainLayout } from "@/components";
import { ConsentRecordsContent } from "@/components/organisms";

export const ConsentRecordsPage: React.FC = () => {
  return (
    <MainLayout>
      <ConsentRecordsContent />
    </MainLayout>
  );
};
