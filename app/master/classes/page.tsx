"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveDataDisplay } from "@/components/ui/responsive-data-display";
import { MobileListItem } from "@/components/ui/mobile-list-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import {
  useClasses,
  useCreateClass,
  useDeleteClass,
  useUpdateClass,
} from "@/hooks/use-classes";
import { usePermissionGuard } from "@/hooks/use-permissions";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useState } from "react";

import { ClassForm } from "@/components/forms/class-form";
import { Class as ClassType } from "@/types";

type Class = ClassType;

export default function ClassesPage() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: classes = [], isLoading, error } = useClasses({});
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  // Permission checks for /roles path
  const {
    showAddButton,
    showEditButton,
    showDeleteButton,
    canUpdate,
    isLoading: permissionsLoading,
  } = usePermissionGuard("/roles");

  const handleCreateClass = async (data: any) => {
    try {
      await createClass.mutateAsync(data);
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to create classes:", error);
    }
  };

  const handleUpdateClass = async (data: any) => {
    try {
      if (selectedClass) {
        await updateClass.mutateAsync({ id: selectedClass.id, ...data });
        setDialogOpen(false);
        setSelectedClass(null);
      }
    } catch (error) {
      console.error("Failed to update classes:", error);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm("Are you sure you want to delete this classes?")) {
      try {
        await deleteClass.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete classes:", error);
      }
    }
  };

  const openEditDialog = (classes: any) => {
    setSelectedClass(classes);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedClass(null);
    setDialogOpen(true);
  };

  const columns: ColumnDef<Class>[] = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "grade",
      header: "Kelas",
    },
    {
      accessorKey: "year",
      header: "Tahun Ajaran",
    },
    {
      accessorKey: "teacherName",
      header: "Wali Kelas",
      cell: ({ row }) => (
        <div>{row.getValue("teacherName") || "No teacher"}</div>
      ),
    },
    {
      accessorKey: "monthlyFee",
      header: "Biaya SPP",
      cell: ({ row }) => (
        <div>{row.getValue("monthlyFee") || "No monthly fee"}</div>
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
              {showDeleteButton && (
                <DropdownMenuItem
                  onClick={() => handleDeleteClass(classes.id)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const mobileItemMapper = (classItem: Class): MobileListItem => ({
    id: classItem.id,
    title: classItem.name,
    subtitle: `Kelas ${classItem.grade} - ${classItem.year}`,
    details: [
      { label: "Wali Kelas", value: classItem.teacherName || "No teacher" },
      { label: "Jenjang kelas", value: classItem.grade },
      { label: "Biaya SPP", value: classItem.monthlyFee || "No monthly fee" },
    ],
    actions: [
      ...(showEditButton ? [{
        label: "Edit",
        icon: <Edit className="mr-2 h-4 w-4" />,
        onClick: () => openEditDialog(classItem),
      }] : []),
      ...(showDeleteButton ? [{
        label: "Hapus",
        icon: <Trash className="mr-2 h-4 w-4" />,
        onClick: () => handleDeleteClass(classItem.id),
        variant: "destructive" as const,
      }] : []),
    ],
  });

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between">
        {showAddButton && (
          <Modal
            isOpen={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selectedClass ? "Edit Class" : "Create Class"}
            description={
              selectedClass
                ? "Make changes to the classes here."
                : "Add a new classes to the system."
            }
            trigger={
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kelas
              </Button>
            }
          >
            <ClassForm
              classes={selectedClass || undefined}
              onSubmit={selectedClass ? handleUpdateClass : handleCreateClass}
              isLoading={createClass.isPending || updateClass.isPending}
            />
          </Modal>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ResponsiveDataDisplay
          columns={columns}
          data={classes}
          isLoading={isLoading}
          searchPlaceholder="Cari..."
          emptyMessage="Tidak ada kelas ditemukan."
          pageSize={10}
          mobileItemMapper={mobileItemMapper}
          headerComponent={renderHeader()}
        />
      </div>
    </DashboardLayout>
  );
}
