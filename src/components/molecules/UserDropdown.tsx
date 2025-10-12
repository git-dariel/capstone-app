import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/atoms";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks";
import { UserService } from "@/services";
import { ConfirmationModal } from "./ConfirmationModal";
import { cn } from "@/lib/utils";

interface UserDropdownProps {
  className?: string;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ className }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(user?.avatar);

  // Fetch fresh user data to get the latest avatar
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user?.id) {
        try {
          const freshUser = await UserService.getUserById(user.id);
          setUserAvatar(freshUser.avatar);
        } catch (error) {
          console.error("Error fetching user avatar:", error);
          // Fallback to auth user avatar
          setUserAvatar(user.avatar);
        }
      }
    };

    fetchUserAvatar();
  }, [user?.id, user?.avatar]);

  // Get the first letter of user's firstName for avatar
  const avatarLetter = user?.person?.firstName?.charAt(0).toUpperCase() || "U";
  const userName =
    user?.person?.firstName && user?.person?.lastName
      ? `${user.person.firstName} ${user.person.lastName}`
      : "User";

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center space-x-2 h-auto p-1 hover:bg-gray-100 rounded-lg transition-colors",
              className
            )}
          >
            <Avatar src={userAvatar} fallback={avatarLetter} className="h-8 w-8 md:h-10 md:w-10" />
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900 truncate max-w-32">{userName}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.type || "user"}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center space-x-2 px-2 py-1.5">
            <Avatar src={userAvatar} fallback={avatarLetter} className="h-8 w-8" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{userName}</div>
              <div className="text-xs text-gray-500 truncate">
                {user?.person?.email || "No email"}
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogoutClick}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
