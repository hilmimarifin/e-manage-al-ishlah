import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // =========================
  // ROLES
  // =========================
  const adminRole = await prisma.role.upsert({
    where: { name: "Super admin" },
    update: {},
    create: {
      name: "Super admin",
      description: "Administrator with full system access",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Regular user with limited access",
    },
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: "guru" },
    update: {},
    create: {
      name: "guru",
      description: "Guru wali kelas yang mengelola siswa dan pembayaran",
    },
  });

  // =========================
  // MENUS
  // =========================
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

  const studentsMenu = await prisma.menu.upsert({
    where: { path: "/students" },
    update: {},
    create: {
      name: "Students",
      path: "/students",
      icon: "GraduationCap",
      orderIndex: 5,
    },
  });

  const classesMenu = await prisma.menu.upsert({
    where: { path: "/classes" },
    update: {},
    create: {
      name: "Classes",
      path: "/classes",
      icon: "School",
      orderIndex: 6,
    },
  });

  const paymentsMenu = await prisma.menu.upsert({
    where: { path: "/payments" },
    update: {},
    create: {
      name: "Payments",
      path: "/payments",
      icon: "CreditCard",
      orderIndex: 7,
    },
  });

  // =========================
  // ROLE-MENU ASSIGNMENTS
  // =========================

  const allMenus = [
    dashboardMenu,
    usersMenu,
    rolesMenu,
    menusMenu,
    studentsMenu,
    classesMenu,
    paymentsMenu,
  ];

  // Full access for admin
  for (const menu of allMenus) {
    await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: {
          roleId: adminRole.id,
          menuId: menu.id,
        },
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

  // Limited access for guru (only students, classes, payments)
  for (const menu of [dashboardMenu, studentsMenu, classesMenu, paymentsMenu]) {
    await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: {
          roleId: teacherRole.id,
          menuId: menu.id,
        },
      },
      update: {},
      create: {
        roleId: teacherRole.id,
        menuId: menu.id,
        canRead: true,
        canWrite: true,
        canUpdate: false,
        canDelete: false,
      },
    });
  }

  // =========================
  // USERS
  // =========================
  const adminPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      password: adminPassword,
      roleId: adminRole.id,
    },
  });

  const userPassword = await bcrypt.hash("user123", 12);
  const normalUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      username: "user",
      password: userPassword,
      roleId: userRole.id,
    },
  });

  const teacherPassword = await bcrypt.hash("guru123", 12);
  const teacherUser = await prisma.user.upsert({
    where: { email: "guru@example.com" },
    update: {},
    create: {
      email: "guru@example.com",
      username: "guru",
      password: teacherPassword,
      roleId: teacherRole.id,
    },
  });

  // =========================
  // CLASSES & STUDENTS & PAYMENTS
  // =========================

  const class1 = await prisma.class.upsert({
    where: { id: "class1" },
    update: {},
    create: {
      id: "class1",
      name: "Kelas 1A",
      level: "1",
      year: "2025",
      capacity: 30,
      teacherId: teacherUser.id,
    },
  });

  const student1 = await prisma.student.upsert({
    where: { id: "student1" },
    update: {},
    create: {
      id: "student1",
      fullName: "Budi Santoso",
      birthDate: new Date("2015-05-20"),
      address: "Jl. Merdeka No. 10",
      phone: "081234567890",
      guardian: "Santoso",
      classId: class1.id,
      status: "ACTIVE",
    },
  });

  const student2 = await prisma.student.upsert({
    where: { id: "student2" },
    update: {},
    create: {
      id: "student2",
      fullName: "Siti Aminah",
      birthDate: new Date("2015-08-15"),
      address: "Jl. Melati No. 5",
      phone: "081987654321",
      guardian: "Aminah",
      classId: class1.id,
      status: "ACTIVE",
    },
  });

  // Buat contoh pembayaran (September 2025)
  await prisma.payment.upsert({
    where: {
      studentId_month_year: {
        studentId: student1.id,
        month: 9,
        year: 2025,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      amount: 300000,
      month: 9,
      year: 2025,
      status: "PAID",
      recordedBy: teacherUser.id,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("🔑 Admin credentials: admin@example.com / admin123");
  console.log("👤 User credentials: user@example.com / user123");
  console.log("👨‍🏫 Guru credentials: guru@example.com / guru123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
