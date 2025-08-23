import React from "react";
import { MainLayout } from "@/components/layout";
import { MessagesContent } from "@/components/organisms";

export const MessagesPage: React.FC = () => {
  return (
    <MainLayout>
      <MessagesContent />
    </MainLayout>
  );
};
