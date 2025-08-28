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
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/services";

interface AppointmentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onMessage?: (appointment: Appointment) => void;
  loading?: boolean;
  userType?: "student" | "guidance";
}

export const AppointmentViewModal: React.FC<AppointmentViewModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onCancel,
  onComplete,
  onReschedule,
  onMessage,
  loading = false,
  userType = "student",
}) => {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
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

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case "consultation":
        return "Consultation";
      case "counseling":
        return "Counseling";
      case "follow_up":
        return "Follow Up";
      case "emergency":
        return "Emergency";
      case "group_session":
        return "Group Session";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const canCancel = appointment.status === "confirmed" || appointment.status === "pending";
  const canComplete = appointment.status === "confirmed" && userType === "guidance";
  const canReschedule = appointment.status !== "completed" && appointment.status !== "cancelled";
  const canEdit = userType === "guidance" || appointment.status === "pending";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{appointment.title}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                    getStatusColor(appointment.status)
                  )}
                >
                  {getStatusIcon(appointment.status)}
                  <span className="ml-1">
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </span>
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                    getPriorityColor(appointment.priority)
                  )}
                >
                  {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)}{" "}
                  Priority
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  {getAppointmentTypeLabel(appointment.appointmentType)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Details */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                Date & Time
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{formatDate(appointment.requestedDate)}</span>
                </p>
                <p className="text-sm text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  {formatTime(appointment.requestedDate)} ({appointment.duration} minutes)
                </p>
              </div>
            </div>

            {/* Location */}
            {appointment.location && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  Location
                </h3>
                <p className="text-sm text-gray-700">{appointment.location}</p>
              </div>
            )}

            {/* Description */}
            {appointment.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {appointment.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Participants & Actions */}
          <div className="space-y-6">
            {/* Student Information */}
            {appointment.student && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Student
                </h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {appointment.student.person?.firstName} {appointment.student.person?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Student ID: {appointment.student.studentNumber}
                  </p>
                  {appointment.student.person?.email && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      {appointment.student.person.email}
                    </p>
                  )}
                  {appointment.student.person?.contactNumber && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      {appointment.student.person.contactNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Counselor Information */}
            {appointment.counselor && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Guidance Counselor
                </h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {appointment.counselor.person?.firstName}{" "}
                    {appointment.counselor.person?.lastName}
                  </p>
                  {appointment.counselor.person?.email && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      {appointment.counselor.person.email}
                    </p>
                  )}
                  {appointment.counselor.person?.contactNumber && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      {appointment.counselor.person.contactNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation Reason */}
            {appointment.status === "cancelled" && appointment.cancellationReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                  Cancellation Reason
                </h3>
                <p className="text-sm text-red-700">{appointment.cancellationReason}</p>
              </div>
            )}

            {/* Completion Notes */}
            {appointment.status === "completed" && appointment.completionNotes && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  Session Notes
                </h3>
                <p className="text-sm text-green-700 whitespace-pre-wrap">
                  {appointment.completionNotes}
                </p>
              </div>
            )}

            {/* Follow-up Information */}
            {appointment.followUpRequired && appointment.followUpDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Follow-up Required</h3>
                <p className="text-sm text-blue-700">
                  Scheduled for: {formatDate(appointment.followUpDate)} at{" "}
                  {formatTime(appointment.followUpDate)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {onMessage && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onMessage(appointment)}
                disabled={loading}
                className="flex items-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {canReschedule && onReschedule && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onReschedule(appointment)}
                disabled={loading}
              >
                Reschedule
              </Button>
            )}

            {canEdit && onEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onEdit(appointment)}
                disabled={loading}
                className="flex items-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}

            {canComplete && onComplete && (
              <Button
                type="button"
                onClick={() => onComplete(appointment)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Mark Complete
              </Button>
            )}

            {canCancel && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onCancel(appointment)}
                disabled={loading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel
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
