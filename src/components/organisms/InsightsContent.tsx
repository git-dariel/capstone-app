import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInsights } from "@/hooks";
import { InsightsHeader, InsightsBarChart } from "@/components/molecules";
import { TrendingUp, Users, BarChart3 } from "lucide-react";
import type { InsightData } from "@/types/insights";

export const InsightsContent: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const {
    insights,
    loading,
    error,
    canNavigateBack,
    canDrillDown,
    fetchInsights,
    drillDown,
    navigateBack,
    updateFilters,
    clearError,
  } = useInsights();

  useEffect(() => {
    if (type && ["anxiety", "depression", "stress"].includes(type)) {
      fetchInsights(type as "anxiety" | "depression" | "stress");
    } else {
      navigate("/dashboard");
    }
  }, [type, fetchInsights, navigate]);

  const handleBarClick = (data: InsightData) => {
    if (canDrillDown) {
      drillDown(data.label);
    }
  };

  const handleFiltersChange = async (filters: any) => {
    await updateFilters(filters);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={clearError}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-600 text-sm sm:text-base">No insights data available.</p>
      </div>
    );
  }

  const totalCount = insights.currentLevel.data.reduce((sum, item) => sum + item.value, 0);
  const averageValue = Math.round(totalCount / insights.currentLevel.data.length);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <InsightsHeader
        insights={insights}
        canNavigateBack={canNavigateBack}
        onNavigateBack={navigateBack}
        onFiltersChange={handleFiltersChange}
      />

      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    Total Cases
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalCount}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">Across all categories</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    Average per Category
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{averageValue}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">Mean distribution</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-green-600 flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    Categories
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {insights.currentLevel.data.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">Different groups</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart */}
          <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {insights.currentLevel.title}
              </h2>
              {canDrillDown && (
                <p className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                  💡 Click on bars to drill down for more details
                </p>
              )}
            </div>

            <InsightsBarChart
              data={insights.currentLevel.data}
              onBarClick={handleBarClick}
              clickable={canDrillDown}
            />

            {/* Data Table */}
            <div className="mt-6 sm:mt-8">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
                Detailed Breakdown
              </h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                          </th>
                          <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Distribution
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {insights.currentLevel.data.map((item, index) => {
                          const percentage = Math.round((item.value / totalCount) * 100);
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2 sm:mr-3 flex-shrink-0"
                                    style={{ backgroundColor: item.color }}
                                  ></div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                    {item.label}
                                  </span>
                                </div>
                                {/* Mobile: Show percentage below category name */}
                                <div className="sm:hidden text-xs text-gray-500 mt-1">
                                  {item.value} ({percentage}%)
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {item.value}
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {percentage}%
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: item.color,
                                    }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
