import React from "react";
import { TopNavigation, SidebarNavigation } from "@/components/molecules";
import { HelpSupportContent } from "@/components/organisms";

export const HelpSupportPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavigation />

      <div className="flex flex-1 overflow-hidden">
        <SidebarNavigation />
        <HelpSupportContent />
      </div>
    </div>
  );
};
