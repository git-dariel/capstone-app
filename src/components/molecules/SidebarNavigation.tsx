import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, HelpCircle, Settings, LogOut, BarChart3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export const SidebarNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  // Check if user is guidance counselor
  const isGuidance = user?.type === "guidance";

  const allNavigationItems = [
    { icon: <Home className="w-5 h-5" />, label: "Home", path: "/home" },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Dashboard",
      path: "/dashboard",
      guidanceOnly: true,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Reports",
      path: "/reports",
      guidanceOnly: true,
    },
    { icon: <BookOpen className="w-5 h-5" />, label: "Resources", path: "/resources" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help & Support", path: "/help-support" },
  ];

  // Filter navigation items based on user type
  const navigationItems = allNavigationItems.filter((item) => !item.guidanceOnly || isGuidance);

  const bottomItems = [
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/settings" },
    { icon: <LogOut className="w-5 h-5" />, label: "Log Out", path: "/signin" },
  ];

  const handleNavigation = async (path: string, label: string) => {
    if (label === "Log Out") {
      try {
        await signOut();
        // signOut already handles navigation to signin
      } catch (error) {
        console.error("Logout failed:", error);
        // Fallback navigation if logout fails
        navigate("/signin");
      }
    } else {
      navigate(path);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.path}
              onClick={() => handleNavigation(item.path, item.label)}
            />
          ))}
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.path}
              onClick={() => handleNavigation(item.path, item.label)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
