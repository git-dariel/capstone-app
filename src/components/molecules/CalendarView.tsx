import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment, Schedule } from "@/services";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  type: "appointment" | "schedule";
  status?: string;
  color: string;
  data: Appointment | Schedule;
}

interface CalendarViewProps {
  appointments: Appointment[];
  schedules: Schedule[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  loading?: boolean;
  className?: string;
  userType?: "student" | "guidance";
  hasActiveAppointmentForSchedule?: (scheduleId: string) => boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  schedules,
  onDateClick,
  onEventClick,
  loading = false,
  className = "",
  userType = "student",
  hasActiveAppointmentForSchedule,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for mobile responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Convert appointments and schedules to calendar events
  const events: CalendarEvent[] = [
    ...appointments.map(
      (appointment): CalendarEvent => ({
        id: appointment.id,
        title: appointment.title,
        date: new Date(appointment.requestedDate),
        startTime: new Date(appointment.requestedDate),
        endTime: new Date(
          new Date(appointment.requestedDate).getTime() + appointment.duration * 60000
        ),
        type: "appointment",
        status: appointment.status,
        color: getAppointmentColor(appointment.status),
        data: appointment,
      })
    ),
    ...schedules.map(
      (schedule): CalendarEvent => ({
        id: schedule.id,
        title: schedule.title,
        date: new Date(schedule.startTime),
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        type: "schedule",
        status: schedule.status,
        color: getScheduleColor(schedule.status),
        data: schedule,
      })
    ),
  ];

  // Get first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  // Generate calendar days
  const days = [];
  const currentDateCopy = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDateCopy));
    currentDateCopy.setDate(currentDateCopy.getDate() + 1);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Only trigger callback for guidance users or if there are available schedules on this date
    if (userType === "guidance") {
      onDateClick?.(date);
    } else {
      // For students, only allow if there are available schedules on this date
      const dateEvents = getEventsForDate(date);
      const hasAvailableSchedules = dateEvents.some(
        (event) => event.type === "schedule" && event.data.status === "available"
      );
      if (hasAvailableSchedules) {
        // Don't trigger onDateClick for students - they should click the specific schedule event
        return;
      }
    }
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => event.date.toDateString() === date.toDateString());
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  if (loading) {
    return (
      <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}>
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading calendar...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      {/* Calendar Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center space-x-2 sm:hidden">
              <button
                onClick={goToPreviousMonth}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
            >
              Today
            </button>
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2 sm:p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-8 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-500"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-16 sm:min-h-24 p-1 border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
                  !isCurrentMonth(day) && "bg-gray-50 text-gray-400",
                  isToday(day) && "bg-primary-50 border-primary-200",
                  isSelected(day) && "bg-primary-100 border-primary-300"
                )}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex flex-col h-full">
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-medium",
                        isToday(day) && "text-primary-700",
                        !isCurrentMonth(day) && "text-gray-400"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {hasEvents && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Events */}
                  <div className="flex-1 space-y-0.5 sm:space-y-1 overflow-hidden">
                    {dayEvents.slice(0, isMobile ? 1 : 2).map((event) => {
                      const hasExistingAppointment =
                        event.type === "schedule" && hasActiveAppointmentForSchedule
                          ? hasActiveAppointmentForSchedule(event.data.id)
                          : false;

                      const isClickable =
                        userType === "guidance" ||
                        event.type === "appointment" ||
                        (event.type === "schedule" && event.data.status === "available");

                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "px-1 py-0.5 rounded text-xs font-medium truncate transition-all relative",
                            event.color,
                            hasExistingAppointment
                              ? "border-2 border-orange-400 bg-orange-100 text-orange-800"
                              : event.color,
                            isClickable
                              ? "cursor-pointer hover:opacity-80 hover:scale-105"
                              : "cursor-default opacity-60"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isClickable) {
                              onEventClick?.(event);
                            }
                          }}
                          title={`${event.title} - ${event.startTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}${
                            hasExistingAppointment
                              ? " (You have an appointment for this schedule)"
                              : !isClickable && userType === "student"
                              ? " (Not available for booking)"
                              : ""
                          }`}
                        >
                          <span className="hidden sm:inline">{event.title}</span>
                          <span className="sm:hidden">•</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > (isMobile ? 1 : 2) && (
                      <div className="text-xs text-gray-500 px-1">
                        <span className="hidden sm:inline">+{dayEvents.length - 2} more</span>
                        <span className="sm:hidden">+{dayEvents.length - 1}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-600">Appointments</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span className="text-gray-600">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span className="text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for colors
function getAppointmentColor(status: string): string {
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
}

function getScheduleColor(status: string): string {
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
}
