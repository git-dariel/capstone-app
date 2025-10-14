import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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

export const description = "An interactive area chart";

interface ChartAreaInteractiveProps {
  data?: Array<{
    date: string;
    anxiety: number;
    depression: number;
    stress: number;
  }>;
  title?: string;
  description?: string;
  onTimeRangeChange?: (timeRange: string) => void;
  currentTimeRange?: string;
}

const chartConfig = {
  visitors: {
    label: "Visitors",
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
} satisfies ChartConfig;

// Default data for fallback - converted to match API structure
const defaultAssessmentData = [
  { date: "2024-04-01", anxiety: 222, depression: 150, stress: 180 },
  { date: "2024-04-02", anxiety: 97, depression: 180, stress: 120 },
  { date: "2024-04-03", anxiety: 167, depression: 120, stress: 200 },
  { date: "2024-04-04", anxiety: 242, depression: 260, stress: 190 },
  { date: "2024-04-05", anxiety: 373, depression: 290, stress: 250 },
];

export function ChartAreaInteractive({
  data = defaultAssessmentData,
  title = "Assessment Trends",
  description = "Showing assessment trends over time",
  onTimeRangeChange,
  currentTimeRange = "7d",
}: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState(currentTimeRange);

  // Sync internal state with prop changes
  React.useEffect(() => {
    setTimeRange(currentTimeRange);
  }, [currentTimeRange]);

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
    if (onTimeRangeChange) {
      onTimeRangeChange(newTimeRange);
    }
  };

  // Transform API data to match chart format if needed
  const transformedData = React.useMemo(() => {
    if (!data || data.length === 0) return defaultAssessmentData;

    // If data has anxiety/depression/stress, use it directly
    if (data[0] && "anxiety" in data[0]) {
      return data;
    }

    // Otherwise use default data
    return defaultAssessmentData;
  }, [data]);

  // For API data, we don't need to filter since the API already provides the correct date range
  // The API returns data based on the selected time range
  const filteredData = transformedData;

  return (
    <div>
      <CardHeader className="flex flex-col gap-3 space-y-0 border-b py-4 sm:flex-row sm:items-center sm:gap-2 sm:py-5">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger
            className="w-full rounded-lg sm:ml-auto sm:w-[160px]"
            aria-label="Select a value"
          >
            {timeRange === "90d"
              ? "Last 3 months"
              : timeRange === "30d"
              ? "Last 30 days"
              : timeRange === "7d"
              ? "Last 7 days"
              : "Last 3 months"}
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-3 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full sm:h-[250px]">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAnxiety" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-anxiety)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-anxiety)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillDepression" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-depression)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-depression)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-stress)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-stress)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="anxiety"
              type="natural"
              fill="url(#fillAnxiety)"
              stroke="var(--color-anxiety)"
              stackId="a"
            />
            <Area
              dataKey="depression"
              type="natural"
              fill="url(#fillDepression)"
              stroke="var(--color-depression)"
              stackId="a"
            />
            <Area
              dataKey="stress"
              type="natural"
              fill="url(#fillStress)"
              stroke="var(--color-stress)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
}
