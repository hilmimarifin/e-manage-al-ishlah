"use client";

import { ComboBox } from "@/components/elements/combo-box";
import FilterContainer from "@/components/elements/filter-container";
import Select from "@/components/elements/select";
import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses } from "@/hooks/use-classes";
import { useCreatePayment, usePaymentClass } from "@/hooks/use-payment-class";
import { useStudents } from "@/hooks/use-students";
import { useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";
import { Handshake, Plus } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    teacherId: useAuthStore.getState().user?.id,
    studentId: "",
    classId: "",
    year: "2025/2026",
    amount: "",
  });

  const { data: classes = [] } = useClasses(form);

  const classOptions = classes.map((cls) => ({
    value: cls.id,
    label: cls.name,
  }));

  const { data: paymentClass, isLoading, error } = usePaymentClass(form);

  const studentsOptions = paymentClass?.map((student) => ({
    value: student.id,
    label: student.name,
  }));

  const createPayment = useCreatePayment();

  const handleCreatePayment = async () => {
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
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Selamat Datang, {user?.username}!
          </h1>
        </div>
      </div>
      <section className="md:w-1/3 flex flex-col gap-8 border p-4 rounded-xl">
        <div className="flex flex-col items-center gap-2 text-primary">
          <Handshake className="h-12 w-12" />
          <h2 className="text-xl font-semibold">Tambah Pembayaran SPP</h2>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Siswa</Label>
          <ComboBox
            rootClassName="h-12 rounded-xl"
            value={form.studentId}
            onValueChange={(value) =>
              setForm({
                ...form,
                studentId: value,
                classId:
                  paymentClass?.find((cls) => cls.id === value)?.classId || "",
                amount:
                  paymentClass
                    ?.find((cls) => cls.id === value)
                    ?.monthlyFeeAmount.toString() || "",
              })
            }
            options={studentsOptions || []}
          />
        </div>
        <TahunAjaran
          rootClassName="h-12 rounded-xl"
          onValueChange={(value) => {
            setForm({ ...form, year: value, classId: "", studentId: "" });
          }}
          value={form.year}
        />
        <Select
          label="Kelas"
          rootClassName="h-12 rounded-xl"
          placeholder="Pilih kelas"
          options={classOptions}
          value={form.classId}
          onValueChange={(value) => {
            setForm({ ...form, classId: value, studentId: "" });
          }}
        />
        <div className="flex flex-col gap-2">
          <Label>Jumlah</Label>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Jumlah"
            className="h-12 rounded-xl"
          />
        </div>
        <Button
          disabled={!form.studentId || createPayment.isPending}
          onClick={handleCreatePayment}
          className="h-12 rounded-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </section>
    </DashboardLayout>
  );
}
