"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Student } from "@/types";
import {
  createStudentSchema,
  updateStudentSchema,
  CreateStudentInput,
  UpdateStudentInput,
} from "@/lib/validations";
import { ComboBox } from "../elements/combo-box";
import Select from "../elements/select";
import TahunAjaran from "../elements/tahun-ajaran-picker";

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function StudentForm({
  student,
  onSubmit,
  isLoading,
}: StudentFormProps) {
  const isEditing = !!student;
  const schema = isEditing ? updateStudentSchema : createStudentSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateStudentInput | UpdateStudentInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: student?.fullName || "",
      address: student?.address || "",
      birthDate: student?.birthDate
        ? new Date(student.birthDate).toISOString().split("T")[0]
        : "",
      phone: student?.phone || "",
      gender: student?.gender || "MALE",
      photo: student?.photo || "",
      status: student?.status || "ACTIVE",
      guardian: student?.guardian || "",
      entryYear: student?.entryYear || "",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (student) {
      reset({
        fullName: student.fullName || "",
        address: student.address || "",
        birthDate: student.birthDate
          ? new Date(student.birthDate).toISOString().split("T")[0]
          : "",
        phone: student.phone || "",
        gender: student.gender || "MALE",
        photo: student.photo || "",
        status: student.status || "ACTIVE",
        guardian: student.guardian || "",
        entryYear: student.entryYear || "",
      });
    }
  }, [student, reset]);

  const onFormSubmit = (data: CreateStudentInput | UpdateStudentInput) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Nama</Label>
          <Input
            id="fullName"
            {...register("fullName")}
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && (
            <span className="text-sm text-red-500">
              {errors.fullName.message}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Alamat</Label>
          <Textarea
            id="address"
            placeholder="Alamat"
            {...register("address")}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && (
            <span className="text-sm text-red-500">
              {errors.address.message}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-2 mb-4">
        <Label htmlFor="birthDate">Tanggal Lahir</Label>
        <Input
          type="date"
          id="birthDate"
          {...register("birthDate")}
          className={errors.birthDate ? "border-red-500" : ""}
        />
        {errors.birthDate && (
          <span className="text-sm text-red-500">
            {errors.birthDate.message}
          </span>
        )}
      </div>
      <div className="grid gap-2 mb-4">
        <TahunAjaran
          {...register("entryYear")}
          label="Tahun Masuk"
          value={watchedValues.entryYear}
          onValueChange={(value) =>
            setValue("entryYear", value)
          }
        />
        {errors.entryYear && (
          <span className="text-sm text-red-500">
            {errors.entryYear.message}
          </span>
        )}
      </div>

      <div className="grid gap-2 mb-4">
        <Label htmlFor="phone">Nomor Telepon</Label>
        <Input
          type="tel"
          id="phone"
          {...register("phone")}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <span className="text-sm text-red-500">{errors.phone.message}</span>
        )}
      </div>

      <Select
        className="mb-4"
        label="Jenis Kelamin"
        value={watchedValues.gender}
        onValueChange={(value) =>
          setValue("gender", value as "MALE" | "FEMALE")
        }
        options={[
          { value: "MALE", label: "Laki-laki" },
          { value: "FEMALE", label: "Perempuan" },
        ]}
        error={errors.gender?.message}
      />
      <div className="grid gap-2 mb-4">
        <Label htmlFor="guardian">Orang Tua / Wali</Label>
        <Input
          type="text"
          id="guardian"
          {...register("guardian")}
          className={errors.guardian ? "border-red-500" : ""}
        />
        {errors.guardian && (
          <span className="text-sm text-red-500">
            {errors.guardian.message}
          </span>
        )}
      </div>

      <Select
        className="mb-4"
        label="Status"
        value={watchedValues.status}
        onValueChange={(value) =>
          setValue("status", value as "ACTIVE" | "INACTIVE" | "GRADUATED")
        }
        options={[
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
          { value: "GRADUATED", label: "Graduated" },
        ]}
        error={errors.status?.message}
      />
      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : student
            ? "Update Student"
            : "Create Student"}
        </Button>
      </div>
    </form>
  );
}
