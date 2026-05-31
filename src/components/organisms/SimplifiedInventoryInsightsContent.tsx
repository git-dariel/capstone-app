import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSimplifiedInventoryInsights } from "@/hooks";
import { InventoryStudentList, InsightsBarChart } from "@/components/molecules";
import { MetricsService } from "@/services";
import {
  TrendingUp,
  Users,
  BarChart3,
  ArrowLeft,
  Filter,
  Package,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export const SimplifiedInventoryInsightsContent: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const {
    insightType,
    categoryData,
    availableCategories,
    selectedCategory,
    studentList,
    loading,
    error,
    filters,
    totalCount,
    fetchInsights,
    selectCategory,
    updateFilters,
    clearError,
  } = useSimplifiedInventoryInsights();

  const [localFilters, setLocalFilters] = useState({
    year: filters.year,
    month: filters.month,
    program: filters.program,
    yearLevel: filters.yearLevel,
    gender: filters.gender,
  });

  // Fetch available programs from API
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const request = {
          model: "Inventory",
          data: ["totalInventoryByProgram"],
          filter: {},
        };
        const response = await MetricsService.fetchMetrics(request);
        const programData = response.data[0]?.totalInventoryByProgram || [];
        const programs = programData.map(
          (item: { program: string; count: number }) => item.program,
        );
        setAvailablePrograms(programs);
      } catch (error) {
        console.error("Error fetching programs:", error);
        // Fallback to default programs
        setAvailablePrograms(["BSIT", "BSCS", "BSE", "BSBA"]);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  // Calculate category and program distribution for charts
  const [categoryDistribution, setCategoryDistribution] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [programDistribution, setProgramDistribution] = useState<
    Array<{ program: string; count: number; color: string }>
  >([]);
  const [genderDistribution, setGenderDistribution] = useState<
    Array<{ gender: string; count: number; color: string }>
  >([]);

  // Calculate distributions based on student list
  useEffect(() => {
    if (studentList.length > 0) {
      const categoryCounts: Record<string, number> = {};
      const programCounts: Record<string, number> = {};
      const genderCounts: Record<string, number> = {};

      studentList.forEach((student) => {
        // Category (mental health or BMI)
        let category = "Unknown";
        if (insightType === "mental-health-prediction") {
          category = student.mentalHealthPrediction || "Unknown";
        } else if (
          insightType === "bmi-category" ||
          insightType === "physical-health"
        ) {
          category = student.bmiCategory || "Unknown";
        }
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;

        // Program
        const program = student.program || "Unknown";
        programCounts[program] = (programCounts[program] || 0) + 1;

        // Gender
        const gender = student.gender || "Unknown";
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      });

      const categoryColors: Record<string, string> = {
        // Mental Health Risk Levels
        Low: "#10b981",
        Moderate: "#fbbf24",
        High: "#f59e0b",
        Critical: "#ef4444",
        low: "#10b981",
        moderate: "#fbbf24",
        high: "#f59e0b",
        critical: "#ef4444",
        // BMI Categories
        Underweight: "#60a5fa",
        Normal: "#10b981",
        Overweight: "#fbbf24",
        Obese: "#ef4444",
        underweight: "#60a5fa",
        normal: "#10b981",
        overweight: "#fbbf24",
        obese: "#ef4444",
        Unknown: "#6b7280",
      };

      const programColors: Record<string, string> = {
        BSIT: "#3b82f6",
        BSCS: "#8b5cf6",
        BSE: "#10b981",
        BSBA: "#f59e0b",
        Unknown: "#6b7280",
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

      const categoryDataArray = Object.entries(categoryCounts).map(
        ([category, count]) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: count,
          color: categoryColors[category] || "#6b7280",
        }),
      );

      const programDataArray = Object.entries(programCounts).map(
        ([program, count]) => ({
          program: program,
          count: count,
          color: programColors[program] || "#6b7280",
        }),
      );

      const genderDataArray = Object.entries(genderCounts).map(
        ([gender, count]) => ({
          gender: gender.charAt(0).toUpperCase() + gender.slice(1),
          count: count,
          color: genderColors[gender] || "#6b7280",
        }),
      );

      setCategoryDistribution(categoryDataArray);
      setProgramDistribution(programDataArray);
      setGenderDistribution(genderDataArray);
    } else {
      setCategoryDistribution([]);
      setProgramDistribution([]);
      setGenderDistribution([]);
    }
  }, [studentList, insightType]);

  useEffect(() => {
    if (
      type &&
      ["mental-health-prediction", "bmi-category", "physical-health"].includes(
        type,
      )
    ) {
      fetchInsights(
        type as "mental-health-prediction" | "bmi-category" | "physical-health",
      );
    } else {
      navigate("/inventory");
    }
  }, [type, fetchInsights, navigate]);

  // Auto-select "All Categories" when category data is loaded
  useEffect(() => {
    if (categoryData.length > 0 && !selectedCategory) {
      selectCategory("all");
    }
  }, [categoryData, selectedCategory, selectCategory]);

  const handleCategorySelect = (category: string) => {
    // Always call selectCategory - it will handle "all" by not filtering by category
    selectCategory(category);
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

  const handleProgramChange = (program: string) => {
    const programValue = program === "all" ? undefined : program;
    setLocalFilters((prev) => ({ ...prev, program: programValue }));
    updateFilters({ ...localFilters, program: programValue });
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

  const handleBackToInventory = () => {
    navigate("/inventory-records");
  };

  const getInsightTitle = () => {
    switch (type) {
      case "mental-health-prediction":
        return "Mental Health Predictions";
      case "bmi-category":
        return "BMI Categories";
      case "physical-health":
        return "Physical Health Overview";
      default:
        return "Inventory Insights";
    }
  };

  const getInsightColor = () => {
    switch (type) {
      case "mental-health-prediction":
        return "text-purple-600";
      case "bmi-category":
        return "text-blue-600";
      case "physical-health":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading && !insightType) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">
            Loading inventory insights...
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

  if (!insightType) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-600 text-sm sm:text-base">
          No inventory insights data available.
        </p>
      </div>
    );
  }

  const averageValue =
    categoryData.length > 0 ? Math.round(totalCount / categoryData.length) : 0;

  const availableYears = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i,
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
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" },
  ];

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  // Clear all filters function
  const handleClearAllFilters = () => {
    setLocalFilters({
      year: undefined,
      month: undefined,
      program: undefined,
      yearLevel: undefined,
      gender: undefined,
    });
    updateFilters({
      year: undefined,
      month: undefined,
      program: undefined,
      yearLevel: undefined,
      gender: undefined,
    });
  };

  // Check if any filter is active
  const hasActiveFilters =
    localFilters.year ||
    localFilters.month ||
    localFilters.program ||
    localFilters.yearLevel ||
    localFilters.gender;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Top row: Back button and title */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToInventory}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to Inventory"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <Package className={`w-6 h-6 ${getInsightColor()}`} />
                <h1 className="text-xl font-bold text-gray-900">
                  {getInsightTitle()}
                </h1>
              </div>
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All Filters</span>
              </button>
            )}
          </div>

          {/* Filters section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {
                    [
                      localFilters.year && "Year",
                      localFilters.month && "Month",
                      localFilters.program && "Program",
                      localFilters.yearLevel && "Level",
                      localFilters.gender && "Gender",
                    ].filter(Boolean).length
                  }{" "}
                  active
                </span>
              )}
            </div>

            {/* Filter dropdowns in a responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Year Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Year
                </label>
                <Select
                  value={localFilters.year?.toString() || "all"}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {localFilters.year ? localFilters.year : "All Years"}
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
              </div>

              {/* Month Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Month
                </label>
                <Select
                  value={localFilters.month?.toString() || "all"}
                  onValueChange={handleMonthChange}
                  disabled={!localFilters.year}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {localFilters.month
                        ? availableMonths.find(
                            (m) => m.value === localFilters.month,
                          )?.label
                        : "All Months"}
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
              </div>

              {/* Program Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Program
                </label>
                <Select
                  value={localFilters.program || "all"}
                  onValueChange={handleProgramChange}
                  disabled={loadingPrograms}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {localFilters.program || "All Programs"}
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
              </div>

              {/* Year Level Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Year Level
                </label>
                <Select
                  value={localFilters.yearLevel || "all"}
                  onValueChange={handleYearLevelChange}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {localFilters.yearLevel || "All Levels"}
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
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <Select
                  value={localFilters.gender || "all"}
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {localFilters.gender
                        ? localFilters.gender.charAt(0).toUpperCase() +
                          localFilters.gender.slice(1)
                        : "All Genders"}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Records
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Across all categories
                  </p>
                </div>
                <div className="w-12 h-12 flex items-center justify-center text-blue-600 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average per Category
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {averageValue}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Mean distribution
                  </p>
                </div>
                <div className="w-12 h-12 flex items-center justify-center text-green-600 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Categories
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {categoryData.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Different groups</p>
                </div>
                <div className="w-12 h-12 flex items-center justify-center text-purple-600 bg-purple-50 rounded-lg">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribution by Category
            </h3>
            <InsightsBarChart
              data={categoryData}
              onBarClick={() => {
                // Optional: handle bar click for drilling down
              }}
              clickable={false}
            />
          </div>

          {/* Category Selection Dropdown */}
          <div className="bg-white rounded-lg border shadow-sm p-6 max-w-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Category for Details
              </h3>
              {selectedCategory && selectedCategory !== "all" && (
                <button
                  onClick={() => selectCategory("all")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  Show All Categories
                </button>
              )}
            </div>
            <Select
              value={selectedCategory || "all"}
              onValueChange={handleCategorySelect}
            >
              <SelectTrigger className="w-full">
                <span>
                  {selectedCategory === "all"
                    ? "All Categories"
                    : selectedCategory || "Select a category..."}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Analytics (when category selected) */}
          {selectedCategory && studentList.length > 0 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Distribution Pie */}
                <div className="bg-white rounded-lg border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Category Breakdown
                  </h3>
                  <div className="space-y-3">
                    {categoryDistribution.map((item, index) => {
                      // Get color classes based on category name
                      const getCategoryColorClass = (name: string) => {
                        const lowerName = name.toLowerCase();
                        // Mental Health Risk Levels
                        if (lowerName.includes("low")) {
                          return "bg-green-100 text-green-800";
                        } else if (lowerName.includes("moderate")) {
                          return "bg-yellow-100 text-yellow-800";
                        } else if (lowerName.includes("high")) {
                          return "bg-orange-100 text-orange-800";
                        } else if (lowerName.includes("critical")) {
                          return "bg-red-100 text-red-800";
                        }
                        // BMI Categories
                        else if (lowerName.includes("normal")) {
                          return "bg-green-100 text-green-800";
                        } else if (lowerName.includes("underweight")) {
                          return "bg-blue-100 text-blue-800";
                        } else if (lowerName.includes("overweight")) {
                          return "bg-yellow-100 text-yellow-800";
                        } else if (lowerName.includes("obese")) {
                          return "bg-red-100 text-red-800";
                        }
                        return "bg-gray-100 text-gray-800";
                      };

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-md text-sm font-medium ${getCategoryColorClass(item.name)}`}
                            >
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Program Distribution */}
                <div className="bg-white rounded-lg border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    By Program
                  </h3>
                  <div className="space-y-3">
                    {programDistribution.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="px-3 py-1 rounded-md text-sm font-medium text-gray-700"
                            style={{
                              backgroundColor: item.color + "20",
                              color: item.color,
                            }}
                          >
                            {item.program}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Distribution */}
                <div className="bg-white rounded-lg border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    By Gender
                  </h3>
                  <div className="space-y-3">
                    {genderDistribution.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="px-3 py-1 rounded-md text-sm font-medium text-gray-700"
                            style={{
                              backgroundColor: item.color + "20",
                              color: item.color,
                            }}
                          >
                            {item.gender}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student List */}
              <InventoryStudentList
                students={studentList}
                loading={loading}
                title={`Students - ${selectedCategory === "all" ? "All Categories" : selectedCategory}`}
              />
            </>
          )}

          {/* Data Table */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Detailed Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distribution
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryData.map((item, index) => {
                    const percentage =
                      totalCount > 0
                        ? Math.round((item.value / totalCount) * 100)
                        : 0;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              {item.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {percentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
  );
};
