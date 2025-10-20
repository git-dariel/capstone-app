import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export const description = "An interactive pie chart";

interface AssessmentData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface ChartPieInteractiveProps {
  data?: AssessmentData[];
  title?: string;
  description?: string;
  centerText?: string;
}

// Default data for fallback
const defaultData = [
  { name: "Anxiety", value: 107, color: "#f59e0b", fill: "var(--color-anxiety)" },
  { name: "Depression", value: 103, color: "#8b5cf6", fill: "var(--color-depression)" },
  { name: "Stress", value: 70, color: "#ef4444", fill: "var(--color-stress)" },
  { name: "Personal Problems", value: 45, color: "#10b981", fill: "var(--color-checklist)" },
  { name: "Suicide Risk", value: 12, color: "#dc2626", fill: "var(--color-suicide)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
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
  "personal-problems": {
    label: "Personal Problems",
    color: "var(--chart-4)",
  },
  "suicide-risk": {
    label: "Suicide Risk",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function ChartPieInteractive({
  data = defaultData,
  title = "Assessment Distribution",
  description = "Breakdown of assessment types by distribution",
  centerText,
}: ChartPieInteractiveProps) {
  const id = "pie-interactive";

  // Transform data to include fill property and ensure proper format
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: `var(--color-${item.name.toLowerCase().replace(/\s+/g, '-')})`,
      key: item.name.toLowerCase().replace(/\s+/g, '-'),
    }));
  }, [data]);

  const [activeItem, setActiveItem] = React.useState(chartData[0]?.key || "anxiety");

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.key === activeItem),
    [activeItem, chartData]
  );

  const items = React.useMemo(() => chartData.map((item) => item.key), [chartData]);

  return (
    <div>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-col space-y-3 sm:flex-row sm:items-start sm:space-y-0">
        <div className="grid gap-1 flex-1">
          <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        </div>
        <Select value={activeItem} onValueChange={setActiveItem}>
          <SelectTrigger
            className="h-8 w-full rounded-lg pl-2.5 sm:ml-auto sm:h-7 sm:w-[130px]"
            aria-label="Select assessment type"
          >
            {activeItem
              ? chartConfig[activeItem as keyof typeof chartConfig]?.label || activeItem
              : "Select type"}
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {items.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem key={key} value={key} className="rounded-lg [&_span]:flex">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0 px-2 sm:px-6">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px] sm:max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const activeValue = chartData[activeIndex]?.value || 0;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold sm:text-3xl"
                        >
                          {centerText || activeValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs sm:text-sm"
                        >
                          {chartData[activeIndex]?.name || "Assessments"}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
}
