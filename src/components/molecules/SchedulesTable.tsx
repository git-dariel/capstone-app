import React, { useState } from "react";
import type { Schedule, Appointment } from "@/services";
import { ConfirmationModal } from "./ConfirmationModal";

interface SchedulesTableProps {
  schedules: Schedule[];
  loading?: boolean;
  onEdit?: (schedule: Schedule) => void;
  onView?: (schedule: Schedule) => void;
  onDelete?: (scheduleId: string) => void;
  onBook?: (schedule: Schedule) => void;
  showActions?: boolean;
  searchable?: boolean;
  userType?: "student" | "guidance";
  hasActiveAppointmentForSchedule?: (scheduleId: string) => boolean;
  getExistingAppointmentForSchedule?: (scheduleId: string) => Appointment | null;
}

export const SchedulesTable: React.FC<SchedulesTableProps> = ({
  schedules,
  loading = false,
  onEdit,
  onView,
  onDelete,
  onBook,
  showActions = true,
  searchable = true,
  userType = "student",
  hasActiveAppointmentForSchedule,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);

  const filteredSchedules = searchable
    ? schedules.filter(
        (schedule) =>
          schedule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.counselor?.person?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.counselor?.person?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : schedules;

  const handleDeleteClick = (schedule: Schedule) => {
    setScheduleToDelete(schedule);
  };

  const handleDeleteConfirm = () => {
    if (scheduleToDelete && onDelete) {
      onDelete(scheduleToDelete.id);
      setScheduleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setScheduleToDelete(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading schedules...</span>
          </div>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-gray-400">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
          <p className="text-gray-500">
            {searchable && searchTerm
              ? "No schedules match your search criteria."
              : "There are no schedules to display."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Search */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">🔍</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSchedules.map((schedule) => (
              <tr key={schedule.id} className="hover:bg-gray-50">
                {/* Schedule Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {schedule.title || "Untitled Schedule"}
                    </div>
                    {schedule.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {schedule.description}
                      </div>
                    )}
                    {schedule.location && (
                      <div className="text-xs text-gray-400 mt-1">📍 {schedule.location}</div>
                    )}
                  </div>
                </td>

                {/* Staff */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {schedule.counselor?.person
                      ? `${schedule.counselor.person.firstName} ${schedule.counselor.person.lastName}`
                      : "Unassigned"}
                  </div>
                  {schedule.counselor?.person?.email && (
                    <div className="text-xs text-gray-500">{schedule.counselor.person.email}</div>
                  )}
                </td>

                {/* Date & Time */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(schedule.startTime).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    to {new Date(schedule.endTime).toLocaleString()}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      schedule.status === "available"
                        ? "bg-green-100 text-green-800"
                        : schedule.status === "booked"
                        ? "bg-blue-100 text-blue-800"
                        : schedule.status === "unavailable"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </span>
                </td>

                {/* Availability */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {schedule.maxSlots - schedule.bookedSlots} / {schedule.maxSlots} slots
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        schedule.bookedSlots >= schedule.maxSlots
                          ? "bg-red-500"
                          : schedule.bookedSlots >= schedule.maxSlots * 0.8
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (schedule.bookedSlots / schedule.maxSlots) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </td>

                {/* Actions */}
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {userType === "student" &&
                        onBook &&
                        schedule.status === "available" &&
                        (() => {
                          const hasExistingAppointment =
                            hasActiveAppointmentForSchedule?.(schedule.id) || false;
                          const isFullyBooked = schedule.bookedSlots >= schedule.maxSlots;
                          const isDisabled = hasExistingAppointment || isFullyBooked;

                          return (
                            <div className="flex flex-col items-end space-y-1">
                              <button
                                onClick={() => onBook(schedule)}
                                className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md transition-colors ${
                                  isDisabled
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                }`}
                                title={
                                  hasExistingAppointment
                                    ? "You already have an appointment for this schedule"
                                    : isFullyBooked
                                    ? "This schedule is fully booked"
                                    : "Book Appointment"
                                }
                                disabled={isDisabled}
                              >
                                📅 {hasExistingAppointment ? "Booked" : "Book"}
                              </button>
                              {hasExistingAppointment && (
                                <span className="text-xs text-orange-600 font-medium">
                                  Already Booked
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      {onView && (
                        <button
                          onClick={() => onView(schedule)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="View Schedule"
                        >
                          👁️
                        </button>
                      )}
                      {userType === "guidance" && onEdit && (
                        <button
                          onClick={() => onEdit(schedule)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit Schedule"
                        >
                          ✏️
                        </button>
                      )}
                      {userType === "guidance" && onDelete && (
                        <button
                          onClick={() => handleDeleteClick(schedule)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Schedule"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {filteredSchedules.length} of {schedules.length} schedules
          {searchable && searchTerm && (
            <span className="text-gray-500"> (filtered by "{searchTerm}")</span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!scheduleToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Schedule"
        message={`Are you sure you want to delete the schedule "${scheduleToDelete?.title}"? This action cannot be undone and may affect existing appointments.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
