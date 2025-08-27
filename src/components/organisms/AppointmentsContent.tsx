import React, { useState, useEffect } from "react";
import {
  AppointmentsTable,
  AppointmentModal,
  SchedulesTable,
  ScheduleModal,
} from "@/components/molecules";
import { useAppointments, useSchedules, useAuth } from "@/hooks";
import { AppointmentService } from "@/services";
import type { Appointment, Schedule } from "@/services";

interface AppointmentsContentProps {
  activeTab?: "appointments" | "schedules";
  onTabChange?: (tab: "appointments" | "schedules") => void;
}

export const AppointmentsContent: React.FC<AppointmentsContentProps> = ({
  activeTab = "appointments",
  onTabChange,
}) => {
  const { user } = useAuth();
  const isGuidance = user?.type === "guidance";
  const isStudent = user?.type === "student";

  // State for modals
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Hooks for data management
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    fetchAppointments,
    fetchAppointmentsByStudentId,
    fetchAppointmentsByCounselorId,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

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

  // Handle tab changes
  const handleTabClick = (tab: "appointments" | "schedules") => {
    onTabChange?.(tab);
  };

  // Appointment handlers
  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      await AppointmentService.updateAppointment(appointment.id, {
        status: "cancelled",
        cancellationReason: "Cancelled by user",
      });
      // Refresh the list
      if (isStudent) {
        await fetchAppointmentsByStudentId(user?.id || "");
      } else if (isGuidance) {
        await fetchAppointmentsByCounselorId(user?.id || "");
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
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
        completionNotes: "Session completed successfully",
      });
      // Refresh the list
      if (isStudent) {
        await fetchAppointmentsByStudentId(user?.id || "");
      } else if (isGuidance) {
        await fetchAppointmentsByCounselorId(user?.id || "");
      }
    } catch (error) {
      console.error("Failed to complete appointment:", error);
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
      } else {
        await createAppointment(appointmentData);
      }
      setIsAppointmentModalOpen(false);
      // Refresh the list
      if (isStudent) {
        await fetchAppointmentsByStudentId(user?.id || "");
      } else if (isGuidance) {
        await fetchAppointmentsByCounselorId(user?.id || "");
      }
    } catch (error) {
      console.error("Failed to save appointment:", error);
      throw error;
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
      // Create appointment data for the selected schedule
      const appointmentData = {
        studentId: user?.id || "",
        counselorId: schedule.counselorId,
        scheduleId: schedule.id,
        title: `Appointment: ${schedule.title}`,
        description: schedule.description || "",
        appointmentType: "consultation" as const,
        requestedDate: schedule.startTime,
        priority: "normal" as const,
        location: schedule.location || "",
        duration: 60, // Default duration
      };

      await createAppointment(appointmentData);

      // Refresh data
      if (isStudent) {
        await fetchAppointmentsByStudentId(user?.id || "");
        await fetchAvailableSchedules();
      } else if (isGuidance) {
        await fetchAppointmentsByCounselorId(user?.id || "");
        await fetchSchedules();
      }

      alert("Appointment booked successfully!");
    } catch (error) {
      console.error("Failed to book appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const hasError = appointmentsError || schedulesError;

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => handleTabClick("appointments")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "appointments"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Appointments
            {appointments.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {appointments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabClick("schedules")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "schedules"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {isStudent ? "Available Schedules" : "Schedules"}
            {(isStudent ? availableSchedules : schedules).length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {(isStudent ? availableSchedules : schedules).length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === "appointments"
              ? "Appointments"
              : isStudent
              ? "Available Schedules"
              : "Schedules"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === "appointments"
              ? isStudent
                ? "View your booked appointments with guidance counselors"
                : "View students who booked your scheduled sessions"
              : isStudent
              ? "Browse available counseling schedules to book appointments"
              : "Configure available time slots and schedules"}
          </p>
        </div>
        {/* Only show action buttons for guidance counselors */}
        {/* {isGuidance && (
          <button
            onClick={activeTab === "appointments" ? handleCreateAppointment : handleCreateSchedule}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="mr-2">+</span>
            {activeTab === "appointments" ? "New Appointment" : "New Schedule"}
          </button>
        )} */}
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
      {activeTab === "appointments" && (
        <AppointmentsTable
          appointments={appointments}
          loading={appointmentsLoading}
          onEdit={handleEditAppointment}
          onView={handleViewAppointment}
          onCancel={handleCancelAppointment}
          onReschedule={handleRescheduleAppointment}
          onComplete={handleCompleteAppointment}
          onDelete={handleDeleteAppointment}
          showActions={true}
          searchable={true}
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
        />
      )}

      {/* Modals */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSubmit={handleSaveAppointment}
        appointment={selectedAppointment}
        loading={appointmentsLoading}
        mode={selectedAppointment ? "edit" : "create"}
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
    </div>
  );
};
