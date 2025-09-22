"use client";

import { useState, useEffect, ReactNode } from "react";
import { DataTable } from "@/components/ui/data-table";
import { MobileListView, MobileListItem } from "@/components/ui/mobile-list-view";
import { ColumnDef } from "@tanstack/react-table";

interface ResponsiveDataDisplayProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  pageSize?: number;
  mobileItemMapper: (item: T) => MobileListItem;
  headerComponent?: React.ReactNode;
  mobileItemCustomContent?: (item: MobileListItem) => ReactNode;
}

export function ResponsiveDataDisplay<T>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found.",
  pageSize = 10,
  mobileItemMapper,
  headerComponent,
  mobileItemCustomContent,
}: ResponsiveDataDisplayProps<T>) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Convert data to mobile list items
  const mobileItems: MobileListItem[] = data.map(mobileItemMapper);

  if (isMobile) {
    return (
      <div className="space-y-4">
        {headerComponent && headerComponent}
        <MobileListView
          items={mobileItems}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          customContent={mobileItemCustomContent}
        />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      pageSize={pageSize}
      headerComponent={headerComponent}
    />
  );
}
