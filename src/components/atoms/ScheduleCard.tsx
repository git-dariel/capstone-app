import React from "react";
import { cn } from "@/lib/utils";
import { ScheduleService } from "@/services";
import type { Schedule } from "@/services";

interface ScheduleCardProps {
  schedule: Schedule;
  onClick?: () => void;
  onBook?: () => void;
  showBookingButton?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onClick,
  onBook,
  showBookingButton = false,
  className = "",
  size = "md",
}) => {
  const statusInfo = ScheduleService.getStatusDisplayInfo(schedule.status);
  const canBook = ScheduleService.canBookSchedule(schedule);
  const availabilityPercentage = ScheduleService.getAvailabilityPercentage(schedule);
  const formattedTime = ScheduleService.formatScheduleTime(schedule.startTime, schedule.endTime);
  const duration = ScheduleService.getDurationInMinutes(schedule.startTime, schedule.endTime);
  const recurringDisplay = ScheduleService.getRecurringTypeDisplay(schedule.recurringType);

  const sizeClasses = {
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-4 sm:p-6",
  };

  const titleSizes = {
    sm: "text-sm font-medium",
    md: "text-base font-semibold",
    lg: "text-lg font-semibold",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary-300",
        !canBook && "opacity-75",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className={cn("text-gray-900 mb-1", titleSizes[size])}>{schedule.title}</h3>
          {schedule.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{schedule.description}</p>
          )}
        </div>

        {/* Status Badge */}
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            statusInfo.bgColor,
            statusInfo.color
          )}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Schedule Details */}
      <div className="space-y-2">
        {/* Time */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🕐</span>
          <span className="font-medium">{formattedTime}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">⏱️</span>
          <span>{duration} minutes</span>
        </div>

        {/* Location */}
        {schedule.location && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span>{schedule.location}</span>
          </div>
        )}

        {/* Counselor */}
        {schedule.counselor && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">👨‍💼</span>
            <span>
              {schedule.counselor.person.firstName} {schedule.counselor.person.lastName}
            </span>
          </div>
        )}

        {/* Availability */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Available Slots: {schedule.maxSlots - schedule.currentSlots}/{schedule.maxSlots}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                availabilityPercentage > 50
                  ? "text-green-600"
                  : availabilityPercentage > 20
                  ? "text-yellow-600"
                  : "text-red-600"
              )}
            >
              {availabilityPercentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                availabilityPercentage > 50
                  ? "bg-green-500"
                  : availabilityPercentage > 20
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${availabilityPercentage}%` }}
            />
          </div>
        </div>

        {/* Recurring info */}
        {schedule.isRecurring && (
          <div className="flex items-center text-sm text-purple-600">
            <span className="mr-2">🔄</span>
            <span>{recurringDisplay}</span>
          </div>
        )}

        {/* Notes */}
        {schedule.notes && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{schedule.notes}</p>
          </div>
        )}
      </div>

      {/* Book Button */}
      {showBookingButton && onBook && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            disabled={!canBook}
            className={cn(
              "w-full px-4 py-2 text-sm font-medium rounded-md transition-colors",
              canBook
                ? "bg-primary-700 hover:bg-primary-800 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {canBook ? "Book Appointment" : "Not Available"}
          </button>
        </div>
      )}

      {/* Full indicator */}
      {!canBook &&
        schedule.status === "available" &&
        schedule.currentSlots >= schedule.maxSlots && (
          <div className="mt-2 text-center">
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
              Fully Booked
            </span>
          </div>
        )}
    </div>
  );
};
