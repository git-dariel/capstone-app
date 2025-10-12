import { Avatar, FormField, FormSelect, FullScreenLoading, Modal } from "@/components/atoms";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks";
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@/services";
import { Download, FileText, Trash2, Upload, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ConfirmationModal } from "./ConfirmationModal";

interface AnnouncementFormData {
  title: string;
  description: string;
  status: "academic" | "career" | "wellness";
  attachments: File[];
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
    attachments: [],
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
        attachments: [], // For edit mode, we'll handle existing attachments separately
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "academic",
        attachments: [],
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
        attachement: formData.attachments,
      };
      onUpdate?.(announcement.id, updateData);
    } else {
      // Create new announcement
      const createData: CreateAnnouncementRequest = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        attachement: formData.attachments,
      };
      onSubmit(createData);
    }
  };

  const handleChange = (name: keyof Omit<AnnouncementFormData, 'attachments'>, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ 
      ...prev, 
      attachments: [...prev.attachments, ...files]
    }));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
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
      attachments: [],
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
                {announcement.attachement && announcement.attachement.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {announcement.attachement.map((attachment, index) => (
                      <div key={index}>
                        {isImageFile(attachment.name) ? (
                          <div className="rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-full h-auto max-h-96 object-cover cursor-pointer"
                              onClick={() => window.open(attachment.url, '_blank')}
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
                                  <p className="text-base font-medium text-gray-900">{attachment.name}</p>
                                  <p className="text-sm text-gray-500">Click to view full size</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-sm text-gray-500">Click to download or view</p>
                            </div>
                            <Download className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
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
      <FullScreenLoading
        isLoading={loading}
        message={isViewMode ? "Updating announcement..." : "Working on it..."}
      />
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

          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Attachments (Optional)
            </label>
            
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={loading || isReadOnly}
                accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer flex flex-col items-center justify-center py-4 ${
                  loading || isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Images, PDF, Word, Excel, PowerPoint files (max 10MB each)
                </span>
              </label>
            </div>

            {/* Existing Attachments (Edit Mode) */}
            {isViewMode && announcement?.attachement && announcement.attachement.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Current Attachments:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {announcement.attachement.map((attachment, index) => (
                    <div
                      key={`existing-${index}`}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-blue-600">Current attachment</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.url, '_blank')}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-1 h-8 w-8"
                          title="View/Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Handle remove existing attachment */}}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                            title="Remove attachment"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Files List */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">New Files to Upload:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
                  {isViewMode ? "Update Announcement" : "Create Announcement"}
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
