"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { usePermissionGuard } from "@/hooks/use-permissions";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import Select from "@/components/elements/select";
import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import { usePaymentClass } from "@/hooks/use-payment-class";
import { useCreatePayment } from "@/hooks/use-payment-class";
import { useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";
import { CreatePaymentClass, PaymentClass as PaymentClassType } from "@/types";
import TrueHeaderRowMergingExamples from "./example";
import { Check, Plus } from "lucide-react";
import { ComboBox } from "@/components/elements/combo-box";
import { Button } from "@/components/ui/button";
import FilterContainer from "@/components/elements/filter-container";
import Container from "@/components/elements/container";
import HeaderTitle from "@/components/elements/header-title";
import { useClasses } from "@/hooks/use-classes";

type PaymentClass = PaymentClassType;

export default function ClassesPage() {
  const [selectedClass, setSelectedClass] = useState<PaymentClass | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState({
    year: "2025/2026",
    teacherId: useAuthStore.getState().user?.id,
    classId: "",
  });
  const { data: paymentClass, isLoading, error } = usePaymentClass(filter);
  const [form, setForm] = useState<CreatePaymentClass>({
    studentId: "",
    classId: "",
  });
  const createPayment = useCreatePayment();
  const studentsOptions = paymentClass?.map((student) => ({
    value: student.id,
    label: student.name,
  }));
  // Permission checks for /roles path
  const {
    showAddButton,
    showEditButton,
    showDeleteButton,
    canUpdate,
    isLoading: permissionsLoading,
  } = usePermissionGuard("/paymentClass");

  const handleCreatePayment = async () => {
    try {
      await createPayment.mutateAsync(form);
    } catch (error) {
      console.error("Failed to add student to class:", error);
    }
  };

  const { data: teachers = [] } = useUsers({});
  const teacherOptions = teachers.map((teacher) => ({
    value: teacher.id,
    label: teacher.username,
  }));

  const columns: ColumnDef<PaymentClass>[] = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "className",
      header: "Kelas",
    },
    {
      accessorKey: "monthlyFee.jul",
      header: "Jul",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.jul ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.aug",
      header: "Aug",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.aug ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.sep",
      header: "Sep",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.sep ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.oct",
      header: "Oct",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.oct ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.nov",
      header: "Nov",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.nov ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.dec",
      header: "Dec",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.dec ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.jan",
      header: "Jan",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.jan ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.feb",
      header: "Feb",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.feb ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.mar",
      header: "Mar",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.mar ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.apr",
      header: "Apr",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.apr ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.may",
      header: "May",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.may ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      accessorKey: "monthlyFee.jun",
      header: "Jun",
      cell: ({ row }) => (
        <>
          {row.original.monthlyFee.jun ? (
            <Check className="w-4 h-4" color="green" />
          ) : (
            <></>
          )}
        </>
      ),
    },
  ];
  const { data: classes = [] } = useClasses(filter);

  const classOptions = classes.map((cls) => ({
    value: cls.id,
    label: cls.name,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HeaderTitle
          title="Pembayaran Kelas"
          description="Mengelola pembayaran kelas di sekolah"
        />
        <FilterContainer className="grid md:grid-cols-3 grid-cols-1 gap-2">
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
          <Select
            label="Kelas"
            placeholder="Pilih kelas"
            options={classOptions}
            value={filter.classId}
            onValueChange={(value) => {
              setFilter({ ...filter, classId: value });
            }}
          />
        </FilterContainer>

        <DataTable
          columns={columns}
          data={paymentClass || []}
          isLoading={isLoading}
          searchPlaceholder="Cari siswa..."
          emptyMessage="Tidak ada siswa ditemukan."
          pageSize={10}
        />
      </div>
    </DashboardLayout>
  );
}
