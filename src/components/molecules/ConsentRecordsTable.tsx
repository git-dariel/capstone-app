import React, { useState, useMemo } from "react";
import { Search, AlertCircle, Loader2, Eye, FileText } from "lucide-react";
import { Avatar } from "@/components/atoms";
import { Button } from "@/components/ui";
import type { GetConsentResponse } from "@/services/consent.service";

interface ConsentTableData {
  id: string;
  studentName: string;
  studentNumber: string;
  program: string;
  year: string;
  email: string;
  gender: string;
  avatar?: string;
  referred: string;
  stressLevel: string;
  academicPerformance: string;
  createdAt: string;
  what_brings_you_to_guidance?: string;
}

interface ConsentRecordsTableProps {
  consents?: GetConsentResponse[];
  loading?: boolean;
  error?: string | null;
  onView?: (consent: GetConsentResponse) => void;
}

const formatLabel = (value: string) => {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStressLevelBadge = (level: string) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (level) {
    case "low":
      return `${baseClasses} bg-green-100 text-green-800`;
    case "medium":
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case "high":
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getPerformanceBadge = (performance: string) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (performance) {
    case "improved":
      return `${baseClasses} bg-green-100 text-green-800`;
    case "same":
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case "declined":
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export const ConsentRecordsTable: React.FC<ConsentRecordsTableProps> = ({
  consents = [],
  loading = false,
  error = null,
  onView,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // Transform consent data for table display
  const tableData: ConsentTableData[] = useMemo(() => {
    return consents.map((consent) => ({
      id: consent.id,
      studentName: consent.student
        ? `${consent.student.person.firstName} ${consent.student.person.lastName}`
        : "N/A",
      studentNumber: consent.student?.studentNumber || "N/A",
      program: consent.student?.program || "N/A",
      year: consent.student?.year || "N/A",
      email: consent.student?.person.email || "N/A",
      gender: consent.student?.person.gender || "N/A",
      referred: formatLabel(consent.referred),
      stressLevel: consent.stress_level,
      academicPerformance: consent.academic_performance_change,
      createdAt: consent.createdAt,
      what_brings_you_to_guidance: consent.what_brings_you_to_guidance,
    }));
  }, [consents]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!localSearchQuery) return tableData;

    const query = localSearchQuery.toLowerCase();
    return tableData.filter(
      (item) =>
        item.studentName.toLowerCase().includes(query) ||
        item.studentNumber.toLowerCase().includes(query) ||
        item.program.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.referred.toLowerCase().includes(query) ||
        item.stressLevel.toLowerCase().includes(query) ||
        item.academicPerformance.toLowerCase().includes(query) ||
        item.what_brings_you_to_guidance?.toLowerCase().includes(query)
    );
  }, [tableData, localSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
              <p className="text-gray-500">Loading consent records...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load consent records
              </h3>
              <p className="text-gray-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Consent Records</h2>
            <p className="text-sm text-gray-500">
              {loading
                ? "Loading consent records..."
                : `Showing ${filteredData.length} of ${filteredData.length} records`}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, student number, program, stress level, performance..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 touch-manipulation"
            disabled={loading}
          />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading consent records...</span>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm">No consent records found</p>
              {localSearchQuery && <p className="text-xs mt-1">Try adjusting your search terms</p>}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout - visible on small screens */}
            <div className="block md:hidden divide-y divide-gray-200">
              {filteredData.map((consent) => {
                const originalConsent = consents.find((c) => c.id === consent.id)!;
                return (
                  <div
                    key={consent.id}
                    className="p-4 hover:bg-gray-50 transition-colors touch-manipulation"
                    onClick={() => onView?.(originalConsent)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Avatar
                          fallback={consent.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {consent.studentName}
                          </h3>
                          <p className="text-sm text-gray-500">{consent.studentNumber}</p>
                          <p className="text-xs text-gray-400">
                            {consent.program} • Year {consent.year}
                          </p>
                        </div>
                      </div>
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(originalConsent);
                          }}
                          className="text-primary-600 hover:text-primary-900 hover:bg-primary-50 p-1 ml-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="space-y-3">
                      {/* Contact & Basic Info */}
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">{consent.email}</div>
                        <div className="text-xs text-gray-500">
                          Gender: {formatLabel(consent.gender)} • Referred by: {consent.referred}
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-2">Status</div>
                        <div className="flex flex-wrap gap-2">
                          <span className={getStressLevelBadge(consent.stressLevel)}>
                            Stress: {formatLabel(consent.stressLevel)}
                          </span>
                          <span className={getPerformanceBadge(consent.academicPerformance)}>
                            Performance: {formatLabel(consent.academicPerformance)}
                          </span>
                        </div>
                      </div>

                      {/* What brings to guidance */}
                      {consent.what_brings_you_to_guidance && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-600">
                            What brings to guidance:
                          </div>
                          <div className="bg-primary-50 border border-primary-200 rounded-md px-2 py-1">
                            <div className="text-xs text-primary-700 line-clamp-2">
                              {consent.what_brings_you_to_guidance}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Date */}
                      <div className="text-xs text-gray-400">
                        Submitted: {formatDate(consent.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table Layout - hidden on small screens */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program & Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referred By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      What Brings to Guidance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((consent) => {
                    const originalConsent = consents.find((c) => c.id === consent.id)!;
                    return (
                      <tr
                        key={consent.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group relative"
                        onClick={() => onView?.(originalConsent)}
                        title="Click to view consent details"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar
                              fallback={consent.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                              className="mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {consent.studentName}
                              </div>
                              <div className="text-sm text-gray-500">{consent.studentNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{consent.program}</div>
                          <div className="text-sm text-gray-500">Year {consent.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{consent.referred}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={getStressLevelBadge(consent.stressLevel)}>
                              {formatLabel(consent.stressLevel)} stress
                            </span>
                            <br />
                            <span className={getPerformanceBadge(consent.academicPerformance)}>
                              {formatLabel(consent.academicPerformance)} performance
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {consent.what_brings_you_to_guidance ? (
                              <div className="bg-primary-50 border border-primary-200 rounded-md px-2 py-1">
                                <div className="text-xs text-primary-700 line-clamp-2">
                                  {consent.what_brings_you_to_guidance}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">No response</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(consent.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(originalConsent);
                              }}
                              className="text-primary-600 hover:text-primary-900 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
