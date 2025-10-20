import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AssessmentTrend } from "@/services/student-dashboard.service";

interface ProgressTrendChartProps {
  data: AssessmentTrend[];
  title: string;
  color?: string;
  height?: number;
}

export const ProgressTrendChart: React.FC<ProgressTrendChartProps> = ({
  data,
  title,
  color = "#3b82f6",
  height = 200,
}) => {
  // Format data for the chart
  const chartData = (data || []).map((item) => {
    // For suicide assessments, map risk levels to numeric values for charting
    let chartScore = item.score;
    if (chartScore === null && item.level) {
      // Map risk levels to numeric values for suicide assessments
      const riskLevelMap = { low: 10, moderate: 50, high: 90 };
      chartScore = riskLevelMap[item.level.toLowerCase() as keyof typeof riskLevelMap] || null;
    }

    return {
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: chartScore,
      level: item.level,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isSuicideAssessment =
        (data.score !== null && data.score === 10) || data.score === 50 || data.score === 90;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Date: ${label}`}</p>
          {isSuicideAssessment ? (
            <p className="text-sm text-gray-600">
              Risk Level: <span className="font-medium">{data.level}</span>
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Score: <span className="font-medium">{data.score || "N/A"}</span>
              </p>
              <p className="text-sm text-gray-600">
                Level: <span className="font-medium">{data.level}</span>
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        {(!data || data.length === 0) ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="text-center">
              <p className="text-sm">No assessment data available</p>
              <p className="text-xs text-gray-400 mt-1">
                Take your first assessment to see progress
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
