"use client";

import { useState, useEffect } from "react";
import { useMenus } from "@/hooks/use-menus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const iconOptions = [
  { value: "LayoutDashboard", label: "Dashboard" },
  { value: "Users", label: "Users" },
  { value: "UserCheck", label: "User Check" },
  { value: "MenuIcon", label: "Menu" },
  { value: "Home", label: "Home" },
];

interface MenuFormProps {
  menu?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function MenuForm({ menu, onSubmit, isLoading }: MenuFormProps) {
  const [formData, setFormData] = useState({
    id: menu?.id || "",
    name: menu?.name || "",
    path: menu?.path || "",
    icon: menu?.icon || "",
    parentId: menu?.parentId || "",
    orderIndex: menu?.orderIndex || 0,
  });

  const { data: menus = [] } = useMenus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Menu Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="path">Path</Label>
          <Input
            id="path"
            placeholder="/dashboard"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="icon">Icon</Label>
          <Select
            value={formData.icon}
            onValueChange={(value) => setFormData({ ...formData, icon: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((icon) => (
                <SelectItem key={icon.value} value={icon.value}>
                  {icon.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="parent">Parent Menu</Label>
          <Select
            value={formData.parentId}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                parentId: value === "none" ? "" : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent menu (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Parent</SelectItem>
              {menus
                .filter((m: any) => m.id !== menu?.id)
                .map((parentMenu: any) => (
                  <SelectItem key={parentMenu.id} value={parentMenu.id}>
                    {parentMenu.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="orderIndex">Order Index</Label>
          <Input
            id="orderIndex"
            type="number"
            value={formData.orderIndex}
            onChange={(e) =>
              setFormData({
                ...formData,
                orderIndex: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : menu ? "Update Menu" : "Create Menu"}
        </Button>
      </div>
    </form>
  );
}
