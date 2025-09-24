"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  showGrid = true
}: CustomBarChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              {showGrid && <CartesianGrid vertical={false} />}
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => String(value).slice(0, 3)}
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
              <Legend />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
