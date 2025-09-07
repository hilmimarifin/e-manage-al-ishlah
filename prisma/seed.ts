import { PrismaClient, StudentStatus, PaymentStatus, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "Super admin" },
    update: {},
    create: {
      name: "Super admin",
      description: "Administrator with full system access",
    },
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: "Teacher" },
    update: {},
    create: {
      name: "Teacher",
      description: "Handles teaching and class management",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "User" },
    update: {},
    create: {
      name: "User",
      description: "Regular user with limited access",
    },
  });

  // Menus
  const dashboardMenu = await prisma.menu.upsert({
    where: { path: "/dashboard" },
    update: {},
    create: {
      name: "Dashboard",
      path: "/dashboard",
      icon: "LayoutDashboard",
      orderIndex: 1,
    },
  });

  const usersMenu = await prisma.menu.upsert({
    where: { path: "/users" },
    update: {},
    create: {
      name: "Users",
      path: "/users",
      icon: "Users",
      orderIndex: 2,
    },
  });

  const rolesMenu = await prisma.menu.upsert({
    where: { path: "/roles" },
    update: {},
    create: {
      name: "Roles",
      path: "/roles",
      icon: "UserCheck",
      orderIndex: 3,
    },
  });

  const menusMenu = await prisma.menu.upsert({
    where: { path: "/menus" },
    update: {},
    create: {
      name: "Menus",
      path: "/menus",
      icon: "MenuIcon",
      orderIndex: 4,
    },
  });

  // RoleMenu - full access for admin
  for (const menu of [dashboardMenu, usersMenu, rolesMenu, menusMenu]) {
    await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: { roleId: adminRole.id, menuId: menu.id },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        menuId: menu.id,
        canRead: true,
        canWrite: true,
        canUpdate: true,
        canDelete: true,
      },
    });
  }

  // Users
  const adminPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      password: adminPassword,
      photo: "https://placehold.co/100x100",
      roleId: adminRole.id,
    },
  });

  const teacherPassword = await bcrypt.hash("teacher123", 12);
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@example.com" },
    update: {},
    create: {
      email: "teacher@example.com",
      username: "teacher",
      password: teacherPassword,
      photo: "https://placehold.co/100x100",
      roleId: teacherRole.id,
    },
  });

  // Classes
  const class1 = await prisma.class.create({
    data: {
      name: "Kelas 1A",
      level: "1",
      year: "2025",
      capacity: 30,
      teacherId: teacherUser.id,
    },
  });

  const class2 = await prisma.class.create({
    data: {
      name: "Kelas 2A",
      level: "2",
      year: "2026",
      capacity: 30,
      teacherId: teacherUser.id,
    },
  });

  // Students
  const student1 = await prisma.student.create({
    data: {
      fullName: "Ahmad Fauzi",
      birthDate: new Date("2015-01-10"),
      address: "Jl. Merdeka No. 1",
      phone: "08123456789",
      gender: Gender.MALE,
      guardian: "Bapak Fauzi",
      photo: "https://placehold.co/100x100",
      status: StudentStatus.ACTIVE,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      fullName: "Siti Aminah",
      birthDate: new Date("2014-06-20"),
      address: "Jl. Mawar No. 2",
      phone: "08234567890",
      gender: Gender.FEMALE,
      guardian: "Ibu Aminah",
      photo: "https://placehold.co/100x100",
      status: StudentStatus.ACTIVE,
    },
  });

  // StudentClass (riwayat kelas)
  await prisma.studentClass.createMany({
    data: [
      { studentId: student1.id, classId: class1.id, year: "2025" },
      { studentId: student1.id, classId: class2.id, year: "2026" },
      { studentId: student2.id, classId: class1.id, year: "2025" },
    ],
  });

  // Payments
  await prisma.payment.createMany({
    data: [
      {
        studentId: student1.id,
        amount: 500000,
        month: 1,
        year: 2025,
        status: PaymentStatus.PAID,
        recordedBy: teacherUser.id,
      },
      {
        studentId: student2.id,
        amount: 500000,
        month: 1,
        year: 2025,
        status: PaymentStatus.PENDING,
        recordedBy: teacherUser.id,
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("🔑 Admin credentials: admin@example.com / admin123");
  console.log("👩‍🏫 Teacher credentials: teacher@example.com / teacher123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
