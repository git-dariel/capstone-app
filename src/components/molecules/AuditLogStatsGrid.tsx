import React from "react";
import {
  Activity,
  Shield,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  Database,
  CheckCircle,
} from "lucide-react";
import type { AuditLogStatistics } from "@/types/audit-logs.types";

interface AuditLogStatsGridProps {
  statistics: AuditLogStatistics | null;
  loading?: boolean;
}

export const AuditLogStatsGrid: React.FC<AuditLogStatsGridProps> = ({
  statistics,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const stats = [
    {
      title: "Total Audit Logs",
      value: formatNumber(statistics.totalLogs),
      subtitle: "All recorded actions",
      icon: Database,
      color: "text-blue-600 bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Today's Activity",
      value: formatNumber(statistics.todayLogs),
      subtitle: "Actions logged today",
      icon: Clock,
      color: "text-green-600 bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "This Week",
      value: formatNumber(statistics.thisWeekLogs),
      subtitle: "Weekly activity",
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "This Month",
      value: formatNumber(statistics.thisMonthLogs),
      subtitle: "Monthly activity",
      icon: Activity,
      color: "text-indigo-600 bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    {
      title: "High Risk Actions",
      value: formatNumber(statistics.recentHighRiskActions?.length || 0),
      subtitle: "Requiring attention",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "System Actions",
      value: formatNumber(statistics.systemVsUserActions.systemActions),
      subtitle: "Automated processes",
      icon: Shield,
      color: "text-gray-600 bg-gray-50",
      borderColor: "border-gray-200",
    },
    {
      title: "User Actions",
      value: formatNumber(statistics.systemVsUserActions.userActions),
      subtitle: "Human-initiated",
      icon: Users,
      color: "text-orange-600 bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Success Rate",
      value: `${(
        ((statistics.totalLogs -
          (statistics.actionBreakdown.find((a) => a.action === "LOGIN_FAILED")
            ?.count || 0)) /
          statistics.totalLogs) *
        100
      ).toFixed(1)}%`,
      subtitle: "Non-failed actions",
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
      borderColor: "border-emerald-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-sm border ${stat.borderColor} p-4 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {stat.subtitle}
                </p>
              </div>
              <div
                className={`w-12 h-12 flex items-center justify-center ${stat.color} rounded-lg flex-shrink-0`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Actions
          </h3>
          <div className="space-y-3">
            {statistics.actionBreakdown.slice(0, 6).map((action, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700 truncate">
                    {action.action
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(action.count)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {action.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Modules
          </h3>
          <div className="space-y-3">
            {statistics.moduleBreakdown.slice(0, 6).map((module, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700 truncate">
                    {module.module
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(module.count)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {module.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Level Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Risk Distribution
          </h3>
          <div className="space-y-3">
            {statistics.riskLevelBreakdown.map((risk, index) => {
              const colors = {
                critical: "bg-red-500",
                high: "bg-orange-500",
                medium: "bg-yellow-500",
                low: "bg-green-500",
              };
              const color =
                colors[risk.riskLevel as keyof typeof colors] || "bg-gray-500";

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-sm text-gray-700 capitalize">
                      {risk.riskLevel} Risk
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900">
                      {formatNumber(risk.count)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {risk.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Type Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Types</h3>
          <div className="space-y-3">
            {statistics.userTypeBreakdown.map((userType, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-700 capitalize">
                    {userType.userType.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(userType.count)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {userType.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent High Risk Actions */}
      {statistics.recentHighRiskActions &&
        statistics.recentHighRiskActions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Recent High Risk Actions
            </h3>
            <div className="space-y-3">
              {statistics.recentHighRiskActions
                .slice(0, 5)
                .map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-red-900 truncate">
                          {log.action
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="text-xs text-red-700 mt-1">
                        by {log.userName} •{" "}
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        {(log.riskLevel || "high").charAt(0).toUpperCase() +
                          (log.riskLevel || "high").slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
    </div>
  );
};
