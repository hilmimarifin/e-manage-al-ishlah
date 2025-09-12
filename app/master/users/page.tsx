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
import { DataTable } from "@/components/ui/data-table";
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
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
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
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage system users and their roles.
              </p>
            </div>
            {showAddButton && (
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={users}
                isLoading={isLoading}
                searchPlaceholder="Search users..."
                emptyMessage="No users found."
                pageSize={10}
              />
            </CardContent>
          </Card>
        </div>
        <Modal
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          title={selectedUser ? "Edit User" : "Create User"}
          description={
            selectedUser
              ? "Make changes to the user account here."
              : "Add a new user to the system."
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
