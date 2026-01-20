import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuditLogsTable,
  AuditLogDetailsModal,
} from "@/components/molecules";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { TokenManager } from "@/services/api.config";
import {
  Shield,
  Activity,
  Users,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui";
import type {
  AuditLogResponse,
  ExportAuditLogsRequest,
  CleanupAuditLogsRequest,
} from "@/types/audit-logs.types";

export const AuditLogsContent: React.FC = () => {
  const navigate = useNavigate();
  const {
    auditLogs,
    statistics,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    fetchAuditLogs,
    fetchStatistics,
    exportAuditLogs,
    cleanupAuditLogs,
    refreshData,
  } = useAuditLogs();

  const [viewingAuditLog, setViewingAuditLog] =
    useState<AuditLogResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [exportRequest, setExportRequest] = useState<ExportAuditLogsRequest>({
    format: "csv",
    limit: 1000,
  });
  const [cleanupRequest, setCleanupRequest] = useState<CleanupAuditLogsRequest>(
    {
      olderThanDays: 90,
      dryRun: true,
    },
  );

  // Check user permissions
  const user = TokenManager.getUser();
  const canViewAuditLogs =
    user?.role === "admin" || user?.role === "super_admin";
  const canExportAuditLogs = user?.role === "super_admin";
  const canCleanupAuditLogs = user?.role === "super_admin";

  // Redirect if not authorized
  useEffect(() => {
    if (!canViewAuditLogs) {
      navigate("/dashboard");
    }
  }, [canViewAuditLogs, navigate]);

  // Fetch initial data
  useEffect(() => {
    if (canViewAuditLogs) {
      fetchAuditLogs({
        limit: 50,
        page: 1,
        sort: "-timestamp",
      }).catch((err) => {
        console.error("Failed to fetch audit logs:", err);
        // Check if it's a 404 error (API not available)
        if (err?.response?.status === 404) {
          setError(
            "Audit logs API is not available. Please ensure the backend audit logs feature is properly configured.",
          );
        }
      });

      fetchStatistics().catch((err) => {
        console.error("Failed to fetch audit statistics:", err);
      });
    }
  }, [canViewAuditLogs, fetchAuditLogs, fetchStatistics]);

  const handleViewAuditLog = (auditLog: AuditLogResponse) => {
    setViewingAuditLog(auditLog);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingAuditLog(null);
  };

  const handlePageChange = (page: number) => {
    fetchAuditLogs({
      limit: 50,
      page,
      sort: "-timestamp",
    }).catch(console.error);
  };

  const handleExport = () => {
    if (!canExportAuditLogs) {
      return;
    }
    setIsExportModalOpen(true);
  };

  const handleExportSubmit = async () => {
    try {
      const result = await exportAuditLogs(exportRequest);

      // If there's a download URL, trigger download
      if (result.downloadUrl) {
        const link = document.createElement("a");
        link.href = result.downloadUrl;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleCleanup = () => {
    if (!canCleanupAuditLogs) {
      return;
    }
    setIsCleanupModalOpen(true);
  };

  const handleCleanupSubmit = async () => {
    try {
      await cleanupAuditLogs(cleanupRequest);
      setIsCleanupModalOpen(false);

      // Refresh data if it wasn't a dry run
      if (!cleanupRequest.dryRun) {
        await refreshData();
      }
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  };

  const handleRefresh = async () => {
    await refreshData();
    await fetchStatistics();
  };

  // Don't render if user doesn't have permission
  if (!canViewAuditLogs) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Error Message for Missing API */}
      {error && error.includes("Audit logs API is not available") && (
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Audit Logs Feature Not Available
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  The audit logs API endpoints are not available. Please ensure:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    The backend audit logs feature is properly implemented
                  </li>
                  <li>The database schema includes the AuditLog model</li>
                  <li>The server has been restarted to load the new routes</li>
                  <li>
                    Run:{" "}
                    <code className="bg-yellow-100 px-1 rounded">
                      npx prisma db push
                    </code>{" "}
                    to apply schema changes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 md:mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Audit Logs
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Comprehensive system activity tracking and security monitoring
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            {canExportAuditLogs && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
            {canCleanupAuditLogs && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanup}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Cleanup
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">
                Security Events
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics?.recentHighRiskActions?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                High priority actions
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center text-red-600 bg-red-50 rounded-lg flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">
                System Activity
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics?.systemVsUserActions.systemActions || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Automated processes
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center text-blue-600 bg-blue-50 rounded-lg flex-shrink-0">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">
                User Actions
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics?.systemVsUserActions.userActions || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Human-initiated
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center text-green-600 bg-green-50 rounded-lg flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">
                Today's Logs
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics?.todayLogs || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Actions logged today
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center text-purple-600 bg-purple-50 rounded-lg flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <AuditLogsTable
          auditLogs={auditLogs}
          loading={loading}
          error={error}
          onView={handleViewAuditLog}
          onExport={canExportAuditLogs ? handleExport : undefined}
          onCleanup={canCleanupAuditLogs ? handleCleanup : undefined}
          onRefresh={handleRefresh}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Audit Log Details Modal */}
      <AuditLogDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        auditLog={viewingAuditLog}
      />

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Export Audit Logs
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={exportRequest.format}
                  onChange={(e) =>
                    setExportRequest((prev) => ({
                      ...prev,
                      format: e.target.value as "json" | "csv",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limit
                </label>
                <input
                  type="number"
                  value={exportRequest.limit}
                  onChange={(e) =>
                    setExportRequest((prev) => ({
                      ...prev,
                      limit: parseInt(e.target.value) || 1000,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={exportRequest.startDate || ""}
                  onChange={(e) =>
                    setExportRequest((prev) => ({
                      ...prev,
                      startDate: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={exportRequest.endDate || ""}
                  onChange={(e) =>
                    setExportRequest((prev) => ({
                      ...prev,
                      endDate: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExportSubmit}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cleanup Modal */}
      {isCleanupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Cleanup Audit Logs
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  This action will soft-delete audit logs older than the
                  specified number of days. Use dry run to preview what will be
                  deleted.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delete logs older than (days)
                </label>
                <input
                  type="number"
                  value={cleanupRequest.olderThanDays}
                  onChange={(e) =>
                    setCleanupRequest((prev) => ({
                      ...prev,
                      olderThanDays: parseInt(e.target.value) || 90,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="90"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dryRun"
                  checked={cleanupRequest.dryRun}
                  onChange={(e) =>
                    setCleanupRequest((prev) => ({
                      ...prev,
                      dryRun: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="dryRun" className="text-sm text-gray-700">
                  Dry run (preview only, don't actually delete)
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCleanupModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCleanupSubmit}
                disabled={loading}
                className={`flex items-center gap-2 ${
                  cleanupRequest.dryRun
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {cleanupRequest.dryRun ? "Preview" : "Cleanup"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
