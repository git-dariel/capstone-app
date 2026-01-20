import React from "react";
import { MainLayout } from "@/components";
import { AuditLogsContent } from "@/components/organisms";

export const AuditLogsPage: React.FC = () => {
  return (
    <MainLayout>
      <AuditLogsContent />
    </MainLayout>
  );
};
