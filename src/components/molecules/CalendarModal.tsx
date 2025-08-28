import React, { useState, useEffect } from "react";
import { Modal, FormField, FormSelect, DateTimePicker } from "@/components/atoms";
import { Button } from "@/components/ui";
import { useAuth, useStudents } from "@/hooks";

import type { CreateAppointmentRequest, CreateScheduleRequest } from "@/services";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onCreateAppointment?: (data: CreateAppointmentRequest) => Promise<void>;
  onCreateSchedule?: (data: CreateScheduleRequest) => Promise<void>;
  loading?: boolean;
  mode: "appointment" | "schedule";
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
}

interface ScheduleFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringType: "none" | "daily" | "weekly" | "monthly";
  maxSlots: number;
  location: string;
  notes: string;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onCreateAppointment,
  onCreateSchedule,
  loading = false,
  mode,
}) => {
  const { user, student } = useAuth();
  const { students, fetchStudents } = useStudents();
  const isGuidanceUser = user?.type === "guidance";

  const [appointmentData, setAppointmentData] = useState<AppointmentFormData>({
    studentId: student?.id || "",
    counselorId: isGuidanceUser ? user?.id || "" : "",
    scheduleId: "",
    title: "",
    description: "",
    appointmentType: "consultation",
    requestedDate: "",
    priority: "normal",
    location: "",
    duration: 60,
  });

  const [scheduleData, setScheduleData] = useState<ScheduleFormData>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    isRecurring: false,
    recurringType: "none",
    maxSlots: 1,
    location: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when selectedDate changes
  useEffect(() => {
    if (selectedDate && isOpen) {
      const dateTimeString = formatDateForInput(selectedDate, "09:00");
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(10, 0, 0, 0);
      const endDateTimeString = formatDateForInput(endDateTime);

      if (mode === "appointment") {
        setAppointmentData((prev) => ({
          ...prev,
          requestedDate: dateTimeString,
        }));
      } else {
        setScheduleData((prev) => ({
          ...prev,
          startTime: dateTimeString,
          endTime: endDateTimeString,
        }));
      }
    }
  }, [selectedDate, isOpen, mode]);

  // Fetch students for guidance users
  useEffect(() => {
    if (isOpen && isGuidanceUser && mode === "appointment") {
      fetchStudents({ limit: 100 }).catch(console.error);
    }
  }, [isOpen, isGuidanceUser, mode, fetchStudents]);

  const formatDateForInput = (date: Date, time?: string): string => {
    // Convert to Philippines timezone first
    const philippinesDate = new Date(date.getTime() + 8 * 60 * 60 * 1000); // UTC+8

    const year = philippinesDate.getFullYear();
    const month = String(philippinesDate.getMonth() + 1).padStart(2, "0");
    const day = String(philippinesDate.getDate()).padStart(2, "0");

    if (time) {
      return `${year}-${month}-${day}T${time}`;
    }

    const hours = String(philippinesDate.getHours()).padStart(2, "0");
    const minutes = String(philippinesDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleAppointmentChange = (field: keyof AppointmentFormData, value: string | number) => {
    setAppointmentData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleScheduleChange = (
    field: keyof ScheduleFormData,
    value: string | number | boolean
  ) => {
    setScheduleData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateAppointmentForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!appointmentData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!appointmentData.requestedDate) {
      newErrors.requestedDate = "Date and time is required";
    }

    if (isGuidanceUser && !appointmentData.studentId) {
      newErrors.studentId = "Student selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateScheduleForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!scheduleData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!scheduleData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!scheduleData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (scheduleData.startTime && scheduleData.endTime) {
      const start = new Date(scheduleData.startTime);
      const end = new Date(scheduleData.endTime);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (scheduleData.maxSlots < 1) {
      newErrors.maxSlots = "Maximum slots must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "appointment") {
      if (!validateAppointmentForm() || !onCreateAppointment) return;

      try {
        const submitData: CreateAppointmentRequest = {
          ...appointmentData,
          requestedDate: new Date(appointmentData.requestedDate).toISOString(),
        };
        await onCreateAppointment(submitData);
        onClose();
      } catch (error) {
        console.error("Error creating appointment:", error);
      }
    } else {
      if (!validateScheduleForm() || !onCreateSchedule) return;

      try {
        const submitData: CreateScheduleRequest = {
          ...scheduleData,
          startTime: new Date(scheduleData.startTime).toISOString(),
          endTime: new Date(scheduleData.endTime).toISOString(),
        };
        await onCreateSchedule(submitData);
        onClose();
      } catch (error) {
        console.error("Error creating schedule:", error);
      }
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

  const recurringTypeOptions = [
    { value: "none", label: "One Time" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const getModalTitle = () => {
    const dateStr = selectedDate?.toLocaleDateString();
    return mode === "appointment"
      ? `Create Appointment - ${dateStr}`
      : `Create Schedule - ${dateStr}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === "appointment" ? (
          <>
            {/* Appointment Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormField
                  id="title"
                  label="Appointment Title"
                  type="text"
                  value={appointmentData.title}
                  onChange={(e) => handleAppointmentChange("title", e.target.value)}
                  placeholder="e.g., Academic Consultation"
                  disabled={loading}
                  required
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <FormSelect
                id="appointmentType"
                label="Appointment Type"
                value={appointmentData.appointmentType}
                onChange={(value) => handleAppointmentChange("appointmentType", value)}
                options={appointmentTypeOptions}
                disabled={loading}
                required
              />

              <FormSelect
                id="priority"
                label="Priority"
                value={appointmentData.priority}
                onChange={(value) => handleAppointmentChange("priority", value)}
                options={priorityOptions}
                disabled={loading}
              />

              <div>
                <FormField
                  id="duration"
                  label="Duration (minutes)"
                  type="number"
                  value={appointmentData.duration.toString()}
                  onChange={(e) =>
                    handleAppointmentChange("duration", parseInt(e.target.value) || 60)
                  }
                  disabled={loading}
                />
              </div>
            </div>

            {/* Student Selection (only for guidance users) */}
            {isGuidanceUser && (
              <div>
                <FormSelect
                  id="studentId"
                  label="Student"
                  value={appointmentData.studentId}
                  onChange={(value) => handleAppointmentChange("studentId", value)}
                  options={(students || []).map((s) => ({
                    value: s.id,
                    label: `${s.person?.firstName ?? "Unknown"} ${s.person?.lastName ?? ""} (${
                      s.studentNumber
                    })`,
                  }))}
                  disabled={loading}
                  required
                />
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                )}
              </div>
            )}

            <div>
              <DateTimePicker
                id="requestedDate"
                label="Date & Time"
                value={appointmentData.requestedDate}
                onChange={(value) => handleAppointmentChange("requestedDate", value)}
                disabled={loading}
                required
                minDate={new Date().toISOString().slice(0, 16)}
                error={errors.requestedDate}
                placeholder="Select appointment date and time"
              />
            </div>

            <div>
              <FormField
                id="location"
                label="Location"
                type="text"
                value={appointmentData.location}
                onChange={(e) => handleAppointmentChange("location", e.target.value)}
                placeholder="Meeting location (optional)"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={appointmentData.description}
                onChange={(e) => handleAppointmentChange("description", e.target.value)}
                placeholder="Describe the purpose of your appointment..."
                disabled={loading}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </>
        ) : (
          <>
            {/* Schedule Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormField
                  id="title"
                  label="Schedule Title"
                  type="text"
                  value={scheduleData.title}
                  onChange={(e) => handleScheduleChange("title", e.target.value)}
                  placeholder="e.g., Morning Consultations"
                  disabled={loading}
                  required
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <FormField
                  id="maxSlots"
                  label="Maximum Slots"
                  type="number"
                  value={scheduleData.maxSlots.toString()}
                  onChange={(e) => handleScheduleChange("maxSlots", parseInt(e.target.value) || 1)}
                  disabled={loading}
                  required
                />
                {errors.maxSlots && <p className="mt-1 text-sm text-red-600">{errors.maxSlots}</p>}
              </div>

              <div>
                <DateTimePicker
                  id="startTime"
                  label="Start Time"
                  value={scheduleData.startTime}
                  onChange={(value) => handleScheduleChange("startTime", value)}
                  disabled={loading}
                  required
                  minDate={new Date().toISOString().slice(0, 16)}
                  error={errors.startTime}
                  placeholder="Select start date and time"
                />
              </div>

              <div>
                <DateTimePicker
                  id="endTime"
                  label="End Time"
                  value={scheduleData.endTime}
                  onChange={(value) => handleScheduleChange("endTime", value)}
                  disabled={loading}
                  required
                  minDate={scheduleData.startTime || new Date().toISOString().slice(0, 16)}
                  error={errors.endTime}
                  placeholder="Select end date and time"
                />
              </div>
            </div>

            <div>
              <FormField
                id="location"
                label="Location"
                type="text"
                value={scheduleData.location}
                onChange={(e) => handleScheduleChange("location", e.target.value)}
                placeholder="Meeting location (optional)"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={scheduleData.isRecurring}
                  onChange={(e) => handleScheduleChange("isRecurring", e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                  Recurring schedule
                </label>
              </div>

              {scheduleData.isRecurring && (
                <FormSelect
                  id="recurringType"
                  label="Recurring Type"
                  value={scheduleData.recurringType}
                  onChange={(value) => handleScheduleChange("recurringType", value)}
                  options={recurringTypeOptions}
                  disabled={loading}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={scheduleData.description}
                onChange={(e) => handleScheduleChange("description", e.target.value)}
                placeholder="Describe this schedule..."
                disabled={loading}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={scheduleData.notes}
                onChange={(e) => handleScheduleChange("notes", e.target.value)}
                placeholder="Additional notes..."
                disabled={loading}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary-700 hover:bg-primary-800 text-white"
          >
            {loading
              ? "Creating..."
              : mode === "appointment"
              ? "Create Appointment"
              : "Create Schedule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
