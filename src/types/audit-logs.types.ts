// Audit Log Types
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

export interface AuditLogTableData {
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

export interface AuditLogFilters {
  search: string;
  action?: string;
  module?: string;
  riskLevel?: string;
  userType?: string;
  startDate?: string;
  endDate?: string;
  isSystemAction?: boolean;
  isSecurityLog?: boolean;
}

export interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLogResponse | null;
}

export interface AuditLogExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (request: ExportAuditLogsRequest) => Promise<void>;
}

export interface AuditLogCleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleanup: (request: CleanupAuditLogsRequest) => Promise<void>;
}

// Action Types for Audit Logs
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  LOGIN_FAILED: "LOGIN_FAILED",

  // CRUD Operations
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  VIEW: "VIEW",

  // Data Operations
  EXPORT: "EXPORT",
  IMPORT: "IMPORT",

  // Appointment Actions
  APPOINTMENT_CREATED: "APPOINTMENT_CREATED",
  APPOINTMENT_UPDATED: "APPOINTMENT_UPDATED",
  APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
  APPOINTMENT_COMPLETED: "APPOINTMENT_COMPLETED",

  // Inventory Actions
  INVENTORY_CREATED: "INVENTORY_CREATED",
  INVENTORY_UPDATED: "INVENTORY_UPDATED",

  // User Management
  ROLE_CHANGED: "ROLE_CHANGED",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  PROFILE_UPDATED: "PROFILE_UPDATED",

  // File Operations
  FILE_UPLOADED: "FILE_UPLOADED",
  FILE_DOWNLOADED: "FILE_DOWNLOADED",
  FILE_DELETED: "FILE_DELETED",

  // Assessment Actions
  ASSESSMENT_COMPLETED: "ASSESSMENT_COMPLETED",

  // Consent Actions
  CONSENT_GIVEN: "CONSENT_GIVEN",
  CONSENT_WITHDRAWN: "CONSENT_WITHDRAWN",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// Module Types
export const AUDIT_MODULES = {
  AUTHENTICATION: "authentication",
  APPOINTMENT: "appointment",
  INVENTORY: "inventory",
  USER_MANAGEMENT: "user-management",
  STUDENT: "student",
  SYSTEM: "system",
  ASSESSMENT: "assessment",
  CONSENT: "consent",
  FILE_MANAGEMENT: "file-management",
} as const;

export type AuditModule = (typeof AUDIT_MODULES)[keyof typeof AUDIT_MODULES];

// Risk Level Types
export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS];

// User Type for Audit Logs
export const USER_TYPES = {
  STUDENT: "student",
  GUIDANCE: "guidance",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  SYSTEM: "system",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
