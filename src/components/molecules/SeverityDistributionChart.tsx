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
    <div className="w-full h-80 sm:h-96">
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
            right: 10,
            left: 10,
            bottom: 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="program"
            stroke="#64748b"
            fontSize={10}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            stroke="#64748b"
            fontSize={10}
            width={40}
            label={{ value: "Assessments", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
          <Bar dataKey="anxiety" fill="#f59e0b" name="Anxiety" radius={[2, 2, 0, 0]} />
          <Bar dataKey="depression" fill="#8b5cf6" name="Depression" radius={[2, 2, 0, 0]} />
          <Bar dataKey="stress" fill="#ef4444" name="Stress" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
