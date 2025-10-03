import {
  PrismaClient,
  StudentStatus,
  Gender,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super admin" },
    update: {},
    create: {
      name: "Super admin",
      description: "Administrator with full system access",
    },
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: "Guru" },
    update: {},
    create: {
      name: "Guru",
      description: "Handles teaching and class management",
    },
  });

  const headMasterRole = await prisma.role.upsert({
    where: { name: "Kepala Sekolah" },
    update: {},
    create: {
      name: "Kepala Sekolah",
      description: "Regular user with limited access",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "User" },
    update: {},
    create: {
      name: "User",
      description: "Default initial user",
    },
  });

    const adminRole = await prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: {
        name: "Admin",
        description: "Administrator with full system access",
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
  const Master = await prisma.menu.upsert({
    where: { path: "#" },
    update: {},
    create: {
      name: "Master",
      path: "#",
      icon: "HardDrive",
      orderIndex: 99,
    },
  });

  const usersMenu = await prisma.menu.upsert({
    where: { path: "/master/users" },
    update: {},
    create: {
      name: "Tenaga Pendidik",
      path: "/master/users",
      icon: "Users",
      orderIndex: 2,
      parentId: Master.id,
    },
  });

  const rolesMenu = await prisma.menu.upsert({
    where: { path: "/master/roles" },
    update: {},
    create: {
      name: "Role dan Hak Akses",
      path: "/master/roles",
      icon: "UserCheck",
      orderIndex: 3,
      parentId: Master.id,
    },
  });

    const masterMenu = await prisma.menu.upsert({
      where: { path: "/master/menus" },
      update: {},
      create: {
        name: "Master Menu",
        path: "/master/menus",
        icon: "MenuIcon",
        orderIndex: 4,
        parentId: Master.id,
      },
    });


  const masterClass = await prisma.menu.upsert({
    where: { path: "/master/classes" },
    update: {},
    create: {
      name: "Master Kelas",
      path: "/master/classes",
      icon: "GraduationCap",
      orderIndex: 4,
      parentId: Master.id,
    },
  });

  const studentsMenu = await prisma.menu.upsert({
    where: { path: "/master/students" },
    update: {},
    create: {
      name: "Master Siswa",
      path: "/master/students",
      icon: "Users",
      orderIndex: 4,
      parentId: Master.id,
    },
  });

  const classRoomMenu = await prisma.menu.upsert({
    where: { path: "/classrooms" },
    update: {},
    create: {
      name: "Kelas",
      path: "/classrooms",
      icon: "GraduationCap",
      orderIndex: 4,
    },
  });

  const paymentMenu = await prisma.menu.upsert({
    where: { path: "/payment-class" },
    update: {},
    create: {
      name: "Rekapulasi Pembayaran",
      path: "/payment-class",
      icon: "CreditCard",
      orderIndex: 4,
    },
  });
  const transactionMenu = await prisma.menu.upsert({
    where: { path: "/transaction" },
    update: {},
    create: {
      name: "Pembayaran",
      path: "/transaction",
      icon: "NotebookPen",
      orderIndex: 4,
    },
  });

  // RoleMenu - full access for admin
  for (const menu of [
    dashboardMenu,
    usersMenu,
    rolesMenu,
    masterMenu,
    masterClass,
    studentsMenu,
    classRoomMenu,
    paymentMenu,
    transactionMenu,
    Master,
  ]) {
    await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: { roleId: superAdminRole.id, menuId: menu.id },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        menuId: menu.id,
        canRead: true,
        canWrite: true,
        canUpdate: true,
        canDelete: true,
      },
    });
  }

    for (const menu of [
      usersMenu,
      rolesMenu,
      masterClass,
      studentsMenu,
      classRoomMenu,
      paymentMenu,
      transactionMenu,
    ]) {
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

      for (const menu of [
        dashboardMenu,
        usersMenu,
        rolesMenu,
        masterClass,
        studentsMenu,
        classRoomMenu,
        paymentMenu,
        transactionMenu,
      ]) {
        await prisma.roleMenu.upsert({
          where: {
            roleId_menuId: { roleId: superAdminRole.id, menuId: menu.id },
          },
          update: {},
          create: {
            roleId: superAdminRole.id,
            menuId: menu.id,
            canRead: true,
            canWrite: true,
            canUpdate: true,
            canDelete: true,
          },
        });
      }


  // Users

    const superAdminPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD!, 12);
    const superAdminUser = await prisma.user.upsert({
      where: { email: "hilmi.m.arifin@gmail.com" },
      update: {},
      create: {
        nik: "3201010101010001",
        email: "hilmi.m.arifin@gmail.com",
        username: "hilmimarifin",
        password: superAdminPassword,
        name: "Hilmi M. Arifin",
        gender: Gender.MALE,
        birthDate: new Date("1990-01-01"),
        birthPlace: "Jakarta",
        education: "S1 Sistem Informasi",
        photo: "https://placehold.co/100x100",
        phone: "08123456789",
        address: "Jl. Admin No. 1, Jakarta",
        roleId: superAdminRole.id,
      },
    });

  const adminPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      nik: "3201010101010002",
      email: "admin@example.com",
      username: "admin",
      password: adminPassword,
      name: "Administrator",
      gender: Gender.MALE,
      birthDate: new Date("1990-01-01"),
      birthPlace: "Jakarta",
      education: "S1 Sistem Informasi",
      photo: "https://placehold.co/100x100",
      phone: "08123456789",
      address: "Jl. Admin No. 1, Jakarta",
      roleId: adminRole.id,
    },
  });

  // Classes
  // const class1 = await prisma.class.create({
  //   data: {
  //     name: "Kelas 1A",
  //     grade: "1",
  //     year: "2025/2026",
  //     teacherId: teacherUser.id,
  //     monthlyFee: 25000,
  //   },
  // });

  // const class2 = await prisma.class.create({
  //   data: {
  //     name: "Kelas 2A",
  //     grade: "2",
  //     year: "2024/2025",
  //     teacherId: teacherUser.id,
  //     monthlyFee: 30000,
  //   },
  // });

  // Students
  // const student1 = await prisma.student.create({
  //   data: {
  //     nik: "3201010101010003",
  //     fullName: "Ahmad Fauzi",
  //     birthDate: new Date("2015-01-10"),
  //     birthPlace: "Jakarta",
  //     address: "Jl. Merdeka No. 1",
  //     phone: "08123456789",
  //     entryYear: "2025/2026",
  //     gender: Gender.MALE,
  //     guardian: "Bapak Fauzi",
  //     photo: "https://placehold.co/100x100",
  //     status: StudentStatus.ACTIVE,
  //   },
  // });

  // const student2 = await prisma.student.create({
  //   data: {
  //     nik: "3201010101010004",
  //     fullName: "Siti Aminah",
  //     birthDate: new Date("2014-06-20"),
  //     birthPlace: "Bandung",
  //     address: "Jl. Mawar No. 2",
  //     phone: "08234567890",
  //     entryYear: "2025/2026",
  //     gender: Gender.FEMALE,
  //     guardian: "Ibu Aminah",
  //     photo: "https://placehold.co/100x100",
  //     status: StudentStatus.ACTIVE,
  //   },
  // });

  // StudentClass (riwayat kelas)
  // await prisma.studentClass.createMany({
  //   data: [
  //     { studentId: student1.id, classId: class1.id, year: "2025" },
  //     { studentId: student1.id, classId: class2.id, year: "2026" },
  //     { studentId: student2.id, classId: class1.id, year: "2025" },
  //   ],
  // });

  // // Payments
  // await prisma.payment.createMany({
  //   data: [
  //     {
  //       studentId: student1.id,
  //       amount: 500000,
  //       month: 1,
  //       recordedBy: teacherUser.id,
  //       classId: class1.id,
  //     },
  //     {
  //       studentId: student2.id,
  //       amount: 500000,
  //       month: 1,
  //       recordedBy: teacherUser.id,
  //       classId: class1.id,
  //     },
  //   ],
  // });

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
