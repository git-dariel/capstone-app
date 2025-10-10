import React, { useState, useEffect } from "react";
import {
  AppointmentsTable,
  AppointmentModal,
  AppointmentViewModal,
  SchedulesTable,
  ScheduleModal,
  ScheduleViewModal,
  CalendarView,
  CalendarModal,
  DateEventsDrawer,
  RequestAppointmentModal,
  PendingRequestsTable,
} from "@/components/molecules";
import { useAppointments, useSchedules, useAuth, useToast } from "@/hooks";
import { AppointmentService } from "@/services";
import { HttpClient } from "@/services/api.config";
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
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isDateEventsDrawerOpen, setIsDateEventsDrawerOpen] = useState(false);
  const [isRequestAppointmentModalOpen, setIsRequestAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarModalMode, setCalendarModalMode] = useState<"appointment" | "schedule">(
    "appointment"
  );
  const [appointmentModalMode, setAppointmentModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  // Hooks for data management
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    fetchAppointmentsByStudentId,
    fetchAppointmentsByCounselorId,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

  // State for pending requests (guidance only)
  const [pendingRequests, setPendingRequests] = useState<Appointment[]>([]);
  const [pendingRequestsLoading, setPendingRequestsLoading] = useState(false);

  const {
    schedules,
    availableSchedules,
    loading: schedulesLoading,
    error: schedulesError,
    fetchSchedules,
    fetchAvailableSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedules();

  // Load data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Don't load if user context is not available yet
      if (!user || appointmentsLoading || schedulesLoading) return;

      console.log("Loading data for user type:", user.type);

      try {
        if (isStudent) {
          console.log("Loading appointments for student:", user.id);
          await fetchAppointmentsByStudentId(user.id);
        } else if (isGuidance) {
          console.log("Loading appointments for guidance counselor:", user.id);
          await fetchAppointmentsByCounselorId(user.id);
        }
      } catch (error) {
        console.error("Failed to load appointments:", error);
        // Don't throw error to prevent useEffect loop
      }

      try {
        if (isGuidance) {
          console.log("Loading schedules for guidance counselor");
          await fetchSchedules();
        } else if (isStudent) {
          console.log("Loading available schedules for student");
          await fetchAvailableSchedules();
        }
      } catch (error) {
        console.error("Failed to load schedules:", error);
        // Don't throw error to prevent useEffect loop
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isGuidance, isStudent]); // Depend on user and user type to reload when context is available

  // Fetch pending appointment requests for guidance counselors
  const fetchPendingRequests = async () => {
    if (!isGuidance || !user?.id) return;

    setPendingRequestsLoading(true);
    try {
      // Use HttpClient for authenticated requests with proper base URL
      const response = await HttpClient.get<{
        appointments: Appointment[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/appointment/counselor/${user.id}`);

      // Filter for pending requests
      const pending = response.appointments.filter(
        (appointment: Appointment) => appointment.status === "pending"
      );
      setPendingRequests(pending);
    } catch (err) {
      console.error("Failed to fetch pending requests:", err);
      error("Error", "Failed to fetch pending appointment requests. Please try again.");
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
              new Date(appointment.requestedDate).getTime() + (appointment.duration || 60) * 60000
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
      setCalendarModalMode(activeTab === "schedules" && isGuidance ? "schedule" : "appointment");
      setIsCalendarModalOpen(true);
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

  const handleCreateFromCalendar = async (data: any) => {
    try {
      if (calendarModalMode === "appointment") {
        await createAppointment(data);
        success("Appointment Created", "Your appointment has been successfully created.");
        // Refresh appointments
        if (isStudent) {
          await fetchAppointmentsByStudentId(user?.id || "");
        } else if (isGuidance) {
          await fetchAppointmentsByCounselorId(user?.id || "");
        }
      } else {
        await createSchedule(data);
        success("Schedule Created", "Your schedule has been successfully created.");
        // Refresh schedules
        await fetchSchedules();
      }
      setIsCalendarModalOpen(false);
    } catch (err) {
      console.error("Failed to create from calendar:", err);
      error("Creation Failed", "Failed to create. Please try again.");
      throw err;
    }
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
        "Your appointment request has been submitted successfully. The counselor will review and respond soon."
      );

      // Refresh appointments
      if (user?.id) {
        await fetchAppointmentsByStudentId(user.id);
      }

      setIsRequestAppointmentModalOpen(false);
    } catch (err) {
      console.error("Failed to submit appointment request:", err);
      error("Request Failed", "Failed to submit appointment request. Please try again.");
      throw err;
    }
  };

  // Pending requests handlers
  const handleApproveRequest = async (request: Appointment) => {
    try {
      await updateAppointment(request.id, { status: "confirmed" });
      success(
        "Request Approved",
        `Appointment with ${request.student?.person?.firstName} ${request.student?.person?.lastName} has been approved.`
      );

      // Refresh pending requests and appointments
      await fetchPendingRequests();
      if (user?.id) {
        await fetchAppointmentsByCounselorId(user.id);
      }
    } catch (err) {
      console.error("Failed to approve request:", err);
      error("Approval Failed", "Failed to approve appointment request. Please try again.");
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
        `Appointment request from ${request.student?.person?.firstName} ${request.student?.person?.lastName} has been denied.`
      );

      // Refresh pending requests and appointments
      await fetchPendingRequests();
      if (user?.id) {
        await fetchAppointmentsByCounselorId(user.id);
      }
    } catch (err) {
      console.error("Failed to deny request:", err);
      error("Denial Failed", "Failed to deny appointment request. Please try again.");
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
        await fetchAppointmentsByStudentId(user?.id || "");
        await fetchAvailableSchedules(); // Refresh available schedules for student
      } else if (isGuidance) {
        await fetchAppointmentsByCounselorId(user?.id || "");
        await fetchSchedules(); // Refresh schedules for guidance
      }
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      error("Cancellation Failed", "Failed to cancel appointment. Please try again.");
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
        `Appointment with ${appointment.student?.person?.firstName} ${appointment.student?.person?.lastName} has been marked as completed.`
      );

      // Refresh the list
      if (isStudent) {
        await fetchAppointmentsByStudentId(user?.id || "");
      } else if (isGuidance) {
        await fetchAppointmentsByCounselorId(user?.id || "");
      }
    } catch (err) {
      console.error("Failed to complete appointment:", err);
      error("Completion Failed", "Failed to mark appointment as completed. Please try again.");
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId);
      // Refresh the list
      if (isStudent) {
        await fetchAppointmentsByStudentId(user?.id || "");
      } else if (isGuidance) {
        await fetchAppointmentsByCounselorId(user?.id || "");
      }
    } catch (error) {
      console.error("Failed to delete appointment:", error);
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
        await fetchAppointmentsByStudentId(user?.id || "");
      } else if (isGuidance) {
        await fetchAppointmentsByCounselorId(user?.id || "");
      }
    } catch (err) {
      console.error("Failed to save appointment:", err);
      error("Save Failed", "Failed to save appointment. Please try again.");
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
      fetchSchedules(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  const handleSaveSchedule = async (scheduleData: Partial<Schedule>) => {
    try {
      if (selectedSchedule) {
        await updateSchedule(selectedSchedule.id, scheduleData);
      } else {
        await createSchedule(
          scheduleData as Omit<
            Schedule,
            "id" | "createdAt" | "updatedAt" | "isDeleted" | "bookedSlots"
          >
        );
      }
      setIsScheduleModalOpen(false);
      fetchSchedules(); // Refresh the list
    } catch (error) {
      console.error("Failed to save schedule:", error);
      throw error;
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
            existingAppointment?.requestedDate || ""
          ).toLocaleDateString()}. Cancel it first to book again.`
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
        appointmentType: "consultation" as const,
        requestedDate: schedule.startTime,
        status: "confirmed" as const, // Students booking from available schedules get confirmed status
        priority: "normal" as const,
        location: schedule.location || "",
        duration: 60, // Default duration
      };

      await createAppointment(appointmentData);
      success(
        "Appointment Booked",
        `Your appointment for "${schedule.title}" has been successfully booked.`
      );

      // Refresh data
      if (isStudent) {
        await fetchAppointmentsByStudentId(user?.id || "");
        await fetchAvailableSchedules();
      } else if (isGuidance) {
        await fetchAppointmentsByCounselorId(user?.id || "");
        await fetchSchedules();
      }
    } catch (err) {
      console.error("Failed to book appointment:", err);
      error("Booking Failed", "Failed to book appointment. Please try again.");
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
        appointment.status !== "completed"
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
          appointment.status !== "completed"
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
        onClose={() => setIsAppointmentModalOpen(false)}
        onSubmit={handleSaveAppointment}
        appointment={selectedAppointment}
        loading={appointmentsLoading}
        mode={appointmentModalMode}
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
          onClose={() => setIsScheduleModalOpen(false)}
          onSave={handleSaveSchedule}
          schedule={selectedSchedule}
          loading={schedulesLoading}
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

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDate={selectedDate}
        onCreateAppointment={
          calendarModalMode === "appointment" ? handleCreateFromCalendar : undefined
        }
        onCreateSchedule={calendarModalMode === "schedule" ? handleCreateFromCalendar : undefined}
        loading={appointmentsLoading || schedulesLoading}
        mode={calendarModalMode}
      />

      {/* Date Events Drawer */}
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
