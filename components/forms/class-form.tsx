"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Class } from "@/types";
import {
  createClassSchema,
  updateClassSchema,
  CreateClassInput,
  UpdateClassInput,
} from "@/lib/validations";
import { ComboBox } from "../elements/combo-box";
import Select from "../elements/select";
import { useUsers } from "@/hooks/use-users";
import TahunAjaran from "../elements/tahun-ajaran-picker";
import { Loader2, Plus } from "lucide-react";

interface ClassFormProps {
  classes?: Class;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ClassForm({
  classes,
  onSubmit,
  isLoading,
}: ClassFormProps) {
  const isEditing = !!classes;
  const schema = isEditing ? updateClassSchema : createClassSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateClassInput | UpdateClassInput>({
    resolver: zodResolver(schema),
    defaultValues: {
     name: classes?.name || "",
     grade: classes?.grade || "",
     year: classes?.year || "",
     teacherId: classes?.teacherId || "",
     monthlyFee: classes?.monthlyFee || 0,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (classes) {
      reset({
        name: classes.name || "",
        grade: classes.grade || "",
        year: classes.year || "",
        teacherId: classes.teacherId || "",
        monthlyFee: classes.monthlyFee || 0,
      });
    }
  }, [classes, reset]);

  const onFormSubmit = (data: CreateClassInput | UpdateClassInput) => {
    onSubmit(data);
  };

  const teacherOptions = useUsers({}).data?.map((user) => ({
    value: user.id,
    label: user.username,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nama Kelas</Label>
          <Input
            id="name"
            {...register("name")}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <span className="text-sm text-red-500">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="grade">Jenjang Kelas</Label>
          <Input
            type="number"
            id="grade"
            {...register("grade")}
            className={errors.grade ? "border-red-500" : ""}
          />
          {errors.grade && (
            <span className="text-sm text-red-500">
              {errors.grade.message}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-2 mb-4">
        <TahunAjaran
          id="year"
          {...register("year")}
          className={errors.year ? "border-red-500" : ""}
          onValueChange={(value) => setValue("year", value)}
          value={watchedValues.year}
        />
      </div>

      <div className="grid gap-2 mb-4">
        <Select
          id="teacherId"
          label="Wali Kelas"
          {...register("teacherId")}
          options={teacherOptions}
          className={errors.teacherId ? "border-red-500" : ""}
          onValueChange={(value) => setValue("teacherId", value)}
          value={watchedValues.teacherId}
        />
      </div>

      <div className="grid gap-2 mb-4">
        <Label htmlFor="monthlyFee">SPP Bulanan</Label>

        <Input
          type="number"
          id="monthlyFee"
          {...register("monthlyFee")}
          className={errors.monthlyFee ? "border-red-500" : ""}
        />
        {errors.monthlyFee && (
          <span className="text-sm text-red-500">
            {errors.monthlyFee.message}
          </span>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Saving..." : classes ? "Update Class" : "Create Class"}
        </Button>
      </div>
    </form>
  );
}
