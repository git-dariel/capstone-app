import React from "react";
import { ChevronLeft, Filter, Calendar } from "lucide-react";
import type { MentalHealthInsights, ChartFilters } from "@/types/insights";

interface InsightsHeaderProps {
  insights: MentalHealthInsights;
  canNavigateBack: boolean;
  onNavigateBack: () => void;
  onFiltersChange: (filters: ChartFilters) => void;
}

export const InsightsHeader: React.FC<InsightsHeaderProps> = ({
  insights,
  canNavigateBack,
  onNavigateBack,
  onFiltersChange,
}) => {
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value ? parseInt(e.target.value) : undefined;
    console.log(`🔧 Year filter changed to: ${year}`);
    console.log(`🔧 Current filters:`, insights.filters);

    // If year is cleared, also clear month to avoid invalid combinations
    const newFilters = year
      ? { ...insights.filters, year }
      : { ...insights.filters, year: undefined, month: undefined };

    console.log(`🔧 New filters:`, newFilters);
    onFiltersChange(newFilters);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value ? parseInt(e.target.value) : undefined;
    console.log(`🔧 Month filter changed to: ${month}`);
    console.log(`🔧 Current filters:`, insights.filters);

    // Month filter only works when year is selected
    if (month && !insights.filters.year) {
      console.warn("⚠️ Month filter requires year to be selected first");
      return;
    }

    const newFilters = { ...insights.filters, month };
    console.log(`🔧 New filters:`, newFilters);
    onFiltersChange(newFilters);
  };

  const getTitle = () => {
    const baseTitle = insights.type.charAt(0).toUpperCase() + insights.type.slice(1);
    return `${baseTitle} Insights - ${insights.currentLevel.title}`;
  };

  const getFullTitle = () => getTitle();
  const getTruncatedTitle = () => {
    const title = getTitle();
    return title.length > 60 ? title.substring(0, 57) + "..." : title;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {canNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1
              className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate"
              title={getFullTitle()}
            >
              {getTruncatedTitle()}
            </h1>
            {insights.currentLevel.parentValue && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                Filtered by: {insights.currentLevel.parentValue}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={insights.filters.year || ""}
              onChange={handleYearChange}
              className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-sm w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Years</option>
              {insights.availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={insights.filters.month || ""}
              onChange={handleMonthChange}
              disabled={!insights.filters.year}
              className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-sm w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{insights.filters.year ? "All Months" : "Select Year First"}</option>
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
  );
};
