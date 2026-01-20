import React, { useState, useMemo } from "react";
import {
  Search,
  AlertCircle,
  Loader2,
  Eye,
  Shield,
  Clock,
  User,
  Activity,
  ChevronDown,
  Filter,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui";
import { AuditLogsService } from "@/services/audit-logs.service";
import type { AuditLogResponse } from "@/types/audit-logs.types";

interface AuditLogTableData {
  id: string;
  action: string;
  actor: string;
  module: string;
  description: string;
  riskLevel: string;
  timestamp: string;
  ipAddress?: string;
  hasChanges: boolean;
  isSystemAction: boolean;
  isSecurityLog: boolean;
  userType: string;
}

interface AuditLogsTableProps {
  auditLogs: AuditLogResponse[];
  loading?: boolean;
  error?: string | null;
  onView?: (auditLog: AuditLogResponse) => void;
  onExport?: () => void;
  onCleanup?: () => void;
  onRefresh?: () => void;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  auditLogs = [],
  loading = false,
  error = null,
  onView,
  onExport,
  onCleanup,
  onRefresh,
  totalCount = 0,
  currentPage = 1,
  totalPages = 0,
  onPageChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(50);
  const [sortBy, setSortBy] = useState<
    "timestamp" | "action" | "riskLevel" | "module"
  >("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>("");
  const [filterModule, setFilterModule] = useState<string>("");
  const [filterUserType, setFilterUserType] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Transform audit logs to table data
  const tableData = useMemo<AuditLogTableData[]>(() => {
    if (!auditLogs || !Array.isArray(auditLogs)) {
      return [];
    }
    return auditLogs.map((log) => {
      const formatted = AuditLogsService.formatAuditLogForDisplay(log);
      return {
        id: log.id,
        action: log.action,
        actor: formatted.actor,
        module: formatted.module,
        description: formatted.description,
        riskLevel: formatted.riskLevel,
        timestamp: formatted.timestamp,
        ipAddress: log.ipAddress,
        hasChanges: formatted.hasChanges,
        isSystemAction: log.isSystemAction || false,
        isSecurityLog: log.isSecurityLog || false,
        userType: log.userType,
      };
    });
  }, [auditLogs]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = tableData;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.actor.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.description.toLowerCase().includes(searchLower) ||
          log.module.toLowerCase().includes(searchLower) ||
          (log.ipAddress && log.ipAddress.toLowerCase().includes(searchLower)),
      );
    }

    // Risk level filter
    if (filterRiskLevel) {
      filtered = filtered.filter((log) => log.riskLevel === filterRiskLevel);
    }

    // Module filter
    if (filterModule) {
      filtered = filtered.filter((log) => log.module === filterModule);
    }

    // User type filter
    if (filterUserType) {
      filtered = filtered.filter((log) => log.userType === filterUserType);
    }

    // Sort data
    filtered.sort((a, b) => {
      let valueA: string | number = a[sortBy];
      let valueB: string | number = b[sortBy];

      if (sortBy === "timestamp") {
        valueA = new Date(a.timestamp).getTime();
        valueB = new Date(b.timestamp).getTime();
      }

      if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = (valueB as string).toLowerCase();
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    return filtered;
  }, [
    tableData,
    searchTerm,
    filterRiskLevel,
    filterModule,
    filterUserType,
    sortBy,
    sortOrder,
  ]);

  // Paginated data for display
  const paginatedData = useMemo(() => {
    const startIndex = 0;
    const endIndex = Math.min(displayCount, filteredData.length);
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, displayCount]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "high":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "medium":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "low":
      default:
        return <Shield className="w-4 h-4 text-green-500" />;
    }
  };

  const getActionIcon = (isSystemAction: boolean, isSecurityLog: boolean) => {
    if (isSecurityLog) {
      return <Shield className="w-4 h-4 text-red-500" />;
    }
    if (isSystemAction) {
      return <Activity className="w-4 h-4 text-blue-500" />;
    }
    return <User className="w-4 h-4 text-gray-500" />;
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterRiskLevel("");
    setFilterModule("");
    setFilterUserType("");
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header with Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search and Display Count */}
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={displayCount}
              onChange={(e) => setDisplayCount(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white min-w-[80px]"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </Button>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
            {onCleanup && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCleanup}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Cleanup
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <select
                  value={filterRiskLevel}
                  onChange={(e) => setFilterRiskLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">All Risk Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Module
                </label>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">All Modules</option>
                  <option value="authentication">Authentication</option>
                  <option value="appointment">Appointment</option>
                  <option value="inventory">Inventory</option>
                  <option value="user-management">User Management</option>
                  <option value="student">Student</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <select
                  value={filterUserType}
                  onChange={(e) => setFilterUserType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">All User Types</option>
                  <option value="student">Student</option>
                  <option value="guidance">Guidance</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {paginatedData.length} of {filteredData.length} audit logs
            {totalCount > 0 && ` (${totalCount} total)`}
          </span>
          {(searchTerm ||
            filterRiskLevel ||
            filterModule ||
            filterUserType) && (
            <span className="text-blue-600">Filtered results</span>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading audit logs...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No audit logs found
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterRiskLevel || filterModule || filterUserType
                ? "Try adjusting your search or filter criteria"
                : "No audit logs have been recorded yet"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("timestamp")}
                >
                  <div className="flex items-center gap-1">
                    Timestamp
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        sortBy === "timestamp" && sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("action")}
                >
                  <div className="flex items-center gap-1">
                    Action
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        sortBy === "action" && sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("module")}
                >
                  <div className="flex items-center gap-1">
                    Module
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        sortBy === "module" && sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("riskLevel")}
                >
                  <div className="flex items-center gap-1">
                    Risk Level
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        sortBy === "riskLevel" && sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((log, index) => (
                <tr
                  key={log.id}
                  className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.isSystemAction, log.isSecurityLog)}
                      <span className="font-medium text-gray-900">
                        {log.action
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      {log.hasChanges && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Changes
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${AuditLogsService.getModuleColor(
                        log.module,
                      )}`}
                    >
                      {log.module
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={log.description}>
                      {log.description}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {getRiskLevelIcon(log.riskLevel)}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${AuditLogsService.getRiskLevelColor(
                          log.riskLevel,
                        )}`}
                      >
                        {log.riskLevel.charAt(0).toUpperCase() +
                          log.riskLevel.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onView(auditLogs.find((al) => al.id === log.id)!)
                        }
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
