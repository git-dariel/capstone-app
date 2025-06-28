import React from "react";
import { TopNavigation, SidebarNavigation } from "@/components/molecules";
import { ReportsContent } from "@/components/organisms";

export const ReportsPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavigation />

      <div className="flex flex-1 overflow-hidden">
        <SidebarNavigation />
        <ReportsContent />
      </div>
    </div>
  );
};
