# Audit Logs Frontend Implementation

This document provides a comprehensive guide to the audit logs frontend implementation in the Capstone Mental Health Application.

## Overview

The audit logs system provides comprehensive tracking and monitoring of all significant actions within the application. It captures user activities, system events, and security-related actions for compliance, debugging, and security purposes.

## Architecture

### File Structure

```
src/
├── components/
│   ├── molecules/
│   │   ├── AuditLogsTable.tsx
│   │   ├── AuditLogDetailsModal.tsx
│   │   └── AuditLogStatsGrid.tsx
│   └── organisms/
│       └── AuditLogsContent.tsx
├── hooks/
│   └── useAuditLogs.ts
├── pages/
│   └── AuditLogsPage.tsx
├── services/
│   └── audit-logs.service.ts
└── types/
    └── audit-logs.types.ts
```

## Components

### 1. AuditLogsPage

**Location:** `src/pages/AuditLogsPage.tsx`

Main page component that renders the audit logs interface within the MainLayout.

**Features:**
- Uses MainLayout wrapper
- Renders AuditLogsContent component

**Usage:**
```tsx
// Route configuration
<Route path="/audit-logs" element={
  <ProtectedRoute>
    <AuditLogsPage />
  </ProtectedRoute>
} />
```

### 2. AuditLogsContent

**Location:** `src/components/organisms/AuditLogsContent.tsx`

Main content component that orchestrates the entire audit logs interface.

**Features:**
- Role-based access control (admin/super_admin only)
- Statistics dashboard with quick stats cards
- Export functionality (super_admin only)
- Cleanup functionality (super_admin only)
- Real-time data refreshing
- Comprehensive filtering and search

**Props:**
- None (uses hooks for state management)

**Key Functions:**
- `handleViewAuditLog()` - Opens audit log details modal
- `handleExport()` - Initiates audit log export
- `handleCleanup()` - Initiates old audit logs cleanup
- `handleRefresh()` - Refreshes all data

### 3. AuditLogsTable

**Location:** `src/components/molecules/AuditLogsTable.tsx`

Advanced data table component for displaying audit logs with comprehensive filtering and sorting capabilities.

**Features:**
- Advanced search and filtering
- Multi-column sorting
- Risk level and module filtering
- User type filtering
- Pagination support
- Real-time data updates
- Export and cleanup controls
- Responsive design

**Props:**
```tsx
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
```

**Filtering Options:**
- Text search (actor, action, description, module, IP address)
- Risk level (low, medium, high, critical)
- Module (authentication, appointment, inventory, etc.)
- User type (student, guidance, admin, super_admin, system)

**Sorting Options:**
- Timestamp (default: newest first)
- Action type
- Risk level
- Module

### 4. AuditLogDetailsModal

**Location:** `src/components/molecules/AuditLogDetailsModal.tsx`

Comprehensive modal for viewing detailed audit log information.

**Features:**
- Complete audit log information display
- Before/after values comparison
- JSON formatting with syntax highlighting
- Sensitive data redaction
- Metadata display
- Retention information
- Security and system action indicators

**Props:**
```tsx
interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLogResponse | null;
}
```

**Information Sections:**
- Basic Information (timestamp, action, actor, module, risk level)
- Technical Information (IP address, session ID, user agent, entity details)
- Data Changes (before/after values with diff highlighting)
- Additional Metadata
- Retention Information

### 5. AuditLogStatsGrid

**Location:** `src/components/molecules/AuditLogStatsGrid.tsx`

Statistics dashboard showing audit log analytics and insights.

**Features:**
- Key performance indicators
- Action breakdown charts
- Module distribution
- Risk level statistics
- User type analytics
- Recent high-risk actions
- System vs user action ratios

**Props:**
```tsx
interface AuditLogStatsGridProps {
  statistics: AuditLogStatistics | null;
  loading?: boolean;
}
```

**Statistics Displayed:**
- Total audit logs count
- Today's activity
- Weekly/monthly trends
- High-risk action count
- System vs user actions
- Success rate
- Action type breakdown
- Module usage breakdown
- Risk level distribution
- User type activity

## Hooks

### useAuditLogs

**Location:** `src/hooks/useAuditLogs.ts`

Comprehensive React hook for managing audit logs state and operations.

**Features:**
- Data fetching with pagination
- Search and filtering
- Statistics retrieval
- Export functionality
- Cleanup operations
- Error handling
- Loading states
- Toast notifications

**Hook Interface:**
```tsx
interface UseAuditLogsReturn {
  // State
  auditLogs: AuditLogResponse[];
  auditLog: AuditLogResponse | null;
  statistics: AuditLogStatistics | null;
  availableActions: string[];
  availableModules: string[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;

  // Operations
  fetchAuditLogs: (params?: QueryParams) => Promise<void>;
  fetchAuditLogById: (id: string) => Promise<void>;
  fetchStatistics: (params?) => Promise<void>;
  fetchActions: () => Promise<void>;
  fetchModules: () => Promise<void>;
  exportAuditLogs: (request: ExportAuditLogsRequest) => Promise<ExportResult>;
  cleanupAuditLogs: (request: CleanupAuditLogsRequest) => Promise<CleanupResult>;

  // Utilities
  clearError: () => void;
  clearAuditLog: () => void;
  refreshData: () => Promise<void>;
}
```

**Usage Example:**
```tsx
const {
  auditLogs,
  statistics,
  loading,
  error,
  fetchAuditLogs,
  fetchStatistics,
  exportAuditLogs,
} = useAuditLogs();

// Fetch data
useEffect(() => {
  fetchAuditLogs({ limit: 50, page: 1 });
  fetchStatistics();
}, []);

// Export logs
const handleExport = async () => {
  try {
    await exportAuditLogs({
      format: 'csv',
      limit: 1000,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

## Services

### AuditLogsService

**Location:** `src/services/audit-logs.service.ts`

Service class providing API communication for audit logs functionality.

**Methods:**
- `getAuditLogs(params?)` - Fetch audit logs with pagination/filtering
- `getAuditLogById(id)` - Fetch single audit log details
- `getAuditLogStatistics(params?)` - Fetch analytics/statistics
- `exportAuditLogs(request)` - Export audit logs
- `cleanupAuditLogs(request)` - Cleanup old audit logs
- `getAuditLogActions()` - Get available action types
- `getAuditLogModules()` - Get available modules

**Helper Methods:**
- `formatAuditLogForDisplay(log)` - Format log for UI display
- `getRiskLevelColor(level)` - Get CSS classes for risk level
- `getModuleColor(module)` - Get CSS classes for module

## Types

### Core Types

**Location:** `src/types/audit-logs.types.ts`

**AuditLogResponse:**
```tsx
interface AuditLogResponse {
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
```

**AuditLogStatistics:**
```tsx
interface AuditLogStatistics {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
  actionBreakdown: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  moduleBreakdown: Array<{
    module: string;
    count: number;
    percentage: number;
  }>;
  riskLevelBreakdown: Array<{
    riskLevel: string;
    count: number;
    percentage: number;
  }>;
  userTypeBreakdown: Array<{
    userType: string;
    count: number;
    percentage: number;
  }>;
  recentHighRiskActions: AuditLogResponse[];
  systemVsUserActions: {
    systemActions: number;
    userActions: number;
  };
}
```

## Security & Access Control

### Role-Based Access

The audit logs system implements strict role-based access control:

**View Access:**
- `admin` role: Can view audit logs
- `super_admin` role: Can view audit logs

**Export Access:**
- `super_admin` role only

**Cleanup Access:**
- `super_admin` role only

### Implementation

**Component Level:**
```tsx
// Check user permissions
const user = TokenManager.getUser();
const canViewAuditLogs = user?.role === "admin" || user?.role === "super_admin";
const canExportAuditLogs = user?.role === "super_admin";
const canCleanupAuditLogs = user?.role === "super_admin";

// Redirect if not authorized
useEffect(() => {
  if (!canViewAuditLogs) {
    navigate("/dashboard");
  }
}, [canViewAuditLogs, navigate]);
```

**Sidebar Navigation:**
```tsx
{
  icon: <Shield className="w-5 h-5" />,
  label: "Audit Logs",
  path: "/audit-logs",
  adminOnly: true, // Only shown to admin/super_admin
}
```

## Data Security

### Sensitive Data Handling

The system automatically redacts sensitive information:

**Redacted Fields:**
- Passwords
- Tokens
- API keys
- Personal identification numbers

**Implementation:**
```tsx
const formatJsonValue = (value: unknown, key?: string): React.ReactNode => {
  if (key && (
    key.toLowerCase().includes("password") || 
    key.toLowerCase().includes("token")
  )) {
    return <span className="text-gray-400 italic">***REDACTED***</span>;
  }
  // ... format other values
};
```

## Features

### 1. Real-time Updates

- Automatic data refresh capabilities
- Socket integration for live updates (future enhancement)
- Manual refresh with loading indicators

### 2. Advanced Filtering

**Search Filters:**
- Free text search across multiple fields
- Risk level filtering
- Module-based filtering
- User type filtering
- Date range filtering

**Implementation:**
```tsx
const filteredData = useMemo(() => {
  let filtered = tableData;

  // Search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(log =>
      log.actor.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.description.toLowerCase().includes(searchLower) ||
      log.module.toLowerCase().includes(searchLower)
    );
  }

  // Risk level filter
  if (filterRiskLevel) {
    filtered = filtered.filter(log => log.riskLevel === filterRiskLevel);
  }

  return filtered;
}, [tableData, searchTerm, filterRiskLevel]);
```

### 3. Export Functionality

**Supported Formats:**
- CSV
- JSON

**Export Options:**
- Date range selection
- Record limit
- Action type filtering
- Module filtering

**Implementation:**
```tsx
const handleExport = async (request: ExportAuditLogsRequest) => {
  const result = await exportAuditLogs(request);
  
  if (result.downloadUrl) {
    const link = document.createElement("a");
    link.href = result.downloadUrl;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
```

### 4. Cleanup Operations

**Cleanup Features:**
- Soft deletion (records marked as deleted)
- Dry run capability
- Retention date-based cleanup
- Bulk operation support

**Safety Features:**
- Confirmation dialogs
- Dry run preview
- Role-based restrictions

## Performance Considerations

### 1. Pagination

- Server-side pagination implementation
- Configurable page sizes (25, 50, 100, 200)
- Efficient data loading

### 2. Data Loading

**Lazy Loading:**
```tsx
const fetchAuditLogs = useCallback(async (params: QueryParams = {}) => {
  const defaultParams = {
    page: 1,
    limit: 50,
    sort: "-timestamp",
    ...params,
  };
  
  const response = await AuditLogsService.getAuditLogs(defaultParams);
  // ... handle response
}, []);
```

### 3. Memory Management

- Efficient component re-rendering with useMemo
- Proper cleanup of event listeners
- Optimized state updates

## Error Handling

### 1. API Error Handling

```tsx
try {
  const response = await AuditLogsService.getAuditLogs(params);
  // ... success handling
} catch (error: unknown) {
  const errorMessage = (error as Error)?.message || "Failed to fetch audit logs";
  setError(errorMessage);
  showErrorToast(errorMessage);
  console.error("Error fetching audit logs:", error);
}
```

### 2. User Feedback

- Toast notifications for success/error states
- Loading indicators during operations
- Error messages with retry options
- Confirmation dialogs for destructive actions

## Responsive Design

### 1. Mobile Optimization

- Responsive table layouts
- Mobile-friendly modals
- Touch-friendly controls
- Adaptive navigation

### 2. Table Responsiveness

- Horizontal scrolling on small screens
- Collapsible columns
- Mobile-optimized row layouts
- Sticky headers

## Future Enhancements

### 1. Real-time Updates

- WebSocket integration for live audit log streaming
- Real-time notifications for high-risk actions
- Live statistics updates

### 2. Advanced Analytics

- Trend analysis charts
- Anomaly detection
- Risk scoring algorithms
- Predictive analytics

### 3. Integration Features

- SIEM integration
- External log forwarding
- Alert management system
- Compliance reporting

## Testing Considerations

### 1. Unit Tests

- Hook testing with React Testing Library
- Service method testing
- Component rendering tests
- Error handling validation

### 2. Integration Tests

- API integration testing
- Role-based access testing
- Export functionality testing
- Cleanup operation testing

### 3. E2E Tests

- Full user workflow testing
- Cross-browser compatibility
- Performance testing
- Security testing

## Deployment

### 1. Environment Configuration

```typescript
// API Configuration
const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};
```

### 2. Security Headers

- HTTPS enforcement
- CORS configuration
- Authentication headers
- Authorization validation

### 3. Production Considerations

- API rate limiting
- Data retention policies
- Log rotation strategies
- Performance monitoring

## Maintenance

### 1. Regular Tasks

- Monitor audit log growth
- Review retention policies
- Update security configurations
- Performance optimization

### 2. Monitoring

- Error rate tracking
- Performance metrics
- User activity monitoring
- System health checks

### 3. Updates

- Regular dependency updates
- Security patch management
- Feature enhancement rollouts
- Bug fix deployments

## Troubleshooting

### Common Issues

1. **Access Denied Error**
   - Verify user role (admin/super_admin required)
   - Check authentication token validity
   - Confirm API permissions

2. **Data Loading Issues**
   - Check API connectivity
   - Verify query parameters
   - Review error logs

3. **Export Failures**
   - Confirm super_admin role
   - Check data size limits
   - Verify export parameters

4. **Performance Issues**
   - Review pagination settings
   - Optimize query parameters
   - Check network connectivity

### Debug Information

Enable debug mode by setting:
```typescript
localStorage.setItem('debug', 'audit-logs:*');
```

This will provide detailed logging for troubleshooting.

---

This documentation provides a comprehensive guide to the audit logs frontend implementation. For backend API documentation, refer to the corresponding API documentation files.