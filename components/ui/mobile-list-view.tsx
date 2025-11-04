"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical, Search } from "lucide-react";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { Input } from "./input";
import { maxTextFormater } from "@/lib/utils";

export interface MobileListItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  details: Array<{
    label: string;
    value: ReactNode;
  }>;
  actions?: Array<{
    label: string;
    icon: ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
  }>;
}

interface MobileListViewProps {
  items: MobileListItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  customContent?: (item: MobileListItem) => ReactNode;
  userImage?: boolean;
}

export function MobileListView({
  items,
  isLoading = false,
  emptyMessage = "No items found.",
  searchPlaceholder = "Cari...",
  customContent,
  userImage,
}: MobileListViewProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredItems = items.filter((item) => {
    return (
      item.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(globalFilter.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4 border-r-4 border-r-primary rounded-r-lg">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative flex-1 w-full md:max-w-[200px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="pl-8 bg-card"
        />
      </div>
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        filteredItems.map((item, index) => (
          <Card key={item.id} className="shadow-md transition-shadow">
            <CardContent className="p-4 border-r-4 border-r-primary rounded-r-lg flex flex-row gap-4">
              {userImage && (
                <Image
                  src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200"
                  alt={item.title}
                  width={70}
                  height={50}
                />
              )}
              <div className="space-y-3 w-full">
                {/* Header with title, subtitle, and actions */}
                <div className="flex items-start justify-between ">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm leading-tight truncate">
                        {index + 1}. {maxTextFormater(item.title, 18)}
                      </h3>
                      {item.badge && (
                        <Badge
                          variant={item.badge.variant || "secondary"}
                          className="text-xs"
                        >
                          {item.badge.text}
                        </Badge>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Actions dropdown */}
                  {item.actions && item.actions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {item.actions.map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={action.onClick}
                            className={
                              action.variant === "destructive"
                                ? "text-destructive"
                                : ""
                            }
                          >
                            {action.icon}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Details */}
                {item.details.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {item.details.map((detail, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-muted-foreground font-medium">
                          {detail.label}:
                        </span>
                        <span className="text-right flex-1 ml-2 truncate">
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {customContent && customContent(item)}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
