import React, { useState, useEffect, useRef } from "react";
import { Modal, FormField, FormSelect } from "@/components/atoms";
import { Button } from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks/useSchedules";
import { useAuth } from "@/hooks";
import { InventoryService, StudentService } from "@/services";
import type { Student } from "@/services/student.service";
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  Appointment,
} from "@/services";

// Character limits for fields
const CHAR_LIMITS = {
  title: 100,
  description: 500,
  location: 100,
  cancellationReason: 500,
  completionNotes: 500,
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

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateAppointmentRequest | UpdateAppointmentRequest,
  ) => Promise<void>;
  appointment?: Appointment | null;
  loading?: boolean;
  mode: "create" | "edit" | "view";
  initialDate?: Date | null; // Pre-fill date from calendar
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
  status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  priority: "low" | "normal" | "high" | "urgent";
  location: string;
  duration: number;
  maxStudents: number; // Maximum students for group sessions
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
  initialDate = null,
}) => {
  // Enhanced close handler to ensure proper cleanup
  const handleClose = () => {
    console.log("=== MODAL CLOSING ===");
    console.log("Resetting all state...");
    setSelectedStudent(null);
    setStudentSearchQuery("");
    setStudentSuggestions([]);
    setShowSuggestions(false);
    setErrors({});
    onClose();
  };
  const { user, student } = useAuth();
  const { availableSchedules, fetchAvailableSchedules } = useSchedules();

  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentSuggestions, setStudentSuggestions] = useState<Student[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]); // Track selected students for group sessions
  const searchRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<AppointmentFormData>({
    studentId: "",
    studentIds: [], // Initialize empty array for group sessions
    counselorId: "",
    scheduleId: "",
    title: "",
    description: "",
    appointmentType: "general_information",
    requestedDate: "",
    priority: "normal",
    location: "",
    duration: 60,
    maxStudents: 10, // Default max students for group sessions
    cancellationReason: "",
    completionNotes: "",
    followUpRequired: false,
    followUpDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isGuidanceUser = user?.type === "guidance";

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment) {
      const appointmentData = appointment as unknown as Record<string, unknown>;
      setFormData({
        studentId: appointment.studentId,
        studentIds: Array.isArray(appointmentData.studentIds)
          ? (appointmentData.studentIds as string[])
          : [],
        counselorId: appointment.counselorId,
        scheduleId: appointment.scheduleId,
        title: appointment.title,
        description: appointment.description || "",
        appointmentType: appointment.appointmentType,
        requestedDate: new Date(appointment.requestedDate)
          .toISOString()
          .slice(0, 16),
        priority: appointment.priority,
        location: appointment.location || "",
        duration: appointment.duration,
        maxStudents:
          typeof appointmentData.maxStudents === "number"
            ? appointmentData.maxStudents
            : 10,
        cancellationReason: appointment.cancellationReason || "",
        completionNotes: appointment.completionNotes || "",
        followUpRequired: appointment.followUpRequired || false,
        followUpDate: appointment.followUpDate
          ? new Date(appointment.followUpDate).toISOString().slice(0, 16)
          : "",
      });

      // Load selected students for group sessions
      const studentsData = appointmentData.students;
      if (Array.isArray(studentsData)) {
        setSelectedStudents(studentsData as Student[]);
      } else {
        setSelectedStudents([]);
      }
    } else {
      // Reset for create mode
      setFormData({
        studentId: isGuidanceUser ? "" : user?.id || "", // For students, use their user ID (not student record ID), for guidance users it will be empty
        studentIds: [],
        counselorId: isGuidanceUser ? user?.id || "" : "", // For guidance users, set their ID as counselor
        scheduleId: "",
        title: "",
        description: "",
        appointmentType: "general_information",
        requestedDate: initialDate
          ? new Date(
              initialDate.getFullYear(),
              initialDate.getMonth(),
              initialDate.getDate(),
              9,
              0,
            )
              .toISOString()
              .slice(0, 16)
          : "",
        status: isGuidanceUser ? "confirmed" : "pending", // Auto-confirm for guidance users
        priority: "normal",
        location: "",
        duration: 60,
        followUpRequired: false,
        followUpDate: "",
        maxStudents: 10,
      });
      setSelectedStudents([]);
    }
    setErrors({});
    setStudentSearchQuery("");
    setSelectedStudent(null);
    setStudentSuggestions([]);
    setShowSuggestions(false);
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
      } catch (error) {
        console.error("Error loading data:", error);
      }
    })();
    // Only depend on isOpen so this runs exactly once per open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search students as user types
  useEffect(() => {
    const searchStudents = async () => {
      if (!studentSearchQuery.trim() || studentSearchQuery.length < 2) {
        setStudentSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await StudentService.getAllStudents({
          query: studentSearchQuery,
          limit: 10,
          fields:
            "id,userId,studentNumber,program,person.firstName,person.lastName,person.email",
        });

        setStudentSuggestions(response.data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error searching students:", error);
        setStudentSuggestions([]);
      }
    };

    const debounce = setTimeout(() => {
      searchStudents();
    }, 300);

    return () => clearTimeout(debounce);
  }, [studentSearchQuery]);

  const handleInputChange = async (
    field: keyof AppointmentFormData,
    value: string | number | boolean,
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

  // Handle student selection from suggestions
  const handleSelectStudent = async (selectedStudent: Student) => {
    console.log("=== SELECTING STUDENT ===");
    console.log("Selected student object:", selectedStudent);
    console.log("Student userId:", selectedStudent.userId);
    console.log("Student id (record):", selectedStudent.id);

    setSelectedStudent(selectedStudent);
    setStudentSearchQuery(
      `${selectedStudent.person?.firstName} ${selectedStudent.person?.lastName}`,
    );
    setShowSuggestions(false);

    // Update form data with userId for appointment (not student record id)
    if (!selectedStudent.userId) {
      console.error("Student record missing userId:", selectedStudent);
      setErrors((prev) => ({
        ...prev,
        studentId:
          "Selected student has no user account. Please contact support.",
      }));
      return;
    }

    console.log("Setting studentId in form to:", selectedStudent.userId);
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        studentId: selectedStudent.userId!,
      };
      console.log("New form data after student selection:", newFormData);
      return newFormData;
    });

    // Auto-populate priority and suggested type based on inventory
    // Inventory uses student record ID, not userId
    try {
      const inventory = await InventoryService.getInventoryByStudentId(
        selectedStudent.id,
      );
      if (
        inventory?.mentalHealthPredictions &&
        inventory.mentalHealthPredictions.length > 0
      ) {
        const latestPrediction = inventory.mentalHealthPredictions[0];
        const riskLevel = latestPrediction.mentalHealthRisk?.level;

        // Map risk level to priority
        let suggestedPriority: "low" | "normal" | "high" | "urgent" = "normal";
        let suggestedType = formData.appointmentType;
        let suggestedDuration = formData.duration;

        switch (riskLevel) {
          case "critical":
            suggestedPriority = "urgent";
            suggestedType = "individual_counseling";
            suggestedDuration = 90;
            break;
          case "high":
            suggestedPriority = "high";
            suggestedType = "individual_counseling";
            suggestedDuration = 60;
            break;
          case "moderate":
            suggestedPriority = "normal";
            suggestedType = "one_or_two_session_problem_solving";
            suggestedDuration = 60;
            break;
          case "low":
            suggestedPriority = "low";
            suggestedType = "general_information";
            suggestedDuration = 30;
            break;
        }

        setFormData((prev) => ({
          ...prev,
          priority: suggestedPriority,
          appointmentType: suggestedType,
          duration: suggestedDuration,
        }));
      }
    } catch (error) {
      console.error("Error fetching inventory for priority:", error);
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > CHAR_LIMITS.title) {
      newErrors.title = `Title must not exceed ${CHAR_LIMITS.title} characters`;
    } else if (!validateSpecialCharacters(formData.title)) {
      newErrors.title =
        "Title contains invalid characters (< > & are not allowed)";
    }

    // Description validation
    if (
      formData.description &&
      formData.description.length > CHAR_LIMITS.description
    ) {
      newErrors.description = `Description must not exceed ${CHAR_LIMITS.description} characters`;
    } else if (
      formData.description &&
      !validateSpecialCharacters(formData.description)
    ) {
      newErrors.description =
        "Description contains invalid characters (< > & are not allowed)";
    }

    // Location validation
    if (formData.location && formData.location.length > CHAR_LIMITS.location) {
      newErrors.location = `Location must not exceed ${CHAR_LIMITS.location} characters`;
    } else if (
      formData.location &&
      !validateSpecialCharacters(formData.location)
    ) {
      newErrors.location =
        "Location contains invalid characters (< > & are not allowed)";
    }

    // Cancellation reason validation
    if (
      formData.cancellationReason &&
      formData.cancellationReason.length > CHAR_LIMITS.cancellationReason
    ) {
      newErrors.cancellationReason = `Cancellation reason must not exceed ${CHAR_LIMITS.cancellationReason} characters`;
    } else if (
      formData.cancellationReason &&
      !validateSpecialCharacters(formData.cancellationReason)
    ) {
      newErrors.cancellationReason =
        "Cancellation reason contains invalid characters (< > & are not allowed)";
    }

    // Completion notes validation
    if (
      formData.completionNotes &&
      formData.completionNotes.length > CHAR_LIMITS.completionNotes
    ) {
      newErrors.completionNotes = `Completion notes must not exceed ${CHAR_LIMITS.completionNotes} characters`;
    } else if (
      formData.completionNotes &&
      !validateSpecialCharacters(formData.completionNotes)
    ) {
      newErrors.completionNotes =
        "Completion notes contains invalid characters (< > & are not allowed)";
    }

    // Student validation - support both single and group sessions
    if (isGuidanceUser) {
      if (formData.appointmentType === "group_counseling") {
        // Group session - check studentIds array
        if (formData.studentIds.length === 0) {
          newErrors.studentId =
            "Please add at least one student to the group session";
        }
      } else {
        // Single student session
        if (!formData.studentId) {
          newErrors.studentId = "Please select a student";
        }
        if (!selectedStudent) {
          newErrors.studentId = "Please search and select a student";
        }
      }
    }

    // Schedule selection is optional - guidance can assign later

    if (!formData.requestedDate) {
      newErrors.requestedDate = "Please select a date and time";
    } else {
      // Validate time range (8 AM to 8 PM)
      const selectedDate = new Date(formData.requestedDate);
      const hours = selectedDate.getHours();

      if (hours < 8 || hours >= 20) {
        newErrors.requestedDate =
          "Appointments can only be scheduled between 8:00 AM and 8:00 PM";
      }

      // Check if the selected date/time is in the past
      const now = new Date();
      if (selectedDate < now) {
        newErrors.requestedDate = "Cannot schedule appointments in the past";
      }

      // Check for conflicts if we have a student and counselor
      if (
        formData.studentId &&
        formData.counselorId &&
        !newErrors.requestedDate
      ) {
        setCheckingConflicts(true);
        try {
          // Check student's existing appointments
          const studentAppointments = await fetch(
            `/api/appointment/student/${formData.studentId}?dateFrom=${selectedDate.toISOString()}&dateTo=${new Date(selectedDate.getTime() + formData.duration * 60000).toISOString()}`,
          ).then((res) => res.json());

          // Check counselor's existing appointments
          const counselorAppointments = await fetch(
            `/api/appointment/counselor/${formData.counselorId}?dateFrom=${selectedDate.toISOString()}&dateTo=${new Date(selectedDate.getTime() + formData.duration * 60000).toISOString()}`,
          ).then((res) => res.json());

          const appointmentEndTime = new Date(
            selectedDate.getTime() + formData.duration * 60000,
          );

          // Check for conflicts (excluding current appointment in edit mode)
          const hasStudentConflict = studentAppointments.appointments?.some(
            (apt: Appointment) => {
              if (appointment && apt.id === appointment.id) return false;
              if (apt.status === "cancelled") return false;

              const aptStart = new Date(apt.requestedDate);
              const aptEnd = new Date(
                aptStart.getTime() + apt.duration * 60000,
              );

              return selectedDate < aptEnd && appointmentEndTime > aptStart;
            },
          );

          const hasCounselorConflict = counselorAppointments.appointments?.some(
            (apt: Appointment) => {
              if (appointment && apt.id === appointment.id) return false;
              if (apt.status === "cancelled") return false;

              const aptStart = new Date(apt.requestedDate);
              const aptEnd = new Date(
                aptStart.getTime() + apt.duration * 60000,
              );

              return selectedDate < aptEnd && appointmentEndTime > aptStart;
            },
          );

          if (hasStudentConflict) {
            newErrors.requestedDate =
              "Student already has an appointment at this time";
          } else if (hasCounselorConflict) {
            newErrors.requestedDate =
              "Counselor already has an appointment at this time";
          }
        } catch (error) {
          console.error("Error checking conflicts:", error);
        } finally {
          setCheckingConflicts(false);
        }
      }
    }

    if (
      isEditMode &&
      appointment?.status === "cancelled" &&
      !formData.cancellationReason.trim()
    ) {
      newErrors.cancellationReason = "Cancellation reason is required";
    }

    if (
      isEditMode &&
      appointment?.status === "completed" &&
      !formData.completionNotes.trim()
    ) {
      newErrors.completionNotes = "Completion notes are required";
    }

    if (formData.followUpRequired && !formData.followUpDate) {
      newErrors.followUpDate =
        "Follow-up date is required when follow-up is needed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    try {
      // Prepare studentIds array based on whether it's a group session
      const isGroupSession = formData.appointmentType === "group_counseling";

      const submitData: CreateAppointmentRequest | UpdateAppointmentRequest = {
        ...formData,
        requestedDate: new Date(formData.requestedDate).toISOString(),
        followUpDate: formData.followUpDate
          ? new Date(formData.followUpDate).toISOString()
          : undefined,
        // Only include scheduleId if it's selected
        ...(formData.scheduleId && { scheduleId: formData.scheduleId }),
        // Include studentIds if it's a group session
        ...(isGroupSession && {
          studentIds: formData.studentIds,
          maxStudents: formData.maxStudents,
        }),
        // For backward compatibility, ensure studentId is set
        studentId:
          isGroupSession && formData.studentIds.length > 0
            ? formData.studentIds[0]
            : formData.studentId,
      };

      console.log("=== SUBMITTING APPOINTMENT ===");
      console.log("Full submitData:", submitData);
      console.log(
        "studentId being sent:",
        (submitData as CreateAppointmentRequest).studentId,
      );
      console.log("formData.studentId:", formData.studentId);
      console.log("Selected student object:", selectedStudent);
      console.log("Selected student userId:", selectedStudent?.userId);

      await onSubmit(submitData);

      // Reset form after successful submit
      console.log("=== APPOINTMENT CREATED SUCCESSFULLY ===");
      console.log("Resetting form state...");
      setSelectedStudent(null);
      setStudentSearchQuery("");
    } catch (error) {
      console.error("Error submitting appointment:", error);
    }
  };

  const appointmentTypeOptions = [
    { value: "general_information", label: "General Information" },
    {
      value: "one_or_two_session_problem_solving",
      label: "One or Two Session Problem Solving",
    },
    { value: "stress_management", label: "Stress Management" },
    { value: "group_counseling", label: "Group Counseling" },
    { value: "substance_abuse_services", label: "Substance Abuse Services" },
    { value: "career_exploration", label: "Career Exploration" },
    { value: "individual_counseling", label: "Individual Counseling" },
    { value: "referral_for_university", label: "Referral for University" },
  ];

  const durationOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "60 minutes" },
    { value: "90", label: "90 minutes" },
    { value: "120", label: "120 minutes" },
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
        {/* Student Selection - Support both single and multiple students */}
        {isGuidanceUser && (
          <div className="space-y-4">
            {/* Toggle for Group Session */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isGroupSession"
                checked={formData.appointmentType === "group_counseling"}
                onChange={(e) => {
                  handleInputChange(
                    "appointmentType",
                    e.target.checked
                      ? "group_counseling"
                      : "general_information",
                  );
                  // Clear studentIds when switching modes
                  if (!e.target.checked) {
                    setFormData((prev) => ({
                      ...prev,
                      studentIds: [],
                    }));
                    setSelectedStudents([]);
                  }
                }}
                disabled={loading || isViewMode}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="isGroupSession"
                className="text-sm font-medium text-gray-700"
              >
                Group Session (Multiple Students)
              </label>
            </div>

            {formData.appointmentType === "group_counseling" ? (
              /* Multi-student Selection for Group Sessions */
              <div ref={searchRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Students <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    ({formData.studentIds.length} of {formData.maxStudents}{" "}
                    selected)
                  </span>
                </label>

                {/* Student search for adding */}
                <div className="relative mb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={
                        formData.studentIds.length >= formData.maxStudents
                          ? "Maximum students reached"
                          : "Search to add student..."
                      }
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (studentSuggestions.length > 0)
                          setShowSuggestions(true);
                      }}
                      disabled={
                        loading ||
                        isViewMode ||
                        formData.studentIds.length >= formData.maxStudents
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && studentSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {studentSuggestions
                        .filter(
                          (student) =>
                            !formData.studentIds.includes(
                              student.userId || student.id,
                            ),
                        )
                        .map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => {
                              const studentUserId =
                                student.userId || student.id;
                              if (
                                !formData.studentIds.includes(studentUserId)
                              ) {
                                setFormData((prev) => ({
                                  ...prev,
                                  studentIds: [
                                    ...prev.studentIds,
                                    studentUserId,
                                  ],
                                  studentId:
                                    prev.studentIds.length === 0
                                      ? studentUserId
                                      : prev.studentId,
                                }));
                                setSelectedStudents((prev) => [
                                  ...prev,
                                  student,
                                ]);
                                setStudentSearchQuery("");
                                setShowSuggestions(false);
                              }
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {student.person?.firstName}{" "}
                                  {student.person?.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {student.studentNumber} • {student.program}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}

                  {/* No results message */}
                  {showSuggestions &&
                    studentSearchQuery.length >= 2 &&
                    studentSuggestions.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
                        No students found
                      </div>
                    )}
                </div>

                {/* Selected students list */}
                {formData.studentIds.length > 0 && (
                  <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedStudents.map((student) => {
                        const studentUserId = student.userId || student.id;
                        if (!formData.studentIds.includes(studentUserId))
                          return null;

                        return (
                          <div
                            key={student.id}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                          >
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.person?.firstName}{" "}
                                {student.person?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.studentNumber} • {student.program}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  studentIds: prev.studentIds.filter(
                                    (id) => id !== studentUserId,
                                  ),
                                  studentId:
                                    prev.studentIds[0] === studentUserId &&
                                    prev.studentIds.length > 1
                                      ? prev.studentIds[1]
                                      : prev.studentId,
                                }));
                                setSelectedStudents((prev) =>
                                  prev.filter(
                                    (s) => (s.userId || s.id) !== studentUserId,
                                  ),
                                );
                              }}
                              disabled={loading || isViewMode}
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

                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.studentId}
                  </p>
                )}
              </div>
            ) : (
              /* Single Student Selection */
              <div ref={searchRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search student by name..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (studentSuggestions.length > 0)
                          setShowSuggestions(true);
                      }}
                      disabled={loading || isViewMode}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && studentSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {studentSuggestions.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => handleSelectStudent(student)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.person?.firstName}{" "}
                                {student.person?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.studentNumber} • {student.program}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {showSuggestions &&
                    studentSearchQuery.length >= 2 &&
                    studentSuggestions.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
                        No students found
                      </div>
                    )}
                </div>

                {/* Selected Student Display */}
                {selectedStudent && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-blue-900">
                          Selected: {selectedStudent.person?.firstName}{" "}
                          {selectedStudent.person?.lastName}
                        </div>
                        <div className="text-xs text-blue-700">
                          {selectedStudent.studentNumber} •{" "}
                          {selectedStudent.program}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(null);
                          setStudentSearchQuery("");
                          setFormData((prev) => ({ ...prev, studentId: "" }));
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.studentId}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Title *
              <span className="text-xs text-gray-500 font-normal ml-2">
                ({getRemainingChars(formData.title, CHAR_LIMITS.title)}{" "}
                characters remaining)
              </span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                const sanitized = sanitizeInput(e.target.value);
                if (sanitized.length <= CHAR_LIMITS.title) {
                  handleInputChange("title", sanitized);
                }
              }}
              maxLength={CHAR_LIMITS.title}
              placeholder="e.g., Academic Consultation"
              disabled={isViewMode || loading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
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
          <FormSelect
            id="duration"
            label="Duration (minutes)"
            value={formData.duration.toString()}
            onChange={(value) =>
              handleInputChange("duration", parseInt(value) || 60)
            }
            options={durationOptions}
            disabled={loading || isViewMode}
            required
          />
        </div>

        {/* Schedule Selection */}
        <div>
          <FormSelect
            id="scheduleId"
            label="Available Schedule (Optional)"
            value={formData.scheduleId}
            onChange={(value) => handleInputChange("scheduleId", value)}
            options={[
              {
                value: "",
                label: "No specific schedule - counselor will assign later",
              },
              ...(availableSchedules || []).map((s) => ({
                value: s.id,
                label: `${s.title} - ${new Date(s.startTime).toLocaleString()} (${(
                  s.counselor?.person?.firstName ?? ""
                ).trim()} ${(s.counselor?.person?.lastName ?? "").trim()})`,
              })),
            ]}
            disabled={loading || isViewMode}
          />
          {errors.scheduleId && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduleId}</p>
          )}
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
                    !formData.requestedDate && "text-muted-foreground",
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
                  selected={
                    formData.requestedDate
                      ? new Date(formData.requestedDate)
                      : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      const currentTime =
                        formData.requestedDate.slice(11, 16) || "09:00";
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      handleInputChange(
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
              Preferred Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formData.requestedDate.slice(11, 16) || "09:00"}
              onChange={(e) => {
                const currentDate =
                  formData.requestedDate.slice(0, 10) ||
                  new Date().toISOString().slice(0, 10);
                handleInputChange(
                  "requestedDate",
                  `${currentDate}T${e.target.value}`,
                );
              }}
              min="08:00"
              max="19:45"
              step="900"
              disabled={loading || isViewMode || checkingConflicts}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
            />
            {checkingConflicts && (
              <p className="mt-1 text-sm text-blue-600">
                Checking for scheduling conflicts...
              </p>
            )}
            {errors.requestedDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.requestedDate}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
            <span className="text-xs text-gray-500 font-normal ml-2">
              ({getRemainingChars(formData.location, CHAR_LIMITS.location)}{" "}
              characters remaining)
            </span>
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => {
              const sanitized = sanitizeInput(e.target.value);
              if (sanitized.length <= CHAR_LIMITS.location) {
                handleInputChange("location", sanitized);
              }
            }}
            maxLength={CHAR_LIMITS.location}
            placeholder="Meeting location (optional)"
            disabled={isViewMode || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
            <span className="text-xs text-gray-500 font-normal ml-2">
              (
              {getRemainingChars(formData.description, CHAR_LIMITS.description)}{" "}
              characters remaining)
            </span>
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => {
              const sanitized = sanitizeInput(e.target.value);
              if (sanitized.length <= CHAR_LIMITS.description) {
                handleInputChange("description", sanitized);
              }
            }}
            maxLength={CHAR_LIMITS.description}
            placeholder="Describe the purpose of your appointment..."
            disabled={isViewMode || loading}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Cancellation Reason (only for cancelled appointments) */}
        {isEditMode && appointment?.status === "cancelled" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason *
              <span className="text-xs text-gray-500 font-normal ml-2">
                (
                {getRemainingChars(
                  formData.cancellationReason,
                  CHAR_LIMITS.cancellationReason,
                )}{" "}
                characters remaining)
              </span>
            </label>
            <textarea
              rows={3}
              value={formData.cancellationReason}
              onChange={(e) => {
                const sanitized = sanitizeInput(e.target.value);
                if (sanitized.length <= CHAR_LIMITS.cancellationReason) {
                  handleInputChange("cancellationReason", sanitized);
                }
              }}
              maxLength={CHAR_LIMITS.cancellationReason}
              disabled={loading}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              placeholder="Reason for cancellation"
            />
            {errors.cancellationReason && (
              <p className="mt-1 text-sm text-red-600">
                {errors.cancellationReason}
              </p>
            )}
          </div>
        )}

        {/* Completion Notes (only for completed appointments) */}
        {isEditMode && appointment?.status === "completed" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Notes *
              <span className="text-xs text-gray-500 font-normal ml-2">
                (
                {getRemainingChars(
                  formData.completionNotes,
                  CHAR_LIMITS.completionNotes,
                )}{" "}
                characters remaining)
              </span>
            </label>
            <textarea
              rows={3}
              value={formData.completionNotes}
              onChange={(e) => {
                const sanitized = sanitizeInput(e.target.value);
                if (sanitized.length <= CHAR_LIMITS.completionNotes) {
                  handleInputChange("completionNotes", sanitized);
                }
              }}
              maxLength={CHAR_LIMITS.completionNotes}
              disabled={loading}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              placeholder="Notes about the completed appointment"
            />
            {errors.completionNotes && (
              <p className="mt-1 text-sm text-red-600">
                {errors.completionNotes}
              </p>
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
                onChange={(e) =>
                  handleInputChange("followUpRequired", e.target.checked)
                }
                disabled={loading}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="followUpRequired"
                className="ml-2 block text-sm text-gray-700"
              >
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
                  onChange={(e) =>
                    handleInputChange("followUpDate", e.target.value)
                  }
                  disabled={loading}
                  required
                />
                {errors.followUpDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.followUpDate}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        {!isViewMode && (
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
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
                ? "Submitting..."
                : isCreateMode
                  ? "Book Appointment"
                  : "Update Appointment"}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};
