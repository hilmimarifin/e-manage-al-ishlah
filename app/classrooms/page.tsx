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
import { ResponsiveDataDisplay } from "@/components/ui/responsive-data-display";
import { MobileListItem } from "@/components/ui/mobile-list-view";
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
import FilterContainer from "@/components/elements/filter-container";
import Container from "@/components/elements/container";
import { isAdminClient } from "@/lib/client-utils";
import HeaderTitle from "@/components/elements/header-title";
import { useClasses } from "@/hooks/use-classes";
import moment from "moment";

type Classroom = ClassroomType;

export default function ClassesPage() {
  const initFilter = {
    year:
      moment().format("YYYY") + "/" + moment().add(1, "year").format("YYYY"),
    teacherId: useAuthStore.getState().user?.id,
    classId: "",
  };
  const [filter, setFilter] = useState(initFilter);
  const { data: classrooms, isLoading, error } = useStudentClassrooms(filter);
  const { data: classes = [] } = useClasses(filter);

  const isAdmin = isAdminClient();
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
    setForm((prev) => ({ ...prev, classId: filter.classId }));
  }, [filter.classId]);
  const addStudentToClass = useAddStudentToClass();
  const handleAddStudentToClass = async () => {
    try {
      await addStudentToClass.mutateAsync(form);
      setForm((prev) => ({ ...prev, studentId: "" }));
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

  const { data: teachers = [] } = useUsers({});
  const teacherOptions = teachers.map((teacher) => ({
    value: teacher.id,
    label: teacher.username,
  }));
  const classOptions = classes.map((cls) => ({
    value: cls.id,
    label: cls.name,
  }));

  const columns: ColumnDef<Classroom>[] = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "className",
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

  const mobileItemMapper = (classroom: Classroom): MobileListItem => ({
    id: classroom.id,
    title: classroom.name,
    subtitle: `${classroom.className} - ${classroom.year}`,
    details: [
      { label: "No Telp", value: classroom.phone || "No phone" },
      { label: "Alamat", value: classroom.address || "No address" },
    ],
    actions: [
      ...(showDeleteButton
        ? [
            {
              label: "Delete",
              icon: <Trash className="mr-2 h-4 w-4" />,
              onClick: () => handleDeleteClass(classroom.id),
              variant: "destructive" as const,
            },
          ]
        : []),
    ],
  });

  const addStudentToClassComponent = () => {
    return showAddButton ? (
      <div className="flex flex-row gap-2 w-full md:justify-end">
        <ComboBox
          className="md:w-[250px] w-full"
          rootClassName="h-12 md:h-[30px]"
          value={form.studentId}
          placeholder="Tambahkan siswa"
          onValueChange={(value) => setForm({ ...form, studentId: value })}
          options={studentsOptions}
        />
        <Button
          className="h-12 md:h-[30px]"
          disabled={!form.studentId || addStudentToClass.isPending}
          onClick={handleAddStudentToClass}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </div>
    ) : (
      <></>
    );
  };

  useEffect(() => {
    if (filter.year) {
      setForm({ ...form, year: filter.year });
    }
  }, [filter.year]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <FilterContainer className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Select
            label="Guru"
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
          data={classrooms || []}
          isLoading={isLoading}
          searchPlaceholder="Cari siswa..."
          emptyMessage="Tidak ada siswa ditemukan."
          pageSize={10}
          mobileItemMapper={mobileItemMapper}
          headerComponent={addStudentToClassComponent()}
        />
      </div>
    </DashboardLayout>
  );
}
