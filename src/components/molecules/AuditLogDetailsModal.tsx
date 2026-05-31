import React from "react";
import {
  X,
  Clock,
  User,
  Shield,
  Activity,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui";
import { AuditLogsService } from "@/services/audit-logs.service";
import type { AuditLogResponse } from "@/types/audit-logs.types";

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLogResponse | null;
}

export const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({
  isOpen,
  onClose,
  auditLog,
}) => {
  if (!isOpen || !auditLog) return null;

  const formatted = AuditLogsService.formatAuditLogForDisplay(auditLog);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  const formatJsonValue = (value: unknown, key?: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span className={value ? "text-green-600" : "text-red-600"}>
          {value ? "true" : "false"}
        </span>
      );
    }

    if (typeof value === "string") {
      // Redact sensitive fields
      if (
        key &&
        (key.toLowerCase().includes("password") ||
          key.toLowerCase().includes("token"))
      ) {
        return <span className="text-gray-400 italic">***REDACTED***</span>;
      }
      return <span className="text-gray-900">"{value}"</span>;
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>;
    }

    if (Array.isArray(value)) {
      return (
        <div className="pl-4">
          [
          {value.map((item, index) => (
            <div key={index} className="ml-2">
              {formatJsonValue(item)}
              {index < value.length - 1 && ","}
            </div>
          ))}
          ]
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="pl-4">
          {"{"}
          {Object.entries(value).map(([k, v], index, arr) => (
            <div key={k} className="ml-2">
              <span className="text-purple-600">"{k}"</span>:{" "}
              {formatJsonValue(v, k)}
              {index < arr.length - 1 && ","}
            </div>
          ))}
          {"}"}
        </div>
      );
    }

    return <span className="text-gray-600">{String(value)}</span>;
  };

  const getRiskLevelIcon = () => {
    switch (auditLog.riskLevel?.toLowerCase()) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "high":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "low":
      default:
        return <Shield className="w-5 h-5 text-green-500" />;
    }
  };

  const getActionIcon = () => {
    if (auditLog.isSecurityLog) {
      return <Shield className="w-5 h-5 text-red-500" />;
    }
    if (auditLog.isSystemAction) {
      return <Activity className="w-5 h-5 text-blue-500" />;
    }
    return <User className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getActionIcon()}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {formatted.title}
              </h2>
              <p className="text-sm text-gray-600">Audit Log Details</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 border-b pb-2">
                Basic Information
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatDate(auditLog.timestamp)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatted.title}
                    </span>
                    {auditLog.isSystemAction && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        System
                      </span>
                    )}
                    {auditLog.isSecurityLog && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Security
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actor
                  </label>
                  <div className="mt-1">
                    <span className="text-sm text-gray-900">
                      {formatted.actor}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Role: {auditLog.userRole} | Type: {auditLog.userType}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${AuditLogsService.getModuleColor(
                        auditLog.module || "system",
                      )}`}
                    >
                      {(auditLog.module || "system")
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    {getRiskLevelIcon()}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${AuditLogsService.getRiskLevelColor(
                        auditLog.riskLevel || "low",
                      )}`}
                    >
                      {(auditLog.riskLevel || "low").charAt(0).toUpperCase() +
                        (auditLog.riskLevel || "low").slice(1)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </label>
                  <div className="mt-1">
                    <p className="text-sm text-gray-900">
                      {formatted.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 border-b pb-2">
                Technical Information
              </h3>

              <div className="space-y-3">
                {auditLog.ipAddress && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </label>
                    <div className="mt-1">
                      <span className="text-sm text-gray-900 font-mono">
                        {auditLog.ipAddress}
                      </span>
                    </div>
                  </div>
                )}

                {auditLog.sessionId && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session ID
                    </label>
                    <div className="mt-1">
                      <span className="text-sm text-gray-900 font-mono">
                        {auditLog.sessionId}
                      </span>
                    </div>
                  </div>
                )}

                {auditLog.userAgent && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Agent
                    </label>
                    <div className="mt-1">
                      <p className="text-sm text-gray-900 break-all">
                        {auditLog.userAgent}
                      </p>
                    </div>
                  </div>
                )}

                {auditLog.entityType && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity Type
                    </label>
                    <div className="mt-1">
                      <span className="text-sm text-gray-900">
                        {auditLog.entityType}
                      </span>
                    </div>
                  </div>
                )}

                {auditLog.entityId && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity ID
                    </label>
                    <div className="mt-1">
                      <span className="text-sm text-gray-900 font-mono">
                        {auditLog.entityId}
                      </span>
                    </div>
                  </div>
                )}

                {auditLog.changedFields &&
                  auditLog.changedFields.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Changed Fields
                      </label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {auditLog.changedFields.map((field, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Data Changes Section */}
          {(auditLog.beforeValues || auditLog.afterValues) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                Data Changes
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {auditLog.beforeValues && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronRight className="w-4 h-4 text-red-500 rotate-180" />
                      <label className="text-sm font-medium text-red-700">
                        Before Values
                      </label>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm font-mono overflow-x-auto">
                      {formatJsonValue(auditLog.beforeValues)}
                    </div>
                  </div>
                )}

                {auditLog.afterValues && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronRight className="w-4 h-4 text-green-500" />
                      <label className="text-sm font-medium text-green-700">
                        After Values
                      </label>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm font-mono overflow-x-auto">
                      {formatJsonValue(auditLog.afterValues)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata Section */}
          {auditLog.metadata && Object.keys(auditLog.metadata).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                Additional Metadata
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm font-mono overflow-x-auto">
                {formatJsonValue(auditLog.metadata)}
              </div>
            </div>
          )}

          {/* Retention Information */}
          {auditLog.retentionDate && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                Retention Information
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    This audit log is scheduled for deletion on{" "}
                    <span className="font-medium">
                      {formatDate(auditLog.retentionDate)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
