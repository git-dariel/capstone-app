import React from "react";
import { cn } from "@/lib/utils";
import { AppointmentService } from "@/services";
import type { Appointment } from "@/services";

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  showActions?: boolean;
  onCancel?: () => void;
  onReschedule?: () => void;
  onComplete?: () => void;
  className?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
  showActions = false,
  onCancel,
  onReschedule,
  onComplete,
  className = "",
}) => {
  const statusInfo = AppointmentService.getStatusDisplayInfo(appointment.status);
  const priorityInfo = AppointmentService.getPriorityDisplayInfo(appointment.priority);
  const typeInfo = AppointmentService.getTypeDisplayInfo(appointment.appointmentType);

  const canCancel = AppointmentService.canCancelAppointment(appointment);
  const canReschedule = AppointmentService.canRescheduleAppointment(appointment);
  const canComplete = appointment.status === "confirmed";

  const formattedDate = AppointmentService.formatAppointmentDate(appointment.requestedDate);

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary-300",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{appointment.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{appointment.description}</p>
        </div>

        {/* Status Badge */}
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              statusInfo.bgColor,
              statusInfo.color
            )}
          >
            {statusInfo.label}
          </span>

          {appointment.priority !== "normal" && (
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                priorityInfo.bgColor,
                priorityInfo.color
              )}
            >
              {priorityInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {/* Date and Type */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📅</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">{typeInfo.icon}</span>
            <span>{typeInfo.label}</span>
          </div>
        </div>

        {/* Duration and Location */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {appointment.duration && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">⏱️</span>
              <span>{appointment.duration} minutes</span>
            </div>
          )}
          {appointment.location && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📍</span>
              <span>{appointment.location}</span>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="space-y-2">
          {appointment.student && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">👨‍🎓</span>
              <span>
                {appointment.student.person.firstName} {appointment.student.person.lastName}
                {appointment.student.studentNumber && (
                  <span className="ml-2 text-gray-500">({appointment.student.studentNumber})</span>
                )}
              </span>
            </div>
          )}
          {appointment.counselor && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">👨‍💼</span>
              <span>
                {appointment.counselor.person.firstName} {appointment.counselor.person.lastName}
              </span>
            </div>
          )}
        </div>

        {/* Follow-up info */}
        {appointment.followUpRequired && appointment.followUpDate && (
          <div className="flex items-center text-sm text-orange-600">
            <span className="mr-2">📝</span>
            <span>
              Follow-up scheduled for {new Date(appointment.followUpDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Completion notes */}
        {appointment.completionNotes && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <span className="font-medium">Notes:</span> {appointment.completionNotes}
            </p>
          </div>
        )}

        {/* Cancellation reason */}
        {appointment.cancellationReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <span className="font-medium">Cancelled:</span> {appointment.cancellationReason}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (onCancel || onReschedule || onComplete) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {canComplete && onComplete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
              >
                Mark Complete
              </button>
            )}
            {canReschedule && onReschedule && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReschedule();
                }}
                className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
              >
                Reschedule
              </button>
            )}
            {canCancel && onCancel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
