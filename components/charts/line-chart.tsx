"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LineChartData {
  [key: string]: string | number;
}

function toKilo(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K";
  }
  return num.toString();
}
interface CustomLineChartProps {
  title: string;
  description?: string;
  data: LineChartData[];
  config: ChartConfig;
  xAxisKey: string;
  lines: Array<{
    dataKey: string;
    strokeWidth?: number;
    dot?: boolean;
  }>;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function CustomLineChart({
  title,
  description,
  data,
  config,
  xAxisKey,
  lines,
  className,
  showLegend = true,
  showGrid = true
}: CustomLineChartProps) {
  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              {showGrid && <CartesianGrid vertical={false} />}
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => String(value).slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickCount={3}
                tickFormatter={(value) => toKilo(value)}
              />
              <Legend />
              <Tooltip />
              {lines.map((line, index) => (
                <Line
                  key={line.dataKey}
                  type="linear"
                  dataKey={line.dataKey}
                  stroke={`hsl(var(--chart-${index + 1}))`}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
