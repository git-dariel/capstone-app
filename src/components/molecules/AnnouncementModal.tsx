import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/atoms";
import { FormField, FormSelect } from "@/components/atoms";
import { Avatar } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Trash2, FileText, Download, X } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import { useAuth } from "@/hooks";
import type {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  Announcement,
} from "@/services";

interface AnnouncementFormData {
  title: string;
  description: string;
  status: "academic" | "career" | "wellness";
  attachement?: File | null;
}

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAnnouncementRequest) => void;
  onUpdate?: (id: string, data: UpdateAnnouncementRequest) => void;
  onDelete?: (id: string) => void;
  announcement?: Announcement | null; // For view/edit mode
  loading?: boolean;
  error?: string | null;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  announcement,
  loading = false,
  error,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    description: "",
    status: "academic",
    attachement: null,
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isViewMode = !!announcement;
  const isCreateMode = !announcement;

  // Check if update/delete functionality is available (user is guidance counselor)
  const canEdit = !!onUpdate && !!onDelete;
  const isReadOnly = isViewMode && !canEdit;

  // Check if user is a student
  const isStudent = user?.type === "student";

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

  // Populate form data when announcement is provided
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        description: announcement.description,
        status: announcement.status,
        attachement: announcement.attachement ? new File([], announcement.attachement) : null,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "academic",
        attachement: null,
      });
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isViewMode && announcement) {
      // Update existing announcement
      const updateData: UpdateAnnouncementRequest = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        attachement: formData.attachement ? formData.attachement.name : undefined,
      };
      onUpdate?.(announcement.id, updateData);
    } else {
      // Create new announcement
      const createData: CreateAnnouncementRequest = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        attachement: formData.attachement ? formData.attachement.name : undefined,
      };
      onSubmit(createData);
    }
  };

  const handleChange = (name: keyof AnnouncementFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, attachement: file }));
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (announcement && onDelete) {
      onDelete(announcement.id);
      setShowConfirmDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      title: "",
      description: "",
      status: "academic",
      attachement: null,
    });
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Close confirmation modal if open
    setShowConfirmDelete(false);
    onClose();
  };

  const isFormValid = formData.title.trim() && formData.description.trim();

  const statusOptions = [
    { value: "academic", label: "Academic" },
    { value: "career", label: "Career" },
    { value: "wellness", label: "Wellness" },
  ];

  const getModalTitle = () => {
    if (isCreateMode) return "Create New Announcement";
    if (isReadOnly) return "View Announcement";
    return "Edit Announcement";
  };

  const getCategoryColor = (status: string) => {
    const colors = {
      academic: "bg-blue-100 text-blue-800",
      career: "bg-green-100 text-green-800",
      wellness: "bg-purple-100 text-purple-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render Facebook-style post modal for students
  if (isStudent && isViewMode && announcement) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div className="fixed inset-0 backdrop-blur-sm transition-all" onClick={onClose} />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Custom Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Post Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 rounded-full p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Facebook-style Post Content */}
            <div className="p-0">
              {/* Post Header */}
              <div className="p-3 sm:p-4 pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar
                    fallback="GC"
                    className="h-10 w-10 sm:h-12 sm:w-12 bg-primary-100 text-primary-700 font-semibold"
                  />
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                      Guidance Counselor
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-3 sm:px-4 pb-4">
                {/* Category Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                      announcement.status
                    )}`}
                  >
                    {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                  </span>
                </div>

                {/* Title and Description */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {announcement.title}
                  </h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {announcement.description}
                  </div>
                </div>

                {/* Attachment Display */}
                {announcement.attachement && (
                  <div className="mt-6">
                    {isImageFile(announcement.attachement) ? (
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={announcement.attachement}
                          alt="Announcement attachment"
                          className="w-full h-auto max-h-96 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <div className="hidden bg-gray-100 p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-base font-medium text-gray-900">Attachment</p>
                              <p className="text-sm text-gray-500">Click to view full size</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-medium text-gray-900">Attachment</p>
                          <p className="text-sm text-gray-500">Click to download or view</p>
                        </div>
                        <Download className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Post Footer - Facebook-style */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center space-x-2">
                    <span>📌</span>
                    <span>Official Announcement</span>
                  </span>
                  <span className="text-xs">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  onClick={onClose}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default form modal for guidance counselors and non-student users

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          <FormField
            id="title"
            label="Announcement Title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Enter announcement title"
            required
            disabled={loading || isReadOnly}
          />

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter announcement description"
              required
              disabled={loading || isReadOnly}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            />
          </div>

          <FormSelect
            id="status"
            label="Category"
            value={formData.status}
            onChange={(value) => handleChange("status", value)}
            options={statusOptions}
            disabled={loading || isReadOnly}
          />

          <div className="space-y-2">
            <label htmlFor="attachement" className="block text-sm font-medium text-gray-700">
              Attachment (Optional)
            </label>
            <input
              ref={fileInputRef}
              id="attachement"
              type="file"
              onChange={handleFileChange}
              disabled={loading || isReadOnly}
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {formData.attachement && (
              <p className="text-xs sm:text-sm text-gray-500">
                Selected: {formData.attachement.name}
              </p>
            )}
          </div>

          {/* Mobile-responsive button layout */}
          <div className="flex flex-col sm:flex-row sm:justify-between pt-4 border-t border-gray-200 gap-3 sm:gap-20">
            {/* Right side - Action buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 order-1 sm:order-2">
              {canEdit && (
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="bg-primary-700 hover:bg-primary-800 text-white w-full sm:w-auto"
                >
                  <span className="text-sm sm:text-base">
                    {loading
                      ? isViewMode
                        ? "Updating..."
                        : "Creating..."
                      : isViewMode
                      ? "Update Announcement"
                      : "Create Announcement"}
                  </span>
                </Button>
              )}
            </div>

            {/* Left side - Delete button (only for guidance users) */}
            <div className="order-2 sm:order-1">
              {isViewMode && onDelete && canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-600 border-red-300 hover:bg-red-50 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${announcement?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={loading}
      />
    </>
  );
};
