import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { MetricsService } from "@/services";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ProgramData {
  program: string;
  count: number;
}

interface YearData {
  year: string;
  count: number;
}

interface StudentDistributionChartsProps {
  className?: string;
}

const chartConfig = {
  count: {
    label: "Students",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const StudentDistributionCharts: React.FC<StudentDistributionChartsProps> = ({
  className = "",
}) => {
  const [programData, setProgramData] = useState<ProgramData[]>([]);
  const [yearData, setYearData] = useState<YearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistributionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [programStats, yearStats] = await Promise.all([
        MetricsService.getStudentsByProgram(),
        MetricsService.getStudentsByYear(),
      ]);

      // Sort by count (descending) for better visualization
      setProgramData(
        programStats
          .sort((a, b) => b.count - a.count)
          .map((item) => ({
            program: item.program,
            count: item.count,
          }))
      );

      // Sort year levels numerically
      setYearData(
        yearStats
          .sort((a, b) => {
            // Convert year strings to numbers for proper sorting
            const yearA = parseInt(a.year);
            const yearB = parseInt(b.year);
            return yearA - yearB;
          })
          .map((item) => ({
            year: `Year ${item.year}`,
            count: item.count,
          }))
      );
    } catch (error: any) {
      console.error("Error fetching distribution data:", error);
      setError("Failed to load distribution data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributionData();
  }, []);

  const getBarColors = (dataLength: number) => {
    const colors = [
      "#3b82f6", // Blue
      "#10b981", // Green
      "#f59e0b", // Yellow
      "#ef4444", // Red
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#06b6d4", // Cyan
      "#84cc16", // Lime
    ];
    return Array.from({ length: dataLength }, (_, index) => colors[index % colors.length]);
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to Load Charts</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button
            onClick={fetchDistributionData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Students by Program Chart */}
      <div className="bg-white rounded-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Students by Academic Program
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Distribution of students across academic programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <BarChart data={programData} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="program"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  // Truncate long program names for mobile
                  return value.length > 12 ? value.substring(0, 12) + "..." : value;
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {programData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColors(programData.length)[index]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </div>

      {/* Students by Year Level Chart */}
      <div className="bg-white rounded-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Students by Year Level
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Distribution of students across year levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <BarChart data={yearData} margin={{ top: 20, right: 10, left: 10, bottom: 40 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {yearData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColors(yearData.length)[index]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </div>
    </div>
  );
};
