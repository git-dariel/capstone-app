import React from "react";
import { Modal } from "@/components/atoms";
import { Button } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="p-4 sm:p-6">
        {/* Icon and Title */}
        <div className="flex items-center space-x-3 mb-4">
          <div
            className={`p-2 sm:p-3 rounded-full ${
              isDestructive ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
            }`}
          >
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{message}</p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:w-auto order-1 sm:order-2 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-primary-700 hover:bg-primary-800 text-white"
            }`}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
