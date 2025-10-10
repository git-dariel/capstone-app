import React, { useState, useEffect, useRef } from "react";
import { Modal, FormField, FormSelect } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks/useSchedules";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks";
import type { CreateAppointmentRequest, UpdateAppointmentRequest, Appointment } from "@/services";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAppointmentRequest | UpdateAppointmentRequest) => Promise<void>;
  appointment?: Appointment | null;
  loading?: boolean;
  mode: "create" | "edit" | "view";
}

interface AppointmentFormData {
  studentId: string;
  counselorId: string;
  scheduleId: string;
  title: string;
  description: string;
  appointmentType: "consultation" | "counseling" | "follow_up" | "emergency" | "group_session";
  requestedDate: string;
  priority: "low" | "normal" | "high" | "urgent";
  location: string;
  duration: number;
  cancellationReason: string;
  completionNotes: string;
  followUpRequired: boolean;
  followUpDate: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  loading = false,
  mode,
}) => {
  const { user, student } = useAuth();
  const { availableSchedules, fetchAvailableSchedules } = useSchedules();
  const { users: studentUsers, fetchUsers } = useUsers();

  const [formData, setFormData] = useState<AppointmentFormData>({
    studentId: student?.id || "",
    counselorId: "",
    scheduleId: "",
    title: "",
    description: "",
    appointmentType: "consultation",
    requestedDate: "",
    priority: "normal",
    location: "",
    duration: 60,
    cancellationReason: "",
    completionNotes: "",
    followUpRequired: false,
    followUpDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isGuidanceUser = user?.type === "guidance";

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        studentId: appointment.studentId,
        counselorId: appointment.counselorId,
        scheduleId: appointment.scheduleId,
        title: appointment.title,
        description: appointment.description || "",
        appointmentType: appointment.appointmentType,
        requestedDate: new Date(appointment.requestedDate).toISOString().slice(0, 16),
        priority: appointment.priority,
        location: appointment.location || "",
        duration: appointment.duration,
        cancellationReason: appointment.cancellationReason || "",
        completionNotes: appointment.completionNotes || "",
        followUpRequired: appointment.followUpRequired || false,
        followUpDate: appointment.followUpDate
          ? new Date(appointment.followUpDate).toISOString().slice(0, 16)
          : "",
      });
    } else {
      // Reset for create mode
      setFormData({
        studentId: student?.id || "", // For students, this will be their ID, for guidance users it will be empty
        counselorId: isGuidanceUser ? user?.id || "" : "", // For guidance users, set their ID as counselor
        scheduleId: "",
        title: "",
        description: "",
        appointmentType: "consultation",
        requestedDate: "",
        priority: "normal",
        location: "",
        duration: 60,
        cancellationReason: "",
        completionNotes: "",
        followUpRequired: false,
        followUpDate: "",
      });
    }
    setErrors({});
  }, [appointment, student, isOpen, isGuidanceUser, user]);

  // Fetch data when modal opens (once per open). Guard against StrictMode double-invoke.
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      // Reset guard when modal closes to allow fetching on next open
      hasLoadedRef.current = false;
      return;
    }

    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    (async () => {
      try {
        await fetchAvailableSchedules();
        if (isGuidanceUser) {
          // Fetch users with type=student using the proper service
          await fetchUsers({
            type: "student",
            limit: 100,
            fields: "id,person.firstName,person.lastName,person.email",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    })();
    // Only depend on isOpen so this runs exactly once per open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleInputChange = (
    field: keyof AppointmentFormData,
    value: string | number | boolean
  ) => {
    console.log(`Changing ${field} to:`, value);
    console.log(`Previous formData.${field}:`, formData[field]);

    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      console.log(`New formData after ${field} change:`, newData);
      return newData;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (isGuidanceUser && !formData.studentId) {
      newErrors.studentId = "Please select a student";
    }

    // Schedule selection is optional - guidance can assign later

    if (!formData.requestedDate) {
      newErrors.requestedDate = "Please select a date and time";
    } else {
      // Validate time range (8 AM to 8 PM)
      const selectedDate = new Date(formData.requestedDate);
      const hours = selectedDate.getHours();
      if (hours < 8 || hours >= 20) {
        newErrors.requestedDate = "Appointments can only be scheduled between 8:00 AM and 8:00 PM";
      }
    }

    if (isEditMode && appointment?.status === "cancelled" && !formData.cancellationReason.trim()) {
      newErrors.cancellationReason = "Cancellation reason is required";
    }

    if (isEditMode && appointment?.status === "completed" && !formData.completionNotes.trim()) {
      newErrors.completionNotes = "Completion notes are required";
    }

    if (formData.followUpRequired && !formData.followUpDate) {
      newErrors.followUpDate = "Follow-up date is required when follow-up is needed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreateAppointmentRequest | UpdateAppointmentRequest = {
        ...formData,
        requestedDate: new Date(formData.requestedDate).toISOString(),
        followUpDate: formData.followUpDate
          ? new Date(formData.followUpDate).toISOString()
          : undefined,
        // Only include scheduleId if it's selected
        ...(formData.scheduleId && { scheduleId: formData.scheduleId }),
      };

      console.log("Submitting appointment data:", submitData);
      console.log("Selected student ID:", formData.studentId);
      console.log("Available student users:", studentUsers);
      console.log("Student options:", [
        { value: "", label: "Please Select a Student" },
        ...(Array.isArray(studentUsers) ? studentUsers : []).map((user) => ({
          value: user.id,
          label: `${user.person?.firstName ?? "Unknown"} ${user.person?.lastName ?? "Student"}`,
        })),
      ]);

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting appointment:", error);
    }
  };

  const appointmentTypeOptions = [
    { value: "consultation", label: "Consultation" },
    { value: "counseling", label: "Counseling" },
    { value: "follow_up", label: "Follow Up" },
    { value: "emergency", label: "Emergency" },
    { value: "group_session", label: "Group Session" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Book New Appointment";
      case "edit":
        return "Edit Appointment";
      case "view":
        return "View Appointment";
      default:
        return "Appointment";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <FormField
              id="title"
              label="Title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Academic Consultation"
              disabled={loading || isViewMode}
              required
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Type */}
          <FormSelect
            id="appointmentType"
            label="Appointment Type"
            value={formData.appointmentType}
            onChange={(value) => handleInputChange("appointmentType", value)}
            options={appointmentTypeOptions}
            disabled={loading || isViewMode}
            required
          />

          {/* Priority */}
          <FormSelect
            id="priority"
            label="Priority"
            value={formData.priority}
            onChange={(value) => handleInputChange("priority", value)}
            options={priorityOptions}
            disabled={loading || isViewMode}
          />

          {/* Duration */}
          <div>
            <FormField
              id="duration"
              label="Duration (minutes)"
              type="number"
              value={formData.duration.toString()}
              onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 60)}
              disabled={loading || isViewMode}
            />
            {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
          </div>
        </div>

        {/* Student Selection (only for guidance users) */}
        {isGuidanceUser && (
          <div>
            <FormSelect
              id="studentId"
              label="Student"
              value={formData.studentId}
              onChange={(value) => handleInputChange("studentId", value)}
              options={[
                { value: "", label: "Please Select a Student" },
                ...(Array.isArray(studentUsers) ? studentUsers : []).map((user, index) => ({
                  value: user.id, // Use user id directly since these are user records
                  label: `${user.person?.firstName ?? "Unknown"} ${
                    user.person?.lastName ?? "Student"
                  }`,
                  key: `user-${user.id}-${index}`, // Unique key for React
                })),
              ]}
              disabled={loading || isViewMode}
              required
            />
            {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}
          </div>
        )}

        {/* Schedule Selection */}
        <div>
          <FormSelect
            id="scheduleId"
            label="Available Schedule (Optional)"
            value={formData.scheduleId}
            onChange={(value) => handleInputChange("scheduleId", value)}
            options={[
              { value: "", label: "No specific schedule - counselor will assign later" },
              ...(availableSchedules || []).map((s) => ({
                value: s.id,
                label: `${s.title} - ${new Date(s.startTime).toLocaleString()} (${(
                  s.counselor?.person?.firstName ?? ""
                ).trim()} ${(s.counselor?.person?.lastName ?? "").trim()})`,
              })),
            ]}
            disabled={loading || isViewMode}
          />
          {errors.scheduleId && <p className="mt-1 text-sm text-red-600">{errors.scheduleId}</p>}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading || isViewMode}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.requestedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.requestedDate ? (
                    format(new Date(formData.requestedDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.requestedDate ? new Date(formData.requestedDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const currentTime = formData.requestedDate.slice(11, 16) || "09:00";
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      handleInputChange("requestedDate", `${year}-${month}-${day}T${currentTime}`);
                    }
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formData.requestedDate.slice(11, 16) || "09:00"}
              onChange={(e) => {
                const currentDate =
                  formData.requestedDate.slice(0, 10) || new Date().toISOString().slice(0, 10);
                handleInputChange("requestedDate", `${currentDate}T${e.target.value}`);
              }}
              min="08:00"
              max="20:00"
              step="900"
              disabled={loading || isViewMode}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
            />
            {errors.requestedDate && (
              <p className="mt-1 text-sm text-red-600">{errors.requestedDate}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <FormField
            id="location"
            label="Location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="Meeting location (optional)"
            disabled={loading || isViewMode}
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe the purpose of your appointment..."
            disabled={loading || isViewMode}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Cancellation Reason (only for cancelled appointments) */}
        {isEditMode && appointment?.status === "cancelled" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              value={formData.cancellationReason}
              onChange={(e) => handleInputChange("cancellationReason", e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              disabled={loading}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.cancellationReason && (
              <p className="mt-1 text-sm text-red-600">{errors.cancellationReason}</p>
            )}
          </div>
        )}

        {/* Completion Notes (only for completed appointments) */}
        {isEditMode && appointment?.status === "completed" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Completion Notes *
            </label>
            <textarea
              value={formData.completionNotes}
              onChange={(e) => handleInputChange("completionNotes", e.target.value)}
              placeholder="Summary of the appointment and any recommendations..."
              disabled={loading}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.completionNotes && (
              <p className="mt-1 text-sm text-red-600">{errors.completionNotes}</p>
            )}
          </div>
        )}

        {/* Follow-up Section */}
        {(isEditMode || isCreateMode) && (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={formData.followUpRequired}
                onChange={(e) => handleInputChange("followUpRequired", e.target.checked)}
                disabled={loading}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="followUpRequired" className="ml-2 block text-sm text-gray-700">
                Follow-up appointment required
              </label>
            </div>

            {formData.followUpRequired && (
              <div>
                <FormField
                  id="followUpDate"
                  label="Follow-up Date"
                  type="datetime-local"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange("followUpDate", e.target.value)}
                  disabled={loading}
                  required
                />
                {errors.followUpDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.followUpDate}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        {!isViewMode && (
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-700 hover:bg-primary-800 text-white"
            >
              {loading ? "Submitting..." : isCreateMode ? "Book Appointment" : "Update Appointment"}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};
