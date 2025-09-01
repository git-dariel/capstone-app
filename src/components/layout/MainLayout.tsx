import React, { useState } from "react";
import { TopNavigation, SidebarNavigation, MobileMenuToggle } from "@/components/molecules";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarMinimize = () => {
    setSidebarMinimized(!sidebarMinimized);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation with Mobile Menu Toggle */}
      <div className="flex items-center">
        <MobileMenuToggle onClick={toggleSidebar} className="ml-4 md:hidden" />
        <div className="flex-1">
          <TopNavigation />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <SidebarNavigation
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          isMinimized={sidebarMinimized}
          onToggleMinimize={toggleSidebarMinimize}
        />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};
