import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useIsMobile } from "../../hooks/useIsMobile";

interface ProgramData {
  program: string;
  anxiety?: number;
  depression?: number;
  stress?: number;
}

interface ProgramDistributionChartProps {
  data: ProgramData[];
  title?: string;
}

export const ProgramDistributionChart: React.FC<ProgramDistributionChartProps> = ({
  data,
  title = "Assessments by Academic Program",
}) => {
  const isMobile = useIsMobile();
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} assessments
            </p>
          ))}
          <p className="text-sm text-gray-600 mt-1 pt-1 border-t border-gray-200">
            Total: {total} assessments
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
          <p className="text-sm text-gray-600">
            Mental health assessment distribution across academic programs
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: isMobile ? 5 : 10,
            left: isMobile ? 5 : 10,
            bottom: isMobile ? 100 : 80,
          }}
          style={{ outline: "none" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="program"
            stroke="#64748b"
            fontSize={isMobile ? 8 : 10}
            angle={-45}
            textAnchor="end"
            height={isMobile ? 100 : 80}
            interval={0}
          />
          <YAxis
            stroke="#64748b"
            fontSize={isMobile ? 8 : 10}
            width={isMobile ? 30 : 40}
            label={{
              value: "Assessments",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: isMobile ? 8 : 10 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "0px",
              fontSize: isMobile ? "10px" : "12px",
            }}
            iconType="rect"
          />
          <Bar dataKey="anxiety" fill="#f59e0b" name="Anxiety" radius={[2, 2, 0, 0]} />
          <Bar dataKey="depression" fill="#8b5cf6" name="Depression" radius={[2, 2, 0, 0]} />
          <Bar dataKey="stress" fill="#ef4444" name="Stress" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
