import React, { useState } from "react";
import { AppointmentService } from "@/services";
import type { Appointment } from "@/services";
import { ConfirmationModal } from "./ConfirmationModal";

interface AppointmentsTableProps {
  appointments: Appointment[];
  loading?: boolean;
  onEdit?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
  showActions?: boolean;
  searchable?: boolean;
  userType?: "student" | "guidance";
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  loading = false,
  onEdit,
  onView,
  onCancel,
  onReschedule,
  onComplete,
  onDelete,
  showActions = true,
  searchable = true,
  userType = "student",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter((appointment) => {
    const searchText = searchTerm.toLowerCase();
    return (
      appointment.title.toLowerCase().includes(searchText) ||
      appointment.description?.toLowerCase().includes(searchText) ||
      appointment.student?.person.firstName.toLowerCase().includes(searchText) ||
      appointment.student?.person.lastName.toLowerCase().includes(searchText) ||
      appointment.counselor?.person.firstName.toLowerCase().includes(searchText) ||
      appointment.counselor?.person.lastName.toLowerCase().includes(searchText) ||
      appointment.appointmentType.toLowerCase().includes(searchText) ||
      appointment.status.toLowerCase().includes(searchText)
    );
  });

  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (appointmentToDelete && onDelete) {
      onDelete(appointmentToDelete.id);
    }
    setShowDeleteConfirm(false);
    setAppointmentToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header with Search */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 touch-manipulation"
            />
            <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">🔍</div>
          </div>
        </div>
      )}

      {/* Mobile Card Layout - visible on small screens */}
      <div className="block md:hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? "No appointments match your search." : "No appointments found."}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => {
              const statusInfo = AppointmentService.getStatusDisplayInfo(appointment.status);
              const priorityInfo = AppointmentService.getPriorityDisplayInfo(appointment.priority);
              const typeInfo = AppointmentService.getTypeDisplayInfo(appointment.appointmentType);
              const canCancel = AppointmentService.canCancelAppointment(appointment);
              const canReschedule =
                AppointmentService.canRescheduleAppointment(appointment) && userType === "guidance";
              const canComplete = appointment.status === "confirmed" && userType === "guidance";
              const canEdit = userType === "guidance";
              const canDelete = userType === "guidance";

              return (
                <div
                  key={appointment.id}
                  className="p-4 hover:bg-gray-50 touch-manipulation"
                  onClick={() => onView?.(appointment)}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1 min-w-0">
                      <span className="mr-2 flex-shrink-0">{typeInfo.icon}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {appointment.title}
                        </h3>
                        {appointment.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${statusInfo.bgColor} ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">Student:</span>
                      <span className="text-gray-900 truncate">
                        {appointment.student?.person.firstName}{" "}
                        {appointment.student?.person.lastName}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">Counselor:</span>
                      <span className="text-gray-900 truncate">
                        {appointment.counselor?.person.firstName}{" "}
                        {appointment.counselor?.person.lastName}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">Date:</span>
                      <span className="text-gray-900">{formatDate(appointment.requestedDate)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-20 flex-shrink-0">Duration:</span>
                        <span className="text-gray-900">{appointment.duration} min</span>
                      </div>
                      {appointment.priority !== "normal" && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}
                        >
                          {priorityInfo.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  {showActions && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      {canComplete && onComplete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onComplete(appointment);
                          }}
                          className="px-3 py-1 text-green-600 hover:text-green-900 text-xs font-medium border border-green-200 rounded-md hover:bg-green-50 touch-manipulation"
                        >
                          Complete
                        </button>
                      )}
                      {canReschedule && onReschedule && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReschedule(appointment);
                          }}
                          className="px-3 py-1 text-blue-600 hover:text-blue-900 text-xs font-medium border border-blue-200 rounded-md hover:bg-blue-50 touch-manipulation"
                        >
                          Reschedule
                        </button>
                      )}
                      {canEdit && onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(appointment);
                          }}
                          className="px-3 py-1 text-primary-600 hover:text-primary-900 text-xs font-medium border border-primary-200 rounded-md hover:bg-primary-50 touch-manipulation"
                        >
                          Edit
                        </button>
                      )}
                      {canCancel && onCancel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel(appointment);
                          }}
                          className="px-3 py-1 text-red-600 hover:text-red-900 text-xs font-medium border border-red-200 rounded-md hover:bg-red-50 touch-manipulation"
                        >
                          Cancel
                        </button>
                      )}
                      {canDelete && onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(appointment);
                          }}
                          className="px-3 py-1 text-gray-600 hover:text-red-600 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 touch-manipulation"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Table Layout - hidden on small screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appointment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Counselor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              {showActions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? "No appointments match your search." : "No appointments found."}
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => {
                const statusInfo = AppointmentService.getStatusDisplayInfo(appointment.status);
                const priorityInfo = AppointmentService.getPriorityDisplayInfo(
                  appointment.priority
                );
                const typeInfo = AppointmentService.getTypeDisplayInfo(appointment.appointmentType);
                const canCancel = AppointmentService.canCancelAppointment(appointment);
                const canReschedule =
                  AppointmentService.canRescheduleAppointment(appointment) &&
                  userType === "guidance";
                const canComplete = appointment.status === "confirmed" && userType === "guidance";
                const canEdit = userType === "guidance";
                const canDelete = userType === "guidance";

                return (
                  <tr
                    key={appointment.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onView?.(appointment)}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center">
                          <span className="mr-2">{typeInfo.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
                            {appointment.description && (
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {appointment.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.student?.person.firstName}{" "}
                          {appointment.student?.person.lastName}
                        </p>
                        {appointment.student?.studentNumber && (
                          <p className="text-sm text-gray-500">
                            {appointment.student.studentNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {appointment.counselor?.person.firstName}{" "}
                        {appointment.counselor?.person.lastName}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatDate(appointment.requestedDate)}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.duration} min</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {appointment.priority !== "normal" && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}
                        >
                          {priorityInfo.label}
                        </span>
                      )}
                    </td>
                    {showActions && (
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canComplete && onComplete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onComplete(appointment);
                              }}
                              className="text-green-600 hover:text-green-900 text-sm font-medium"
                              title="Mark Complete"
                            >
                              Complete
                            </button>
                          )}
                          {canReschedule && onReschedule && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReschedule(appointment);
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                              title="Reschedule"
                            >
                              Reschedule
                            </button>
                          )}
                          {canEdit && onEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(appointment);
                              }}
                              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                              title="Edit"
                            >
                              Edit
                            </button>
                          )}
                          {canCancel && onCancel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancel(appointment);
                              }}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                              title="Cancel"
                            >
                              Cancel
                            </button>
                          )}
                          {canDelete && onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(appointment);
                              }}
                              className="text-gray-400 hover:text-red-600 text-sm font-medium"
                              title="Delete"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        message={`Are you sure you want to delete the appointment "${appointmentToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
