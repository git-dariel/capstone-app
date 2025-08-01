import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { useRetakeRequest } from "@/hooks/useRetakeRequest";
import { useAuth } from "@/hooks/useAuth";
import type { RetakeRequest, RetakeRequestQueryParams } from "@/services/retakeRequest.service";
import { RetakeRequestService } from "@/services/retakeRequest.service";
import {
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface RetakeRequestsTableProps {
  showUserColumn?: boolean;
  isUserView?: boolean;
}

export const RetakeRequestsTable: React.FC<RetakeRequestsTableProps> = ({
  showUserColumn = true,
  isUserView = false,
}) => {
  const { user } = useAuth();
  const {
    requests,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchAllRequests,
    fetchUserRequests,
    approveRequest,
    rejectRequest,
    clearError,
  } = useRetakeRequest();

  const [filters, setFilters] = useState<RetakeRequestQueryParams>({
    page: 1,
    limit: 10,
    status: undefined,
    assessmentType: undefined,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RetakeRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [reviewComments, setReviewComments] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const isGuidance = user?.type === "guidance";
  const canReview = isGuidance && !isUserView;

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const loadRequests = async () => {
    try {
      if (isUserView) {
        await fetchUserRequests(filters);
      } else {
        await fetchAllRequests(filters);
      }
    } catch (error) {
      console.error("Failed to load retake requests:", error);
    }
  };

  const handleFilterChange = (key: keyof RetakeRequestQueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleReview = (request: RetakeRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewComments("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;

    setReviewLoading(true);
    try {
      if (reviewAction === "approve") {
        await approveRequest(selectedRequest.id, reviewComments);
      } else {
        await rejectRequest(selectedRequest.id, reviewComments);
      }

      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewComments("");

      // Refresh the list
      await loadRequests();
    } catch (error) {
      console.error("Failed to review request:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = RetakeRequestService.getStatusDisplayInfo(status);
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearError();
              loadRequests();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isUserView ? "My Retake Requests" : "Retake Requests"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isUserView
                ? "View your assessment retake requests and their status"
                : "Review and manage student retake requests"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            <Button variant="outline" size="sm" onClick={loadRequests} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Type
                </label>
                <select
                  value={filters.assessmentType || ""}
                  onChange={(e) => handleFilterChange("assessmentType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="depression">Depression</option>
                  <option value="stress">Stress</option>
                  <option value="suicide">Suicide Risk</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
                <select
                  value={filters.limit || 10}
                  onChange={(e) => handleFilterChange("limit", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No retake requests found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {showUserColumn && !isUserView && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewed
                </th>
                {canReview && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  {showUserColumn && !isUserView && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.user?.person?.firstName} {request.user?.person?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{request.user?.person?.email}</p>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {RetakeRequestService.getAssessmentTypeDisplayName(request.assessmentType)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
                      {request.reason}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {RetakeRequestService.formatDate(request.requestedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.reviewedAt ? (
                      <div>
                        <p className="text-sm text-gray-900">
                          {RetakeRequestService.formatDate(request.reviewedAt)}
                        </p>
                        {request.reviewer && (
                          <p className="text-xs text-gray-500">
                            by {request.reviewer.person?.firstName}{" "}
                            {request.reviewer.person?.lastName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  {canReview && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === "pending" ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleReview(request, "approve")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(request, "reject")}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {Math.min((page - 1) * (filters.limit || 10) + 1, total)} to{" "}
              {Math.min(page * (filters.limit || 10), total)} of {total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {reviewAction === "approve" ? "Approve Request" : "Reject Request"}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Student:</strong> {selectedRequest.user?.person?.firstName}{" "}
                {selectedRequest.user?.person?.lastName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Assessment:</strong>{" "}
                {RetakeRequestService.getAssessmentTypeDisplayName(selectedRequest.assessmentType)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Reason:</strong> {selectedRequest.reason}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Add your comments..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                disabled={reviewLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={reviewLoading}
                className={
                  reviewAction === "approve"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
              >
                {reviewLoading
                  ? "Processing..."
                  : reviewAction === "approve"
                  ? "Approve Request"
                  : "Reject Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
