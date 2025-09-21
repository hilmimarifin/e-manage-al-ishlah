import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withWritePermission } from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { createStudentSchema, GenderEnum } from "@/lib/validations";
import * as XLSX from 'xlsx';

interface StudentRow {
  fullName: string;
  nik?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  phone?: string;
  guardian?: string;
  gender: string;
  entryYear: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

interface ProcessResult {
  success: boolean;
  created: number;
  errors: ValidationError[];
  duplicates: string[];
}

function validateExcelRow(row: any, rowIndex: number): { isValid: boolean; errors: ValidationError[]; data?: StudentRow } {
  const errors: ValidationError[] = [];
  
  // Required fields validation
  if (!row['Nama Lengkap'] || typeof row['Nama Lengkap'] !== 'string' || row['Nama Lengkap'].trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'Nama Lengkap',
      message: 'Nama lengkap wajib diisi',
      value: row['Nama Lengkap']
    });
  }

  if (!row['Tahun Masuk'] || typeof row['Tahun Masuk'] !== 'string' || row['Tahun Masuk'].trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'Tahun Masuk',
      message: 'Tahun masuk wajib diisi',
      value: row['Tahun Masuk']
    });
  }

  // Gender validation
  const genderValue = row['Jenis Kelamin']?.toString().toUpperCase();
  if (!genderValue || !['MALE', 'FEMALE', 'L', 'P', 'LAKI-LAKI', 'PEREMPUAN'].includes(genderValue)) {
    errors.push({
      row: rowIndex,
      field: 'Jenis Kelamin',
      message: 'Jenis kelamin harus diisi dengan: MALE/FEMALE, L/P, atau Laki-laki/Perempuan',
      value: row['Jenis Kelamin']
    });
  }

  // Birth date validation (optional but must be valid if provided)
  if (row['Tanggal Lahir']) {
    const birthDate = new Date(row['Tanggal Lahir']);
    if (isNaN(birthDate.getTime())) {
      errors.push({
        row: rowIndex,
        field: 'Tanggal Lahir',
        message: 'Format tanggal lahir tidak valid',
        value: row['Tanggal Lahir']
      });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Normalize gender
  let normalizedGender = 'MALE';
  if (['FEMALE', 'P', 'PEREMPUAN'].includes(genderValue)) {
    normalizedGender = 'FEMALE';
  }

  const studentData: StudentRow = {
    fullName: row['Nama Lengkap'].trim(),
    nik: row['NIK']?.toString().trim() || undefined,
    birthDate: row['Tanggal Lahir'] ? new Date(row['Tanggal Lahir']).toISOString() : undefined,
    birthPlace: row['Tempat Lahir']?.toString().trim() || undefined,
    address: row['Alamat']?.toString().trim() || undefined,
    phone: row['No. Telepon']?.toString().trim() || undefined,
    guardian: row['Wali']?.toString().trim() || undefined,
    gender: normalizedGender,
    entryYear: row['Tahun Masuk'].toString().trim()
  };

  return { isValid: true, errors: [], data: studentData };
}

async function processStudentsBatch(students: StudentRow[]): Promise<ProcessResult> {
  const result: ProcessResult = {
    success: true,
    created: 0,
    errors: [],
    duplicates: []
  };

  // Check for duplicates in the database
  const existingStudents = await prisma.student.findMany({
    where: {
      fullName: {
        in: students.map(s => s.fullName)
      }
    },
    select: { fullName: true }
  });

  const existingNames = new Set(existingStudents.map(s => s.fullName));

  // Filter out duplicates and validate each student
  const validStudents: StudentRow[] = [];
  
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    if (existingNames.has(student.fullName)) {
      result.duplicates.push(student.fullName);
      continue;
    }

    // Final validation with Zod schema
    const validationResult = createStudentSchema.safeParse({
      fullName: student.fullName,
      nik: student.nik,
      birthDate: student.birthDate,
      birthPlace: student.birthPlace,
      address: student.address,
      phone: student.phone,
      guardian: student.guardian,
      gender: student.gender,
      entryYear: student.entryYear
    });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      
      result.errors.push({
        row: i + 2, // +2 because Excel rows start from 1 and we have header
        field: 'validation',
        message: errorMessages,
        value: student.fullName
      });
      continue;
    }

    validStudents.push(student);
  }

  // Batch create valid students
  if (validStudents.length > 0) {
    try {
      const createData = validStudents.map(student => ({
        fullName: student.fullName,
        nik: student.nik || "", // Default empty if not provided
        birthDate: student.birthDate ? new Date(student.birthDate) : null,
        birthPlace: student.birthPlace || "", // Default empty if not provided
        address: student.address,
        phone: student.phone,
        guardian: student.guardian,
        gender: student.gender as 'MALE' | 'FEMALE',
        entryYear: student.entryYear,
        photo: "https://placehold.co/100x100"
      }));

      await prisma.student.createMany({
        data: createData,
        skipDuplicates: true
      });

      result.created = validStudents.length;
    } catch (error) {
      result.success = false;
      result.errors.push({
        row: 0,
        field: 'database',
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        value: null
      });
    }
  }

  return result;
}

export const POST = withWritePermission(
  "/students",
  async (req: NextRequest) => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          createErrorResponse("No file uploaded", "File is required"),
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          createErrorResponse(
            "Invalid file type", 
            "Only Excel files (.xlsx, .xls) and CSV files are allowed"
          ),
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          createErrorResponse(
            "File too large", 
            "File size must be less than 5MB"
          ),
          { status: 400 }
        );
      }

      // Read and parse Excel file
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      if (!workbook.SheetNames.length) {
        return NextResponse.json(
          createErrorResponse(
            "Empty file", 
            "Excel file must contain at least one sheet"
          ),
          { status: 400 }
        );
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length) {
        return NextResponse.json(
          createErrorResponse(
            "Empty sheet", 
            "Excel sheet must contain data rows"
          ),
          { status: 400 }
        );
      }

      // Validate required columns
      const requiredColumns = ['Nama Lengkap', 'Jenis Kelamin', 'Tahun Masuk'];
      const firstRow = jsonData[0] as any;
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));

      if (missingColumns.length > 0) {
        return NextResponse.json(
          createErrorResponse(
            "Missing required columns", 
            `Required columns: ${missingColumns.join(', ')}`
          ),
          { status: 400 }
        );
      }

      // Validate each row
      const validationErrors: ValidationError[] = [];
      const validStudents: StudentRow[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const validation = validateExcelRow(jsonData[i], i + 2); // +2 for Excel row number
        
        if (!validation.isValid) {
          validationErrors.push(...validation.errors);
        } else if (validation.data) {
          validStudents.push(validation.data);
        }
      }

      // If there are validation errors, return them
      if (validationErrors.length > 0) {
        return NextResponse.json(
          {
            ...createErrorResponse("Some rows contain invalid data", "Validation failed"),
            data: { errors: validationErrors }
          },
          { status: 400 }
        );
      }

      // Process the batch
      const result = await processStudentsBatch(validStudents);

      if (!result.success) {
        return NextResponse.json(
          {
            ...createErrorResponse("Error occurred while creating students", "Batch processing failed"),
            data: { errors: result.errors }
          },
          { status: 500 }
        );
      }

      // Return success response with details
      const responseData = {
        created: result.created,
        duplicates: result.duplicates,
        totalProcessed: jsonData.length,
        errors: result.errors
      };

      return NextResponse.json(
        createSuccessResponse(
          responseData, 
          `Successfully processed ${result.created} students. ${result.duplicates.length} duplicates skipped.`
        )
      );

    } catch (error) {
      console.error('Batch upload error:', error);
      return NextResponse.json(
        createErrorResponse(
          error instanceof Error ? error.message : "Unknown error", 
          "Internal server error"
        ),
        { status: 500 }
      );
    }
  }
);
