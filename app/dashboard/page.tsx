"use client";

import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getCurrentAcademicYear } from "@/lib/client-utils";
import { useState } from "react";
import {
  StatCard,
  CustomPieChart,
  CustomBarChart,
  CustomLineChart,
} from "@/components/charts";
import { useDashboard } from "@/hooks/use-dashboard";
import { Icons } from "@/components/layout/icons";
import { GraduationCap } from "lucide-react";

export default function DashboardPage() {
  const [year, setYear] = useState(getCurrentAcademicYear());
  const { data, loading, error, refetch } = useDashboard(year);

  const genderConfig = {
    "Laki-laki": {
      label: "Laki-laki",
      color: "hsl(var(--chart-1))",
    },
    Perempuan: {
      label: "Perempuan",
      color: "hsl(var(--chart-2))",
    },
  };

  const classGenderConfig = {
    lakiLaki: {
      label: "Laki-laki",
      color: "hsl(var(--chart-1))",
    },
    perempuan: {
      label: "Perempuan",
      color: "hsl(var(--chart-2))",
    },
  };

  // Generate dynamic config for payment trends based on available classes
  const paymentTrendConfig = Object.keys(data?.paymentTrendData[0] || {})
    .filter((key) => key !== "month")
    .reduce((config, className, index) => {
      config[className] = {
        label: className,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return config;
    }, {} as Record<string, { label: string; color: string }>);

  return (
    <DashboardLayout>
      <section className="space-y-3">
        <div>
          <TahunAjaran
            onValueChange={setYear}
            value={year}
            rootClassName="h-12 rounded-xl bg-card"
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Pembayaran"
            value={`Rp ${data?.stats.totalPayments || 0}`}
            description={`Total pembayaran tahun ajaran ${year}`}
            icon="CreditCard"
            isLoading={loading}
          />
          <StatCard
            title="Total Siswa"
            value={data?.stats.totalStudents || 0}
            description={`Siswa aktif tahun ajaran ${year}`}
            icon="Users"
            isLoading={loading}
          />
          <StatCard
            title="Total Kelas"
            value={data?.stats.totalClasses || 0}
            description={`Kelas aktif tahun ajaran ${year}`}
            icon="GraduationCap"
            isLoading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Gender Distribution Pie Chart */}
          <CustomPieChart
            title="Distribusi Siswa Berdasarkan Gender"
            description={`Perbandingan jumlah siswa laki-laki dan perempuan tahun ajaran ${year}`}
            data={data?.genderDistribution || []}
            config={genderConfig}
            isLoading={loading}
          />

          {/* Students by Class and Gender Bar Chart */}
          <CustomBarChart
            title="Siswa per Kelas Berdasarkan Gender"
            description={`Jumlah siswa laki-laki dan perempuan di setiap kelas tahun ajaran ${year}`}
            data={data?.classGenderData || []}
            config={classGenderConfig}
            xAxisKey="class"
            bars={[{ dataKey: "Laki-laki" }, { dataKey: "Perempuan" }]}
            isLoading={loading}
          />
        </div>

        {/* Payment Trend Line Chart */}
        <CustomLineChart
          title="Total Pembayaran Bulanan per Kelas"
          description={`Perkembangan pembayaran setiap bulan berdasarkan tingkat kelas tahun ajaran ${year}`}
          data={data?.paymentTrendData || []}
          config={paymentTrendConfig}
          xAxisKey="month"
          lines={Object.keys(paymentTrendConfig).map((className) => ({
            dataKey: className,
          }))}
          className="col-span-full"
          isLoading={loading}
        />
      </section>
    </DashboardLayout>
  );
}
