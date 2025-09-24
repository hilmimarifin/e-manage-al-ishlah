export interface DashboardStats {
  totalPayments: number;
  totalStudents: number;
  totalClasses: number;
  paymentGrowth: number;
}

export interface GenderDistribution {
  name: string;
  value: number;
  fill: string;
  [key: string]: string | number;
}

export interface ClassGenderData {
  class: string;
  "Laki-laki": number;
  "Perempuan": number;
  [key: string]: string | number;
}

export interface PaymentTrendData {
  month: string;
  [className: string]: string | number;
}

export interface DashboardData {
  stats: DashboardStats;
  genderDistribution: GenderDistribution[];
  classGenderData: ClassGenderData[];
  paymentTrendData: PaymentTrendData[];
}

export interface DashboardApiParams {
  year?: string;
}

export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}
