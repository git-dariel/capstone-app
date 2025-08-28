import { cn } from "@/lib/utils";
import type { Appointment, Schedule } from "@/services";
import { Calendar, Clock, MapPin, User, X } from "lucide-react";
import React from "react";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  color: string;
  type: "appointment" | "schedule";
  data: Appointment | Schedule;
}

interface DateEventsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  userType?: string;
  hasActiveAppointmentForSchedule?: (scheduleId: string) => boolean;
}

export const DateEventsDrawer: React.FC<DateEventsDrawerProps> = ({
  isOpen,
  onClose,
  date,
  events,
  onEventClick,
  userType,
  hasActiveAppointmentForSchedule,
}) => {
  if (!isOpen || !date) return null;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (startTime: Date, endTime: Date): string => {
    const start = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const end = endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${start} - ${end}`;
  };

  const getEventIcon = (type: string) => {
    return type === "appointment" ? <User className="w-4 h-4" /> : <Calendar className="w-4 h-4" />;
  };

  const getEventDetails = (event: CalendarEvent) => {
    if (event.type === "appointment") {
      const appointment = event.data as Appointment;
      return {
        status: appointment.status,
        location: appointment.location,
        description: appointment.description,
        priority: appointment.priority,
      };
    } else {
      const schedule = event.data as Schedule;
      return {
        status: schedule.status,
        location: schedule.location,
        description: schedule.description,
        maxSlots: schedule.maxSlots,
        bookedSlots: schedule.bookedSlots,
      };
    }
  };

  const isEventClickable = (event: CalendarEvent): boolean => {
    return (
      userType === "guidance" ||
      event.type === "appointment" ||
      (event.type === "schedule" && (event.data as Schedule).status === "available")
    );
  };

  return (
    <>
      {/* Drawer without backdrop - cleaner approach */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 transform transition-transform border-l border-gray-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Events</h2>
              <p className="text-sm text-gray-600">{formatDate(date)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Calendar className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-center">No events for this date</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {events.map((event) => {
                  const details = getEventDetails(event);
                  const hasExistingAppointment =
                    event.type === "schedule" && hasActiveAppointmentForSchedule
                      ? hasActiveAppointmentForSchedule((event.data as Schedule).id)
                      : false;
                  const isClickable = isEventClickable(event);

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        hasExistingAppointment
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300",
                        isClickable ? "cursor-pointer hover:shadow-md" : "cursor-default opacity-60"
                      )}
                      onClick={() => {
                        if (isClickable) {
                          onEventClick?.(event);
                        }
                      }}
                    >
                      {/* Event Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-2">
                          <div className={cn("p-1 rounded", event.color)}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {event.title}
                              {hasExistingAppointment && (
                                <span className="ml-2 text-xs text-orange-600 font-normal">
                                  (You have an appointment)
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(event.startTime, event.endTime)}
                            </div>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            event.color
                          )}
                        >
                          {details.status}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2">
                        {details.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                            {details.location}
                          </div>
                        )}

                        {details.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {details.description}
                          </p>
                        )}

                        {event.type === "schedule" && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Slots: {(details as any).bookedSlots}/{(details as any).maxSlots}
                            </span>
                            {(details as any).priority && (
                              <span className="capitalize">
                                Priority: {(details as any).priority}
                              </span>
                            )}
                          </div>
                        )}

                        {event.type === "appointment" && (details as any).priority && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="capitalize">
                              Priority: {(details as any).priority}
                            </span>
                          </div>
                        )}

                        {!isClickable && userType === "student" && event.type === "schedule" && (
                          <div className="text-xs text-gray-500 italic">
                            Not available for booking
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {events.length} {events.length === 1 ? "event" : "events"} on this date
              {userType === "student" && (
                <span className="block mt-1">
                  Click on available schedules to book an appointment
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
