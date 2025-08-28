import React, { useState } from "react";
import { Search, User, Clock, MapPin, Calendar, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Appointment } from "@/services";

interface PendingRequestsTableProps {
  requests: Appointment[];
  loading?: boolean;
  onApprove?: (request: Appointment) => void;
  onDeny?: (request: Appointment) => void;
  onView?: (request: Appointment) => void;
  searchable?: boolean;
}

export const PendingRequestsTable: React.FC<PendingRequestsTableProps> = ({
  requests,
  loading = false,
  onApprove,
  onDeny,
  onView,
  searchable = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "student">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort requests
  const filteredRequests = requests
    .filter((request) => {
      if (!searchTerm) return true;
      const student =
        `${request.student?.person?.firstName} ${request.student?.person?.lastName}`.toLowerCase();
      const title = request.title?.toLowerCase() || "";
      const description = request.description?.toLowerCase() || "";
      const type = request.appointmentType.toLowerCase();

      return (
        student.includes(searchTerm.toLowerCase()) ||
        title.includes(searchTerm.toLowerCase()) ||
        description.includes(searchTerm.toLowerCase()) ||
        type.includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime();
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          comparison =
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
          break;
        case "student":
          const studentA = `${a.student?.person?.firstName} ${a.student?.person?.lastName}`;
          const studentB = `${b.student?.person?.firstName} ${b.student?.person?.lastName}`;
          comparison = studentA.localeCompare(studentB);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (column: "date" | "priority" | "student") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAppointmentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      consultation: "General Consultation",
      counseling: "Personal Counseling",
      academic_guidance: "Academic Guidance",
      personal_guidance: "Personal Guidance",
      crisis_intervention: "Crisis Intervention",
      follow_up: "Follow-up Session",
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading pending requests...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search and Filters */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by student, title, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [column, order] = e.target.value.split("-");
                  setSortBy(column as "date" | "priority" | "student");
                  setSortOrder(order as "asc" | "desc");
                }}
                className="text-sm border border-gray-200 rounded px-2 py-1"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="priority-desc">High Priority First</option>
                <option value="priority-asc">Low Priority First</option>
                <option value="student-asc">Student A-Z</option>
                <option value="student-desc">Student Z-A</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-500">
              {searchTerm
                ? "No requests match your search criteria."
                : "All appointment requests have been processed."}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("student")}
                >
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("date")}
                >
                  Requested Date
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("priority")}
                >
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.student?.person?.firstName} {request.student?.person?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.student?.studentNumber}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{request.title}</div>
                    <div className="text-sm text-gray-500 mb-1">
                      {getAppointmentTypeLabel(request.appointmentType)}
                    </div>
                    {request.description && (
                      <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                        {request.description}
                      </div>
                    )}
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {request.duration} minutes
                      {request.location && (
                        <>
                          <MapPin className="w-3 h-3 ml-2 mr-1" />
                          {request.location}
                        </>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div>{new Date(request.requestedDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.requestedDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                        request.priority || "normal"
                      )}`}
                    >
                      {request.priority || "normal"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {onView && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(request)}
                          className="h-8 px-2"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      )}

                      {onApprove && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onApprove(request)}
                          className="h-8 px-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                      )}

                      {onDeny && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeny(request)}
                          className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Deny
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {filteredRequests.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredRequests.length} of {requests.length} pending requests
            </div>
            <div className="text-sm text-gray-500">
              {filteredRequests.filter((r) => r.priority === "urgent").length} urgent •{" "}
              {filteredRequests.filter((r) => r.priority === "high").length} high priority
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
