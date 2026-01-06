import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSimplifiedInsights } from "@/hooks";
import {
  AssessmentStudentList,
  InsightsBarChart,
  SeverityPieChart,
  GenderDistributionChart,
} from "@/components/molecules";
import { TrendingUp, Users, BarChart3, ArrowLeft, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export const SimplifiedInsightsContent: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const {
    assessmentType,
    programData,
    availablePrograms,
    selectedProgram,
    studentList,
    loading,
    error,
    filters,
    totalCount,
    isProgramSelected,
    fetchInsights,
    selectProgram,
    clearProgramSelection,
    updateFilters,
    clearError,
  } = useSimplifiedInsights();

  const [localFilters, setLocalFilters] = useState({
    year: filters.year,
    month: filters.month,
    yearLevel: filters.yearLevel,
    gender: filters.gender,
  });

  // Calculate severity and gender distribution for charts
  const [severityData, setSeverityData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [genderData, setGenderData] = useState<
    Array<{ gender: string; count: number; color: string }>
  >([]);

  // Calculate severity distribution based on student list
  useEffect(() => {
    if (studentList.length > 0) {
      const severityCounts: Record<string, number> = {};
      const genderCounts: Record<string, number> = {};

      studentList.forEach((student) => {
        // Severity
        const severity = student.severity || "Unknown";
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;

        // Gender
        const gender = student.gender || "Unknown";
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      });

      const severityColors: Record<string, string> = {
        // DASS-21 severity levels (Anxiety, Depression, Stress)
        Minimal: "#10b981",
        Mild: "#fbbf24",
        Moderate: "#f59e0b",
        Severe: "#ef4444",
        "Extremely Severe": "#dc2626",
        Unknown: "#6b7280",
        // Lowercase variants (from API)
        minimal: "#10b981",
        mild: "#fbbf24",
        moderate: "#f59e0b",
        severe: "#ef4444",
        "extremely severe": "#dc2626",
        // Alternative severity levels (Suicide, Stress)
        Low: "#10b981",
        low: "#10b981",
        High: "#ef4444",
        high: "#ef4444",
        Normal: "#10b981",
        normal: "#10b981",
      };

      const genderColors: Record<string, string> = {
        Male: "#3b82f6",
        Female: "#ec4899",
        Other: "#8b5cf6",
        male: "#3b82f6",
        female: "#ec4899",
        other: "#8b5cf6",
        Unknown: "#6b7280",
      };

      const severityDataArray = Object.entries(severityCounts).map(
        ([severity, count]) => ({
          name: severity.charAt(0).toUpperCase() + severity.slice(1),
          value: count,
          color: severityColors[severity] || "#6b7280",
        }),
      );

      const genderDataArray = Object.entries(genderCounts).map(
        ([gender, count]) => ({
          gender: gender.charAt(0).toUpperCase() + gender.slice(1),
          count: count,
          color: genderColors[gender] || "#6b7280",
        }),
      );

      setSeverityData(severityDataArray);
      setGenderData(genderDataArray);
    } else {
      setSeverityData([]);
      setGenderData([]);
    }
  }, [studentList]);

  useEffect(() => {
    if (
      type &&
      ["anxiety", "depression", "stress", "suicide", "checklist"].includes(type)
    ) {
      fetchInsights(
        type as "anxiety" | "depression" | "stress" | "suicide" | "checklist",
      );
    } else {
      navigate("/dashboard");
    }
  }, [type, fetchInsights, navigate]);

  const handleProgramSelect = (program: string) => {
    if (program === "all") {
      clearProgramSelection();
    } else {
      selectProgram(program);
    }
  };

  const handleYearChange = (year: string) => {
    const yearNum = year === "all" ? undefined : parseInt(year);
    setLocalFilters((prev) => ({ ...prev, year: yearNum }));
    updateFilters({ year: yearNum, month: undefined });
  };

  const handleMonthChange = (month: string) => {
    const monthNum = month === "all" ? undefined : parseInt(month);
    setLocalFilters((prev) => ({ ...prev, month: monthNum }));
    updateFilters({ ...localFilters, month: monthNum });
  };

  const handleYearLevelChange = (yearLevel: string) => {
    const level = yearLevel === "all" ? undefined : yearLevel;
    setLocalFilters((prev) => ({ ...prev, yearLevel: level }));
    updateFilters({ ...localFilters, yearLevel: level });
  };

  const handleGenderChange = (gender: string) => {
    const genderValue = gender === "all" ? undefined : gender;
    setLocalFilters((prev) => ({ ...prev, gender: genderValue }));
    updateFilters({ ...localFilters, gender: genderValue });
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const getAssessmentTitle = () => {
    switch (type) {
      case "anxiety":
        return "Anxiety Assessment";
      case "depression":
        return "Depression Assessment";
      case "stress":
        return "Stress Assessment";
      case "suicide":
        return "Suicide Risk Assessment";
      case "checklist":
        return "Personal Problems Checklist";
      default:
        return "Assessment";
    }
  };

  const getAssessmentColor = () => {
    switch (type) {
      case "anxiety":
        return "text-amber-600";
      case "depression":
        return "text-purple-600";
      case "stress":
        return "text-red-600";
      case "suicide":
        return "text-rose-700";
      case "checklist":
        return "text-green-600";
      default:
        return "text-blue-600";
    }
  };

  if (loading && !assessmentType) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">
            Loading insights...
          </p>
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

  if (!assessmentType) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-600 text-sm sm:text-base">
          No insights data available.
        </p>
      </div>
    );
  }

  const averageValue =
    programData.length > 0 ? Math.round(totalCount / programData.length) : 0;

  const availableYears = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );
  const availableMonths = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const yearLevels = [
    { value: "1st", label: "1st Year" },
    { value: "2nd", label: "2nd Year" },
    { value: "3rd", label: "3rd Year" },
    { value: "4th", label: "4th Year" },
  ];

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackToDashboard}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          {/* Title and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className={`text-xl sm:text-2xl font-bold ${getAssessmentColor()}`}
              >
                {getAssessmentTitle()}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isProgramSelected
                  ? `Showing students in ${selectedProgram}`
                  : "Select a program to view students"}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Filters:
                </span>
              </div>

              {/* Year Filter */}
              <Select
                value={localFilters.year?.toString() || "all"}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-[100px] sm:w-[120px] h-9">
                  <span className="text-xs sm:text-sm">
                    {localFilters.year || "Year"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select
                value={localFilters.month?.toString() || "all"}
                onValueChange={handleMonthChange}
                disabled={!localFilters.year}
              >
                <SelectTrigger className="w-[100px] sm:w-[120px] h-9">
                  <span className="text-xs sm:text-sm">
                    {localFilters.month
                      ? availableMonths
                          .find((m) => m.value === localFilters.month)
                          ?.label.substring(0, 3)
                      : "Month"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Program Filter */}
              <Select
                value={selectedProgram || "all"}
                onValueChange={handleProgramSelect}
              >
                <SelectTrigger className="w-[140px] sm:w-[200px] h-9">
                  <span className="text-xs sm:text-sm truncate">
                    {selectedProgram || "Program"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {availablePrograms.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Level Filter - Only show when program is selected */}
              {isProgramSelected && (
                <Select
                  value={localFilters.yearLevel || "all"}
                  onValueChange={handleYearLevelChange}
                >
                  <SelectTrigger className="w-[100px] sm:w-[120px] h-9">
                    <span className="text-xs sm:text-sm">
                      {localFilters.yearLevel || "Level"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {yearLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Gender Filter - Only show when program is selected */}
              {isProgramSelected && (
                <Select
                  value={localFilters.gender || "all"}
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger className="w-[100px] sm:w-[120px] h-9">
                    <span className="text-xs sm:text-sm capitalize">
                      {localFilters.gender || "Gender"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    {genders.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Student List View - Only show when program is selected */}
          {isProgramSelected ? (
            <>
              {/* Analytics Section - Shown above student list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {/* Summary Statistics */}
                <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                    Program Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600">Total Students</p>
                        <p className="text-xl font-bold text-blue-600">
                          {studentList.length}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600 opacity-50" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600">High Risk</p>
                        <p className="text-xl font-bold text-red-600">
                          {
                            studentList.filter(
                              (s) =>
                                s.severity?.toLowerCase() === "severe" ||
                                s.severity?.toLowerCase() ===
                                  "extremely severe" ||
                                s.severity?.toLowerCase() === "high",
                            ).length
                          }
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-600 opacity-50" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600">Moderate Risk</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {
                            studentList.filter(
                              (s) =>
                                s.severity?.toLowerCase() === "moderate" ||
                                s.severity?.toLowerCase() === "mild" ||
                                s.severity?.toLowerCase() === "low" ||
                                s.severity?.toLowerCase() === "normal",
                            ).length
                          }
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-yellow-600 opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Severity Distribution Pie Chart */}
                {severityData.length > 0 && (
                  <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
                    <SeverityPieChart
                      data={severityData}
                      title="Severity Distribution"
                      description={`Breakdown of severity levels in ${selectedProgram}`}
                    />
                  </div>
                )}

                {/* Gender Distribution Chart */}
                {genderData.length > 0 && (
                  <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
                    <GenderDistributionChart
                      data={genderData}
                      title="Distribution by Gender"
                      description="Student count by gender"
                    />
                  </div>
                )}
              </div>

              {/* Student List */}
              <AssessmentStudentList
                students={studentList}
                loading={loading}
                title={`Students in ${selectedProgram} - ${getAssessmentTitle()}`}
              />
            </>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                        Total Cases
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {totalCount}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Across all programs
                      </p>
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
                        Average per Program
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {averageValue}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Mean distribution
                      </p>
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
                        Programs
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {programData.length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Different programs
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-purple-600 flex-shrink-0">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Bar Chart */}
              <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 mb-6">
                <div className="flex flex-col gap-2 mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Distribution by Program
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    💡 Select a program from the dropdown above to view students
                  </p>
                </div>

                <InsightsBarChart
                  data={programData}
                  onBarClick={() => {}} // No click action - use dropdown instead
                  clickable={false}
                />
              </div>

              {/* Detailed Breakdown Table */}
              <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Program Analysis Overview
                </h2>

                {/* Data Table */}
                <div className="mt-0">
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Program
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
                            {programData.map((item, index) => {
                              const percentage =
                                item.percentage ||
                                Math.round((item.value / totalCount) * 100);
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
                                    {/* Mobile: Show percentage below program name */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
