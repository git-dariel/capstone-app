import React, { useState, useEffect } from "react";
import {
  StatsGrid,
  RecentActivitiesTable,
  TrendsLineChart,
  AssessmentDonutChart,
  ProgramDistributionChart,
} from "@/components/molecules";
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
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setChartsLoading(true);
        const [trends, programs, breakdown] = await Promise.all([
          DashboardService.getAssessmentTrends(7),
          DashboardService.getProgramDistribution(),
          DashboardService.getAssessmentBreakdown(),
        ]);

        // Ensure data is always arrays, even if API returns undefined
        setTrendsData(Array.isArray(trends) ? trends : []);
        setProgramData(Array.isArray(programs) ? programs : []);
        setAssessmentBreakdown(Array.isArray(breakdown) ? breakdown : []);
      } catch (error) {
        console.error("Error loading dashboard charts:", error);
        // Set empty arrays on error to prevent undefined issues
        setTrendsData([]);
        setProgramData([]);
        setAssessmentBreakdown([]);
      } finally {
        setChartsLoading(false);
      }
    };

    loadChartData();
  }, []);

  return (
    <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Overview of student mental health assessments
          </p>
        </div>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Assessment Trends Line Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            {chartsLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <TrendsLineChart data={trendsData} title="Assessment Trends" />
            )}
          </div>

          {/* Assessment Distribution Donut Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            {chartsLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <AssessmentDonutChart
                data={assessmentBreakdown}
                title="Assessment Distribution"
                centerText={
                  assessmentBreakdown && assessmentBreakdown.length > 0
                    ? assessmentBreakdown.reduce((sum, item) => sum + item.value, 0).toString()
                    : "0"
                }
              />
            )}
          </div>
        </div>

        {/* Program Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          {chartsLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <ProgramDistributionChart data={programData} title="Assessments by Academic Program" />
          )}
        </div>

        {/* Recent Activities Table */}
        <RecentActivitiesTable />
      </div>
    </main>
  );
};
