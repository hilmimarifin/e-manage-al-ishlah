"use client";
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

// Example 1: Complex Sales Report with ACTUAL Header Row Merging
interface SalesReportData {
  id: string;
  region: string;
  product: string;
  jan: number;
  feb: number;
  mar: number;
  total: number;
}

const salesReportData: SalesReportData[] = [
  {
    id: "1",
    region: "North",
    product: "Laptop",
    jan: 100,
    feb: 120,
    mar: 110,
    total: 330,
  },
  {
    id: "2",
    region: "North",
    product: "Phone",
    jan: 80,
    feb: 90,
    mar: 85,
    total: 255,
  },
  {
    id: "3",
    region: "South",
    product: "Laptop",
    jan: 75,
    feb: 85,
    mar: 80,
    total: 240,
  },
  {
    id: "4",
    region: "South",
    product: "Phone",
    jan: 60,
    feb: 70,
    mar: 65,
    total: 195,
  },
];

const salesReportColumns: ColumnDef<SalesReportData>[] = [
  { id: "region", accessorKey: "region", header: "Region" },
  { id: "product", accessorKey: "product", header: "Product" },
  { id: "jan", accessorKey: "jan", header: "January" },
  { id: "feb", accessorKey: "feb", header: "February" },
  { id: "mar", accessorKey: "mar", header: "March" },
  { id: "total", accessorKey: "total", header: "Total" },
];

export function TrueHeaderRowMergingExample() {
  // THIS IS TRUE HEADER ROW MERGING - cells spanning multiple header rows
  const customHeaderRows = [
    // First header row
    {
      id: "main-categories",
      cells: [
        // "Location" spans 2 rows (this row and the next)
        {
          columnId: "location-group",
          content: "Location",
          colSpan: 2,
          rowSpan: 2,
          className: "bg-blue-600",
        },
        // "Sales Data" spans 1 row but 3 columns
        {
          columnId: "sales-group",
          content: "2024 Sales Data (Units)",
          colSpan: 3,
          className: "bg-green-600",
        },
        // "Summary" spans 2 rows
        {
          columnId: "summary-group",
          content: "Summary",
          rowSpan: 2,
          className: "bg-purple-600",
        },
      ],
    },
    // Second header row
    {
      id: "sub-categories",
      cells: [
        // Location columns are covered by rowSpan from above
        // Only need to define the sales month columns
        {
          columnId: "jan-header",
          content: "Q1 Start",
          className: "bg-green-500",
        },
        {
          columnId: "feb-header",
          content: "Q1 Mid",
          className: "bg-green-500",
        },
        {
          columnId: "mar-header",
          content: "Q1 End",
          className: "bg-green-500",
        },
        // Summary column is covered by rowSpan from above
      ],
    },
  ];

  const mergedCells = [
    // Merge region cells for same regions
    { rowIndex: 0, columnId: "region", rowSpan: 2 }, // North spans 2 rows
    { rowIndex: 2, columnId: "region", rowSpan: 2 }, // South spans 2 rows
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        True Header Row Merging Example
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Notice how "Location" and "Summary" headers span 2 rows vertically
        (rowSpan=2)
      </p>
      <DataTable
        columns={salesReportColumns}
        data={salesReportData}
        customHeaderRows={customHeaderRows}
        mergedCells={mergedCells}
        showSearch={false}
        showPagination={false}
      />
    </div>
  );
}

// Example 2: Complex Exam Results with Multi-Level Header Row Merging
interface ExamResult {
  id: string;
  student: string;
  class: string;
  mathTheory: number;
  mathPractical: number;
  scienceTheory: number;
  sciencePractical: number;
  average: number;
}

const examData: ExamResult[] = [
  {
    id: "1",
    student: "Alice",
    class: "10A",
    mathTheory: 85,
    mathPractical: 90,
    scienceTheory: 88,
    sciencePractical: 92,
    average: 88.75,
  },
  {
    id: "2",
    student: "Bob",
    class: "10A",
    mathTheory: 78,
    mathPractical: 82,
    scienceTheory: 80,
    sciencePractical: 85,
    average: 81.25,
  },
  {
    id: "3",
    student: "Carol",
    class: "10B",
    mathTheory: 92,
    mathPractical: 88,
    scienceTheory: 90,
    sciencePractical: 94,
    average: 91,
  },
];

const examColumns: ColumnDef<ExamResult>[] = [
  { id: "student", accessorKey: "student", header: "Name" },
  { id: "class", accessorKey: "class", header: "Class" },
  { id: "mathTheory", accessorKey: "mathTheory", header: "Theory" },
  { id: "mathPractical", accessorKey: "mathPractical", header: "Practical" },
  { id: "scienceTheory", accessorKey: "scienceTheory", header: "Theory" },
  {
    id: "sciencePractical",
    accessorKey: "sciencePractical",
    header: "Practical",
  },
  { id: "average", accessorKey: "average", header: "Avg" },
];

export function ExamResultsHeaderRowMergingExample() {
  const customHeaderRows = [
    // Level 1: Main categories
    {
      id: "exam-categories",
      cells: [
        // Student Info spans 3 rows (all header rows)
        {
          columnId: "student-info",
          content: "Student Information",
          colSpan: 2,
          rowSpan: 3,
          className: "bg-indigo-600",
        },
        // Subjects span 1 row, 4 columns
        {
          columnId: "subjects",
          content: "Subject Scores",
          colSpan: 4,
          className: "bg-red-600",
        },
        // Result spans 3 rows
        {
          columnId: "result",
          content: "Final Result",
          rowSpan: 3,
          className: "bg-yellow-600 text-black",
        },
      ],
    },
    // Level 2: Subject breakdown
    {
      id: "subject-breakdown",
      cells: [
        // Student info covered by rowSpan above
        {
          columnId: "math-group",
          content: "Mathematics",
          colSpan: 2,
          className: "bg-blue-600",
        },
        {
          columnId: "science-group",
          content: "Science",
          colSpan: 2,
          className: "bg-green-600",
        },
        // Result covered by rowSpan above
      ],
    },
    // Level 3: Exam types (this will be the actual column headers)
    {
      id: "exam-types",
      cells: [
        // Student info covered by rowSpan from level 1
        {
          columnId: "math-theory",
          content: "Theory",
          className: "bg-blue-500",
        },
        {
          columnId: "math-practical",
          content: "Practical",
          className: "bg-blue-500",
        },
        {
          columnId: "science-theory",
          content: "Theory",
          className: "bg-green-500",
        },
        {
          columnId: "science-practical",
          content: "Practical",
          className: "bg-green-500",
        },
        // Result covered by rowSpan from level 1
      ],
    },
  ];

  const mergedCells = [
    // Class 10A spans 2 students
    { rowIndex: 0, columnId: "class", rowSpan: 2 },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Complex Header Row Merging - 3 Levels
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        This shows true multi-level header row merging where some headers span
        multiple rows vertically
      </p>
      <DataTable
        columns={examColumns}
        data={examData}
        customHeaderRows={customHeaderRows}
        mergedCells={mergedCells}
        showSearch={false}
        showPagination={false}
      />
    </div>
  );
}

// Example 3: Simple but Clear Header Row Merging
interface EmployeeData {
  id: string;
  name: string;
  department: string;
  basicSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
}

const employeeData: EmployeeData[] = [
  {
    id: "1",
    name: "John",
    department: "IT",
    basicSalary: 5000,
    bonus: 500,
    deductions: 200,
    netSalary: 5300,
  },
  {
    id: "2",
    name: "Jane",
    department: "IT",
    basicSalary: 5500,
    bonus: 600,
    deductions: 250,
    netSalary: 5850,
  },
  {
    id: "3",
    name: "Bob",
    department: "HR",
    basicSalary: 4500,
    bonus: 400,
    deductions: 150,
    netSalary: 4750,
  },
];

const employeeColumns: ColumnDef<EmployeeData>[] = [
  { id: "name", accessorKey: "name", header: "Name" },
  { id: "department", accessorKey: "department", header: "Dept" },
  {
    id: "basicSalary",
    accessorKey: "basicSalary",
    header: "Basic",
    cell: ({ row }) => `$${row.getValue("basicSalary")}`,
  },
  {
    id: "bonus",
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => `$${row.getValue("bonus")}`,
  },
  {
    id: "deductions",
    accessorKey: "deductions",
    header: "Deduct",
    cell: ({ row }) => `$${row.getValue("deductions")}`,
  },
  {
    id: "netSalary",
    accessorKey: "netSalary",
    header: "Net",
    cell: ({ row }) => `$${row.getValue("netSalary")}`,
  },
];

export function SimpleHeaderRowMergingExample() {
  const customHeaderRows = [
    {
      id: "salary-structure",
      cells: [
        // Employee info spans 2 rows
        {
          columnId: "employee-info",
          content: "Employee",
          colSpan: 2,
          rowSpan: 2,
          className: "bg-gray-600",
        },
        // Salary components span 1 row, 3 columns
        {
          columnId: "salary-components",
          content: "Salary Components",
          colSpan: 3,
          className: "bg-blue-600",
        },
        // Final amount spans 2 rows
        {
          columnId: "final-amount",
          content: "Final",
          rowSpan: 2,
          className: "bg-green-600",
        },
      ],
    },
  ];

  const mergedCells = [
    // IT department spans 2 employees
    { rowIndex: 0, columnId: "department", rowSpan: 2 },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Simple Header Row Merging Example
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        "Employee" and "Final" headers span 2 rows (including the main header
        row)
      </p>
      <DataTable
        columns={employeeColumns}
        data={employeeData}
        customHeaderRows={customHeaderRows}
        mergedCells={mergedCells}
        showSearch={false}
        showPagination={false}
      />
    </div>
  );
}

// Combined example
export default function TrueHeaderRowMergingExamples() {
  return (
    <div className="space-y-12">
      <SimpleHeaderRowMergingExample />
      <TrueHeaderRowMergingExample />
      <ExamResultsHeaderRowMergingExample />
    </div>
  );
}
