import React, { useState } from "react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui";
import type { ExportFilters } from "@/services/user.service";
import { ChevronDown, Filter, X, Download, Loader2 } from "lucide-react";

interface ExportFilterDropdownProps {
  onExport: (filters: ExportFilters) => Promise<void>;
  isExporting?: boolean;
}

export const ExportFilterDropdown: React.FC<ExportFilterDropdownProps> = ({
  onExport,
  isExporting = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({});

  const handleFilterChange = (key: keyof ExportFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value || undefined,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleExport = async () => {
    await onExport(filters);
    setIsOpen(false);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(
      (value) => value !== undefined && value !== null && value !== ""
    ).length;
  };

  return (
    <div className="relative">
      {/* Export Button with Filter Indicator */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        variant="outline"
        size="default"
        className="flex items-center space-x-2 w-full md:w-auto justify-center relative"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Export Data</span>
            <ChevronDown className="w-4 h-4 ml-1" />
            {hasActiveFilters && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </>
        )}
      </Button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">Export Filters</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Assessment Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Type
              </label>
              <Select
                value={filters.assessmentType || "all"}
                onValueChange={(value: string) => handleFilterChange("assessmentType", value)}
              >
                <SelectTrigger className="w-full">
                  <span>{filters.assessmentType || "All Assessments"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assessments</SelectItem>
                  <SelectItem value="anxiety">Anxiety Only</SelectItem>
                  <SelectItem value="depression">Depression Only</SelectItem>
                  <SelectItem value="stress">Stress Only</SelectItem>
                  <SelectItem value="suicide">Suicide Risk Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level</label>
              <Select
                value={filters.severityLevel || "all"}
                onValueChange={(value: string) => handleFilterChange("severityLevel", value)}
              >
                <SelectTrigger className="w-full">
                  <span>{filters.severityLevel || "All Levels"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="moderately_severe">Moderately Severe</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="low">Low (Stress)</SelectItem>
                  <SelectItem value="high">High (Stress/Suicide)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Program Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <Input
                type="text"
                placeholder="e.g., Computer Science, Engineering"
                value={filters.program || ""}
                onChange={(e) => handleFilterChange("program", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Academic Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Status
              </label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value: string) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-full">
                  <span>{filters.status || "All Statuses"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="freshman">Freshman</SelectItem>
                  <SelectItem value="sophomore">Sophomore</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <Select
                value={filters.gender || "all"}
                onValueChange={(value: string) => handleFilterChange("gender", value)}
              >
                <SelectTrigger className="w-full">
                  <span>{filters.gender || "All Genders"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <Input
                  type="text"
                  placeholder="e.g., Maria"
                  value={filters.firstName || ""}
                  onChange={(e) => handleFilterChange("firstName", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <Input
                  type="text"
                  placeholder="e.g., Santos"
                  value={filters.lastName || ""}
                  onChange={(e) => handleFilterChange("lastName", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Student ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <Input
                type="text"
                placeholder="Specific student ID"
                value={filters.studentId || ""}
                onChange={(e) => handleFilterChange("studentId", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                size="sm"
                className="flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>{getActiveFilterCount()} filter(s) active:</strong>{" "}
                {Object.entries(filters)
                  .filter(([, value]) => value !== undefined && value !== null && value !== "")
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};
