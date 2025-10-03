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
  School,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Heart,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ConfirmationModal } from "./ConfirmationModal";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  isMinimized?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  isMinimized = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center rounded-lg text-sm font-medium transition-colors group relative",
        isMinimized ? "justify-center px-3 py-3" : "space-x-3 px-3 py-2",
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
      title={isMinimized ? label : undefined}
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      {!isMinimized && <span className="truncate">{label}</span>}
      {isMinimized && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </button>
  );
};

interface SidebarNavigationProps {
  isOpen?: boolean;
  onToggle?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  className?: string;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isOpen = true,
  onToggle,
  isMinimized = false,
  onToggleMinimize,
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
    {
      icon: <Home className="w-5 h-5" />,
      label: "Annoucements",
      path: "/home",
      guidanceOnly: true,
    },
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
    {
      icon: <Heart className="w-5 h-5" />,
      label: "Activities",
      path: "/activities",
      studentOnly: true,
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Messages",
      path: "/messages",
    },
    {
      icon: <School className="w-5 h-5" />,
      label: "Student Records",
      path: "/students",
      guidanceOnly: true,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Inventory Records",
      path: "/inventory-records",
      guidanceOnly: true,
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Appointments",
      path: "/appointments",
    },
    {
      icon: <HeartHandshake className="w-5 h-5" />,
      label: "Retake Requests",
      path: "/aid-function",
      guidanceOnly: true,
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Admin Accounts",
      path: "/accounts",
      guidanceOnly: true,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "History",
      path: "/history",
      studentOnly: true,
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Consent Records",
      path: "/consent-records",
    },
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
      {/* Sidebar */}
      <div
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out z-50",
          // Desktop styles
          isMinimized ? "md:w-16" : "md:w-64",
          "md:relative md:transform-none",
          // Mobile styles - drawer (always full width on mobile)
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

        <nav className="flex-1 px-4 py-6 relative">
          {/* Desktop Minimize Toggle Button */}
          {!isMobile && onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="absolute top-2 right-2 p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
              title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
            >
              {isMinimized ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.path}
                onClick={() => handleMobileNavigation(item.path, item.label)}
                isMinimized={!isMobile && isMinimized}
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
                isMinimized={!isMobile && isMinimized}
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
