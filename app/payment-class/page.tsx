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

type PaymentClass = PaymentClassType;

export default function ClassesPage() {
  const [selectedClass, setSelectedClass] = useState<PaymentClass | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState({
    year: "2025/2026",
    teacherId: useAuthStore.getState().user?.id,
  });
  const { data: paymentClass, isLoading, error } = usePaymentClass(filter);
  const [form, setForm] = useState<CreatePaymentClass>({
    studentId: "",
    classId: "",
  });
  const createPayment = useCreatePayment();
  const studentsOptions = paymentClass?.studentData.map((student) => ({
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

  useEffect(() => {
    setForm((prev) => {
      return {
        ...prev,
        classId: paymentClass?.classId || "",
      };
    });
  }, [paymentClass]);

  const columns: ColumnDef<PaymentClass["studentData"][number]>[] = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "monthlyFee.jul",
      header: "Jul",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.jul ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.aug",
      header: "Aug",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.aug ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.sep",
      header: "Sep",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.sep ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.oct",
      header: "Oct",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.oct ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.nov",
      header: "Nov",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.nov ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.dec",
      header: "Dec",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.dec ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.jan",
      header: "Jan",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.jan ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.feb",
      header: "Feb",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.feb ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.mar",
      header: "Mar",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.mar ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.apr",
      header: "Apr",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.apr ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.may",
      header: "May",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.may ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
    {
      accessorKey: "monthlyFee.jun",
      header: "Jun",
      cell: ({ row }) => (
        <>{row.original.monthlyFee.jun ? <Check className="w-4 h-4" color="green" /> : <></>}</>
      ),
    },
  ];

  const addPaymentComponent = () => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-row gap-2">
          <ComboBox
            className="md:w-[250px]"
            value={form.studentId}
            onValueChange={(value) => setForm({ ...form, studentId: value })}
            options={studentsOptions || []}
          />
          <Button
            disabled={!form.studentId || createPayment.isPending}
            onClick={handleCreatePayment}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>
    );
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HeaderTitle
          title="Pembayaran Kelas"
          description="Mengelola pembayaran kelas di sekolah"
        />
        <Container>
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
          </FilterContainer>

          <DataTable
            columns={columns}
            data={paymentClass?.studentData || []}
            isLoading={isLoading}
            searchPlaceholder="Cari siswa..."
            emptyMessage="Tidak ada siswa ditemukan."
            pageSize={10}
            headerComponent={addPaymentComponent()}
          />
        </Container>
      </div>
    </DashboardLayout>
  );
}
