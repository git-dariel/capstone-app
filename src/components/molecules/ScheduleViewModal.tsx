import React from "react";
import { Modal } from "@/components/atoms";
import { Button } from "@/components/ui";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Users,
  CheckCircle2,
  XCircle,
  Edit3,
  CalendarPlus,
  Repeat,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Schedule, Appointment } from "@/services";

interface ScheduleViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (schedule: Schedule) => void;
  onBook?: (schedule: Schedule) => void;
  loading?: boolean;
  userType?: "student" | "guidance";
  hasActiveAppointmentForSchedule?: (scheduleId: string) => boolean;
  getExistingAppointmentForSchedule?: (scheduleId: string) => Appointment | null;
}

export const ScheduleViewModal: React.FC<ScheduleViewModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onEdit,
  onDelete,
  onBook,
  loading = false,
  userType = "student",
  hasActiveAppointmentForSchedule,
  getExistingAppointmentForSchedule,
}) => {
  if (!schedule) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "booked":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "unavailable":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="w-4 h-4" />;
      case "booked":
        return <Users className="w-4 h-4" />;
      case "unavailable":
        return <XCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRecurringTypeLabel = (type: string) => {
    switch (type) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "none":
      default:
        return "One Time";
    }
  };

  const getDuration = () => {
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);
    const diffInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    return diffInMinutes;
  };

  const getAvailabilityPercentage = () => {
    if (schedule.maxSlots === 0) return 0;
    return Math.round(((schedule.maxSlots - schedule.bookedSlots) / schedule.maxSlots) * 100);
  };

  const hasExistingAppointment = hasActiveAppointmentForSchedule?.(schedule.id) || false;
  const existingAppointment = getExistingAppointmentForSchedule?.(schedule.id) || null;

  const canBook =
    schedule.status === "available" &&
    schedule.bookedSlots < schedule.maxSlots &&
    userType === "student" &&
    !hasExistingAppointment;
  const canEdit = userType === "guidance";
  const canDelete = userType === "guidance";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{schedule.title}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                    getStatusColor(schedule.status)
                  )}
                >
                  {getStatusIcon(schedule.status)}
                  <span className="ml-1">
                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </span>
                </span>
                {schedule.isRecurring && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <Repeat className="w-3 h-3 mr-1" />
                    {getRecurringTypeLabel(schedule.recurringType)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Schedule Details */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                Schedule Time
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{formatDate(schedule.startTime)}</span>
                </p>
                <p className="text-sm text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                </p>
                <p className="text-xs text-gray-500">Duration: {getDuration()} minutes</p>
              </div>
            </div>

            {/* Location */}
            {schedule.location && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  Location
                </h3>
                <p className="text-sm text-gray-700">{schedule.location}</p>
              </div>
            )}

            {/* Description */}
            {schedule.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{schedule.description}</p>
              </div>
            )}

            {/* Notes */}
            {schedule.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{schedule.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Availability & Counselor */}
          <div className="space-y-6">
            {/* Availability */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                Availability
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Available Slots</span>
                  <span className="text-sm font-medium text-gray-900">
                    {schedule.maxSlots - schedule.bookedSlots} / {schedule.maxSlots}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      schedule.bookedSlots >= schedule.maxSlots
                        ? "bg-red-500"
                        : schedule.bookedSlots >= schedule.maxSlots * 0.8
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    )}
                    style={{
                      width: `${Math.min((schedule.bookedSlots / schedule.maxSlots) * 100, 100)}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{schedule.bookedSlots} booked</span>
                  <span className="text-gray-500">{getAvailabilityPercentage()}% available</span>
                </div>

                {schedule.bookedSlots >= schedule.maxSlots && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      This schedule is fully booked
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Counselor Information */}
            {schedule.counselor && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Guidance Counselor
                </h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {schedule.counselor.person?.firstName} {schedule.counselor.person?.lastName}
                  </p>
                  {schedule.counselor.person?.email && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      {schedule.counselor.person.email}
                    </p>
                  )}
                  {schedule.counselor.person?.contactNumber && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      {schedule.counselor.person.contactNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recurring Information */}
            {schedule.isRecurring && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-900 mb-2 flex items-center">
                  <Repeat className="w-4 h-4 mr-2 text-purple-600" />
                  Recurring Schedule
                </h3>
                <p className="text-sm text-purple-700">
                  This is a {getRecurringTypeLabel(schedule.recurringType).toLowerCase()} recurring
                  schedule
                </p>
              </div>
            )}

            {/* Booking Status */}
            {userType === "student" && (
              <>
                {hasExistingAppointment && existingAppointment ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-orange-900 mb-2 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-orange-600" />
                      Already Booked
                    </h3>
                    <p className="text-sm text-orange-700">
                      You already have an appointment for this schedule on{" "}
                      {new Date(existingAppointment.requestedDate).toLocaleDateString()}. Cancel
                      your existing appointment to book again.
                    </p>
                  </div>
                ) : canBook ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                      <CalendarPlus className="w-4 h-4 mr-2 text-green-600" />
                      Ready to Book
                    </h3>
                    <p className="text-sm text-green-700">
                      You can book an appointment for this schedule slot
                    </p>
                  </div>
                ) : schedule.bookedSlots >= schedule.maxSlots ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                      <XCircle className="w-4 h-4 mr-2 text-red-600" />
                      Fully Booked
                    </h3>
                    <p className="text-sm text-red-700">
                      This schedule is fully booked. No more appointments available.
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-6 border-t border-gray-200">
          <div>{/* Left side actions */}</div>

          <div className="flex flex-col sm:flex-row gap-2">
            {canBook && onBook && (
              <Button
                type="button"
                onClick={() => onBook(schedule)}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white flex items-center"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            )}

            {canEdit && onEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onEdit(schedule)}
                disabled={loading}
                className="flex items-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Schedule
              </Button>
            )}

            {canDelete && onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDelete(schedule)}
                disabled={loading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete
              </Button>
            )}

            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
