import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");

  // Helper function to get current date in Philippine time
  const getPhilippinesDate = () => {
    const now = new Date();
    // Philippine time is UTC+8
    const philippinesTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    // Reset to start of day in Philippine time
    return new Date(
      philippinesTime.getFullYear(),
      philippinesTime.getMonth(),
      philippinesTime.getDate()
    );
  };

  // Helper function to get current time in Philippine time
  const getPhilippinesTime = () => {
    const now = new Date();
    // Philippine time is UTC+8
    const philippinesTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    return philippinesTime;
  };

  // Helper function to format time in 12-hour format with AM/PM
  const formatTime12Hour = (hour: number): string => {
    if (hour === 0) return "12:00 AM";
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return "12:00 PM";
    return `${hour - 12}:00 PM`;
  };

  // Helper function to check if current time is past available hours (8 AM - 8 PM)
  const isPastAvailableTime = (date: Date): boolean => {
    const today = getPhilippinesDate();
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // If it's not today, it's not past available time
    if (compareDate.toDateString() !== today.toDateString()) {
      return false;
    }

    const currentTime = getPhilippinesTime();
    const currentHour = currentTime.getHours();

    // Available hours are 8 AM to 8 PM (20:00)
    return currentHour >= 20;
  };

  // Helper function to get the next available day
  const getNextAvailableDay = (date: Date): Date => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };

  // Helper function to check if a date is in the past (Philippine time)
  const isPastDate = (date: Date): boolean => {
    const today = getPhilippinesDate();
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return compareDate < today;
  };

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

  // Get week start date (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Get week dates
  const getWeekDates = (date: Date) => {
    const start = getWeekStart(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const handleDateClick = (date: Date) => {
    // Don't allow clicking on past dates
    if (isPastDate(date)) {
      return;
    }

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
    const today = getPhilippinesDate();
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return compareDate.toDateString() === today.toDateString();
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
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100", className)}>
      {/* Modern Calendar Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Left Section - Date Navigation */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={goToPreviousMonth}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
          </div>

          {/* Right Section - View Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("month")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  viewMode === "month"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  viewMode === "week"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("day")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  viewMode === "day"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                Day
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {viewMode === "month" ? (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px mb-4">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="h-12 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-t-lg"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {days.map((day) => {
                const dayEvents = getEventsForDate(day);
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[120px] bg-white p-3 transition-all duration-200 relative",
                      !isCurrentMonth(day) && "bg-gray-50 text-gray-400",
                      isToday(day) && "bg-blue-50 border-l-4 border-l-blue-500",
                      isSelected(day) && "bg-blue-100 ring-2 ring-blue-200",
                      isPastDate(day) && "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60",
                      !isPastDate(day) && "hover:bg-gray-50 cursor-pointer"
                    )}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="flex flex-col h-full">
                      {/* Date Number */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isToday(day) && "text-blue-600 bg-blue-100 px-2 py-1 rounded-full",
                            !isCurrentMonth(day) && "text-gray-400"
                          )}
                        >
                          {day.getDate()}
                        </span>
                        {hasEvents && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>

                      {/* Events */}
                      <div className="flex-1 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event) => {
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
                                "px-2 py-1 rounded-md text-xs font-medium truncate transition-all duration-200 relative group",
                                hasExistingAppointment
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : event.color,
                                isClickable
                                  ? "cursor-pointer hover:shadow-sm hover:scale-[1.02]"
                                  : "cursor-default opacity-60"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isClickable) {
                                  onEventClick?.(event);
                                }
                              }}
                              title={`${event.title} - ${event.startTime.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}${
                                hasExistingAppointment
                                  ? " (You have an appointment for this schedule)"
                                  : !isClickable && userType === "student"
                                  ? " (Not available for booking)"
                                  : ""
                              }`}
                            >
                              <span className="block truncate">{event.title}</span>
                              <span className="text-xs opacity-75">
                                {event.startTime.toLocaleTimeString([], {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : viewMode === "week" ? (
          <>
            {/* Week View */}
            <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Time column */}
              <div className="bg-gray-50 p-3">
                <div className="text-sm font-semibold text-gray-600 text-center">Time</div>
              </div>

              {/* Day columns */}
              {getWeekDates(currentDate).map((day) => (
                <div key={day.toISOString()} className="bg-gray-50 p-3">
                  <div className="text-sm font-semibold text-gray-600 text-center">
                    {dayNames[day.getDay()]}
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">{day.getDate()}</div>
                </div>
              ))}

              {/* Time slots */}
              {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                <React.Fragment key={hour}>
                  <div className="bg-white p-2 border-r border-gray-100">
                    <div className="text-xs text-gray-500 text-right">{formatTime12Hour(hour)}</div>
                  </div>
                  {getWeekDates(currentDate).map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const hourEvents = dayEvents.filter(
                      (event) => event.startTime.getHours() === hour
                    );

                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className={cn(
                          "bg-white p-1 border-r border-gray-100 min-h-[40px] transition-colors",
                          isToday(day) && "bg-blue-50",
                          isPastDate(day) && "bg-gray-100 cursor-not-allowed opacity-60",
                          !isPastDate(day) && "hover:bg-gray-50 cursor-pointer"
                        )}
                        onClick={() => handleDateClick(day)}
                      >
                        {hourEvents.map((event) => {
                          const isClickable =
                            userType === "guidance" ||
                            event.type === "appointment" ||
                            (event.type === "schedule" && event.data.status === "available");

                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "px-2 py-1 rounded text-xs font-medium truncate transition-all",
                                event.color,
                                isClickable
                                  ? "cursor-pointer hover:opacity-80"
                                  : "cursor-default opacity-60"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isClickable) {
                                  onEventClick?.(event);
                                }
                              }}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </>
        ) : (
          /* Day View */
          (() => {
            // Auto-advance to next day if current day is past available time
            const shouldAutoAdvance = isPastAvailableTime(currentDate) && !isPastDate(currentDate);
            const displayDate = shouldAutoAdvance ? getNextAvailableDay(currentDate) : currentDate;

            return (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {displayDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  {shouldAutoAdvance && (
                    <p className="text-sm text-blue-600 mt-2">
                      Showing next available day (current day's available time has passed)
                    </p>
                  )}
                  {isPastDate(displayDate) && (
                    <p className="text-sm text-red-600 mt-2">
                      This date is in the past and cannot be modified.
                    </p>
                  )}
                </div>

                {isPastDate(displayDate) ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium">Past Date</p>
                    <p className="text-sm mt-2">This date is in the past and cannot be modified.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => {
                      const hourEvents = events.filter(
                        (event) =>
                          event.startTime.getHours() === hour &&
                          event.date.toDateString() === displayDate.toDateString()
                      );

                      return (
                        <div
                          key={hour}
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="w-20 text-sm font-medium text-gray-600">
                            {formatTime12Hour(hour)}
                          </div>
                          <div className="flex-1 space-y-2">
                            {hourEvents.length > 0 ? (
                              hourEvents.map((event) => {
                                const isClickable =
                                  userType === "guidance" ||
                                  event.type === "appointment" ||
                                  (event.type === "schedule" && event.data.status === "available");

                                return (
                                  <div
                                    key={event.id}
                                    className={cn(
                                      "p-3 rounded-lg transition-all",
                                      event.color,
                                      isClickable
                                        ? "cursor-pointer hover:shadow-md"
                                        : "cursor-default opacity-60"
                                    )}
                                    onClick={() => {
                                      if (isClickable) {
                                        onEventClick?.(event);
                                      }
                                    }}
                                  >
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-sm opacity-75">
                                      {event.startTime.toLocaleTimeString([], {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}{" "}
                                      -{" "}
                                      {event.endTime.toLocaleTimeString([], {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-gray-400 text-sm">No events</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>

      {/* Modern Legend */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-full"></div>
            <span className="text-gray-700 font-medium">Appointments</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
            <span className="text-gray-700 font-medium">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full"></div>
            <span className="text-gray-700 font-medium">Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></div>
            <span className="text-gray-700 font-medium">Cancelled</span>
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
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200";
  }
}

function getScheduleColor(status: string): string {
  switch (status) {
    case "available":
      return "bg-green-50 text-green-700 border border-green-200";
    case "booked":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    case "unavailable":
      return "bg-gray-50 text-gray-700 border border-gray-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200";
  }
}
