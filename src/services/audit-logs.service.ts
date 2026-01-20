import { HttpClient } from "./api.config";
import type { QueryParams } from "./api.config";

export interface AuditLogResponse {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  tableName?: string;
  recordId?: string;
  userId: string;
  userName: string;
  userRole: string;
  userType: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  description?: string;
  module?: string;
  beforeValues?: Record<string, unknown>;
  afterValues?: Record<string, unknown>;
  changedFields?: string[];
  metadata?: Record<string, unknown>;
  riskLevel?: "low" | "medium" | "high" | "critical";
  isSystemAction?: boolean;
  isSecurityLog?: boolean;
  timestamp: string;
  isDeleted: boolean;
  retentionDate?: string;
  user?: {
    id: string;
    userName: string;
    role: string;
    type: string;
    person?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface AuditLogStatistics {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
  actionBreakdown: {
    action: string;
    count: number;
    percentage: number;
  }[];
  moduleBreakdown: {
    module: string;
    count: number;
    percentage: number;
  }[];
  riskLevelBreakdown: {
    riskLevel: string;
    count: number;
    percentage: number;
  }[];
  userTypeBreakdown: {
    userType: string;
    count: number;
    percentage: number;
  }[];
  recentHighRiskActions: AuditLogResponse[];
  systemVsUserActions: {
    systemActions: number;
    userActions: number;
  };
}

export interface ExportAuditLogsRequest {
  format: "json" | "csv";
  startDate?: string;
  endDate?: string;
  actions?: string[];
  modules?: string[];
  userTypes?: string[];
  riskLevels?: string[];
  limit?: number;
}

export interface CleanupAuditLogsRequest {
  olderThanDays: number;
  dryRun?: boolean;
}

export interface CleanupAuditLogsResponse {
  deletedCount: number;
  affectedLogs: string[];
  dryRun: boolean;
}

export class AuditLogsService {
  private static readonly BASE_PATH = "/audit-logs";

  // Get all audit logs with pagination and filtering
  static async getAuditLogs(params?: QueryParams): Promise<{
    data: AuditLogResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await HttpClient.get<{
      auditLogs?: AuditLogResponse[];
      data?: AuditLogResponse[];
      total: number;
      page: number;
      limit?: number;
      totalPages: number;
    }>(this.BASE_PATH, params);
    
    // Transform response to match expected interface
    return {
      data: response.data || response.auditLogs || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 50,
      totalPages: response.totalPages || 0,
    };
  }

  // Get a single audit log by ID
  static async getAuditLogById(id: string): Promise<{
    data: AuditLogResponse;
  }> {
    return HttpClient.get(`${this.BASE_PATH}/${id}`);
  }

  // Get audit logs statistics
  static async getAuditLogStatistics(params?: {
    startDate?: string;
    endDate?: string;
    modules?: string[];
    actions?: string[];
  }): Promise<{
    data: AuditLogStatistics;
  }> {
    const response = await HttpClient.get<AuditLogStatistics>(
      `${this.BASE_PATH}/statistics`,
      params as QueryParams,
    );
    
    // Transform response to match expected interface
    return {
      data: response as AuditLogStatistics,
    };
  }

  // Export audit logs
  static async exportAuditLogs(request: ExportAuditLogsRequest): Promise<{
    data: {
      downloadUrl?: string;
      filename: string;
      format: string;
      recordCount: number;
    };
  }> {
    return HttpClient.post(`${this.BASE_PATH}/export`, request);
  }

  // Cleanup old audit logs (soft delete)
  static async cleanupAuditLogs(request: CleanupAuditLogsRequest): Promise<{
    data: CleanupAuditLogsResponse;
  }> {
    return HttpClient.post(`${this.BASE_PATH}/cleanup`, request);
  }

  // Get audit log actions enum values
  static async getAuditLogActions(): Promise<{
    data: string[];
  }> {
    return HttpClient.get(`${this.BASE_PATH}/actions`);
  }

  // Get audit log modules
  static async getAuditLogModules(): Promise<{
    data: string[];
  }> {
    return HttpClient.get(`${this.BASE_PATH}/modules`);
  }

  // Helper method to format audit log for display
  static formatAuditLogForDisplay(log: AuditLogResponse): {
    title: string;
    description: string;
    timestamp: string;
    actor: string;
    riskLevel: string;
    module: string;
    hasChanges: boolean;
  } {
    const actor = log.user
      ? `${log.user.person?.firstName || ""} ${log.user.person?.lastName || ""}`.trim() ||
        log.userName
      : log.userName;

    const title = this.getActionDisplayName(log.action);
    const description = log.description || this.generateDescription(log);

    return {
      title,
      description,
      timestamp: log.timestamp,
      actor,
      riskLevel: log.riskLevel || "low",
      module: log.module || "system",
      hasChanges: !!(
        log.beforeValues ||
        log.afterValues ||
        log.changedFields?.length
      ),
    };
  }

  // Helper method to get user-friendly action names
  private static getActionDisplayName(action: string): string {
    const actionMap: Record<string, string> = {
      LOGIN: "User Login",
      LOGOUT: "User Logout",
      LOGIN_FAILED: "Failed Login Attempt",
      CREATE: "Record Created",
      UPDATE: "Record Updated",
      DELETE: "Record Deleted",
      VIEW: "Record Viewed",
      EXPORT: "Data Exported",
      IMPORT: "Data Imported",
      APPOINTMENT_CREATED: "Appointment Created",
      APPOINTMENT_UPDATED: "Appointment Updated",
      APPOINTMENT_CANCELLED: "Appointment Cancelled",
      APPOINTMENT_COMPLETED: "Appointment Completed",
      INVENTORY_CREATED: "Inventory Created",
      INVENTORY_UPDATED: "Inventory Updated",
      ROLE_CHANGED: "Role Changed",
      PASSWORD_CHANGED: "Password Changed",
      PROFILE_UPDATED: "Profile Updated",
      FILE_UPLOADED: "File Uploaded",
      FILE_DOWNLOADED: "File Downloaded",
      FILE_DELETED: "File Deleted",
      ASSESSMENT_COMPLETED: "Assessment Completed",
      CONSENT_GIVEN: "Consent Given",
      CONSENT_WITHDRAWN: "Consent Withdrawn",
    };

    return (
      actionMap[action] ||
      action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  // Helper method to generate description if not provided
  private static generateDescription(log: AuditLogResponse): string {
    const action = this.getActionDisplayName(log.action);
    const entity = log.entityType || "record";

    if (log.changedFields && log.changedFields.length > 0) {
      const fields = log.changedFields.slice(0, 3).join(", ");
      const additional =
        log.changedFields.length > 3
          ? ` and ${log.changedFields.length - 3} more`
          : "";
      return `${action} - Modified: ${fields}${additional}`;
    }

    return `${action} on ${entity}`;
  }

  // Helper method to get risk level color
  static getRiskLevelColor(riskLevel?: string): string {
    switch (riskLevel?.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  }

  // Helper method to get module color
  static getModuleColor(module?: string): string {
    switch (module?.toLowerCase()) {
      case "authentication":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "appointment":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "inventory":
        return "text-green-600 bg-green-50 border-green-200";
      case "user-management":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "student":
        return "text-indigo-600 bg-indigo-50 border-indigo-200";
      case "system":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  }
}
