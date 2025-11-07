import React, { useState, useMemo, useEffect, useRef } from "react";
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
}

export const InventoryRecordsTable: React.FC<InventoryRecordsTableProps> = ({
  inventories: propInventories,
  loading: propLoading,
  error: propError,
  onView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const tableRef = useRef<HTMLDivElement>(null);

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
          "id,height,weight,coplexion,createdAt,updatedAt,predictionGenerated,predictionUpdatedAt,mentalHealthPredictions,student.studentNumber,student.program,student.year,student.person.firstName,student.person.lastName,student.person.email,student.person.gender,student.person.users.avatar",
      }).catch(console.error);
    }
  }, [propInventories, fetchInventories]);

  // Transform API data to table format
  const tableData: InventoryTableData[] = useMemo(() => {
    if (!apiInventories) return [];

    return apiInventories.map((inventory) => {
      const studentName = `${inventory.student?.person?.firstName || ""} ${
        inventory.student?.person?.lastName || ""
      }`.trim();
      // Get the latest prediction from the array (first element since they're ordered by createdAt desc)
      const latestPrediction = inventory.mentalHealthPredictions?.[0];

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
        riskLevel: latestPrediction?.mentalHealthRisk?.level,
        needsAttention: latestPrediction?.mentalHealthRisk?.needsAttention,
      };
    });
  }, [apiInventories]);

  // Filter and search logic
  const filteredData = useMemo(() => {
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
        inventory.complexion.toLowerCase().includes(searchLower)
    );
  }, [tableData, searchTerm]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    return filteredData.slice(0, displayCount);
  }, [filteredData, displayCount]);

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

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      if (displayCount < filteredData.length) {
        setDisplayCount((prev) => Math.min(prev + 10, filteredData.length));
      }
    }
  };

  // Reset display count when search term changes
  useEffect(() => {
    setDisplayCount(10);
  }, [searchTerm]);

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
              inventory.academicPerformanceOutlook
            )}`}
          >
            {inventory.academicPerformanceOutlook || "N/A"}
          </span>
        </div>
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRiskLevelColor(
            inventory.riskLevel
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
                  : `Showing ${paginatedData.length} of ${filteredData.length} inventory records`}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 touch-manipulation"
              disabled={loading}
            />
          </div>
        </div>

        <div
          ref={tableRef}
          className="overflow-x-auto max-h-96 overflow-y-auto"
          onScroll={handleScroll}
        >
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
                              inventory.riskLevel
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
      </div>
    </>
  );
};
