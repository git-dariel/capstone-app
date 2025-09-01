import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useIsMobile } from "../../hooks/useIsMobile";

interface DonutData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface AssessmentDonutChartProps {
  data: DonutData[];
  title?: string;
  centerText?: string;
  showPercentage?: boolean;
}

export const AssessmentDonutChart: React.FC<AssessmentDonutChartProps> = ({
  data,
  title = "Assessment Distribution",
  centerText,
  showPercentage = true,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const isMobile = useIsMobile();

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {showPercentage ? `${(percent * 100).toFixed(0)}%` : value}
      </text>
    );
  };

  const renderMobileLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }: any) => {
    if (percent < 0.08) return null; // Don't show labels for slices smaller than 8% on mobile

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="10"
        fontWeight="600"
      >
        {showPercentage ? `${(percent * 100).toFixed(0)}%` : value}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} assessments ({((data.value / total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 sm:h-96 focus:outline-none" tabIndex={-1}>
      {title && (
        <div className="mb-4 px-2">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Breakdown of assessment types by distribution</p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="85%">
        <PieChart style={{ outline: "none" }}>
          <Pie
            data={data}
            cx="50%"
            cy={isMobile ? "40%" : "45%"}
            labelLine={false}
            label={isMobile ? renderMobileLabel : renderCustomizedLabel}
            outerRadius={isMobile ? 80 : 120}
            innerRadius={isMobile ? 40 : 60}
            fill="#8884d8"
            dataKey="value"
            style={{ outline: "none" }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={isMobile ? 50 : 60}
            wrapperStyle={{
              paddingTop: isMobile ? "15px" : "50px",
              fontSize: isMobile ? "10px" : "12px",
            }}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color, fontSize: isMobile ? "10px" : "12px" }}>
                {value} ({entry.payload.value})
              </span>
            )}
          />
          {/* Always display total in center */}
          <text
            x="50%"
            y={isMobile ? "35%" : "38%"}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-3xl font-bold fill-gray-900"
            style={{ fontSize: isMobile ? "20px" : "28px" }}
          >
            {centerText || total}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
