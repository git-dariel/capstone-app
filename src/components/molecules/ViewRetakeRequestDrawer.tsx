import { Avatar, Drawer } from "@/components/atoms";
import { Button } from "@/components/ui";
import type { RetakeRequest } from "@/services/retakeRequest.service";
import { RetakeRequestService } from "@/services/retakeRequest.service";
import { AlertTriangle, Calendar, CheckCircle, Clock, FileText, MessageSquare, User, XCircle } from "lucide-react";
import React from "react";

interface ViewRetakeRequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request?: RetakeRequest | null;
  canReview?: boolean;
  onApprove?: (request: RetakeRequest) => void;
  onReject?: (request: RetakeRequest) => void;
}

export const ViewRetakeRequestDrawer: React.FC<ViewRetakeRequestDrawerProps> = ({ isOpen, onClose, request, canReview = false, onApprove, onReject }) => {
  if (!request) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string) => {
    const info = RetakeRequestService.getStatusDisplayInfo(status);
    const iconMap = {
      pending: <Clock className="w-5 h-5 text-yellow-600" />,
      approved: <CheckCircle className="w-5 h-5 text-green-600" />,
      rejected: <XCircle className="w-5 h-5 text-red-600" />,
    };

    return {
      ...info,
      icon: iconMap[status as keyof typeof iconMap] || <AlertTriangle className="w-5 h-5 text-gray-600" />,
    };
  };

  const statusInfo = getStatusInfo(request.status);

  const studentName = request.user?.person ? `${request.user.person.firstName} ${request.user.person.lastName}` : "Unknown Student";

  const studentAvatar = (request.user as any)?.avatar;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Retake Request Details" size="lg">
      <div className="space-y-6">
        {/* Status Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            {statusInfo.icon}
            <div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>{statusInfo.label}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {request.status === "pending" && "This request is awaiting review"}
                {request.status === "approved" && "This request has been approved"}
                {request.status === "rejected" && "This request has been rejected"}
              </p>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Student Information</h4>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <Avatar src={studentAvatar} fallback={studentName.charAt(0)} className="w-12 h-12" />
            <div>
              <div className="text-sm font-medium text-gray-900">{studentName}</div>
              {request.user?.person?.email && <div className="text-sm text-gray-500">{request.user.person.email}</div>}
            </div>
          </div>

          <div className="space-y-3"></div>
        </div>

        {/* Assessment Information */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Assessment Details</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 w-24">Type:</div>
              <div className="text-sm font-medium text-gray-900">{RetakeRequestService.getAssessmentTypeDisplayName(request.assessmentType)}</div>
            </div>
          </div>
        </div>

        {/* Request Information */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Request Details</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Reason for Retake:</label>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900">{request.reason}</div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div className="text-sm text-gray-600">Requested on:</div>
              <div className="text-sm font-medium text-gray-900">{formatDate(request.requestedAt)}</div>
            </div>
          </div>
        </div>

        {/* Review Information */}
        {(request.reviewedAt || request.reviewer || request.reviewerComments) && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Review Information</h4>
            </div>

            <div className="space-y-4">
              {request.reviewedAt && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="text-sm text-gray-600">Reviewed on:</div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(request.reviewedAt)}</div>
                </div>
              )}

              {request.reviewer && (
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div className="text-sm text-gray-600">Reviewed by:</div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.reviewer.person?.firstName} {request.reviewer.person?.lastName}
                  </div>
                </div>
              )}

              {request.reviewerComments && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Review Comments:</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900">{request.reviewerComments}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request History Timeline */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Timeline</h4>
          </div>

          <div className="space-y-3">
            {/* Request Creation */}
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Request Created</div>
                <div className="text-xs text-gray-500">{formatDate(request.requestedAt)}</div>
                <div className="text-xs text-gray-600 mt-1">Student requested retake for {RetakeRequestService.getAssessmentTypeDisplayName(request.assessmentType)} assessment</div>
              </div>
            </div>

            {/* Review */}
            {request.reviewedAt && (
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${request.status === "approved" ? "bg-green-500" : request.status === "rejected" ? "bg-red-500" : "bg-yellow-500"}`}></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Request {request.status.charAt(0).toUpperCase() + request.status.slice(1)}</div>
                  <div className="text-xs text-gray-500">{formatDate(request.reviewedAt)}</div>
                  {request.reviewer && (
                    <div className="text-xs text-gray-600 mt-1">
                      Reviewed by {request.reviewer.person?.firstName} {request.reviewer.person?.lastName}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {canReview && request.status === "pending" && onApprove && onReject && (
          <div className="border-t pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => onApprove(request)} className="bg-green-600 hover:bg-green-700 text-white flex-1 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Request
              </Button>
              <Button variant="outline" onClick={() => onReject(request)} className="text-red-600 border-red-300 hover:bg-red-50 flex-1 flex items-center justify-center">
                <XCircle className="w-4 h-4 mr-2" />
                Reject Request
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
