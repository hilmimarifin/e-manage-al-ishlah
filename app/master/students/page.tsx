"use client";

import { PermissionModal } from "@/components/forms/permission-modal";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { usePermissionGuard } from "@/hooks/use-permissions";
import {
  useCreateStudent,
  useDeleteStudent,
  useStudents,
  useUpdateStudent,
} from "@/hooks/use-students";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Plus, Shield, Trash, Upload } from "lucide-react";
import { useState } from "react";

import { StudentForm } from "@/components/forms/student-form";
import { BatchUploadForm } from "@/components/forms/batch-upload-form";
import { Student as StudentType } from "@/types";
import { Gender } from "@prisma/client";
import moment from "moment";

type Student = StudentType;

export default function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchUploadOpen, setBatchUploadOpen] = useState(false);

  const { data: students = [], isLoading, error } = useStudents();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  // Permission checks for /roles path
  const {
    showAddButton,
    showEditButton,
    showDeleteButton,
    canUpdate,
    isLoading: permissionsLoading,
  } = usePermissionGuard("/roles");

  const handleCreateStudent = async (data: any) => {
    try {
      await createStudent.mutateAsync(data);
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to create student:", error);
    }
  };

  const handleUpdateStudent = async (data: any) => {
    try {
      if (selectedStudent) {
        await updateStudent.mutateAsync({ id: selectedStudent.id, ...data });
        setDialogOpen(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete student:", error);
      }
    }
  };

  const openEditDialog = (student: any) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedStudent(null);
    setDialogOpen(true);
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "fullName",
      header: "Nama",
    },
    {
      accessorKey: "address",
      header: "Alamat",
      cell: ({ row }) => <div>{row.getValue("address") || "No address"}</div>,
    },
    {
      accessorKey: "birthDate",
      header: "Tanggal Lahir",
      cell: ({ row }) => (
        <div>{moment(row.getValue("birthDate")).format("DD MMMM YYYY")}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "No. Telp",
      cell: ({ row }) => <div>{row.getValue("phone") || "No phone"}</div>,
    },
    {
      accessorKey: "gender",
      header: "Jenis Kelamin",
      cell: ({ row }) => (
        <div>
          {row.getValue("gender") === Gender.MALE ? "Laki-laki" : "Perempuan"}
        </div>
      ),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showEditButton && (
                <DropdownMenuItem onClick={() => openEditDialog(student)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {showDeleteButton && (
                <DropdownMenuItem
                  onClick={() => handleDeleteStudent(student.id)}
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Master Siswa
            </h1>
            <p className="text-muted-foreground">Mengatur, menambah, mengedit, dan menghapus data siswa.</p>
          </div>

          {showAddButton && (
            <div className="flex gap-2">
              <Modal
                isOpen={dialogOpen}
                onOpenChange={setDialogOpen}
                title={selectedStudent ? "Edit Student" : "Create Student"}
                description={
                  selectedStudent
                    ? "Make changes to the student here."
                    : "Add a new student to the system."
                }
                trigger={
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                }
              >
                <StudentForm
                  student={selectedStudent || undefined}
                  onSubmit={
                    selectedStudent ? handleUpdateStudent : handleCreateStudent
                  }
                  isLoading={createStudent.isPending || updateStudent.isPending}
                />
              </Modal>

              <Modal
                isOpen={batchUploadOpen}
                onOpenChange={setBatchUploadOpen}
                title="Upload Data Siswa"
                description="Upload file Excel atau CSV untuk menambahkan siswa secara batch"
                trigger={
                  <Button variant="outline" onClick={() => setBatchUploadOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Batch Upload
                  </Button>
                }
              >
                <BatchUploadForm onClose={() => setBatchUploadOpen(false)} />
              </Modal>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={students}
          isLoading={isLoading}
          searchPlaceholder="Cari siswa..."
          emptyMessage="Tidak ada siswa ditemukan."
          pageSize={10}
        />
      </div>
    </DashboardLayout>
  );
}
