import React from "react";
import { ChevronLeft, Calendar, Filter } from "lucide-react";
import type { InventoryInsights, InventoryChartFilters } from "@/types/inventory-insights";

interface InventoryInsightsHeaderProps {
  insights: InventoryInsights;
  canNavigateBack: boolean;
  onNavigateBack: () => void;
  onFiltersChange: (filters: InventoryChartFilters) => void;
}

export const InventoryInsightsHeader: React.FC<InventoryInsightsHeaderProps> = ({
  insights,
  canNavigateBack,
  onNavigateBack,
  onFiltersChange,
}) => {
  const getTypeTitle = (type: string) => {
    switch (type) {
      case "mental-health-prediction":
        return "Mental Health Predictions";
      case "bmi-category":
        return "BMI Categories";
      case "physical-health":
        return "Physical Health";
      default:
        return "Inventory Insights";
    }
  };

  const getBreadcrumbPath = () => {
    const path = ["Inventory Insights"];
    
    if (insights.filters.program) {
      path.push(insights.filters.program);
    }
    if (insights.filters.yearLevel) {
      path.push(insights.filters.yearLevel);
    }
    if (insights.filters.gender) {
      path.push(insights.filters.gender);
    }

    return path;
  };

  const handleFilterChange = (filterKey: keyof InventoryChartFilters, value: string | number) => {
    const newFilters = { ...insights.filters, [filterKey]: value };
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        {canNavigateBack && (
          <div className="mb-3 sm:mb-4">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title and Breadcrumb */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
              {getTypeTitle(insights.type)}
            </h1>
            
            {/* Breadcrumb */}
            <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-500">
              {getBreadcrumbPath().map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="mx-1 sm:mx-2">/</span>}
                  <span className={index === getBreadcrumbPath().length - 1 ? "font-medium" : ""}>
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Year Filter */}
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 mr-1 sm:mr-2" />
              <select
                className="text-xs sm:text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={insights.filters.year || ""}
                onChange={(e) => handleFilterChange("year", parseInt(e.target.value))}
              >
                <option value="">All Years</option>
                {insights.availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center">
              <Filter className="w-4 h-4 text-gray-400 mr-1 sm:mr-2" />
              <select
                className="text-xs sm:text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={insights.filters.month || ""}
                onChange={(e) => handleFilterChange("month", parseInt(e.target.value))}
              >
                <option value="">All Months</option>
                {insights.availableMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};