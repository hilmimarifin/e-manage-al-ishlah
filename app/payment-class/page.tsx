"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { usePermissionGuard } from "@/hooks/use-permissions";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import Select from "@/components/elements/select";
import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import { usePaymentClass } from "@/hooks/use-payment-class";
import { useStudents } from "@/hooks/use-students";
import { useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";
import { PaymentClass as PaymentClassType } from "@/types";
import TrueHeaderRowMergingExamples from "./example";
import { Check } from "lucide-react";

type PaymentClass = PaymentClassType;

export default function ClassesPage() {
  const [selectedClass, setSelectedClass] = useState<PaymentClass | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState({
    year: "2025/2026",
    teacherId: useAuthStore.getState().user?.id,
  });
  const { data: paymentClass = [], isLoading, error } = usePaymentClass(filter);
  const [form, setForm] = useState({
    studentId: "",
    classId: "",
    year: "",
  });
  const { data: students = [] } = useStudents();
  const studentsOptions = students.map((student) => ({
    value: student.id,
    label: student.fullName,
  }));
  // Permission checks for /roles path
  const {
    showAddButton,
    showEditButton,
    showDeleteButton,
    canUpdate,
    isLoading: permissionsLoading,
  } = usePermissionGuard("/paymentClass");

  // useEffect(() => {
  //   setForm((prev) => {
  //     return {
  //       ...prev,
  //       classId: paymentClass?.classId || "",
  //       year: paymentClass?.year || "",
  //     };
  //   });
  // }, [paymentClass]);

  // const handleAddStudentToClass = async () => {
  //   try {
  //     await addStudentToClass.mutateAsync(form);
  //   } catch (error) {
  //     console.error("Failed to add student to class:", error);
  //   }
  // };

  const { data: teachers = [] } = useUsers();
  const teacherOptions = teachers.map((teacher) => ({
    value: teacher.id,
    label: teacher.username,
  }));

  const customHeaderRows = [
    {
      id: "name",
      cells: [
        // Employee info spans 2 rows
        {
          columnId: "No",
          content: "No",
          rowSpan: 2,
          className: "bg-primary",
        },

        {
          columnId: "name",
          content: "Nama",
          rowSpan: 2,
          className: "bg-primary",
        },
        // Salary components span 1 row, 3 columns
        {
          columnId: "monthlyFee",
          content: "Monthly Fee",
          colSpan: 12,
          className: "bg-primary",
        },
      ],
    },
  ];
  const columns: ColumnDef<PaymentClass>[] = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "monthlyFee.jul",
      header: "Jul",
      cell: ({ row }) => <>{row.original.monthlyFee.jul ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.aug",
      header: "Aug",
      cell: ({ row }) => <>{row.original.monthlyFee.aug ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.sep",
      header: "Sep",
      cell: ({ row }) => <>{row.original.monthlyFee.sep ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.oct",
      header: "Oct",
      cell: ({ row }) => <>{row.original.monthlyFee.oct ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.nov",
      header: "Nov",
      cell: ({ row }) => <>{row.original.monthlyFee.nov ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.dec",
      header: "Dec",
      cell: ({ row }) => <>{row.original.monthlyFee.dec ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.jan",
      header: "Jan",
      cell: ({ row }) => <>{row.original.monthlyFee.jan ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.feb",
      header: "Feb",
      cell: ({ row }) => <>{row.original.monthlyFee.feb ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.mar",
      header: "Mar",
      cell: ({ row }) => <>{row.original.monthlyFee.mar ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.apr",
      header: "Apr",
      cell: ({ row }) => <>{row.original.monthlyFee.apr ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.may",
      header: "May",
      cell: ({ row }) => <>{row.original.monthlyFee.may ? <Check color="green" /> : <></>}</>,
    },
    {
      accessorKey: "monthlyFee.jun",
      header: "Jun",
      cell: ({ row }) => <>{row.original.monthlyFee.jun ? <Check color="green" /> : <></>}</>,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* <div className="flex items-center justify-between">
          {showAddButton && (
            <div className="flex flex-row gap-2">
              <ComboBox
                className="md:w-[250px]"
                value={form.studentId}
                onValueChange={(value) =>
                  setForm({ ...form, studentId: value })
                }
                options={studentsOptions}
              />
              <Button
                disabled={!form.studentId || addStudentToClass.isPending}
                onClick={handleAddStudentToClass}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            </div>
          )}
        </div> */}

        <Card>
          <CardContent>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-2">
              <Select
                label="Guru"
                options={teacherOptions}
                value={filter.teacherId}
                onValueChange={(value) => {
                  setFilter({ ...filter, teacherId: value });
                }}
              />
              <TahunAjaran
                onValueChange={(value) => {
                  setFilter({ ...filter, year: value });
                }}
                value={filter.year}
              />
            </div>

            <DataTable
              columns={columns}
              data={paymentClass || []}
              isLoading={isLoading}
              customHeaderRows={customHeaderRows}
              searchPlaceholder="Cari siswa..."
              emptyMessage="Tidak ada siswa ditemukan."
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
