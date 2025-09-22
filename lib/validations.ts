import { z } from 'zod'

// Enums
export const StudentStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED'])
export const PaymentStatusEnum = z.enum(['PENDING', 'PAID', 'OVERDUE'])
export const GenderEnum = z.enum(['MALE', 'FEMALE'])

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nik: z.string().min(16, 'NIK harus 16 karakter').max(16, 'NIK harus 16 karakter'),
  name: z.string().min(1, 'Nama wajib diisi'),
  gender: GenderEnum,
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  education: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  photo: z.string().optional(),
  roleId: z.string().min(1, 'Role is required')
})

export const updateUserSchema = z.object({
  email: z.string().email('Format email tidak valid').optional(),
  username: z.string().min(3, 'Username minimal 3 karakter').optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  nik: z.string().min(16, 'NIK harus 16 karakter').max(16, 'NIK harus 16 karakter').optional(),
  name: z.string().min(1, 'Nama wajib diisi').optional(),
  gender: GenderEnum.optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  education: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  photo: z.string().optional(),
  roleId: z.string().min(1, 'Role wajib diisi').optional()
})

// Role validation schemas
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Nama role wajib diisi'),
  description: z.string().optional()
})

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Nama role wajib diisi').optional(),
  description: z.string().optional()
})

// Menu validation schemas
export const createMenuSchema = z.object({
  name: z.string().min(1, 'Nama menu wajib diisi'),
  path: z.string().min(1, 'Path menu wajib diisi'),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  orderIndex: z.number().int().min(0).default(0)
})

export const updateMenuSchema = z.object({
  name: z.string().min(1, 'Nama menu wajib diisi').optional(),
  path: z.string().min(1, 'Path menu wajib diisi').optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  orderIndex: z.number().int().min(0).optional()
})

// RoleMenu validation schemas
export const createRoleMenuSchema = z.object({
  roleId: z.string().min(1, 'Role ID wajib diisi'),
  menuId: z.string().min(1, 'Menu ID wajib diisi'),
  canRead: z.boolean().default(true),
  canWrite: z.boolean().default(false),
  canUpdate: z.boolean().default(false),
  canDelete: z.boolean().default(false)
})

export const updateRoleMenuSchema = z.object({
  canRead: z.boolean().optional(),
  canWrite: z.boolean().optional(),
  canUpdate: z.boolean().optional(),
  canDelete: z.boolean().optional()
})

// Student validation schemas
export const createStudentSchema = z.object({
  nik: z.string().min(16, 'NIK harus 16 karakter').max(16, 'NIK harus 16 karakter'),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi').optional(),
  birthPlace: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  guardian: z.string().optional(),
  gender: GenderEnum,
  photo: z.string().optional(),
  status: StudentStatusEnum.default('ACTIVE'),
  entryYear: z.string().min(1, 'Tahun masuk wajib diisi')
})

export const updateStudentSchema = z.object({
  nik: z.string().min(16, 'NIK harus 16 karakter').max(16, 'NIK harus 16 karakter').optional(),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi').optional(),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi').optional(),
  birthPlace: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  guardian: z.string().optional(),
  gender: GenderEnum.optional(),
  photo: z.string().optional(),
  status: StudentStatusEnum.optional(),
  entryYear: z.string().min(1, 'Tahun masuk wajib diisi')
})

// Class validation schemas
export const createClassSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi"),
  grade: z.string().min(1, "Jenjang kelas wajib diisi"),
  year: z.string().min(1, "Tahun ajaran wajib diisi"),
  teacherId: z.string().min(1, "Wali kelas wajib diisi"),
  monthlyFee: z.coerce
    .number()
    .int()
    .positive()
    .min(1, "Biaya SPP wajib diisi"),
});

export const updateClassSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi").optional(),
  grade: z.string().min(1, "Jenjang kelas wajib diisi").optional(),
  year: z.string().min(1, "Tahun ajaran wajib diisi").optional(),
  teacherId: z.string().min(1, "Wali kelas wajib diisi").optional(),
  monthlyFee: z.coerce
    .number()
    .int()
    .positive()
    .min(1, "Biaya SPP wajib diisi"),
});

// StudentClass validation schemas
export const createStudentClassSchema = z.object({
  studentId: z.string().min(1, 'ID siswa wajib diisi'),
  classId: z.string().optional(),
  year: z.string().min(1, 'Tahun ajaran wajib diisi'),
  teacherId: z.string().optional(),
})

export const updateStudentClassSchema = z.object({
  studentId: z.string().min(1, 'ID siswa wajib diisi'),
  classId: z.string().min(1, 'ID kelas wajib diisi'),
  year: z.string().min(1, 'Tahun ajaran wajib diisi').optional()
})

// Payment validation schemas
export const createPaymentSchema = z.object({
  studentId: z.string().min(1, 'ID siswa wajib diisi'),
  amount: z.number().positive('Jumlah pembayaran harus positif'),
  month: z.number().int().min(1).max(12, 'Bulan harus antara 1 dan 12'),
  year: z.number().int().min(1900).max(2100, 'Tahun harus valid'),
  status: PaymentStatusEnum.default('PAID'),
  paidAt: z.string().datetime().optional().or(z.date().optional()),
  recordedBy: z.string().min(1, 'Recorded by is required')
})

export const updatePaymentSchema = z.object({
  amount: z.number().positive('Jumlah pembayaran harus positif').optional(),
  month: z.number().int().min(1).max(12, 'Bulan harus antara 1 dan 12').optional(),
  year: z.number().int().min(1900).max(2100, 'Tahun harus valid').optional(),
  status: PaymentStatusEnum.optional(),
  paidAt: z.string().datetime().optional().or(z.date().optional())
})

// Type exports for client-side usage
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type CreateMenuInput = z.infer<typeof createMenuSchema>
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>
export type CreateRoleMenuInput = z.infer<typeof createRoleMenuSchema>
export type UpdateRoleMenuInput = z.infer<typeof updateRoleMenuSchema>
export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
export type CreateStudentClassInput = z.infer<typeof createStudentClassSchema>
export type UpdateStudentClassInput = z.infer<typeof updateStudentClassSchema>
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
