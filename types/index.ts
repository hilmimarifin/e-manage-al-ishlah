import { Gender, StudentStatus } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  nik: string;
  name: string;
  gender: Gender;
  birthDate?: string | null;
  birthPlace?: string | null;
  education?: string | null;
  phone: string;
  address?: string | null;
  photo?: string | null;
  roleId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  users?: User[];
  roleMenus?: RoleMenu[];
  _count?: {
    users: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  nik: string;
  fullName: string;
  birthDate?: string | null;
  birthPlace?: string | null;
  address?: string | null;
  phone?: string | null;
  guardian?: string | null;
  photo?: string | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  gender: Gender;
  entryYear: string;
}

export interface Class {
  id: string;
  name: string;
  monthlyFee: number;
  grade: string;
  year: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  teacherName: string;
}

export interface StudentClass {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  className: string;
  year: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}
export interface Classroom {
  id: string;
  name: string;
  grade: string;
  className: string;
  year: string;
  address: string;
  phone: string;
}

export interface PaymentClass {
    id: string;
    name: string;
    year: string;
    grade: string;
    classId: string;
    className: string;
    monthlyFeeAmount: number;
    monthlyFee: {
      jan: number;
      feb: number;
      mar: number;
      apr: number;
      may: number;
      jun: number;
      jul: number;
      aug: number;
      sep: number;
      oct: number;
      nov: number;
      dec: number;
    };
}

export interface CreatePaymentClass {
  studentId: string;
  classId: string;
}

export interface Menu {
  id: string;
  name: string;
  path: string;
  icon?: string | null;
  parentId?: string | null;
  orderIndex: number;
  parent?: Menu;
  children?: Menu[];
  roleMenus?: RoleMenu[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleMenu {
  id: string;
  roleId: string;
  menuId: string;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  role: Role;
  menu: Menu;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}
