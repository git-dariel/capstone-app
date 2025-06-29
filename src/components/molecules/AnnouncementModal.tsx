import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/atoms";
import { FormField, FormSelect } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Trash2 } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
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

  const handleCancel = () => {
    if (announcement) {
      // Reset form data to original announcement data
      setFormData({
        title: announcement.title,
        description: announcement.description,
        status: announcement.status,
        attachement: announcement.attachement ? new File([], announcement.attachement) : null,
      });
    }
    handleClose();
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            {formData.attachement && (
              <p className="text-sm text-gray-500">Selected: {formData.attachement.name}</p>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            {/* Left side - Delete button (only for guidance users) */}
            <div>
              {isViewMode && onDelete && canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={isViewMode ? handleCancel : handleClose}
                disabled={loading}
              >
                {isReadOnly ? "Close" : "Cancel"}
              </Button>
              {canEdit && (
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  {loading
                    ? isViewMode
                      ? "Updating..."
                      : "Creating..."
                    : isViewMode
                    ? "Update Announcement"
                    : "Create Announcement"}
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
