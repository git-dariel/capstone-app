import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  X,
  Clock,
  Users,
  HeartHandshake,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ConfirmationModal } from "./ConfirmationModal";

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
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

interface SidebarNavigationProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isOpen = true,
  onToggle,
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for mobile responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar on mobile when navigating
  const handleMobileNavigation = (path: string, label: string) => {
    if (isMobile && onToggle && label !== "Log Out") {
      onToggle(); // Close sidebar on mobile after navigation
    }
    handleNavigation(path, label);
  };

  // Check if user is guidance counselor
  const isGuidance = user?.type === "guidance";
  const isStudent = user?.type === "student";

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
    {
      icon: <Users className="w-5 h-5" />,
      label: "Accounts",
      path: "/accounts",
      guidanceOnly: true,
    },
    {
      icon: <HeartHandshake className="w-5 h-5" />,
      label: "Aid Function",
      path: "/aid-function",
      guidanceOnly: true,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "History",
      path: "/history",
      studentOnly: true,
    },
    { icon: <BookOpen className="w-5 h-5" />, label: "Resources", path: "/resources" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help & Support", path: "/help-support" },
  ];

  // Filter navigation items based on user type
  const navigationItems = allNavigationItems.filter((item) => {
    if (item.guidanceOnly && !isGuidance) return false;
    if (item.studentOnly && !isStudent) return false;
    return true;
  });

  const bottomItems = [{ icon: <LogOut className="w-5 h-5" />, label: "Log Out", path: "/signin" }];

  const handleNavigation = async (path: string, label: string) => {
    if (label === "Log Out") {
      // Show confirmation modal instead of logging out immediately
      setShowLogoutConfirmation(true);
    } else {
      navigate(path);
    }
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      // signOut already handles navigation to signin
      setShowLogoutConfirmation(false);
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback navigation if logout fails
      navigate("/signin");
      setShowLogoutConfirmation(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col h-full transition-transform duration-300 ease-in-out z-50",
          // Desktop styles
          "md:w-64 md:relative md:transform-none",
          // Mobile styles - drawer
          "fixed left-0 top-0 w-64 md:translate-x-0",
          isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "",
          className
        )}
      >
        {/* Mobile Header with Close Button */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <nav className="flex-1 px-4 py-6">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.path}
                onClick={() => handleMobileNavigation(item.path, item.label)}
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
                onClick={() => handleMobileNavigation(item.path, item.label)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirmation}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmText="Log Out"
        cancelText="Stay Logged In"
        isDestructive={true}
        loading={isLoggingOut}
      />
    </>
  );
};

// Mobile Menu Toggle Button Component
interface MobileMenuToggleProps {
  onClick: () => void;
  className?: string;
}

export const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors",
        className
      )}
      aria-label="Toggle menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
};
