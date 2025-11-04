import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Icons, IconMap } from "../layout/icons";
import { Skeleton } from "../ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: keyof typeof IconMap;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  isLoading,
}: StatCardProps) {
  return (
    <Card className={cn("shadow-md rounded-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <Icons icon={icon} className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="text-2xl font-bold mb-2">
              <Skeleton className="h-12 w-12"></Skeleton>
            </div>
            {description && (
              <span className="text-xs text-muted-foreground mt-1">
                <Skeleton className="h-4 w-24"></Skeleton>
              </span>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <Skeleton className="h-4 w-24"></Skeleton>
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  <Skeleton className="h-4 w-24"></Skeleton>
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {trend.label}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
