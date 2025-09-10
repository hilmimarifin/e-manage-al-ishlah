"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { usePermissionGuard } from "@/hooks/use-permissions";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import {
  useAddStudentToClass,
  useDeleteClassroom,
  useStudentClassrooms,
} from "@/hooks/user-classroom";
import { useAuthStore } from "@/store/auth-store";
import { Classroom as ClassroomType, StudentClass } from "@/types";
import { ComboBox } from "@/components/elements/combo-box";
import { useStudents } from "@/hooks/use-students";
import Select from "@/components/elements/select";
import { useUsers } from "@/hooks/use-users";

type Classroom = ClassroomType;

export default function ClassesPage() {
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState({
    year: "2025/2026",
    teacherId: useAuthStore.getState().user?.id,
  });
  const { data: classrooms, isLoading, error } = useStudentClassrooms(filter);
  const deleteClassroom = useDeleteClassroom();
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
  } = usePermissionGuard("/classrooms");

  useEffect(() => {
    setForm((prev) => {
      return {
        ...prev,
        classId: classrooms?.classId || "",
        year: classrooms?.year || "",
      };
    });
  }, [classrooms]);

  const addStudentToClass = useAddStudentToClass();
  const handleAddStudentToClass = async () => {
    try {
      await addStudentToClass.mutateAsync(form);
    } catch (error) {
      console.error("Failed to add student to class:", error);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm("Are you sure you want to delete this classes?")) {
      try {
        await deleteClassroom.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete classes:", error);
      }
    }
  };

  const openEditDialog = (classes: any) => {
    setSelectedClass(classes);
    setDialogOpen(true);
  };

  const { data: teachers = [] } = useUsers();
  const teacherOptions = teachers.map((teacher) => ({
    value: teacher.id,
    label: teacher.username,
  }));

  const columns: ColumnDef<StudentClass>[] = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "grade",
      header: "Kelas",
    },
    {
      accessorKey: "address",
      header: "Alamat",
    },
    {
      accessorKey: "phone",
      header: "No Telp",
    },
    {
      id: "actions",
      header: "Actions",
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
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{classrooms?.className} </CardTitle>
            <CardDescription>Tahun ajaran {classrooms?.year}</CardDescription>
          </CardHeader>
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
              data={classrooms?.students || []}
              isLoading={isLoading}
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
