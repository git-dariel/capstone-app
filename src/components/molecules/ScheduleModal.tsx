import React, { useState, useEffect } from "react";
import { Modal, DateTimePicker } from "@/components/atoms";
import type { Schedule } from "@/services";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleData: Partial<Schedule>) => Promise<void>;
  schedule?: Schedule | null;
  loading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringType: "none" | "daily" | "weekly" | "monthly";
  maxSlots: number;
  status: "available" | "booked" | "unavailable" | "cancelled";
  location: string;
  notes: string;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  isRecurring: false,
  recurringType: "none",
  maxSlots: 1,
  status: "available",
  location: "",
  notes: "",
};

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  schedule,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or schedule changes
  useEffect(() => {
    if (isOpen) {
      if (schedule) {
        setFormData({
          title: schedule.title || "",
          description: schedule.description || "",
          startTime: schedule.startTime
            ? new Date(schedule.startTime).toISOString().slice(0, 16)
            : "",
          endTime: schedule.endTime ? new Date(schedule.endTime).toISOString().slice(0, 16) : "",
          isRecurring: schedule.isRecurring || false,
          recurringType: schedule.recurringType || "none",
          maxSlots: schedule.maxSlots || 1,
          status: schedule.status || "available",
          location: schedule.location || "",
          notes: schedule.notes || "",
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, schedule]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Schedule title is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (start >= end) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (formData.maxSlots < 1) {
      newErrors.maxSlots = "Max slots must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const scheduleData: Partial<Schedule> = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      await onSave(scheduleData);
      onClose();
    } catch (error) {
      console.error("Failed to save schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const title = schedule ? "Edit Schedule" : "Create New Schedule";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            placeholder="Enter schedule title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            placeholder="Enter schedule description"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <DateTimePicker
              id="startTime"
              label="Start Time"
              value={formData.startTime}
              onChange={(value) => handleInputChange("startTime", value)}
              required
              minDate={new Date().toISOString().slice(0, 16)}
              error={errors.startTime}
              placeholder="Select start date and time"
              restrictTimeRange={true}
              minTime="08:00"
              maxTime="20:00"
            />
          </div>

          <div>
            <DateTimePicker
              id="endTime"
              label="End Time"
              value={formData.endTime}
              onChange={(value) => handleInputChange("endTime", value)}
              required
              minDate={formData.startTime || new Date().toISOString().slice(0, 16)}
              error={errors.endTime}
              placeholder="Select end date and time"
              restrictTimeRange={true}
              minTime="08:00"
              maxTime="20:00"
            />
          </div>
        </div>

        {/* Recurring Options */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange("isRecurring", e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
              Recurring Schedule
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recurring Type</label>
              <select
                value={formData.recurringType}
                onChange={(e) =>
                  handleInputChange("recurringType", e.target.value as FormData["recurringType"])
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Slots *</label>
            <input
              type="number"
              min="1"
              value={formData.maxSlots}
              onChange={(e) => handleInputChange("maxSlots", parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            {errors.maxSlots && <p className="mt-1 text-sm text-red-600">{errors.maxSlots}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value as FormData["status"])}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="booked">Booked</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            placeholder="Enter location (e.g., Room 101, Online)"
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        </div>

        {/* Counselor is inferred from the logged-in user; no manual selection needed */}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            placeholder="Additional notes or instructions"
          />
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {schedule ? "Updating..." : "Creating..."}
              </span>
            ) : schedule ? (
              "Update Schedule"
            ) : (
              "Create Schedule"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
