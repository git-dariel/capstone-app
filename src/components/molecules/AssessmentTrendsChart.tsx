import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { AssessmentTrends } from "@/services/student-dashboard.service";

export const description = "An interactive area chart for assessment severity trends";

interface AssessmentTrendsChartProps {
  data?: Array<{
    date: string;
    anxiety: number;
    depression: number;
    stress: number;
    checklist: number;
    suicide: number;
  }>;
  title?: string;
  description?: string;
  currentTimeRange?: string;
  trends?: AssessmentTrends;
  onAssessmentTimeRangeChange?: (assessmentType: string, timeRange: string) => void;
}

// Note: chartConfig kept for potential future use with Recharts integration
// const chartConfig = { ... }

// Severity level to numeric mapping for consistent ordering
const severityLevelMap: Record<string, number> = {
  // Anxiety/Depression/Stress severity levels
  minimal: 1,
  mild: 2,
  moderate: 3,
  severe: 4,
  "extremely severe": 5,

  // Suicide risk levels
  low: 1,
  medium: 2,
  high: 4,

  // Checklist risk levels
  low_risk: 1,
  moderate_risk: 2,
  high_risk: 3,
  critical: 5,

  // Additional mappings
  normal: 1,
  none: 0,
  unknown: 0,
};

// Severity level to color mapping based on risk level
const severityColorMap: Record<string, string> = {
  // Green: Low/Minimal (1-2)
  minimal: "#10b981", // Emerald
  mild: "#34d399", // Light emerald
  low: "#10b981", // Emerald
  low_risk: "#10b981", // Emerald
  normal: "#10b981", // Emerald
  none: "#d1d5db", // Gray

  // Yellow: Moderate (3)
  moderate: "#f59e0b", // Amber
  moderate_risk: "#f59e0b", // Amber
  medium: "#fbbf24", // Light amber
  moderately_severe: "#f97316", // Orange (between moderate and severe)

  // Orange: High (4)
  high: "#f97316", // Orange
  severe: "#ef4444", // Red (high severity)
  high_risk: "#f97316", // Orange
  extremely_severe: "#dc2626", // Dark red (critical)
  critical: "#dc2626", // Dark red

  // Default
  unknown: "#9ca3af", // Gray
};

// Get color based on severity level with fallback
const getColorBySeverity = (level: string): string => {
  const normalizedLevel = level?.toLowerCase() || "unknown";
  return severityColorMap[normalizedLevel] || severityColorMap["unknown"];
};

export function AssessmentTrendsChart({
  trends,
  title = "Assessment Trends",
  description = "Showing assessment trends over time",
  currentTimeRange = "30d",
  onAssessmentTimeRangeChange,
}: AssessmentTrendsChartProps) {
  const [individualTimeRanges, setIndividualTimeRanges] = React.useState({
    anxiety: currentTimeRange,
    depression: currentTimeRange,
    stress: currentTimeRange,
    checklist: currentTimeRange,
    suicide: currentTimeRange,
  });

  // Sync internal state with prop changes
  React.useEffect(() => {
    setIndividualTimeRanges((prev) => ({
      anxiety: prev.anxiety,
      depression: prev.depression,
      stress: prev.stress,
      checklist: prev.checklist,
      suicide: prev.suicide,
    }));
  }, []);

  // Handle individual chart time range change
  const handleIndividualTimeRangeChange = (
    type: "anxiety" | "depression" | "stress" | "suicide" | "checklist",
    newTimeRange: string
  ) => {
    setIndividualTimeRanges((prev) => ({
      ...prev,
      [type]: newTimeRange,
    }));
    // Notify parent component to reload data for this specific assessment
    if (onAssessmentTimeRangeChange) {
      onAssessmentTimeRangeChange(type, newTimeRange);
    }
  };

  // Transform API trends data for individual assessment charts
  const transformedDataByType = React.useMemo(() => {
    if (!trends) {
      console.log("❌ No trends data provided");
      return {};
    }

    console.log("📊 Raw trends data:", JSON.stringify(trends, null, 2));

    const assessmentTypes = ["anxiety", "depression", "stress", "suicide", "checklist"];
    const dataByType: Record<string, any[]> = {};

    assessmentTypes.forEach((type) => {
      const assessmentArray = (trends as any)[type];

      if (!Array.isArray(assessmentArray) || assessmentArray.length === 0) {
        console.log(`⚠️ No data for ${type}`);
        dataByType[type] = [];
        return;
      }

      console.log(`\n📈 Processing ${type} (${assessmentArray.length} records):`);

      const chartData = assessmentArray.map((item: any) => {
        const level = item.level?.toLowerCase() || "unknown";
        const numericValue = severityLevelMap[level] || 0;
        const barColor = getColorBySeverity(level);

        console.log(`  ✓ Date: ${item.date}, Level: "${level}", Numeric: ${numericValue}, Color: ${barColor}`);

        return {
          date: item.date,
          value: numericValue,
          level: level,
          score: item.score || null,
          count: item.count || 1,
          color: barColor,
        };
      });

      dataByType[type] = chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    console.log("\n✅ Final data by type:", JSON.stringify(dataByType, null, 2));
    return dataByType;
  }, [trends]);

  // Assessment type configurations
  const assessmentConfigs = {
    anxiety: {
      label: "Anxiety",
      icon: "🔹",
    },
    depression: {
      label: "Depression",
      icon: "🔹",
    },
    stress: {
      label: "Stress",
      icon: "🔹",
    },
    checklist: {
      label: "Personal Problems",
      icon: "🔹",
    },
    suicide: {
      label: "Suicide Risk",
      icon: "⚠️",
    },
  };

  const renderIndividualChart = (type: "anxiety" | "depression" | "stress" | "suicide" | "checklist") => {
    const chartData = transformedDataByType[type] || [];
    const config = assessmentConfigs[type];
    const currentChartTimeRange = individualTimeRanges[type];

    if (chartData.length === 0) {
      return null;
    }

    return (
      <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col gap-2 space-y-0 border-b p-4 sm:flex-row sm:items-center sm:gap-2">
          <div className="grid flex-1 gap-1">
            <h3 className="text-base font-semibold text-gray-900">{config.label}</h3>
            <p className="text-xs text-gray-500">Severity trend for {config.label.toLowerCase()}</p>
          </div>
          <Select
            value={currentChartTimeRange}
            onValueChange={(newRange) => handleIndividualTimeRangeChange(type, newRange)}
          >
            <SelectTrigger className="w-full rounded-lg sm:ml-auto sm:w-[140px]" aria-label="Select time range">
              {currentChartTimeRange === "90d"
                ? "Last 3 months"
                : currentChartTimeRange === "30d"
                ? "Last 30 days"
                : currentChartTimeRange === "7d"
                ? "Last 7 days"
                : currentChartTimeRange === "1y"
                ? "Last year"
                : "Last 30 days"}
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="1y" className="rounded-lg">
                Last year
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="p-4">
          <ChartContainer
            config={{
              value: { label: config.label, color: "#6b7280" },
            }}
            className="aspect-auto h-[200px] w-full"
          >
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;

                  const item = payload[0].payload;

                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-sm">
                        {new Date(label || "").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <div className="text-xs space-y-1 mt-2">
                        <p>
                          {config.icon} <strong className="capitalize">{item.level}</strong>
                        </p>
                        {item.score !== null && <p className="text-gray-600">Score: {item.score}</p>}
                        <p className="text-gray-600">Assessment(s): {item.count}</p>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={true}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with title and description */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Individual assessment charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderIndividualChart("anxiety")}
        {renderIndividualChart("depression")}
        {renderIndividualChart("stress")}
        {renderIndividualChart("checklist")}
        {renderIndividualChart("suicide")}
      </div>

      {/* Empty state */}
      {Object.values(transformedDataByType).every((data) => data.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">No assessment data available</p>
              <p className="text-xs text-gray-500 mt-1">Take assessments to see your severity trends</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
