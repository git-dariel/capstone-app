import React from "react";
import { MainLayout } from "@/components";
import { AccountsContent } from "@/components/organisms";

export const AccountsPage: React.FC = () => {
  return (
    <MainLayout>
      <AccountsContent />
    </MainLayout>
  );
};
