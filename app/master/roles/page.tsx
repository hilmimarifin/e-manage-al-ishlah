"use client";

import { RoleForm } from "@/components/forms/role-form";
import { PermissionModal } from "@/components/forms/permission-modal";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from "@/hooks/use-roles";
import { Edit, MoreHorizontal, Plus, Trash, Shield } from "lucide-react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { usePermissionGuard } from "@/hooks/use-permissions";

import { Role as RoleType } from "@/types";

type Role = RoleType;

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
    useState<Role | null>(null);

  const { data: roles = [], isLoading, error } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  // Permission checks for /roles path
  const {
    showAddButton,
    showEditButton,
    showDeleteButton,
    canUpdate,
    isLoading: permissionsLoading,
  } = usePermissionGuard("/roles");

  const handleCreateRole = async (data: any) => {
    try {
      await createRole.mutateAsync(data);
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to create role:", error);
    }
  };

  const handleUpdateRole = async (data: any) => {
    try {
      if (selectedRole) {
        await updateRole.mutateAsync({ id: selectedRole.id, ...data });
        setDialogOpen(false);
        setSelectedRole(null);
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete role:", error);
      }
    }
  };

  const openEditDialog = (role: any) => {
    setSelectedRole(role);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedRole(null);
    setDialogOpen(true);
  };

  const openPermissionModal = (role: Role) => {
    setSelectedRoleForPermissions(role);
    setPermissionModalOpen(true);
  };

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("name")}</Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => (
        <div>{row.getValue("description") || "No description"}</div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showEditButton && (
                <DropdownMenuItem onClick={() => openEditDialog(role)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <DropdownMenuItem onClick={() => openPermissionModal(role)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Hak Akses
                </DropdownMenuItem>
              )}
              {showDeleteButton && (
                <DropdownMenuItem
                  onClick={() => handleDeleteRole(role.id)}
                  className="text-destructive"
                  disabled={(role._count?.users || 0) > 0}
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Role dan Hak Akses
            </h1>
            <p className="text-muted-foreground">
              Membuat dan Mengatur Role dan Hak Akses
            </p>
          </div>

          {showAddButton && (
            <Modal
              isOpen={dialogOpen}
              onOpenChange={setDialogOpen}
              title={selectedRole ? "Ubah Role" : "Tambah Role"}
              description={
                selectedRole
                  ? "Ubah informasi role"
                  : "Menambahkan role baru pada sistem."
              }
              trigger={
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Role
                </Button>
              }
            >
              <RoleForm
                role={selectedRole}
                onSubmit={selectedRole ? handleUpdateRole : handleCreateRole}
                isLoading={createRole.isPending || updateRole.isPending}
              />
            </Modal>
          )}
        </div>

        <DataTable
          columns={columns}
          data={roles}
          isLoading={isLoading}
          searchPlaceholder="cari..."
          emptyMessage="Tidak ada role ditemukan."
          pageSize={10}
        />
      </div>

      {/* Permission Modal */}
      <PermissionModal
        isOpen={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        role={selectedRoleForPermissions}
      />
    </DashboardLayout>
  );
}
