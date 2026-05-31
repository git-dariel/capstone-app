import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface GenderData {
  gender: string;
  count: number;
  color: string;
}

interface GenderDistributionChartProps {
  data: GenderData[];
  title?: string;
  description?: string;
}

export const GenderDistributionChart: React.FC<
  GenderDistributionChartProps
> = ({ data, title = "Distribution by Gender", description }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: { gender: string };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage =
        total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white px-3 py-2 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-semibold text-gray-900">
            {item.payload.gender}
          </p>
          <p className="text-xs text-gray-600">
            Count: <span className="font-semibold">{item.value}</span>
          </p>
          <p className="text-xs text-gray-600">
            Percentage: <span className="font-semibold">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p className="text-sm">No gender data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="gender"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#d1d5db" }}
            label={{
              value: "Count",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: "#6b7280" },
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            iconType="circle"
          />
          <Bar dataKey="count" name="Students" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
