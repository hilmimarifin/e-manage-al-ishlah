"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LineChartData {
  [key: string]: string | number;
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
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
              />
              <Legend />
              <Tooltip />
              {lines.map((line, index) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
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
