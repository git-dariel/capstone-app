import React, { useState, useEffect } from "react";
import { Modal } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Send } from "lucide-react";
import { useAuth } from "@/hooks";
import type { CreateMessageRequest } from "@/types/message";

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: CreateMessageRequest) => Promise<void>;
  recipientId?: string;
  recipientName?: string;
}

// TODO: This should be fetched dynamically from a service
// For now using the known guidance counselor ID from the API response
const GUIDANCE_COUNSELOR_ID = "685e864714bf575592f5bb34";
const GUIDANCE_COUNSELOR_NAME = "Dr. Conchita Dotado";

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  isOpen,
  onClose,
  onSend,
  recipientId,
  recipientName,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    receiverId: recipientId || "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-set recipient based on user type
  useEffect(() => {
    if (user?.type === "student" && !recipientId) {
      // Students can only message the guidance counselor
      setFormData((prev) => ({
        ...prev,
        receiverId: GUIDANCE_COUNSELOR_ID,
      }));
    } else if (recipientId) {
      // Use provided recipient ID
      setFormData((prev) => ({
        ...prev,
        receiverId: recipientId,
      }));
    }
  }, [user, recipientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim() || !formData.receiverId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSend({
        title: "Message", // Default title since it's optional but might be required by API
        content: formData.content.trim(),
        receiverId: formData.receiverId,
      });

      // Reset form and close modal
      setFormData({
        receiverId: recipientId || (user?.type === "student" ? GUIDANCE_COUNSELOR_ID : ""),
        content: "",
      });
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        receiverId: recipientId || (user?.type === "student" ? GUIDANCE_COUNSELOR_ID : ""),
        content: "",
      });
      onClose();
    }
  };

  const isFormValid = formData.content.trim() && formData.receiverId;

  const getModalTitle = () => {
    if (user?.type === "student") {
      return `Send Message to ${GUIDANCE_COUNSELOR_NAME}`;
    }
    return recipientName ? `Send Message to ${recipientName}` : "Compose Message";
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()} size="lg">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient (only show if not a student and no pre-filled recipient) */}
        {user?.type !== "student" && !recipientId && (
          <div>
            <label htmlFor="receiverId" className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <input
              type="text"
              id="receiverId"
              value={formData.receiverId}
              onChange={(e) => setFormData((prev) => ({ ...prev, receiverId: e.target.value }))}
              placeholder="Enter recipient user ID or email"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
              required
            />
          </div>
        )}

        {/* Show recipient info for students */}
        {user?.type === "student" && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="text-sm">
                <span className="font-medium text-blue-900">Sending to: </span>
                <span className="text-blue-700">{GUIDANCE_COUNSELOR_NAME}</span>
              </div>
            </div>
          </div>
        )}

        {/* Message content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Type your message here..."
            disabled={isSubmitting}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 resize-none"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
