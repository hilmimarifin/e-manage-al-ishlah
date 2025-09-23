"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MobileListItem } from "@/components/ui/mobile-list-view";
import { ResponsiveDataDisplay } from "@/components/ui/responsive-data-display";
import { usePermissionGuard } from "@/hooks/use-permissions";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import FilterContainer from "@/components/elements/filter-container";
import Select from "@/components/elements/select";
import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useClasses } from "@/hooks/use-classes";
import {
  useCreatePayment,
  usePaymentClass,
  useUpdatePayment,
} from "@/hooks/use-payment-class";
import { useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";
import { CreatePaymentClass, PaymentClass as PaymentClassType } from "@/types";
import { Check, Edit, MoreHorizontal, Plus } from "lucide-react";
import { isAdminClient } from "@/lib/client-utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import PaymentForm from "@/components/forms/payment-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const isAdmin = isAdminClient();

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
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const classes = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showEditButton && (
                <DropdownMenuItem onClick={() => openEditDialog(classes)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const months = [
    { key: "jul", name: "Jul" },
    { key: "aug", name: "Aug" },
    { key: "sep", name: "Sep" },
    { key: "oct", name: "Oct" },
    { key: "nov", name: "Nov" },
    { key: "dec", name: "Dec" },
    { key: "jan", name: "Jan" },
    { key: "feb", name: "Feb" },
    { key: "mar", name: "Mar" },
    { key: "apr", name: "Apr" },
    { key: "may", name: "May" },
    { key: "jun", name: "Jun" },
  ];
  const openEditDialog = (payment: PaymentClass) => {
    setSelectedClass(payment);
    setDialogOpen(true);
  };

  const mobileItemMapper = (payment: PaymentClass): MobileListItem => {
    const paidMonths: string[] = [];
    const unpaidMonths: string[] = [];

    months.forEach((month) => {
      if (payment.monthlyFee[month.key as keyof typeof payment.monthlyFee]) {
        paidMonths.push(month.name);
      } else {
        unpaidMonths.push(month.name);
      }
    });

    return {
      id: payment.id,
      title: payment.name,
      subtitle: `${payment.className} - ${payment.year}`,
      // badge: { text: payment.className, variant: "default" },
      details: [],
      actions: [
        ...(showEditButton
          ? [
              {
                label: "Update Pembayaran",
                icon: <Edit className="mr-2 h-4 w-4" />,
                onClick: () => openEditDialog(payment),
              },
            ]
          : []),
      ],
    };
  };
  const { data: classes = [] } = useClasses(filter);

  const classOptions = classes.map((cls) => ({
    value: cls.id,
    label: cls.name,
  }));

  useEffect(() => {
    if (classes.length === 1) {
      setFilter((prev) => ({ ...prev, classId: classes[0].id }));
    }
  }, [classes]);

  const renderContent = (item: MobileListItem) => {
    return (
      <ul className="space-y-2 grid grid-cols-6">
        {months.map((month) => {
          const person = paymentClass?.find((item2) => item2.id === item.id);
          return (
            <li key={month.key} className="flex items-center gap-1">
              <Checkbox
                disabled
                checked={Boolean(
                  person?.monthlyFee[
                    month.key as keyof (typeof person)["monthlyFee"]
                  ]
                )}
              />
              <Label className="text-[10px]">{month.name}</Label>
            </li>
          );
        })}
      </ul>
    );
  };
  const openCreateDialog = () => {
    setSelectedClass(null);
    setDialogOpen(true);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between">
        {showAddButton && (
          <Modal
            isOpen={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selectedClass ? "Update Pembayaran" : "Create Pembayaran"}
            description={
              selectedClass
                ? "Update Pembayaran pada siswa ini."
                : "Add a new classes to the system."
            }
          >
            <PaymentForm
              selectedPayment={selectedClass}
              onClose={() => setDialogOpen(false)}
            />
          </Modal>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <FilterContainer className="grid md:grid-cols-3 grid-cols-1 gap-2">
          <Select
            label="Tenaga Pendidik"
            options={teacherOptions}
            value={filter.teacherId}
            onValueChange={(value) => {
              setFilter({ ...filter, teacherId: value });
            }}
            disabled={!isAdmin}
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

        <ResponsiveDataDisplay
          columns={columns}
          data={paymentClass || []}
          isLoading={isLoading}
          searchPlaceholder="Cari siswa..."
          emptyMessage="Tidak ada siswa ditemukan."
          pageSize={10}
          mobileItemMapper={mobileItemMapper}
          mobileItemCustomContent={renderContent}
          headerComponent={renderHeader()}
        />
      </div>
    </DashboardLayout>
  );
}
