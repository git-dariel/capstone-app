import React, { useState, useEffect } from "react";
import { StatsGrid, RecentActivitiesTable } from "@/components/molecules";
import { ChartPieInteractive } from "@/components/ui/piechart";
import { ChartAreaInteractive } from "@/components/ui/areachart";
import { ChartBarInteractive } from "@/components/ui/barchart";
import { DashboardService } from "@/services/dashboard.service";
import type {
  ChartDataPoint,
  ProgramDistribution,
  AssessmentBreakdown,
} from "@/services/dashboard.service";

export const DashboardContent: React.FC = () => {
  const [trendsData, setTrendsData] = useState<ChartDataPoint[]>([]);
  const [programData, setProgramData] = useState<ProgramDistribution[]>([]);
  const [assessmentBreakdown, setAssessmentBreakdown] = useState<AssessmentBreakdown[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [programLoading, setProgramLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(7);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>("all");

  // Load static chart data (programs and breakdown) only once on mount, reload when assessment filter changes
  useEffect(() => {
    const loadStaticChartData = async () => {
      try {
        setProgramLoading(true);
        const [programs, breakdown] = await Promise.all([
          DashboardService.getProgramDistribution(selectedAssessmentType),
          DashboardService.getAssessmentBreakdown(),
        ]);

        setProgramData(Array.isArray(programs) ? programs : []);
        setAssessmentBreakdown(Array.isArray(breakdown) ? breakdown : []);
      } catch (error) {
        console.error("Error loading static chart data:", error);
        // Set empty arrays on error to prevent undefined issues
        setProgramData([]);
        setAssessmentBreakdown([]);
      } finally {
        setProgramLoading(false);
      }
    };

    loadStaticChartData();
  }, [selectedAssessmentType]); // Reload when assessment type changes

  // Load trends data when time range changes
  useEffect(() => {
    const loadTrendsData = async () => {
      try {
        setTrendsLoading(true);
        const trends = await DashboardService.getAssessmentTrends(selectedTimeRange);

        // Ensure data is always arrays, even if API returns undefined
        setTrendsData(Array.isArray(trends) ? trends : []);
      } catch (error) {
        console.error("Error loading trends data:", error);
        // Set empty arrays on error to prevent undefined issues
        setTrendsData([]);
      } finally {
        setTrendsLoading(false);
      }
    };

    loadTrendsData();
  }, [selectedTimeRange]); // Only reload when time range changes

  const handleTimeRangeChange = (timeRange: string) => {
    // Convert time range string to number of days
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    setSelectedTimeRange(days);
  };

  const handleAssessmentTypeChange = (assessmentType: string) => {
    setSelectedAssessmentType(assessmentType);
  };

  const getDescriptionForTimeRange = (days: number) => {
    if (days === 7) return "Showing assessment trends over the last 7 days";
    if (days === 30) return "Showing assessment trends over the last 30 days";
    return "Showing assessment trends over the last 3 months";
  };

  const getTimeRangeString = (days: number) => {
    if (days === 7) return "7d";
    if (days === 30) return "30d";
    return "90d";
  };

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
            Overview of student mental health assessments
          </p>
        </div>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Assessment Trends Area Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
            {trendsLoading ? (
              <div className="flex items-center justify-center h-64 sm:h-80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ChartAreaInteractive
                data={trendsData}
                title="Assessment Trends"
                description={getDescriptionForTimeRange(selectedTimeRange)}
                onTimeRangeChange={handleTimeRangeChange}
                currentTimeRange={getTimeRangeString(selectedTimeRange)}
              />
            )}
          </div>

          {/* Assessment Distribution Interactive Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
            <ChartPieInteractive
              data={assessmentBreakdown}
              title="Assessment Distribution"
              description="Breakdown of assessment types by distribution"
              centerText={
                assessmentBreakdown && assessmentBreakdown.length > 0
                  ? assessmentBreakdown.reduce((sum, item) => sum + item.value, 0).toString()
                  : "0"
              }
            />
          </div>
        </div>

        {/* Program Distribution Interactive Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4">
          {programLoading ? (
            <div className="flex items-center justify-center h-64 sm:h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <ChartBarInteractive
              data={programData.map((item) => ({
                program: item.program,
                anxiety: item.anxiety || 0,
                depression: item.depression || 0,
                stress: item.stress || 0,
                checklist: item.checklist || 0,
                suicide: item.suicide || 0,
              }))}
              title="Assessment Distribution by Program"
              description="Breakdown of assessments across academic programs"
              onAssessmentTypeChange={handleAssessmentTypeChange}
              currentAssessmentType={selectedAssessmentType}
            />
          )}
        </div>

        {/* Recent Activities Table */}
        <RecentActivitiesTable />
      </div>
    </main>
  );
};
