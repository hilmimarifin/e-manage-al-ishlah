"use client";

import {
  PieChart,
  Pie,
  Cell,
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

interface PieChartData {
  name: string;
  value: number;
  fill?: string;
  [key: string]: string | number | undefined;
}

interface CustomPieChartProps {
  title: string;
  description?: string;
  data: PieChartData[];
  config: ChartConfig;
  className?: string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function CustomPieChart({
  title,
  description,
  data,
  config,
  className,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
}: CustomPieChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="mx-auto aspect-square max-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Legend />
              <Tooltip />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={80}
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill || `hsl(var(--chart-${index + 1}))`}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
