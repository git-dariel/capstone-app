import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { InsightData } from "@/types/insights";

interface InsightsBarChartProps {
  data: InsightData[];
  onBarClick?: (data: InsightData) => void;
  clickable?: boolean;
  title?: string;
  description?: string;
}

export const InsightsBarChart: React.FC<InsightsBarChartProps> = ({
  data,
  onBarClick,
  clickable = false,
  title,
  description,
}) => {
  const handleClick = (data: any) => {
    if (clickable && onBarClick && data?.payload) {
      onBarClick(data.payload);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            {value} students ({percentage}%)
          </p>
          {clickable && <p className="text-xs text-blue-600 mt-1">Click to drill down</p>}
        </div>
      );
    }
    return null;
  };

  const getBarColor = (index: number, dataItem: InsightData) => {
    // Use the color from the data if available, otherwise fall back to generated colors
    if (dataItem.color) {
      return dataItem.color;
    }

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
    return colors[index % colors.length];
  };

  return (
    <div className="w-full">
      {(title || description) && (
        <div className="mb-4 px-2">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          {clickable && (
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                💡 Click bars to explore detailed breakdowns
              </span>
            </div>
          )}
        </div>
      )}
      <div className="w-full h-64 sm:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 10,
              left: 10,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              width={40}
              label={{ value: "Students", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              onClick={handleClick}
              cursor={clickable ? "pointer" : "default"}
            >
              {data.map((dataItem, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index, dataItem)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
