"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

interface MergedCell {
  rowIndex: number;
  columnId: string;
  colSpan?: number;
  rowSpan?: number;
}

interface HeaderRow {
  id: string;
  cells: Array<{
    columnId: string;
    content: React.ReactNode;
    colSpan?: number;
    rowSpan?: number;
    className?: string;
  }>;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  showPagination?: boolean;
  showSearch?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  mergedCells?: MergedCell[];
  customHeaderRows?: HeaderRow[];
  headerMergedCells?: Array<{
    columnId: string;
    colSpan?: number;
    rowSpan?: number;
  }>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 10,
  showPagination = true,
  showSearch = true,
  isLoading = false,
  emptyMessage = "No results found.",
  mergedCells = [],
  customHeaderRows = [],
  headerMergedCells = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Helper function to check if a cell should be rendered
  const shouldRenderCell = (rowIndex: number, columnId: string): boolean => {
    // Check if this cell is covered by a merged cell
    for (const mergedCell of mergedCells) {
      const {
        rowIndex: mergedRowIndex,
        columnId: mergedColumnId,
        colSpan = 1,
        rowSpan = 1,
      } = mergedCell;

      // Get column indices
      const allColumns = ["rowNumber", ...columns.map((col) => col.id || "")];
      const mergedColIndex = allColumns.indexOf(mergedColumnId);
      const currentColIndex = allColumns.indexOf(columnId);

      // Check if current cell is within the merged area
      if (
        rowIndex >= mergedRowIndex &&
        rowIndex < mergedRowIndex + rowSpan &&
        currentColIndex >= mergedColIndex &&
        currentColIndex < mergedColIndex + colSpan &&
        !(rowIndex === mergedRowIndex && currentColIndex === mergedColIndex) // Don't skip the main merged cell
      ) {
        return false;
      }
    }
    return true;
  };

  // Helper function to get merged cell properties
  const getMergedCellProps = (rowIndex: number, columnId: string) => {
    const mergedCell = mergedCells.find(
      (cell) => cell.rowIndex === rowIndex && cell.columnId === columnId
    );
    return mergedCell
      ? { colSpan: mergedCell.colSpan || 1, rowSpan: mergedCell.rowSpan || 1 }
      : {};
  };

  // Helper function for header merging
  const shouldRenderHeaderCell = (columnId: string): boolean => {
    for (const mergedCell of headerMergedCells) {
      const { columnId: mergedColumnId, colSpan = 1 } = mergedCell;

      const allColumns = ["rowNumber", ...columns.map((col) => col.id || "")];
      const mergedColIndex = allColumns.indexOf(mergedColumnId);
      const currentColIndex = allColumns.indexOf(columnId);

      if (
        currentColIndex >= mergedColIndex &&
        currentColIndex < mergedColIndex + colSpan &&
        currentColIndex !== mergedColIndex
      ) {
        return false;
      }
    }
    return true;
  };

  const getHeaderMergedCellProps = (columnId: string) => {
    const mergedCell = headerMergedCells.find(
      (cell) => cell.columnId === columnId
    );
    return mergedCell
      ? { colSpan: mergedCell.colSpan || 1, rowSpan: mergedCell.rowSpan || 1 }
      : {};
  };

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {/* Custom header rows */}
            {customHeaderRows.map((headerRow) => (
              <TableRow
                className="h-8 bg-primary text-primary-foreground text-white"
                key={headerRow.id}
              >
                {headerRow.cells.map((cell, index) => (
                  <TableHead
                    key={`${headerRow.id}-${cell.columnId}-${index}`}
                    className={`text-xs h-8 text-white text-center ${
                      cell.className || ""
                    }`}
                    colSpan={cell.colSpan}
                    rowSpan={cell.rowSpan}
                  >
                    {cell.content}
                  </TableHead>
                ))}
              </TableRow>
            ))}

            {/* Main header row */}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="h-8 bg-primary text-primary-foreground rounded-t-md text-white"
                key={headerGroup.id}
              >
                {shouldRenderHeaderCell("rowNumber") && (
                  <TableHead
                    className="text-xs h-8 text-white"
                    {...getHeaderMergedCellProps("rowNumber")}
                  >
                    No
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  if (!shouldRenderHeaderCell(columnId)) return null;

                  return (
                    <TableHead
                      className="text-xs h-8 text-white"
                      key={header.id}
                      {...getHeaderMergedCellProps(columnId)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="h-8">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-8 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="h-8"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {shouldRenderCell(row.index, "rowNumber") && (
                    <TableCell
                      className="text-xs w-2 text-center h-8"
                      {...getMergedCellProps(row.index, "rowNumber")}
                    >
                      {row.index + 1}
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => {
                    const columnId = cell.column.id;
                    if (!shouldRenderCell(row.index, columnId)) return null;

                    return (
                      <TableCell
                        className="text-xs h-8"
                        key={cell.id}
                        {...getMergedCellProps(row.index, columnId)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="h-8">
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-8 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              <span className="text-sm">Page</span>
              <strong className="text-sm">
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
