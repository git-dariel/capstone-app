import { useAuth, useNotifications } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  FileText,
  HelpCircle,
  Home,
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
  Bell,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  isMinimized?: boolean;
  badgeCount?: number;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  isMinimized = false,
  badgeCount = 0,
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
      <div className="relative">
        <span className="w-5 h-5 flex-shrink-0">{icon}</span>
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </div>
      {!isMinimized && (
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="truncate">{label}</span>
          {badgeCount > 0 && (
            <span className="ml-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </div>
      )}
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
  const { user } = useAuth();
  const { unreadCount, requestNotificationPermission } = useNotifications({ autoFetch: true });
  // Ensure permission to show native notifications and establish socket sync early
  useEffect(() => {
    requestNotificationPermission?.();
  }, [requestNotificationPermission]);
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
  const handleMobileNavigation = (path: string) => {
    if (isMobile && onToggle) {
      onToggle(); // Close sidebar on mobile after navigation
    }
    handleNavigation(path);
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
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "My Dashboard",
      path: "/student-dashboard",
      studentOnly: true,
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
      icon: <Bell className="w-5 h-5" />,
      label: "Notifications",
      path: "/notifications",
      hasNotifications: true,
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
      icon: <FileText className="w-5 h-5" />,
      label: "Consultation Records",
      path: "/consultant-records",
      guidanceOnly: true,
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Consent Records",
      path: "/consent-records",
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
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help & Support", path: "/help-support" },
  ];

  // Filter navigation items based on user type
  const navigationItems = allNavigationItems.filter((item) => {
    if (item.guidanceOnly && !isGuidance) return false;
    if (item.studentOnly && !isStudent) return false;
    return true;
  });

  const bottomItems: any[] = [];

  const handleNavigation = (path: string) => {
    navigate(path);
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
                onClick={() => handleMobileNavigation(item.path)}
                isMinimized={!isMobile && isMinimized}
                badgeCount={item.hasNotifications ? unreadCount : undefined}
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
                onClick={() => handleMobileNavigation(item.path)}
                isMinimized={!isMobile && isMinimized}
              />
            ))}
          </div>
        </div>
      </div>
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
