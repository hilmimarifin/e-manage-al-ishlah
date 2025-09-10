import { Gender, StudentStatus } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
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
  fullName: string;
  birthDate: string;
  address: string;
  phone: string;
  guardian: string;
  photo: string;
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
  classId: string;
  className: string;
  grade: string;
  year: string;
  students: StudentClass[];
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
