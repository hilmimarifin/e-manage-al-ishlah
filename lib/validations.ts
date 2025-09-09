import { z } from 'zod'

// Enums
export const StudentStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED'])
export const PaymentStatusEnum = z.enum(['PENDING', 'PAID', 'OVERDUE'])
export const GenderEnum = z.enum(['MALE', 'FEMALE'])

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  photo: z.string().optional(),
  roleId: z.string().min(1, 'Role is required')
})

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  photo: z.string().optional(),
  roleId: z.string().min(1, 'Role is required').optional()
})

// Role validation schemas
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional()
})

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').optional(),
  description: z.string().optional()
})

// Menu validation schemas
export const createMenuSchema = z.object({
  name: z.string().min(1, 'Menu name is required'),
  path: z.string().min(1, 'Menu path is required'),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  orderIndex: z.number().int().min(0).default(0)
})

export const updateMenuSchema = z.object({
  name: z.string().min(1, 'Menu name is required').optional(),
  path: z.string().min(1, 'Menu path is required').optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  orderIndex: z.number().int().min(0).optional()
})

// RoleMenu validation schemas
export const createRoleMenuSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
  menuId: z.string().min(1, 'Menu ID is required'),
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
  fullName: z.string().min(1, 'Full name is required'),
  birthDate: z.string().min(1, 'Birth date is required').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  guardian: z.string().optional(),
  gender: GenderEnum,
  photo: z.string().optional(),
  status: StudentStatusEnum.default('ACTIVE'),
  entryYear: z.string().min(1, 'Entry year is required')
})

export const updateStudentSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').optional(),
  birthDate: z.string().min(1, 'Birth date is required').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  guardian: z.string().optional(),
  gender: GenderEnum.optional(),
  photo: z.string().optional(),
  status: StudentStatusEnum.optional(),
  entryYear: z.string().min(1, 'Entry year is required')
})

// Class validation schemas
export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  grade: z.string().min(1, "Grade is required"),
  year: z.string().min(1, "Year is required"),
  teacherId: z.string().min(1, "Teacher ID is required"),
  monthlyFee: z.coerce
    .number()
    .int()
    .positive()
    .min(1, "Monthly fee is required"),
});

export const updateClassSchema = z.object({
  name: z.string().min(1, "Class name is required").optional(),
  grade: z.string().min(1, "Grade is required").optional(),
  year: z.string().min(1, "Year is required").optional(),
  teacherId: z.string().min(1, "Teacher ID is required").optional(),
  monthlyFee: z.coerce
    .number()
    .int()
    .positive()
    .min(1, "Monthly fee is required"),
});

// StudentClass validation schemas
export const createStudentClassSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  year: z.string().min(1, 'Year is required')
})

export const updateStudentClassSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  year: z.string().min(1, 'Year is required').optional()
})

// Payment validation schemas
export const createPaymentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  amount: z.number().positive('Amount must be positive'),
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(1900).max(2100, 'Year must be valid'),
  status: PaymentStatusEnum.default('PAID'),
  paidAt: z.string().datetime().optional().or(z.date().optional()),
  recordedBy: z.string().min(1, 'Recorded by is required')
})

export const updatePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12').optional(),
  year: z.number().int().min(1900).max(2100, 'Year must be valid').optional(),
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
