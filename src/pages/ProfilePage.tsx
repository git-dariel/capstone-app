import React from "react";
import { MainLayout } from "@/components";
import { ProfileContent } from "@/components/organisms";

export const ProfilePage: React.FC = () => {
  return (
    <MainLayout>
      <ProfileContent />
    </MainLayout>
  );
};
