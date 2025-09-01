import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useIsMobile } from "../../hooks/useIsMobile";

interface TrendData {
  date: string;
  anxiety?: number;
  depression?: number;
  stress?: number;
}

interface TrendsLineChartProps {
  data: TrendData[];
  showLegend?: boolean;
  title?: string;
}

export const TrendsLineChart: React.FC<TrendsLineChartProps> = ({
  data,
  showLegend = true,
  title = "Assessment Trends Over Time",
}) => {
  const isMobile = useIsMobile();
  return (
    <div className="w-full h-80 sm:h-96 focus:outline-none" tabIndex={-1}>
      {title && (
        <div className="mb-4 px-2">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Track mental health assessment patterns over time</p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: isMobile ? 5 : 10,
            left: isMobile ? 5 : 10,
            bottom: isMobile ? 60 : 40,
          }}
          style={{ outline: "none" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={isMobile ? 8 : 10}
            angle={-45}
            textAnchor="end"
            height={isMobile ? 80 : 60}
            interval={isMobile ? "preserveStartEnd" : "preserveStartEnd"}
          />
          <YAxis
            stroke="#64748b"
            fontSize={isMobile ? 8 : 10}
            width={isMobile ? 30 : 40}
            label={{
              value: "Count",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: isMobile ? 8 : 10 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontSize: isMobile ? "10px" : "12px",
            }}
            formatter={(value: number, name: string) => {
              const labels: { [key: string]: string } = {
                anxiety: "Anxiety",
                depression: "Depression",
                stress: "Stress",
              };
              return [`${value} assessments`, labels[name] || name];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: isMobile ? "10px" : "20px",
                fontSize: isMobile ? "10px" : "12px",
              }}
              iconType="line"
            />
          )}
          <Area
            type="monotone"
            dataKey="anxiety"
            stackId="1"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.6}
            strokeWidth={2}
            name="Anxiety"
          />
          <Area
            type="monotone"
            dataKey="depression"
            stackId="1"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
            strokeWidth={2}
            name="Depression"
          />
          <Area
            type="monotone"
            dataKey="stress"
            stackId="1"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.6}
            strokeWidth={2}
            name="Stress"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
