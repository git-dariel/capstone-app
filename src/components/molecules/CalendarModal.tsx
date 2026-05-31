import React, { useState, useEffect } from "react";
import { Modal, FormField, FormSelect } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth, useUsers } from "@/hooks";

import type {
  CreateAppointmentRequest,
  CreateScheduleRequest,
} from "@/services";

// Character limits for fields
const CHAR_LIMITS = {
  appointmentTitle: 100,
  appointmentDescription: 500,
  appointmentLocation: 100,
  scheduleTitle: 100,
  scheduleDescription: 500,
  scheduleLocation: 100,
  scheduleNotes: 1000,
};

// Validation helper functions
const validateSpecialCharacters = (value: string): boolean => {
  // Allow letters, numbers, spaces, common punctuation, and basic accented characters
  // Disallow potentially harmful characters like <, >, &, script tags, etc.
  const allowedPattern = /^[a-zA-Z0-9\s.,!?;:()\]{}'"\-–—\n\r\u00C0-\u017F]*$/;
  return allowedPattern.test(value);
};

const sanitizeInput = (value: string): string => {
  // Remove potentially harmful characters
  return value.replace(/[<>&]/g, "");
};

const getRemainingChars = (value: string, limit: number): number => {
  return limit - value.length;
};

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
  studentIds: string[]; // Array of student IDs for group sessions
  counselorId: string;
  scheduleId: string;
  title: string;
  description: string;
  appointmentType:
    | "general_information"
    | "one_or_two_session_problem_solving"
    | "stress_management"
    | "group_counseling"
    | "substance_abuse_services"
    | "career_exploration"
    | "individual_counseling"
    | "referral_for_university";
  requestedDate: string;
  priority: "low" | "normal" | "high" | "urgent";
  location: string;
  duration: number;
  maxStudents: number; // Maximum students for group sessions
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
  const { users: studentUsers, fetchUsers } = useUsers();
  const isGuidanceUser = user?.type === "guidance";

  const [appointmentData, setAppointmentData] = useState<AppointmentFormData>({
    studentId: student?.id || "",
    studentIds: [], // Initialize empty array for group sessions
    counselorId: isGuidanceUser ? user?.id || "" : "",
    scheduleId: "",
    title: "",
    description: "",
    appointmentType: "general_information",
    requestedDate: "",
    priority: "normal",
    location: "",
    duration: 60,
    maxStudents: 10, // Default max students for group sessions
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
          // Ensure counselorId is set for guidance users
          counselorId: isGuidanceUser ? user?.id || "" : prev.counselorId,
        }));
      } else {
        setScheduleData((prev) => ({
          ...prev,
          startTime: dateTimeString,
          endTime: endDateTimeString,
        }));
      }
    }
  }, [selectedDate, isOpen, mode, isGuidanceUser, user]);

  // Fetch student users for guidance users
  useEffect(() => {
    if (isOpen && isGuidanceUser && mode === "appointment") {
      // Fetch users with type=student using the proper service
      fetchUsers({
        type: "student",
        limit: 100,
        fields: "id,person.firstName,person.lastName,person.middleName",
      }).catch(console.error);
    }
  }, [isOpen, isGuidanceUser, mode, fetchUsers]);

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

  const handleAppointmentChange = (
    field: keyof AppointmentFormData,
    value: string | number,
  ) => {
    setAppointmentData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleScheduleChange = (
    field: keyof ScheduleFormData,
    value: string | number | boolean,
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
    } else if (appointmentData.title.length > CHAR_LIMITS.appointmentTitle) {
      newErrors.title = `Title must not exceed ${CHAR_LIMITS.appointmentTitle} characters`;
    } else if (!validateSpecialCharacters(appointmentData.title)) {
      newErrors.title =
        "Title contains invalid characters (< > & are not allowed)";
    }

    if (
      appointmentData.description &&
      appointmentData.description.length > CHAR_LIMITS.appointmentDescription
    ) {
      newErrors.description = `Description must not exceed ${CHAR_LIMITS.appointmentDescription} characters`;
    } else if (
      appointmentData.description &&
      !validateSpecialCharacters(appointmentData.description)
    ) {
      newErrors.description =
        "Description contains invalid characters (< > & are not allowed)";
    }

    if (
      appointmentData.location &&
      appointmentData.location.length > CHAR_LIMITS.appointmentLocation
    ) {
      newErrors.location = `Location must not exceed ${CHAR_LIMITS.appointmentLocation} characters`;
    } else if (
      appointmentData.location &&
      !validateSpecialCharacters(appointmentData.location)
    ) {
      newErrors.location =
        "Location contains invalid characters (< > & are not allowed)";
    }

    if (!appointmentData.requestedDate) {
      newErrors.requestedDate = "Date and time is required";
    }

    if (
      isGuidanceUser &&
      !appointmentData.studentId &&
      appointmentData.studentIds.length === 0
    ) {
      newErrors.studentId = "At least one student is required";
    }

    if (isGuidanceUser && !appointmentData.counselorId) {
      newErrors.counselorId = "Counselor ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateScheduleForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!scheduleData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (scheduleData.title.length > CHAR_LIMITS.scheduleTitle) {
      newErrors.title = `Title must not exceed ${CHAR_LIMITS.scheduleTitle} characters`;
    } else if (!validateSpecialCharacters(scheduleData.title)) {
      newErrors.title =
        "Title contains invalid characters (< > & are not allowed)";
    }

    if (
      scheduleData.description &&
      scheduleData.description.length > CHAR_LIMITS.scheduleDescription
    ) {
      newErrors.description = `Description must not exceed ${CHAR_LIMITS.scheduleDescription} characters`;
    } else if (
      scheduleData.description &&
      !validateSpecialCharacters(scheduleData.description)
    ) {
      newErrors.description =
        "Description contains invalid characters (< > & are not allowed)";
    }

    if (
      scheduleData.location &&
      scheduleData.location.length > CHAR_LIMITS.scheduleLocation
    ) {
      newErrors.location = `Location must not exceed ${CHAR_LIMITS.scheduleLocation} characters`;
    } else if (
      scheduleData.location &&
      !validateSpecialCharacters(scheduleData.location)
    ) {
      newErrors.location =
        "Location contains invalid characters (< > & are not allowed)";
    }

    if (
      scheduleData.notes &&
      scheduleData.notes.length > CHAR_LIMITS.scheduleNotes
    ) {
      newErrors.notes = `Notes must not exceed ${CHAR_LIMITS.scheduleNotes} characters`;
    } else if (
      scheduleData.notes &&
      !validateSpecialCharacters(scheduleData.notes)
    ) {
      newErrors.notes =
        "Notes contains invalid characters (< > & are not allowed)";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "appointment") {
      if (!validateAppointmentForm() || !onCreateAppointment) return;

      try {
        // Prepare studentIds array based on whether it's a group session
        const isGroupSession = appointmentData.studentIds.length > 0;
        const submitData: CreateAppointmentRequest = {
          ...appointmentData,
          requestedDate: new Date(appointmentData.requestedDate).toISOString(),
          // Include studentIds if it's a group session
          ...(isGroupSession && { studentIds: appointmentData.studentIds }),
          // For backward compatibility, ensure studentId is set
          studentId: isGroupSession
            ? appointmentData.studentIds[0]
            : appointmentData.studentId,
        };

        console.log("CalendarModal submitting appointment data:", submitData);
        console.log(
          "CalendarModal appointmentData before submit:",
          appointmentData,
        );

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
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Appointment Title <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (
                    {getRemainingChars(
                      appointmentData.title,
                      CHAR_LIMITS.appointmentTitle,
                    )}{" "}
                    characters remaining)
                  </span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={appointmentData.title}
                  onChange={(e) => {
                    const sanitized = sanitizeInput(e.target.value);
                    if (sanitized.length <= CHAR_LIMITS.appointmentTitle) {
                      handleAppointmentChange("title", sanitized);
                    }
                  }}
                  maxLength={CHAR_LIMITS.appointmentTitle}
                  placeholder="e.g., Academic Consultation"
                  disabled={loading}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <FormSelect
                id="appointmentType"
                label="Appointment Type"
                value={appointmentData.appointmentType}
                onChange={(value) =>
                  handleAppointmentChange("appointmentType", value)
                }
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
                    handleAppointmentChange(
                      "duration",
                      parseInt(e.target.value) || 60,
                    )
                  }
                  disabled={loading}
                />
              </div>
            </div>

            {/* Student Selection (only for guidance users) */}
            {isGuidanceUser && (
              <div className="space-y-4">
                {/* Toggle for Group Session */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isGroupSession"
                    checked={
                      appointmentData.appointmentType === "group_counseling"
                    }
                    onChange={(e) => {
                      handleAppointmentChange(
                        "appointmentType",
                        e.target.checked
                          ? "group_counseling"
                          : "general_information",
                      );
                      // Clear studentIds when switching modes
                      if (!e.target.checked) {
                        setAppointmentData((prev) => ({
                          ...prev,
                          studentIds: [],
                        }));
                      }
                    }}
                    disabled={loading}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="isGroupSession"
                    className="text-sm font-medium text-gray-700"
                  >
                    Group Session (Multiple Students)
                  </label>
                </div>

                {appointmentData.appointmentType === "group_counseling" ? (
                  /* Multi-student Selection for Group Sessions */
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Students <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        ({appointmentData.studentIds.length} of{" "}
                        {appointmentData.maxStudents} selected)
                      </span>
                    </label>

                    {/* Student multi-select */}
                    <div className="space-y-2">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        disabled={
                          loading ||
                          appointmentData.studentIds.length >=
                            appointmentData.maxStudents
                        }
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (
                            selectedId &&
                            !appointmentData.studentIds.includes(selectedId)
                          ) {
                            setAppointmentData((prev) => ({
                              ...prev,
                              studentIds: [...prev.studentIds, selectedId],
                              studentId:
                                prev.studentIds.length === 0
                                  ? selectedId
                                  : prev.studentId,
                            }));
                            e.target.value = ""; // Reset select
                          }
                        }}
                        value=""
                      >
                        <option value="">
                          {appointmentData.studentIds.length >=
                          appointmentData.maxStudents
                            ? "Maximum students reached"
                            : "Add a student..."}
                        </option>
                        {(Array.isArray(studentUsers) ? studentUsers : [])
                          .filter(
                            (user) =>
                              !appointmentData.studentIds.includes(user.id),
                          )
                          .map((user, index) => {
                            const firstName = user.person?.firstName || "";
                            const lastName = user.person?.lastName || "";
                            const fullName = `${firstName} ${lastName}`.trim();
                            const displayName = fullName || "Unknown Student";

                            return (
                              <option
                                key={`user-${user.id}-${index}`}
                                value={user.id}
                              >
                                {displayName}
                              </option>
                            );
                          })}
                      </select>

                      {/* Selected students list */}
                      {appointmentData.studentIds.length > 0 && (
                        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                          <div className="space-y-2">
                            {appointmentData.studentIds.map((studentId) => {
                              const student = (
                                Array.isArray(studentUsers) ? studentUsers : []
                              ).find((u) => u.id === studentId);
                              const firstName =
                                student?.person?.firstName || "";
                              const lastName = student?.person?.lastName || "";
                              const fullName =
                                `${firstName} ${lastName}`.trim();
                              const displayName = fullName || "Unknown Student";

                              return (
                                <div
                                  key={studentId}
                                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                                >
                                  <span className="text-sm text-gray-700">
                                    {displayName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAppointmentData((prev) => ({
                                        ...prev,
                                        studentIds: prev.studentIds.filter(
                                          (id) => id !== studentId,
                                        ),
                                        // Update primary studentId if removing the first one
                                        studentId:
                                          prev.studentIds[0] === studentId &&
                                          prev.studentIds.length > 1
                                            ? prev.studentIds[1]
                                            : prev.studentId,
                                      }));
                                    }}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    Remove
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {errors.studentId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.studentId}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Single Student Selection */
                  <div>
                    <FormSelect
                      id="studentId"
                      label="Student"
                      value={appointmentData.studentId}
                      onChange={(value) =>
                        handleAppointmentChange("studentId", value)
                      }
                      options={[
                        { value: "", label: "Please Select a Student" },
                        ...(Array.isArray(studentUsers)
                          ? studentUsers
                          : []
                        ).map((user, index) => {
                          const firstName = user.person?.firstName || "";
                          const lastName = user.person?.lastName || "";
                          const fullName = `${firstName} ${lastName}`.trim();
                          const displayName = fullName || "Unknown Student";

                          return {
                            value: user.id,
                            label: displayName,
                            key: `user-${user.id}-${index}`,
                          };
                        }),
                      ]}
                      disabled={loading}
                      required
                    />
                    {errors.studentId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.studentId}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !appointmentData.requestedDate &&
                          "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {appointmentData.requestedDate ? (
                        format(new Date(appointmentData.requestedDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        appointmentData.requestedDate
                          ? new Date(appointmentData.requestedDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const currentTime =
                            appointmentData.requestedDate.slice(11, 16) ||
                            "09:00";
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          handleAppointmentChange(
                            "requestedDate",
                            `${year}-${month}-${day}T${currentTime}`,
                          );
                        }
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={appointmentData.requestedDate.slice(11, 16) || "09:00"}
                  onChange={(e) => {
                    const currentDate =
                      appointmentData.requestedDate.slice(0, 10) ||
                      new Date().toISOString().slice(0, 10);
                    handleAppointmentChange(
                      "requestedDate",
                      `${currentDate}T${e.target.value}`,
                    );
                  }}
                  min="08:00"
                  max="20:00"
                  step="900"
                  disabled={loading}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
                />
                {errors.requestedDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.requestedDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (
                  {getRemainingChars(
                    appointmentData.location,
                    CHAR_LIMITS.appointmentLocation,
                  )}{" "}
                  characters remaining)
                </span>
              </label>
              <input
                id="location"
                type="text"
                value={appointmentData.location}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value);
                  if (sanitized.length <= CHAR_LIMITS.appointmentLocation) {
                    handleAppointmentChange("location", sanitized);
                  }
                }}
                maxLength={CHAR_LIMITS.appointmentLocation}
                placeholder="Meeting location (optional)"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (
                  {getRemainingChars(
                    appointmentData.description,
                    CHAR_LIMITS.appointmentDescription,
                  )}{" "}
                  characters remaining)
                </span>
              </label>
              <textarea
                value={appointmentData.description}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value);
                  if (sanitized.length <= CHAR_LIMITS.appointmentDescription) {
                    handleAppointmentChange("description", sanitized);
                  }
                }}
                maxLength={CHAR_LIMITS.appointmentDescription}
                placeholder="Describe the purpose of your appointment..."
                disabled={loading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Schedule Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="scheduleTitle"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Schedule Title <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (
                    {getRemainingChars(
                      scheduleData.title,
                      CHAR_LIMITS.scheduleTitle,
                    )}{" "}
                    characters remaining)
                  </span>
                </label>
                <input
                  id="scheduleTitle"
                  type="text"
                  value={scheduleData.title}
                  onChange={(e) => {
                    const sanitized = sanitizeInput(e.target.value);
                    if (sanitized.length <= CHAR_LIMITS.scheduleTitle) {
                      handleScheduleChange("title", sanitized);
                    }
                  }}
                  maxLength={CHAR_LIMITS.scheduleTitle}
                  placeholder="e.g., Morning Consultations"
                  disabled={loading}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="maxSlots"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Maximum Slots <span className="text-red-500">*</span>
                </label>
                <select
                  id="maxSlots"
                  value={scheduleData.maxSlots}
                  onChange={(e) =>
                    handleScheduleChange("maxSlots", parseInt(e.target.value))
                  }
                  disabled={loading}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="1">
                    1 slot - Individual/Exclusive Session
                  </option>
                  <option value="2">2 slots - Pair Counseling</option>
                  <option value="3">3 slots - Small Group</option>
                  <option value="5">5 slots - Medium Group</option>
                  <option value="10">10 slots - Large Group/Workshop</option>
                  <option value="15">15 slots - Seminar</option>
                  <option value="20">20 slots - Large Event/Orientation</option>
                </select>
                {errors.maxSlots && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxSlots}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduleData.startTime && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleData.startTime ? (
                          format(new Date(scheduleData.startTime), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          scheduleData.startTime
                            ? new Date(scheduleData.startTime)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const currentTime =
                              scheduleData.startTime.slice(11, 16) || "09:00";
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0",
                            );
                            const day = String(date.getDate()).padStart(2, "0");
                            handleScheduleChange(
                              "startTime",
                              `${year}-${month}-${day}T${currentTime}`,
                            );
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={scheduleData.startTime.slice(11, 16) || "09:00"}
                    onChange={(e) => {
                      const currentDate =
                        scheduleData.startTime.slice(0, 10) ||
                        new Date().toISOString().slice(0, 10);
                      handleScheduleChange(
                        "startTime",
                        `${currentDate}T${e.target.value}`,
                      );
                    }}
                    min="08:00"
                    max="20:00"
                    step="900"
                    disabled={loading}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduleData.endTime && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleData.endTime ? (
                          format(new Date(scheduleData.endTime), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          scheduleData.endTime
                            ? new Date(scheduleData.endTime)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const currentTime =
                              scheduleData.endTime.slice(11, 16) || "10:00";
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0",
                            );
                            const day = String(date.getDate()).padStart(2, "0");
                            handleScheduleChange(
                              "endTime",
                              `${year}-${month}-${day}T${currentTime}`,
                            );
                          }
                        }}
                        disabled={(date) => {
                          const minDate = scheduleData.startTime
                            ? new Date(
                                new Date(scheduleData.startTime).setHours(
                                  0,
                                  0,
                                  0,
                                  0,
                                ),
                              )
                            : new Date(new Date().setHours(0, 0, 0, 0));
                          return date < minDate;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={scheduleData.endTime.slice(11, 16) || "10:00"}
                    onChange={(e) => {
                      const currentDate =
                        scheduleData.endTime.slice(0, 10) ||
                        new Date().toISOString().slice(0, 10);
                      handleScheduleChange(
                        "endTime",
                        `${currentDate}T${e.target.value}`,
                      );
                    }}
                    min="08:00"
                    max="20:00"
                    step="900"
                    disabled={loading}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="scheduleLocation"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (
                  {getRemainingChars(
                    scheduleData.location,
                    CHAR_LIMITS.scheduleLocation,
                  )}{" "}
                  characters remaining)
                </span>
              </label>
              <input
                id="scheduleLocation"
                type="text"
                value={scheduleData.location}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value);
                  if (sanitized.length <= CHAR_LIMITS.scheduleLocation) {
                    handleScheduleChange("location", sanitized);
                  }
                }}
                maxLength={CHAR_LIMITS.scheduleLocation}
                placeholder="Meeting location (optional)"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={scheduleData.isRecurring}
                  onChange={(e) =>
                    handleScheduleChange("isRecurring", e.target.checked)
                  }
                  disabled={loading}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isRecurring"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Recurring schedule
                </label>
              </div>

              {scheduleData.isRecurring && (
                <FormSelect
                  id="recurringType"
                  label="Recurring Type"
                  value={scheduleData.recurringType}
                  onChange={(value) =>
                    handleScheduleChange("recurringType", value)
                  }
                  options={recurringTypeOptions}
                  disabled={loading}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (
                  {getRemainingChars(
                    scheduleData.description,
                    CHAR_LIMITS.scheduleDescription,
                  )}{" "}
                  characters remaining)
                </span>
              </label>
              <textarea
                value={scheduleData.description}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value);
                  if (sanitized.length <= CHAR_LIMITS.scheduleDescription) {
                    handleScheduleChange("description", sanitized);
                  }
                }}
                maxLength={CHAR_LIMITS.scheduleDescription}
                placeholder="Describe this schedule..."
                disabled={loading}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (
                  {getRemainingChars(
                    scheduleData.notes,
                    CHAR_LIMITS.scheduleNotes,
                  )}{" "}
                  characters remaining)
                </span>
              </label>
              <textarea
                value={scheduleData.notes}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value);
                  if (sanitized.length <= CHAR_LIMITS.scheduleNotes) {
                    handleScheduleChange("notes", sanitized);
                  }
                }}
                maxLength={CHAR_LIMITS.scheduleNotes}
                placeholder="Additional notes..."
                disabled={loading}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
              )}
            </div>
          </>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
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
