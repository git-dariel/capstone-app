import React, { useState, useEffect } from "react";
import {
  AppointmentsTable,
  AppointmentModal,
  AppointmentViewModal,
  SchedulesTable,
  ScheduleModal,
  ScheduleViewModal,
  CalendarView,
  DateEventsDrawer,
  RequestAppointmentModal,
  PendingRequestsTable,
} from "@/components/molecules";
import { useAppointments, useSchedules, useAuth, useToast } from "@/hooks";
import { AppointmentService } from "@/services";
import type { Appointment, Schedule } from "@/services";
import { Calendar, List } from "lucide-react";
import { ToastContainer } from "@/components/atoms";

interface AppointmentsContentProps {
  activeTab?: "appointments" | "schedules" | "pending-requests";
  onTabChange?: (tab: "appointments" | "schedules" | "pending-requests") => void;
}

export const AppointmentsContent: React.FC<AppointmentsContentProps> = ({
  activeTab = "appointments",
  onTabChange,
}) => {
  const { user } = useAuth();
  const { success, error, toasts, removeToast } = useToast();
  const isGuidance = user?.type === "guidance";
  const isStudent = user?.type === "student";

  // State for modals and view mode
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isAppointmentViewModalOpen, setIsAppointmentViewModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduleViewModalOpen, setIsScheduleViewModalOpen] = useState(false);
  const [isDateEventsDrawerOpen, setIsDateEventsDrawerOpen] = useState(false);
  const [isRequestAppointmentModalOpen, setIsRequestAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [appointmentModalMode, setAppointmentModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState("");
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState("");

  const appointmentPageSize = 10;
  const schedulePageSize = 10;

  // Hooks for data management
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    total: appointmentsTotal,
    page: appointmentsPage,
    totalPages: appointmentsTotalPages,
    fetchAppointmentsByStudentId,
    fetchAppointmentsByCounselorId,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

  // State for pending requests (guidance only)
  const [pendingRequests, setPendingRequests] = useState<Appointment[]>([]);
  const [pendingRequestsLoading, setPendingRequestsLoading] = useState(false);
  const [pendingRequestsPage, setPendingRequestsPage] = useState(1);
  const [pendingRequestsTotal, setPendingRequestsTotal] = useState(0);
  const [pendingRequestsTotalPages, setPendingRequestsTotalPages] = useState(0);
  const [pendingRequestsSearchQuery, setPendingRequestsSearchQuery] = useState("");

  const {
    schedules,
    availableSchedules,
    loading: schedulesLoading,
    error: schedulesError,
    total: schedulesTotal,
    page: schedulesPage,
    totalPages: schedulesTotalPages,
    fetchSchedules,
    fetchAvailableSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedules();

  const loadAppointments = async (pageOverride = appointmentPage) => {
    if (!user?.id) return;

    if (isStudent) {
      await fetchAppointmentsByStudentId(user.id, {
        page: pageOverride,
        limit: appointmentPageSize,
        ...(appointmentSearchQuery ? { query: appointmentSearchQuery } : {}),
      });
    } else if (isGuidance) {
      await fetchAppointmentsByCounselorId(user.id, {
        page: pageOverride,
        limit: appointmentPageSize,
        ...(appointmentSearchQuery ? { query: appointmentSearchQuery } : {}),
      });
    }
  };

  const loadSchedules = async (pageOverride = schedulePage) => {
    if (isGuidance) {
      await fetchSchedules({
        page: pageOverride,
        limit: schedulePageSize,
        ...(scheduleSearchQuery ? { query: scheduleSearchQuery } : {}),
      });
    } else if (isStudent) {
      await fetchAvailableSchedules();
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Don't load if user context is not available yet
      if (!user || appointmentsLoading || schedulesLoading) return;

      console.log("Loading data for user type:", user.type);

      try {
        console.log("Loading appointments for user:", user.id);
        await loadAppointments();
      } catch (error) {
        console.error("Failed to load appointments:", error);
        // Don't throw error to prevent useEffect loop
      }

      try {
        console.log("Loading schedules for user");
        await loadSchedules();
      } catch (error) {
        console.error("Failed to load schedules:", error);
        // Don't throw error to prevent useEffect loop
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    isGuidance,
    isStudent,
    appointmentPage,
    appointmentSearchQuery,
    schedulePage,
    scheduleSearchQuery,
  ]); // Depend on user and user type to reload when context is available

  // Fetch pending appointment requests for guidance counselors
  const fetchPendingRequests = async (pageOverride = pendingRequestsPage) => {
    if (!isGuidance || !user?.id) return;

    setPendingRequestsLoading(true);
    try {
      const response = await AppointmentService.getAppointmentsByCounselorId(user.id, {
        page: pageOverride,
        limit: 10,
        status: "pending",
        ...(pendingRequestsSearchQuery ? { query: pendingRequestsSearchQuery } : {}),
      });

      const responseAppointments =
        "appointments" in response ? (response as any).appointments : response.data || [];
      setPendingRequests(responseAppointments || []);
      setPendingRequestsTotal((response as any).total || 0);
      setPendingRequestsPage((response as any).page || pageOverride);
      setPendingRequestsTotalPages((response as any).totalPages || 0);
    } catch (err: any) {
      console.error("Failed to fetch pending requests:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch pending appointment requests. Please try again.";
      error("Error", errorMessage);
    } finally {
      setPendingRequestsLoading(false);
    }
  };

  // Handle tab changes
  const handleTabClick = (tab: "appointments" | "schedules" | "pending-requests") => {
    onTabChange?.(tab);

    // Switch to list view when switching to pending-requests tab
    if (tab === "pending-requests") {
      setViewMode("list");
    }

    // Load pending requests when switching to that tab
    if (tab === "pending-requests" && isGuidance) {
      fetchPendingRequests();
    }
  };

  useEffect(() => {
    if (activeTab === "pending-requests" && isGuidance) {
      fetchPendingRequests();
    }
  }, [activeTab, isGuidance, pendingRequestsPage, pendingRequestsSearchQuery]);

  const handlePendingRequestsSearch = (query: string) => {
    setPendingRequestsSearchQuery(query.trim());
    setPendingRequestsPage(1);
  };

  const handlePendingRequestsPageChange = (page: number) => {
    setPendingRequestsPage(page);
  };

  const handleAppointmentSearch = (query: string) => {
    setAppointmentSearchQuery(query.trim());
    setAppointmentPage(1);
  };

  const handleAppointmentPageChange = (page: number) => {
    setAppointmentPage(page);
  };

  const handleScheduleSearch = (query: string) => {
    setScheduleSearchQuery(query.trim());
    setSchedulePage(1);
  };

  const handleSchedulePageChange = (page: number) => {
    setSchedulePage(page);
  };

  // Helper function to get events for a specific date
  const getEventsForDate = (date: Date) => {
    const events: any[] = [];

    // Always add appointments if available (regardless of active tab)
    if (appointments) {
      appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.requestedDate);
        if (appointmentDate.toDateString() === date.toDateString()) {
          events.push({
            id: appointment.id,
            title: appointment.title || "Appointment",
            startTime: new Date(appointment.requestedDate),
            endTime: new Date(
              new Date(appointment.requestedDate).getTime() + (appointment.duration || 60) * 60000,
            ),
            date: appointmentDate,
            color: getAppointmentColor(appointment.status),
            type: "appointment",
            data: appointment,
          });
        }
      });
    }

    // Always add schedules if available (regardless of active tab)
    const scheduleList = isStudent ? availableSchedules : schedules;
    if (scheduleList) {
      scheduleList.forEach((schedule) => {
        const scheduleDate = new Date(schedule.startTime);
        if (scheduleDate.toDateString() === date.toDateString()) {
          events.push({
            id: schedule.id,
            title: schedule.title || "Schedule",
            startTime: new Date(schedule.startTime),
            endTime: new Date(schedule.endTime),
            date: scheduleDate,
            color: getScheduleColor(schedule.status),
            type: "schedule",
            data: schedule,
          });
        }
      });
    }

    return events;
  };

  // Helper functions for colors (duplicated from CalendarView for consistency)
  const getAppointmentColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScheduleColor = (status: string): string => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "booked":
        return "bg-yellow-100 text-yellow-800";
      case "unavailable":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calendar handlers
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);

    // Get events for this date
    const events = getEventsForDate(date);

    // If there are 2 or more events, open the drawer
    if (events.length >= 2) {
      setIsDateEventsDrawerOpen(true);
      return;
    }

    // If there's exactly 1 event and user is student, do nothing (they should click the event itself)
    if (events.length === 1 && isStudent) {
      return;
    }

    // For guidance users with 0 or 1 events, open create modal
    if (isGuidance) {
      if (activeTab === "schedules") {
        // Open schedule modal with selected date
        setSelectedCalendarDate(date);
        setIsScheduleModalOpen(true);
      } else {
        // Open appointment modal with selected date
        setSelectedCalendarDate(date);
        setSelectedAppointment(null);
        setIsAppointmentModalOpen(true);
      }
    }
  };

  const handleCalendarEventClick = (event: any) => {
    if (event.type === "appointment") {
      setSelectedAppointment(event.data);
      setIsAppointmentViewModalOpen(true);
    } else if (event.type === "schedule") {
      // For students, only allow clicking on available schedules
      if (isStudent && event.data.status !== "available") {
        return;
      }
      setSelectedSchedule(event.data);
      setIsScheduleViewModalOpen(true);
    }
  };

  // Handler for when events are clicked from the drawer
  const handleDrawerEventClick = (event: any) => {
    // Close the drawer first
    setIsDateEventsDrawerOpen(false);

    // Then handle the event click
    handleCalendarEventClick(event);
  };

  // Appointment handlers
  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setAppointmentModalMode("create");
    setIsAppointmentModalOpen(true);
  };

  const handleRequestAppointment = () => {
    setIsRequestAppointmentModalOpen(true);
  };

  const handleSubmitAppointmentRequest = async (data: any) => {
    try {
      // Create appointment request with student ID
      const appointmentData = {
        ...data,
        studentId: user?.id || "",
      };

      await createAppointment(appointmentData);
      success(
        "Appointment Requested",
        "Your appointment request has been submitted successfully. The counselor will review and respond soon.",
      );

      // Refresh appointments
      await loadAppointments();

      setIsRequestAppointmentModalOpen(false);
    } catch (err: any) {
      console.error("Failed to submit appointment request:", err);

      // Extract detailed error message from API response
      let errorMessage = "Failed to submit appointment request. Please try again.";

      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Show detailed conflict information if available
      if (err?.response?.data?.conflictDetails) {
        const conflict = err.response.data.conflictDetails;
        errorMessage += `\n\nConflict Details:\n`;
        errorMessage += `Date: ${new Date(conflict.date).toLocaleString()}\n`;
        errorMessage += `Duration: ${conflict.duration} minutes\n`;
        if (conflict.student) {
          errorMessage += `Student: ${conflict.student}`;
        }
        if (conflict.counselor) {
          errorMessage += `Counselor: ${conflict.counselor}`;
        }
      }

      error("Request Failed", errorMessage);
      throw err;
    }
  };

  // Pending requests handlers
  const handleApproveRequest = async (request: Appointment) => {
    try {
      await updateAppointment(request.id, { status: "confirmed" });
      success(
        "Request Approved",
        `Appointment with ${request.student?.person?.firstName} ${request.student?.person?.lastName} has been approved.`,
      );

      // Refresh pending requests and appointments
      await fetchPendingRequests();
      await loadAppointments();
    } catch (err: any) {
      console.error("Failed to approve request:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to approve appointment request. Please try again.";
      error("Approval Failed", errorMessage);
    }
  };

  const handleDenyRequest = async (request: Appointment) => {
    try {
      await updateAppointment(request.id, {
        status: "cancelled",
        cancellationReason: "Request denied by counselor",
      });
      success(
        "Request Denied",
        `Appointment request from ${request.student?.person?.firstName} ${request.student?.person?.lastName} has been denied.`,
      );

      // Refresh pending requests and appointments
      await fetchPendingRequests();
      await loadAppointments();
    } catch (err: any) {
      console.error("Failed to deny request:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to deny appointment request. Please try again.";
      error("Denial Failed", errorMessage);
    }
  };

  const handleViewRequest = (request: Appointment) => {
    setSelectedAppointment(request);
    setIsAppointmentViewModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentModalMode("edit");
    setIsAppointmentModalOpen(true);
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentViewModalOpen(true);
  };

  // View modal handlers
  const handleEditFromView = (appointment: Appointment) => {
    setIsAppointmentViewModalOpen(false);
    setSelectedAppointment(appointment);
    setAppointmentModalMode("edit");
    setIsAppointmentModalOpen(true);
  };

  const handleEditScheduleFromView = (schedule: Schedule) => {
    setIsScheduleViewModalOpen(false);
    setSelectedSchedule(schedule);
    setIsScheduleModalOpen(true);
  };

  const handleBookFromScheduleView = async (schedule: Schedule) => {
    setIsScheduleViewModalOpen(false);
    await handleBookSchedule(schedule);
  };

  const handleDeleteScheduleFromView = async (schedule: Schedule) => {
    setIsScheduleViewModalOpen(false);
    await handleDeleteSchedule(schedule.id);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      await AppointmentService.updateAppointment(appointment.id, {
        status: "cancelled",
        cancellationReason: "Cancelled by user",
      });

      success("Appointment Cancelled", "Your appointment has been successfully cancelled.");

      // Refresh both appointments and schedules since cancelling frees up the schedule slot
      if (isStudent) {
        await loadAppointments();
        await fetchAvailableSchedules(); // Refresh available schedules for student
      } else if (isGuidance) {
        await loadAppointments();
        await loadSchedules(); // Refresh schedules for guidance
      }
    } catch (err: any) {
      console.error("Failed to cancel appointment:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to cancel appointment. Please try again.";
      error("Cancellation Failed", errorMessage);
    }
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    try {
      await AppointmentService.updateAppointment(appointment.id, {
        status: "completed",
        completionNotes: `Appointment completed on ${new Date().toLocaleString()}`,
      });

      success(
        "Appointment Completed",
        `Appointment with ${appointment.student?.person?.firstName} ${appointment.student?.person?.lastName} has been marked as completed.`,
      );

      // Refresh the list
      if (isStudent) {
        await loadAppointments();
      } else if (isGuidance) {
        await loadAppointments();
      }
    } catch (err: any) {
      console.error("Failed to complete appointment:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to mark appointment as completed. Please try again.";
      error("Completion Failed", errorMessage);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId);
      // Refresh the list
      if (isStudent) {
        await loadAppointments();
      } else if (isGuidance) {
        await loadAppointments();
      }
    } catch (err: any) {
      console.error("Failed to delete appointment:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete appointment. Please try again.";
      error("Delete Failed", errorMessage);
    }
  };

  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      if (selectedAppointment) {
        await updateAppointment(selectedAppointment.id, appointmentData);
        success("Appointment Updated", "Your appointment has been successfully updated.");
      } else {
        await createAppointment(appointmentData);
        success("Appointment Created", "Your appointment has been successfully created.");
      }
      setIsAppointmentModalOpen(false);
      // Refresh the list
      if (isStudent) {
        await loadAppointments();
      } else if (isGuidance) {
        await loadAppointments();
      }
    } catch (err: unknown) {
      console.error("Failed to save appointment:", err);
      console.log("Full error object:", JSON.stringify(err, null, 2));

      // Extract error message from backend response
      const errorResponse = err as {
        response?: {
          status?: number;
          data?: {
            error?: string;
            message?: string;
            conflictDetails?: {
              date: string;
              duration: number;
              student?: string;
              counselor?: string;
              appointmentId?: string;
            };
          };
        };
        message?: string;
      };

      console.log("Error response status:", errorResponse?.response?.status);
      console.log("Error response data:", errorResponse?.response?.data);

      const responseData = errorResponse?.response?.data;
      const backendError = responseData?.error || responseData?.message;

      console.log("Backend error message:", backendError);

      // Handle conflict errors (409 status)
      if (errorResponse?.response?.status === 409) {
        const conflictDetails = responseData?.conflictDetails;

        if (conflictDetails) {
          const date = new Date(conflictDetails.date).toLocaleString();
          const personInfo = conflictDetails.student
            ? `Student: ${conflictDetails.student}`
            : conflictDetails.counselor
              ? `Counselor: ${conflictDetails.counselor}`
              : "Unknown person";

          const detailedMessage = `${backendError || "This time slot is already booked"}\n\nConflicting Appointment:\n${personInfo}\nDate: ${date}\nDuration: ${conflictDetails.duration} minutes`;

          error("Schedule Conflict", detailedMessage);
        } else {
          error(
            "Schedule Conflict",
            backendError || "This time slot is already booked. Please choose a different time.",
          );
        }
      } else if (backendError) {
        // Display any other backend error messages
        error("Error", backendError);
      } else if (errorResponse?.message) {
        // Try to get error from top-level message
        error("Error", errorResponse.message);
      } else {
        // Generic error message
        error("Save Failed", "Failed to save appointment. Please try again.");
      }
      throw err;
    }
  };

  // Schedule handlers
  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setIsScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsScheduleModalOpen(true);
  };

  const handleViewSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteSchedule(scheduleId);
      await loadSchedules(); // Refresh the list
      success("Schedule Deleted", "The schedule has been successfully deleted.");
    } catch (err: any) {
      console.error("Failed to delete schedule:", err);

      // Handle specific error cases
      if (err.response && err.response.status === 400) {
        const errorData = err.response.data;
        const errorMessage = errorData.error || "Cannot delete schedule with existing appointments";
        error("Cannot Delete Schedule", errorMessage);
      } else {
        const errorMessage =
          err.response?.data?.error || err.message || "Failed to delete schedule";
        error("Error", errorMessage);
      }
    }
  };

  const handleSaveSchedule = async (scheduleData: Partial<Schedule>) => {
    try {
      if (selectedSchedule) {
        await updateSchedule(selectedSchedule.id, scheduleData);
        success("Schedule Updated", "The schedule has been successfully updated.");
      } else {
        await createSchedule(
          scheduleData as Omit<
            Schedule,
            "id" | "createdAt" | "updatedAt" | "isDeleted" | "bookedSlots"
          >,
        );
        success("Schedule Created", "Your schedule has been successfully created.");
      }
      setIsScheduleModalOpen(false);
      await loadSchedules(); // Refresh the list
    } catch (err: any) {
      console.error("Failed to save schedule:", err);

      // Handle 409 conflict responses (schedule conflicts with appointments)
      if (err.response && err.response.status === 409) {
        const errorData = err.response.data;
        const conflicts = errorData.conflicts || errorData.affectedAppointments || [];

        let errorMessage =
          errorData.message || errorData.error || "Schedule conflicts with existing appointments";

        if (conflicts.length > 0) {
          const conflictList = conflicts
            .map(
              (c: any) =>
                `• ${c.studentName} - ${new Date(c.date).toLocaleString()} (${c.duration || 60} min)`,
            )
            .join("\n");
          errorMessage += `:\n\n${conflictList}`;
        }

        error("Schedule Conflict", errorMessage);
      } else {
        // Handle other errors
        const errorMessage = err.response?.data?.error || err.message || "Failed to save schedule";
        error("Error", errorMessage);
      }

      throw err;
    }
  };

  // Handle booking a schedule (convert to appointment)
  const handleBookSchedule = async (schedule: Schedule) => {
    try {
      // Check if student already has an active appointment for this schedule
      if (hasActiveAppointmentForSchedule(schedule.id)) {
        const existingAppointment = getExistingAppointmentForSchedule(schedule.id);
        error(
          "Already Booked",
          `You already have an appointment for "${schedule.title}" on ${new Date(
            existingAppointment?.requestedDate || "",
          ).toLocaleDateString()}. Cancel it first to book again.`,
        );
        return;
      }

      // Create appointment data for the selected schedule
      const appointmentData = {
        studentId: user?.id || "",
        counselorId: schedule.counselorId,
        scheduleId: schedule.id,
        title: `Appointment: ${schedule.title}`,
        description: schedule.description || "",
        appointmentType: "general_information" as const,
        requestedDate: schedule.startTime,
        status: "confirmed" as const, // Students booking from available schedules get confirmed status
        priority: "normal" as const,
        location: schedule.location || "",
        duration: 60, // Default duration
      };

      await createAppointment(appointmentData);
      success(
        "Appointment Booked",
        `Your appointment for "${schedule.title}" has been successfully booked.`,
      );

      // Refresh data
      if (isStudent) {
        await loadAppointments();
        await fetchAvailableSchedules();
      } else if (isGuidance) {
        await loadAppointments();
        await loadSchedules();
      }
    } catch (err: any) {
      console.error("Failed to book appointment:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to book appointment. Please try again.";
      error("Booking Failed", errorMessage);
      throw err;
    }
  };

  // Check if student already has an active appointment for a specific schedule
  const hasActiveAppointmentForSchedule = (scheduleId: string): boolean => {
    if (!isStudent || !appointments) return false;

    return appointments.some(
      (appointment) =>
        appointment.scheduleId === scheduleId &&
        appointment.status !== "cancelled" &&
        appointment.status !== "completed",
    );
  };

  // Get the existing appointment for a schedule (if any)
  const getExistingAppointmentForSchedule = (scheduleId: string): Appointment | null => {
    if (!isStudent || !appointments) return null;

    return (
      appointments.find(
        (appointment) =>
          appointment.scheduleId === scheduleId &&
          appointment.status !== "cancelled" &&
          appointment.status !== "completed",
      ) || null
    );
  };

  const hasError = appointmentsError || schedulesError;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Tabs and View Toggle */}
      <div className="border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Navigation Tabs */}
          <nav className="flex flex-wrap gap-2 sm:space-x-8 sm:gap-0">
            <button
              onClick={() => handleTabClick("appointments")}
              className={`py-2 px-3 sm:px-1 rounded-lg sm:rounded-none border sm:border-0 sm:border-b-2 font-medium text-sm transition-colors touch-manipulation ${
                activeTab === "appointments"
                  ? "border-primary-500 text-primary-600 bg-primary-50 sm:bg-transparent sm:border-primary-500"
                  : "border-gray-200 text-gray-500 hover:text-gray-700 sm:border-transparent sm:hover:border-gray-300"
              }`}
            >
              <span className="block sm:inline">Appointments</span>
              {appointments.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {appointments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick("schedules")}
              className={`py-2 px-3 sm:px-1 rounded-lg sm:rounded-none border sm:border-0 sm:border-b-2 font-medium text-sm transition-colors touch-manipulation ${
                activeTab === "schedules"
                  ? "border-primary-500 text-primary-600 bg-primary-50 sm:bg-transparent sm:border-primary-500"
                  : "border-gray-200 text-gray-500 hover:text-gray-700 sm:border-transparent sm:hover:border-gray-300"
              }`}
            >
              <span className="block sm:inline">{isStudent ? "Available" : "Schedules"}</span>
              {(isStudent ? availableSchedules : schedules).length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {(isStudent ? availableSchedules : schedules).length}
                </span>
              )}
            </button>

            {/* Pending Requests tab - only for guidance counselors */}
            {isGuidance && (
              <button
                onClick={() => handleTabClick("pending-requests")}
                className={`py-2 px-3 sm:px-1 rounded-lg sm:rounded-none border sm:border-0 sm:border-b-2 font-medium text-sm transition-colors touch-manipulation ${
                  activeTab === "pending-requests"
                    ? "border-primary-500 text-primary-600 bg-primary-50 sm:bg-transparent sm:border-primary-500"
                    : "border-gray-200 text-gray-500 hover:text-gray-700 sm:border-transparent sm:hover:border-gray-300"
                }`}
              >
                <span className="block sm:inline">Requests</span>
                {pendingRequests.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-initial touch-manipulation ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </button>
            {activeTab !== "pending-requests" && (
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-initial touch-manipulation ${
                  viewMode === "calendar"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {activeTab === "appointments"
              ? "Appointments"
              : activeTab === "pending-requests"
                ? "Pending Requests"
                : isStudent
                  ? "Available Schedules"
                  : "Schedules"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 pr-4">
            {activeTab === "appointments"
              ? isStudent
                ? "View your booked appointments with guidance counselors"
                : "View students who booked your scheduled sessions"
              : activeTab === "pending-requests"
                ? "Review and approve student appointment requests"
                : isStudent
                  ? "Browse available counseling schedules to book appointments"
                  : "Configure available time slots and schedules"}
          </p>
        </div>

        {/* Action buttons for both students and guidance */}
        <div className="flex-shrink-0">
          {isGuidance && (
            <button
              onClick={
                activeTab === "appointments" ? handleCreateAppointment : handleCreateSchedule
              }
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 touch-manipulation"
            >
              <span className="mr-2">+</span>
              <span className="hidden sm:inline">
                {activeTab === "appointments" ? "New Appointment" : "New Schedule"}
              </span>
              <span className="sm:hidden">{activeTab === "appointments" ? "New" : "Schedule"}</span>
            </button>
          )}

          {/* Request Appointment button for students */}
          {isStudent && activeTab === "appointments" && (
            <button
              onClick={handleRequestAppointment}
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 touch-manipulation"
            >
              <span className="mr-2">+</span>
              <span className="hidden sm:inline">Request Appointment</span>
              <span className="sm:hidden">Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Backend API Not Available</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>The appointments and schedules backend services are currently unavailable.</p>
                <p className="mt-1">
                  Please ensure your backend server is running or contact your administrator.
                </p>
                {(appointmentsError || schedulesError) && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-red-600 hover:text-red-800">
                      View technical details
                    </summary>
                    <div className="mt-2 pl-4 border-l-2 border-red-300">
                      {appointmentsError && <p>Appointments API: {appointmentsError}</p>}
                      {schedulesError && <p>Schedules API: {schedulesError}</p>}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === "list" ? (
        <>
          {activeTab === "appointments" && (
            <AppointmentsTable
              appointments={appointments}
              loading={appointmentsLoading}
              onEdit={isGuidance ? handleEditAppointment : undefined}
              onView={handleViewAppointment}
              onCancel={handleCancelAppointment}
              onReschedule={isGuidance ? handleRescheduleAppointment : undefined}
              onComplete={isGuidance ? handleCompleteAppointment : undefined}
              onDelete={isGuidance ? handleDeleteAppointment : undefined}
              showActions={true}
              searchable={true}
              userType={user?.type}
              total={appointmentsTotal}
              page={appointmentsPage}
              totalPages={appointmentsTotalPages}
              onSearch={handleAppointmentSearch}
              onPageChange={handleAppointmentPageChange}
            />
          )}

          {activeTab === "schedules" && (
            <SchedulesTable
              schedules={isStudent ? availableSchedules : schedules}
              loading={schedulesLoading}
              onEdit={isGuidance ? handleEditSchedule : undefined}
              onView={handleViewSchedule}
              onDelete={isGuidance ? handleDeleteSchedule : undefined}
              onBook={isStudent ? handleBookSchedule : undefined}
              showActions={true}
              searchable={true}
              userType={user?.type}
              hasActiveAppointmentForSchedule={
                isStudent ? hasActiveAppointmentForSchedule : undefined
              }
              getExistingAppointmentForSchedule={
                isStudent ? getExistingAppointmentForSchedule : undefined
              }
              total={isGuidance ? schedulesTotal : undefined}
              page={isGuidance ? schedulesPage : undefined}
              totalPages={isGuidance ? schedulesTotalPages : undefined}
              onSearch={isGuidance ? handleScheduleSearch : undefined}
              onPageChange={isGuidance ? handleSchedulePageChange : undefined}
            />
          )}

          {activeTab === "pending-requests" && isGuidance && (
            <PendingRequestsTable
              requests={pendingRequests}
              loading={pendingRequestsLoading}
              onApprove={handleApproveRequest}
              onDeny={handleDenyRequest}
              onView={handleViewRequest}
              searchable={true}
              total={pendingRequestsTotal}
              page={pendingRequestsPage}
              totalPages={pendingRequestsTotalPages}
              onSearch={handlePendingRequestsSearch}
              onPageChange={handlePendingRequestsPageChange}
            />
          )}
        </>
      ) : (
        <>
          {activeTab !== "pending-requests" && (
            <CalendarView
              appointments={appointments || []}
              schedules={isStudent ? availableSchedules || [] : schedules || []}
              onDateClick={handleDateClick}
              onEventClick={handleCalendarEventClick}
              loading={appointmentsLoading || schedulesLoading}
              className="min-h-[600px]"
              userType={user?.type}
              hasActiveAppointmentForSchedule={
                isStudent ? hasActiveAppointmentForSchedule : undefined
              }
            />
          )}
          {activeTab === "pending-requests" && (
            <div className="text-center py-12 text-gray-500">
              <p>Calendar view is not available for pending requests.</p>
              <p className="text-sm mt-2">
                Please use the list view to manage appointment requests.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedCalendarDate(null);
        }}
        onSubmit={handleSaveAppointment}
        appointment={selectedAppointment}
        loading={appointmentsLoading}
        mode={appointmentModalMode}
        initialDate={selectedCalendarDate}
      />

      <AppointmentViewModal
        isOpen={isAppointmentViewModalOpen}
        onClose={() => setIsAppointmentViewModalOpen(false)}
        appointment={selectedAppointment}
        onEdit={handleEditFromView}
        onCancel={handleCancelAppointment}
        onComplete={handleCompleteAppointment}
        onReschedule={handleRescheduleAppointment}
        loading={appointmentsLoading}
        userType={user?.type}
      />

      {isGuidance && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setSelectedCalendarDate(null);
          }}
          onSave={handleSaveSchedule}
          schedule={selectedSchedule}
          loading={schedulesLoading}
          initialDate={selectedCalendarDate}
        />
      )}

      <ScheduleViewModal
        isOpen={isScheduleViewModalOpen}
        onClose={() => setIsScheduleViewModalOpen(false)}
        schedule={selectedSchedule}
        onEdit={isGuidance ? handleEditScheduleFromView : undefined}
        onDelete={isGuidance ? handleDeleteScheduleFromView : undefined}
        onBook={isStudent ? handleBookFromScheduleView : undefined}
        loading={schedulesLoading}
        userType={user?.type}
        hasActiveAppointmentForSchedule={isStudent ? hasActiveAppointmentForSchedule : undefined}
        getExistingAppointmentForSchedule={
          isStudent ? getExistingAppointmentForSchedule : undefined
        }
      />

      <DateEventsDrawer
        isOpen={isDateEventsDrawerOpen}
        onClose={() => setIsDateEventsDrawerOpen(false)}
        date={selectedDate}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
        onEventClick={handleDrawerEventClick}
        userType={user?.type}
        hasActiveAppointmentForSchedule={isStudent ? hasActiveAppointmentForSchedule : undefined}
      />

      {/* Request Appointment Modal for Students */}
      <RequestAppointmentModal
        isOpen={isRequestAppointmentModalOpen}
        onClose={() => setIsRequestAppointmentModalOpen(false)}
        onSubmit={handleSubmitAppointmentRequest}
        loading={appointmentsLoading}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
