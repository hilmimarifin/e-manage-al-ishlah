"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface BarChartData {
  [key: string]: string | number;
}

interface CustomBarChartProps {
  title: string;
  description?: string;
  data: BarChartData[];
  config: ChartConfig;
  xAxisKey: string;
  bars: Array<{
    dataKey: string;
    stackId?: string;
  }>;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  isLoading?: boolean;
}

export function CustomBarChart({
  title,
  description,
  data,
  config,
  xAxisKey,
  bars,
  className,
  showLegend = true,
  showGrid = true,
  isLoading = false,
}: CustomBarChartProps) {
  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="h-full w-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
              >
                {showGrid && <CartesianGrid vertical={false} />}
                <Tooltip />
                <Legend />
                <XAxis
                  dataKey={xAxisKey}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickCount={3}
                />
                {bars.map((bar, index) => (
                  <Bar
                    key={bar.dataKey}
                    dataKey={bar.dataKey}
                    stackId={bar.stackId}
                    fill={`hsl(var(--chart-${index + 1}))`}
                    radius={4}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
