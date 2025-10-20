"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An interactive bar chart";

interface ProgramData {
  program: string;
  anxiety: number;
  depression: number;
  stress: number;
  checklist: number;
  suicide: number;
}

interface ChartBarInteractiveProps {
  data?: ProgramData[];
  title?: string;
  description?: string;
}

// Default data for fallback
const defaultData = [
  { program: "Computer Science", anxiety: 45, depression: 32, stress: 28, checklist: 15, suicide: 3 },
  { program: "Engineering", anxiety: 38, depression: 29, stress: 35, checklist: 12, suicide: 2 },
  { program: "Business", anxiety: 25, depression: 18, stress: 22, checklist: 8, suicide: 1 },
  { program: "Psychology", anxiety: 52, depression: 41, stress: 38, checklist: 18, suicide: 4 },
];

const chartConfig = {
  anxiety: {
    label: "Anxiety",
    color: "var(--chart-1)",
  },
  depression: {
    label: "Depression",
    color: "var(--chart-2)",
  },
  stress: {
    label: "Stress",
    color: "var(--chart-3)",
  },
  checklist: {
    label: "Personal Problems",
    color: "var(--chart-4)",
  },
  suicide: {
    label: "Suicide Risk",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function ChartBarInteractive({
  data = defaultData,
  title = "Assessment Distribution by Program",
  description = "Breakdown of assessments across academic programs",
}: ChartBarInteractiveProps) {
  const [selectedProgram, setSelectedProgram] = React.useState<string>("all");

  // Get unique programs for filtering
  const programs = React.useMemo(() => {
    const uniquePrograms = [...new Set(data.map((item) => item.program))];
    return ["all", ...uniquePrograms];
  }, [data]);

  // Filter data based on selected program
  const filteredData = React.useMemo(() => {
    if (selectedProgram === "all") {
      return data;
    }
    return data.filter((item) => item.program === selectedProgram);
  }, [data, selectedProgram]);

  return (
    <div>
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2 px-4 py-3 sm:px-6 sm:py-4">
          {programs.map((program) => (
            <button
              key={program}
              data-active={selectedProgram === program}
              className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground rounded-lg border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
              onClick={() => setSelectedProgram(program)}
            >
              {program === "all" ? "All Programs" : program.toUpperCase()}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-3 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full sm:h-[250px]">
          <BarChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="program"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                // Truncate long program names for mobile
                return value.length > 10 ? value.substring(0, 10) + "..." : value;
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent className="w-[200px]" labelFormatter={(value) => value} />
              }
            />
            <Bar dataKey="anxiety" fill="var(--color-anxiety)" name="Anxiety" />
            <Bar dataKey="depression" fill="var(--color-depression)" name="Depression" />
            <Bar dataKey="stress" fill="var(--color-stress)" name="Stress" />
            <Bar dataKey="checklist" fill="var(--color-checklist)" name="Personal Problems" />
            <Bar dataKey="suicide" fill="var(--color-suicide)" name="Suicide Risk" />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
}
