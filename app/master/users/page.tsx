"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/use-users";
import { User as UserType } from "@/types";
import { UserForm } from "@/components/forms/user-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ResponsiveDataDisplay } from "@/components/ui/responsive-data-display";
import { MobileListItem } from "@/components/ui/mobile-list-view";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Edit, Trash } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ColumnDef } from "@tanstack/react-table";
import { usePermissionGuard } from "@/hooks/use-permissions";
import { log } from "node:console";

type User = UserType;

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: users = [], isLoading } = useUsers({});
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Permission checks for /users path
  const {
    showAddButton,
    showEditButton,
    showDeleteButton,
    isLoading: permissionsLoading,
  } = usePermissionGuard("/users");

  const handleCreateUser = async (data: any) => {
    try {
      await createUser.mutateAsync(data);
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleUpdateUser = async (data: any) => {
    try {
      if (selectedUser) {
        await updateUser.mutateAsync({ id: selectedUser.id, ...data });
        setDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const openEditDialog = (user: any) => {
    setDialogOpen(true);
    setSelectedUser(user);
  };

  const openCreateDialog = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("username")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role.name",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.role.name}</Badge>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showEditButton && (
                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {showDeleteButton && (
                <DropdownMenuItem
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const mobileItemMapper = (user: User): MobileListItem => ({
    id: user.id,
    title: user.username,
    subtitle: user.email,
    badge: { text: user.role.name, variant: "secondary" },
    details: [
      { label: "Email", value: user.email },
      {
        label: "Role",
        value: <Badge variant="secondary">{user.role.name}</Badge>,
      },
    ],
    actions: [
      ...(showEditButton
        ? [
            {
              label: "Edit",
              icon: <Edit className="mr-2 h-4 w-4" />,
              onClick: () => openEditDialog(user),
            },
          ]
        : []),
      ...(showDeleteButton
        ? [
            {
              label: "Hapus",
              icon: <Trash className="mr-2 h-4 w-4" />,
              onClick: () => handleDeleteUser(user.id),
              variant: "destructive" as const,
            },
          ]
        : []),
    ],
  });

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between">
        {showAddButton && (
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <ResponsiveDataDisplay
            columns={columns}
            data={users}
            isLoading={isLoading}
            searchPlaceholder="Search users..."
            emptyMessage="No users found."
            pageSize={10}
            mobileItemMapper={mobileItemMapper}
            headerComponent={renderHeader()}
          />
        </div>
        <Modal
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          title={selectedUser ? "Edit User" : "Create User"}
          description={
            selectedUser
              ? "Ubah data pengguna ini."
              : "Tambah pengguna baru ke dalam sistem."
          }
        >
          <ErrorBoundary>
            <UserForm
              user={selectedUser || undefined}
              onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
              isLoading={createUser.isPending || updateUser.isPending}
            />
          </ErrorBoundary>
        </Modal>
      </ErrorBoundary>
    </DashboardLayout>
  );
}
