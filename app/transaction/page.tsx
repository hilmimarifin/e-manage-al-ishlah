"use client";

import { ComboBox } from "@/components/elements/combo-box";
import Select from "@/components/elements/select";
import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses } from "@/hooks/use-classes";
import { useCreatePayment, usePaymentClass } from "@/hooks/use-payment-class";
import { getCurrentAcademicYear } from "@/lib/client-utils";
import { useAuthStore } from "@/store/auth-store";
import { Handshake, Loader2, Plus } from "lucide-react";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";

export default function DashboardPage() {
  const [form, setForm] = useState({
    teacherId: useAuthStore.getState().user?.id,
    studentId: "",
    classId: "",
    year: getCurrentAcademicYear(),
    amount: "",
  });

  const { data: classes = [], isLoading: classesLoading } = useClasses(form);

  // Memoize class options to prevent unnecessary re-renders
  const classOptions = useMemo(
    () =>
      classes.map((cls) => ({
        value: cls.id,
        label: cls.name,
      })),
    [classes]
  );

  const { data: paymentClass, isLoading, error } = usePaymentClass(form);

  // Memoize student options to prevent unnecessary re-renders
  const studentsOptions = useMemo(
    () =>
      paymentClass?.map((student) => ({
        value: student.id,
        label: student.name,
      })) || [],
    [paymentClass]
  );

  const createPayment = useCreatePayment();

  const handleCreatePayment = useCallback(async () => {
    try {
      await createPayment.mutateAsync(form).then(() => {
        setForm((prev) => ({
          ...prev,
          studentId: "",
          amount: "",
        }));
      });
    } catch (error) {
      console.error("Failed to add student to class:", error);
    }
  }, [form, createPayment]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleStudentChange = useCallback((value: string) => {
    // Update studentId immediately for responsive UI
    setForm((prev) => ({
      ...prev,
      studentId: value,
      classId: "", // Reset these until data loads
      amount: "",
    }));
  }, []);

  // Effect to update classId and amount when paymentClass data changes
  React.useEffect(() => {
    if (form.studentId && paymentClass) {
      const selectedStudent = paymentClass.find(
        (cls) => cls.id === form.studentId
      );
      if (selectedStudent) {
        setForm((prev) => ({
          ...prev,
          classId: selectedStudent.classId || "",
          amount: selectedStudent.monthlyFeeAmount.toString() || "",
        }));
      }
    }
  }, [form.studentId, paymentClass]);

  const handleYearChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, year: value, classId: "", studentId: "" }));
  }, []);

  const handleClassChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, classId: value, studentId: "" }));
  }, []);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, amount: e.target.value }));
    },
    []
  );

  return (
    <DashboardLayout>
      <section className="md:w-1/3 flex flex-col gap-8 bg-card shadow-md border p-4 rounded-xl mx-auto">
        <div className="flex flex-col items-center gap-2 text-primary">
          <Handshake className="h-12 w-12" />
          <h2 className="text-xl font-semibold">Tambah Pembayaran SPP</h2>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Siswa</Label>
          <ComboBox
            isLoading={isLoading || classesLoading}
            rootClassName="h-12 rounded-xl"
            value={form.studentId}
            onValueChange={handleStudentChange}
            options={studentsOptions}
          />
        </div>
        <TahunAjaran
          rootClassName="h-12 rounded-xl"
          onValueChange={handleYearChange}
          value={form.year}
        />
        <Select
          label="Kelas"
          rootClassName="h-12 rounded-xl"
          placeholder="Pilih kelas"
          options={classOptions}
          value={form.classId}
          isLoading={classesLoading || isLoading}
          onValueChange={handleClassChange}
        />
        <div className="flex flex-col gap-2">
          <Label>Jumlah</Label>
          <Input
            type="number"
            value={form.amount}
            onChange={handleAmountChange}
            placeholder="Jumlah"
            className="h-12 rounded-xl"
          />
        </div>
        <Button
          disabled={!form.studentId || createPayment.isPending}
          onClick={handleCreatePayment}
          className="h-12 rounded-xl shadow-md shadow-primary/50"
        >
          {createPayment.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Tambah
        </Button>
      </section>
    </DashboardLayout>
  );
}
