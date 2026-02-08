import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  AlertCircle,
  Loader2,
  Eye,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Avatar } from "@/components/atoms";
import { Button } from "@/components/ui";
import { useInventory } from "@/hooks";
import type { GetInventoryResponse } from "@/services/inventory.service";

interface InventoryTableData {
  id: string;
  studentName: string;
  studentNumber: string;
  program: string;
  year: string;
  email: string;
  gender: string;
  height: string;
  weight: string;
  complexion: string;
  avatar?: string;
  createdAt: string;
  predictionGenerated: boolean;
  predictionUpdatedAt?: string;
  academicPerformanceOutlook?: "improved" | "same" | "declined";
  confidence?: number;
  riskLevel?: "low" | "moderate" | "high" | "critical";
  needsAttention?: boolean;
}

interface InventoryRecordsTableProps {
  inventories?: GetInventoryResponse[];
  loading?: boolean;
  error?: string | null;
  onView?: (inventory: GetInventoryResponse) => void;
  onSearch?: (query: string) => void;
  total?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const InventoryRecordsTable: React.FC<InventoryRecordsTableProps> = ({
  inventories: propInventories,
  loading: propLoading,
  error: propError,
  onView,
  onSearch,
  total,
  page,
  totalPages,
  onPageChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Use prop data if provided, otherwise fall back to hook
  const {
    inventories: hookInventories,
    loading: hookLoading,
    error: hookError,
    fetchInventories,
  } = useInventory();

  const apiInventories = propInventories || hookInventories;
  const loading = propLoading !== undefined ? propLoading : hookLoading;
  const error = propError !== undefined ? propError : hookError;

  // Fetch inventories on component mount only if no prop data is provided
  useEffect(() => {
    if (!propInventories) {
      fetchInventories({
        limit: 100,
        fields:
          "id,height,weight,coplexion,createdAt,updatedAt,predictionGenerated,predictionUpdatedAt,mentalHealthPredictions.mlPredictions,student.studentNumber,student.program,student.year,student.person.firstName,student.person.lastName,student.person.email,student.person.gender,student.person.users.avatar",
      }).catch(console.error);
    }
  }, [propInventories, fetchInventories]);

  // Helper function to extract risk level from ML predictions using count-based prioritization
  const getMLRiskLevel = (mlPredictions: any): "low" | "moderate" | "high" | undefined => {
    if (!mlPredictions || !mlPredictions.anxiety) {
      return undefined;
    }

    // Check if it's the positive message format (all low risk)
    if (
      "message" in mlPredictions &&
      "status" in mlPredictions &&
      mlPredictions.status === "all_low_risk"
    ) {
      return "low";
    }

    // Helper function to check if a condition is High Risk (case-insensitive)
    const isConditionHighRisk = (condition: any): boolean => {
      if (!condition) return false;
      const riskLevel = condition.riskLevel?.toLowerCase() || "";
      const prediction = condition.prediction?.toLowerCase() || "";
      return riskLevel.includes("high") || prediction.includes("high");
    };

    // Helper function to check if a condition is Moderate Risk (case-insensitive)
    const isConditionModerateRisk = (condition: any): boolean => {
      if (!condition) return false;
      const riskLevel = condition.riskLevel?.toLowerCase() || "";
      const prediction = condition.prediction?.toLowerCase() || "";
      return (
        (riskLevel.includes("moderate") || prediction.includes("moderate")) &&
        !isConditionHighRisk(condition)
      );
    };

    // Helper function to check if a condition is Low Risk (case-insensitive)
    const isConditionLowRisk = (condition: any): boolean => {
      if (!condition) return false;
      const riskLevel = condition.riskLevel?.toLowerCase() || "";
      const prediction = condition.prediction?.toLowerCase() || "";
      return (
        (riskLevel.includes("low") || prediction.includes("low")) &&
        !isConditionHighRisk(condition) &&
        !isConditionModerateRisk(condition)
      );
    };

    // Categorize all conditions
    const conditions = [
      { name: "depression", data: mlPredictions.depression },
      { name: "anxiety", data: mlPredictions.anxiety },
      { name: "stress", data: mlPredictions.stress },
    ].filter((c) => !!c.data);

    const highRiskConditions = conditions.filter((c) => isConditionHighRisk(c.data));
    const moderateRiskConditions = conditions.filter((c) => isConditionModerateRisk(c.data));
    const lowRiskConditions = conditions.filter((c) => isConditionLowRisk(c.data));

    // Prioritize category with more conditions
    if (
      highRiskConditions.length >= moderateRiskConditions.length &&
      highRiskConditions.length >= lowRiskConditions.length &&
      highRiskConditions.length > 0
    ) {
      // Pick from High Risk (Depression > Anxiety > Stress)
      const selectedCondition =
        highRiskConditions.find((c) => c.name === "depression") ||
        highRiskConditions.find((c) => c.name === "anxiety") ||
        highRiskConditions.find((c) => c.name === "stress");
      return selectedCondition ? "high" : undefined;
    } else if (
      moderateRiskConditions.length > highRiskConditions.length &&
      moderateRiskConditions.length >= lowRiskConditions.length &&
      moderateRiskConditions.length > 0
    ) {
      // Pick from Moderate Risk (Depression > Anxiety > Stress)
      const selectedCondition =
        moderateRiskConditions.find((c) => c.name === "depression") ||
        moderateRiskConditions.find((c) => c.name === "anxiety") ||
        moderateRiskConditions.find((c) => c.name === "stress");
      return selectedCondition ? "moderate" : undefined;
    } else if (lowRiskConditions.length > 0) {
      // Pick from Low Risk (Depression > Anxiety > Stress)
      return "low";
    }

    return undefined;
  };

  // Transform API data to table format
  const tableData: InventoryTableData[] = useMemo(() => {
    if (!apiInventories) return [];

    return apiInventories.map((inventory) => {
      const studentName = `${inventory.student?.person?.firstName || ""} ${
        inventory.student?.person?.lastName || ""
      }`.trim();
      // Get the latest prediction from the array (first element since they're ordered by createdAt desc)
      const latestPrediction = inventory.mentalHealthPredictions?.[0];

      // Extract risk level from ML predictions
      const mlRiskLevel = latestPrediction?.mlPredictions
        ? getMLRiskLevel(latestPrediction.mlPredictions)
        : undefined;

      // Extract needsAttention from ML predictions (check if any condition has immediateAction)
      const needsAttention = latestPrediction?.mlPredictions
        ? (() => {
            const ml = latestPrediction.mlPredictions;
            // Check if it's the all_low_risk format
            if ("message" in ml && "status" in ml && ml.status === "all_low_risk") {
              return false;
            }
            // Check if any condition has immediateAction
            return !!(
              ml.anxiety?.immediateAction ||
              ml.depression?.immediateAction ||
              ml.stress?.immediateAction
            );
          })()
        : undefined;

      return {
        id: inventory.id,
        studentName: studentName || "Unknown Student",
        studentNumber: inventory.student?.studentNumber || "N/A",
        program: inventory.student?.program || "N/A",
        year: inventory.student?.year || "N/A",
        email: inventory.student?.person?.email || "N/A",
        gender: inventory.student?.person?.gender || "N/A",
        height: inventory.height,
        weight: inventory.weight,
        complexion: inventory.coplexion,
        avatar: inventory.student?.person?.users?.[0]?.avatar,
        createdAt: inventory.createdAt,
        predictionGenerated: inventory.predictionGenerated || false,
        predictionUpdatedAt: inventory.predictionUpdatedAt,
        academicPerformanceOutlook: latestPrediction?.academicPerformanceOutlook,
        confidence: latestPrediction?.confidence,
        riskLevel: mlRiskLevel,
        needsAttention: needsAttention,
      };
    });
  }, [apiInventories]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    if (onSearch) return tableData;
    if (!searchTerm) return tableData;

    const searchLower = searchTerm.toLowerCase();
    return tableData.filter(
      (inventory) =>
        inventory.studentName.toLowerCase().includes(searchLower) ||
        inventory.studentNumber.toLowerCase().includes(searchLower) ||
        inventory.program.toLowerCase().includes(searchLower) ||
        inventory.email.toLowerCase().includes(searchLower) ||
        inventory.height.toLowerCase().includes(searchLower) ||
        inventory.weight.toLowerCase().includes(searchLower) ||
        inventory.complexion.toLowerCase().includes(searchLower),
    );
  }, [tableData, searchTerm]);

  const paginatedData = filteredData;

  const getPerformanceIcon = (outlook?: "improved" | "same" | "declined") => {
    switch (outlook) {
      case "improved":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declined":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "same":
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRiskLevelColor = (level?: "low" | "moderate" | "high" | "critical") => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPerformanceColor = (outlook?: "improved" | "same" | "declined") => {
    switch (outlook) {
      case "improved":
        return "text-green-600";
      case "declined":
        return "text-red-600";
      case "same":
        return "text-yellow-600";
      default:
        return "text-gray-400";
    }
  };

  const handleSearchSubmit = () => {
    if (!onSearch) return;
    onSearch(searchTerm.trim());
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch && value.trim() === "") {
      onSearch("");
    }
  };

  const handleView = (inventoryData: InventoryTableData) => {
    const originalInventory = apiInventories.find((inv) => inv.id === inventoryData.id);
    if (originalInventory && onView) {
      onView(originalInventory);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderPredictionInfo = (inventory: InventoryTableData) => {
    if (!inventory.predictionGenerated) {
      return <div className="text-sm text-gray-400">No prediction</div>;
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center">
          {getPerformanceIcon(inventory.academicPerformanceOutlook)}
          <span
            className={`ml-2 text-xs font-medium capitalize ${getPerformanceColor(
              inventory.academicPerformanceOutlook,
            )}`}
          >
            {inventory.academicPerformanceOutlook || "N/A"}
          </span>
        </div>
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRiskLevelColor(
            inventory.riskLevel,
          )}`}
        >
          {inventory.riskLevel || "N/A"}
        </span>
        {inventory.needsAttention && (
          <div className="text-xs text-orange-600 font-medium">⚠️ Needs Attention</div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 antialiased">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Inventory Records</h2>
              <p className="text-sm text-gray-500">
                {loading
                  ? "Loading inventory records..."
                  : `Showing ${paginatedData.length} of ${
                      total ?? filteredData.length
                    } inventory records`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, program, year, email, or physical info..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-20 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 touch-manipulation"
              disabled={loading}
            />
            {onSearch && (
              <button
                type="button"
                onClick={handleSearchSubmit}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Search
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
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
                <span className="text-sm">Loading inventory records...</span>
              </div>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No inventory records found</p>
                {searchTerm && <p className="text-xs mt-1">Try adjusting your search terms</p>}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout - visible on small screens */}
              <div className="block md:hidden divide-y divide-gray-200">
                {paginatedData.map((inventory) => (
                  <div
                    key={inventory.id}
                    className="p-4 hover:bg-[#fdf2f6] transition-colors touch-manipulation"
                    onClick={() => handleView(inventory)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Avatar
                          src={inventory.avatar}
                          fallback={inventory.studentName.charAt(0)}
                          className="w-10 h-10 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {inventory.studentName}
                          </h3>
                          <p className="text-sm text-gray-500">{inventory.program}</p>
                          <p className="text-xs text-gray-400">Year {inventory.year}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="space-y-3">
                      {/* Contact Info */}
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">{inventory.email}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span className="mr-2">📱</span>
                          {inventory.studentNumber}
                        </div>
                        <div className="text-xs text-gray-400">
                          {inventory.height} / {inventory.weight} • {inventory.complexion} •{" "}
                          {inventory.gender} • Added: {formatDate(inventory.createdAt)}
                        </div>
                      </div>

                      {/* Prediction Status */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          Mental Health Prediction
                        </div>
                        {inventory.predictionGenerated ? (
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                              <span className="text-xs text-green-700 font-medium">Generated</span>
                              {inventory.predictionUpdatedAt && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatDate(inventory.predictionUpdatedAt)}
                                </span>
                              )}
                            </div>
                            {renderPredictionInfo(inventory)}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-500">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout - hidden on small screens */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[1200px] text-sm antialiased">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                        Program & Year
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Physical Info
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Prediction Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        Risk Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((inventory) => (
                      <tr
                        key={inventory.id}
                        className="hover:bg-[#fdf2f6] transition-colors cursor-pointer group relative"
                        onClick={() => handleView(inventory)}
                        title="Click to view inventory details"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar
                              src={inventory.avatar}
                              fallback={inventory.studentName.charAt(0)}
                              className="w-8 h-8 mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {inventory.studentName}
                              </div>

                              <div className="text-xs text-gray-400">{inventory.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{inventory.program}</div>
                          <div className="text-sm text-gray-500">Year {inventory.year}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {inventory.height} / {inventory.weight}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {inventory.complexion}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">{inventory.gender}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {inventory.predictionGenerated ? (
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                <span className="text-sm text-green-700 font-medium">
                                  Generated
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-500">Pending</span>
                              </div>
                            )}
                          </div>
                          {inventory.predictionUpdatedAt && (
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDate(inventory.predictionUpdatedAt)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRiskLevelColor(
                              inventory.riskLevel,
                            )}`}
                          >
                            {inventory.riskLevel || "N/A"}
                          </span>
                          {inventory.needsAttention && (
                            <div className="text-xs text-orange-600 mt-1 font-medium">
                              ⚠️ Needs Attention
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(inventory.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(inventory);
                              }}
                              className="text-primary-600 hover:text-primary-900 hover:bg-primary-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        {totalPages && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs sm:text-sm text-gray-600">
              Page {page ?? 1} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || (page ?? 1) <= 1}
                onClick={() => onPageChange?.((page ?? 1) - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loading || (page ?? 1) >= totalPages}
                onClick={() => onPageChange?.((page ?? 1) + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
