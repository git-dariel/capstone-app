import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { InsightData } from "@/types/insights";

interface InsightsBarChartProps {
  data: InsightData[];
  onBarClick?: (data: InsightData) => void;
  clickable?: boolean;
}

export const InsightsBarChart: React.FC<InsightsBarChartProps> = ({
  data,
  onBarClick,
  clickable = false,
}) => {
  const handleClick = (data: any) => {
    if (clickable && onBarClick && data?.payload) {
      onBarClick(data.payload);
    }
  };

  return (
    <div className="w-full h-64 sm:h-80 lg:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 5,
            left: 5,
            bottom: 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            stroke="#64748b"
            fontSize={10}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis stroke="#64748b" fontSize={10} width={30} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [
              `${value} students`,
              name === "value" ? "Count" : name,
            ]}
          />
          <Bar
            dataKey="value"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            onClick={handleClick}
            cursor={clickable ? "pointer" : "default"}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
