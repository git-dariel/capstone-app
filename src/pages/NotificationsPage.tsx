import React from "react";
import { MainLayout } from "@/components";
import { NotificationsContent } from "@/components/organisms/NotificationsContent";

export const NotificationsPage: React.FC = () => {
  return (
    <MainLayout>
      <NotificationsContent />
    </MainLayout>
  );
};
