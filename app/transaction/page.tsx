"use client";

import { ComboBox } from "@/components/elements/combo-box";
import Select from "@/components/elements/select";
import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses } from "@/hooks/use-classes";
import {
  useCreatePayment,
  usePaymentClass,
  useUpdatePayment,
} from "@/hooks/use-payment-class";
import { getCurrentAcademicYear } from "@/lib/client-utils";
import { useAuthStore } from "@/store/auth-store";
import { Handshake, Loader2, Plus } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type MonthKey =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "oct"
  | "nov"
  | "dec";

interface MonthData {
  key: MonthKey;
  name: string;
  number: number;
}

interface FormState {
  teacherId: string | undefined;
  studentId: string;
  classId: string;
  year: string;
  amount: string;
}

const MONTHS: MonthData[] = [
  { key: "jul", name: "Juli", number: 7 },
  { key: "aug", name: "Agustus", number: 8 },
  { key: "sep", name: "September", number: 9 },
  { key: "oct", name: "Oktober", number: 10 },
  { key: "nov", name: "November", number: 11 },
  { key: "dec", name: "Desember", number: 12 },
  { key: "jan", name: "Januari", number: 1 },
  { key: "feb", name: "Februari", number: 2 },
  { key: "mar", name: "Maret", number: 3 },
  { key: "apr", name: "April", number: 4 },
  { key: "may", name: "Mei", number: 5 },
  { key: "jun", name: "Juni", number: 6 },
];

export default function DashboardPage() {
  const [form, setForm] = useState<FormState>({
    teacherId: useAuthStore.getState().user?.id,
    studentId: "",
    classId: "",
    year: getCurrentAcademicYear(),
    amount: "",
  });

  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [initialSelectedMonths, setInitialSelectedMonths] = useState<string[]>(
    []
  );

  const { data: classes = [], isLoading: classesLoading } = useClasses(form);
  const { data: paymentClass, isLoading, error } = usePaymentClass(form);
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();

  // Memoize class options to prevent unnecessary re-renders
  const classOptions = useMemo(
    () =>
      classes.map((cls) => ({
        value: cls.id,
        label: cls.name,
      })),
    [classes]
  );

  // Memoize student options
  const studentsOptions = useMemo(
    () =>
      paymentClass?.map((student) => ({
        value: student.id,
        label: student.name,
      })) || [],
    [paymentClass]
  );

  // Check if there are changes to submit
  const hasChanges = useMemo(() => {
    if (selectedMonths.length !== initialSelectedMonths.length) return true;
    return selectedMonths.some(
      (month) => !initialSelectedMonths.includes(month)
    );
  }, [selectedMonths, initialSelectedMonths]);

  // Handlers
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
          amount: selectedStudent.monthlyFeeAmount?.toString() || "",
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

  const handleMonthToggle = useCallback((monthNumber: string) => {
    setSelectedMonths((prev) =>
      prev.includes(monthNumber)
        ? prev.filter((m) => m !== monthNumber)
        : [...prev, monthNumber]
    );
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!form.studentId || !form.classId || !hasChanges) {
        return;
      }

      try {
        const monthsToUpdate = MONTHS.filter(
          (month) => !selectedMonths.includes(month.number.toString())
        ).map((month) => month.number.toString());

        await updatePayment.mutateAsync({
          studentId: form.studentId,
          classId: form.classId,
          months: monthsToUpdate,
        });

        // Update initial state after successful submission
        setInitialSelectedMonths(selectedMonths);
      } catch (error) {
        console.error("Failed to update payment:", error);
      }
    },
    [form.studentId, form.classId, selectedMonths, hasChanges, updatePayment]
  );

  // Effects
  // Update selected months when student changes
  useEffect(() => {
    if (form.studentId && paymentClass) {
      const selectedPerson = paymentClass.find(
        (cls) => cls.id === form.studentId
      );
      if (selectedPerson) {
        const monthlyFee = selectedPerson.monthlyFee as Record<string, unknown>;
        const unpaidMonths = MONTHS.filter(
          (month) => !monthlyFee[month.key]
        ).map((month) => month.number.toString());

        setSelectedMonths(unpaidMonths);
        setInitialSelectedMonths([...unpaidMonths]);
      }
    } else {
      setSelectedMonths([]);
      setInitialSelectedMonths([]);
    }
  }, [form.studentId, paymentClass]);

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
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                {form.studentId && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {MONTHS.map((month) => {
                      const selectedPerson = paymentClass?.find(
                        (cls) => cls.id === form.studentId
                      );

                      const monthlyFee = selectedPerson?.monthlyFee as
                        | Record<string, unknown>
                        | undefined;
                      const isPaid = monthlyFee
                        ? Boolean(monthlyFee[month.key])
                        : false;
                      const isSelected = selectedMonths.includes(
                        month.number.toString()
                      );

                      return (
                        <div
                          key={month.key}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={month.key}
                            disabled={!!isPaid}
                            checked={!isSelected}
                            onCheckedChange={() =>
                              handleMonthToggle(month.number.toString())
                            }
                          />
                          <Label
                            htmlFor={month.key}
                            className={`text-sm ${
                              isPaid ? "text-muted-foreground line-through" : ""
                            }`}
                          >
                            {month.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="submit"
                className="h-12 rounded-xl shadow-md shadow-primary/50 w-full"
                disabled={
                  !form.studentId ||
                  !form.classId ||
                  !hasChanges ||
                  updatePayment.isPending ||
                  createPayment.isPending
                }
              >
                {updatePayment.isPending || createPayment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Pembayaran
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* <div className="flex flex-col gap-2">
          <Label>Jumlah</Label>
          <Input
            type="number"
            value={form.amount}
            onChange={handleAmountChange}
            placeholder="Jumlah"
            className="h-12 rounded-xl"
          />
        </div> */}
        {/* <Button
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
        </Button> */}
      </section>
    </DashboardLayout>
  );
}
