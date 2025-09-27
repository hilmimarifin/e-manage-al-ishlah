"use client";

import TahunAjaran from "@/components/elements/tahun-ajaran-picker";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getCurrentAcademicYear } from "@/lib/client-utils";
import { useState } from "react";
import { StatCard, CustomPieChart, CustomBarChart, CustomLineChart } from "@/components/charts";
import { useDashboard } from "@/hooks/use-dashboard";
import { Icons } from "@/components/layout/icons";
import { GraduationCap } from "lucide-react";

export default function DashboardPage() {
  const [year, setYear] = useState(getCurrentAcademicYear());
  const { data, loading, error, refetch } = useDashboard(year);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Icons icon="Loader2" className="animate-spin h-12 w-12 text-primary" />
          <div className="text-lg text-muted-foreground">Loading dashboard data...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error || 'Failed to load data'}</div>
          <button 
            onClick={refetch}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const genderConfig = {
    "Laki-laki": {
      label: "Laki-laki",
      color: "hsl(var(--chart-1))"
    },
    "Perempuan": {
      label: "Perempuan", 
      color: "hsl(var(--chart-2))"
    }
  };

  const classGenderConfig = {
    lakiLaki: {
      label: "Laki-laki",
      color: "hsl(var(--chart-1))"
    },
    perempuan: {
      label: "Perempuan",
      color: "hsl(var(--chart-2))"
    }
  };

  // Generate dynamic config for payment trends based on available classes
  const paymentTrendConfig = Object.keys(data.paymentTrendData[0] || {})
    .filter(key => key !== 'month')
    .reduce((config, className, index) => {
      config[className] = {
        label: className,
        color: `hsl(var(--chart-${(index % 5) + 1}))`
      };
      return config;
    }, {} as Record<string, { label: string; color: string }>);


  return (
    <DashboardLayout>
      <section className="space-y-3">
        <div>
          <TahunAjaran onValueChange={setYear} value={year} rootClassName="h-12 rounded-xl bg-card" />
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Pembayaran"
            value={`Rp ${data.stats.totalPayments.toLocaleString()}`}
            description={`Total pembayaran tahun ajaran ${year}`}
            icon="CreditCard"
          />
          <StatCard
            title="Total Siswa"
            value={data.stats.totalStudents}
            description={`Siswa aktif tahun ajaran ${year}`}
            icon="Users"
          />
          <StatCard
            title="Total Kelas"
            value={data.stats.totalClasses}
            description={`Kelas aktif tahun ajaran ${year}`}
            icon="GraduationCap"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Gender Distribution Pie Chart */}
          <CustomPieChart
            title="Distribusi Siswa Berdasarkan Gender"
            description={`Perbandingan jumlah siswa laki-laki dan perempuan tahun ajaran ${year}`}
            data={data.genderDistribution}
            config={genderConfig}
          />

          {/* Students by Class and Gender Bar Chart */}
          <CustomBarChart
            title="Siswa per Kelas Berdasarkan Gender"
            description={`Jumlah siswa laki-laki dan perempuan di setiap kelas tahun ajaran ${year}`}
            data={data.classGenderData}
            config={classGenderConfig}
            xAxisKey="class"
            bars={[
              { dataKey: "Laki-laki" },
              { dataKey: "Perempuan" }
            ]}
          />
        </div>

        {/* Payment Trend Line Chart */}
        <CustomLineChart
          title="Total Pembayaran Bulanan per Kelas"
          description={`Perkembangan pembayaran setiap bulan berdasarkan tingkat kelas tahun ajaran ${year}`}
          data={data.paymentTrendData}
          config={paymentTrendConfig}
          xAxisKey="month"
          lines={Object.keys(paymentTrendConfig).map(className => ({ dataKey: className }))}
          className="col-span-full"
        />
      </section>
    </DashboardLayout>
  );
}
