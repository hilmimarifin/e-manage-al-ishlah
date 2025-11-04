"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileListItem } from "@/components/ui/mobile-list-view";
import { ResponsiveDataDisplay } from "@/components/ui/responsive-data-display";
import { usePermissionGuard } from "@/hooks/use-permissions";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import { ComboBox } from "@/components/elements/combo-box";
import FilterContainer from "@/components/elements/filter-container";
import Select from "@/components/elements/select";
import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import { useClasses } from "@/hooks/use-classes";
import { useStudents } from "@/hooks/use-students";
import { useUsers } from "@/hooks/use-users";
import {
  useAddStudentToClass,
  useDeleteClassroom,
  useStudentClassrooms,
} from "@/hooks/user-classroom";
import { getCurrentAcademicYear, isAdminClient } from "@/lib/client-utils";
import { useAuthStore } from "@/store/auth-store";
import { Classroom as ClassroomType } from "@/types";

type Classroom = ClassroomType;

export default function ClassesPage() {
  const initFilter = {
    year: getCurrentAcademicYear(),
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

  useEffect(() => {
    if (classes.length === 1) {
      setFilter((prev) => ({ ...prev, classId: classes[0].id }));
    }
  }, [classes]);
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
    label: teacher.name,
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
          rootClassName="h-12 md:h-[30px] bg-card"
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
          {addStudentToClass.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
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

  console.log(form);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <FilterContainer className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
              setFilter({ ...filter, year: value, classId: "" });
              setForm({ ...form, year: value, classId: "", studentId: "" });
            }}
            value={filter.year}
          />

          <Select
            label="Kelas"
            placeholder="Semua Kelas"
            options={classOptions}
            value={filter.classId}
            onValueChange={(value) => {
              setFilter({ ...filter, classId: value });
              setForm({ ...form, classId: value, studentId: "" });
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
          userImage={true}
        />
      </div>
    </DashboardLayout>
  );
}
