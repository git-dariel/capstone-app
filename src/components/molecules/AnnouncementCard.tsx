import { cn } from "@/lib/utils";
import React from "react";
import { Avatar } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Edit, FileText, Download } from "lucide-react";

interface AnnouncementCardProps {
  title: string;
  description: string;
  date: string;
  category: string;
  categoryColor?: "blue" | "green" | "purple" | "orange";
  className?: string;
  onClick?: () => void;
  onEdit?: () => void;
  showEditOption?: boolean;
  authorName?: string;
  authorInitials?: string;
  attachement?: string;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  title,
  description,
  date,
  category,
  categoryColor = "blue",
  className = "",
  onClick,
  onEdit,
  showEditOption = false,
  authorName = "Guidance Counselor",
  authorInitials = "GC",
  attachement,
}) => {
  const categoryColors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800",
  };

  // Helper function to check if attachment is an image
  const isImageFile = (filename: string): boolean => {
    if (!filename) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
    const lowerFilename = filename.toLowerCase();
    return (
      imageExtensions.some((ext) => lowerFilename.endsWith(ext)) ||
      lowerFilename.startsWith("data:image/") ||
      lowerFilename.includes("image")
    );
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleCardClick = () => {
    onClick?.();
  };

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:border-gray-300",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              fallback={authorInitials}
              className="h-10 w-10 bg-primary-100 text-primary-700 font-semibold"
            />
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{authorName}</h4>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
          </div>

          {/* Edit Button for Guidance Users */}
          {showEditOption && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="text-gray-400 hover:text-primary-600 hover:bg-primary-50 p-2 h-8 w-8 rounded-full transition-colors"
              title="Edit announcement"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4">
        {/* Category Badge */}
        <div className="mb-3">
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
              categoryColors[categoryColor]
            )}
          >
            {category}
          </span>
        </div>

        {/* Title and Description */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </div>

        {/* Attachment/Image Display */}
        {attachement && (
          <div className="mt-4">
            {isImageFile(attachement) ? (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={attachement}
                  alt="Announcement attachment"
                  className="w-full h-auto max-h-80 object-cover"
                  onError={(e) => {
                    // Fallback to generic attachment display if image fails to load
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="hidden bg-gray-100 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Attachment</p>
                      <p className="text-xs text-gray-500">Click to view full size</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center space-x-3 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Attachment</p>
                  <p className="text-xs text-gray-500">Click to download or view</p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center space-x-1">
            <span>💬</span>
            <span>Click to view details</span>
          </span>
          {showEditOption && <span className="text-primary-600 font-medium">✏️ Editable</span>}
        </div>
      </div>
    </div>
  );
};
