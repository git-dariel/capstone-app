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
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

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
  onAssessmentTypeChange?: (assessmentType: string) => void;
  currentAssessmentType?: string;
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
  onAssessmentTypeChange,
  currentAssessmentType = "all",
}: ChartBarInteractiveProps) {
  const [selectedProgram, setSelectedProgram] = React.useState<string>("all");
  const [selectedAssessmentType, setSelectedAssessmentType] = React.useState<string>(currentAssessmentType);

  // Sync internal state with prop changes
  React.useEffect(() => {
    setSelectedAssessmentType(currentAssessmentType);
  }, [currentAssessmentType]);

  // Handle assessment type change
  const handleAssessmentTypeChange = (newAssessmentType: string) => {
    setSelectedAssessmentType(newAssessmentType);
    if (onAssessmentTypeChange) {
      onAssessmentTypeChange(newAssessmentType);
    }
  };

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
      <CardHeader className="flex flex-col gap-3 space-y-0 border-b py-4 sm:flex-row sm:items-center sm:gap-2 sm:py-5">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:ml-auto">
          {/* Assessment Type Filter */}
          <Select value={selectedAssessmentType} onValueChange={handleAssessmentTypeChange}>
            <SelectTrigger
              className="w-full rounded-lg sm:w-[180px]"
              aria-label="Select assessment type"
            >
              {selectedAssessmentType === "all" ? "All Assessments" : 
               selectedAssessmentType === "checklist" ? "Personal Problems" :
               selectedAssessmentType.charAt(0).toUpperCase() + selectedAssessmentType.slice(1)}
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                All Assessments
              </SelectItem>
              <SelectItem value="anxiety" className="rounded-lg">
                Anxiety
              </SelectItem>
              <SelectItem value="depression" className="rounded-lg">
                Depression
              </SelectItem>
              <SelectItem value="stress" className="rounded-lg">
                Stress
              </SelectItem>
              <SelectItem value="checklist" className="rounded-lg">
                Personal Problems
              </SelectItem>
              <SelectItem value="suicide" className="rounded-lg">
                Suicide Risk
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* Program Filter */}
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger
              className="w-full rounded-lg sm:w-[180px]"
              aria-label="Select a program"
            >
              {selectedProgram === "all" ? "All Programs" : selectedProgram.toUpperCase()}
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {programs.map((program) => (
                <SelectItem key={program} value={program} className="rounded-lg">
                  {program === "all" ? "All Programs" : program.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
