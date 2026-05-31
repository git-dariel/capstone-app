import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface SeverityData {
  name: string;
  value: number;
  color: string;
}

interface SeverityPieChartProps {
  data: SeverityData[];
  title?: string;
  description?: string;
}

export const SeverityPieChart: React.FC<SeverityPieChartProps> = ({
  data,
  title = "Severity Distribution",
  description,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      payload: { name: string; value: number; color: string };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage =
        total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white px-3 py-2 border border-gray-200 rounded shadow-lg">
          <p
            className="text-sm font-semibold"
            style={{ color: item.payload.color }}
          >
            {item.name}
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

  const CustomLegend = ({
    payload,
  }: {
    payload?: Array<{
      value: string;
      color: string;
      payload: { value: number };
    }>;
  }) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload?.map((entry, index: number) => {
          const percentage =
            total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-700">
                {entry.value}:{" "}
                <span className="font-semibold">{entry.payload.value}</span> (
                {percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p className="text-sm">No severity data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {title && (
        <div className="mb-2">
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }: { percent: number }) =>
              `${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
