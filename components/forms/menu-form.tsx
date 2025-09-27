"use client";

import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { createMenuSchema, updateMenuSchema, CreateMenuInput, UpdateMenuInput } from '@/lib/validations'
import { Loader2, Plus } from "lucide-react";
import { IconMap, Icons } from "@/components/layout/icons";

const iconOptions = Object.keys(IconMap).map((key) => ({
  value: key,
  label: key,
}));

interface MenuFormProps {
  menu?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function MenuForm({ menu, onSubmit, isLoading }: MenuFormProps) {
  const isEditing = !!menu
  const schema = isEditing ? updateMenuSchema : createMenuSchema
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CreateMenuInput | UpdateMenuInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: menu?.name || '',
      path: menu?.path || '',
      icon: menu?.icon || '',
      parentId: menu?.parentId || '',
      orderIndex: menu?.orderIndex || 0,
    }
  })

  const watchedValues = watch()
  const { data: menus = [] } = useMenus();

  useEffect(() => {
    if (menu) {
      reset({
        name: menu.name || '',
        path: menu.path || '',
        icon: menu.icon || '',
        parentId: menu.parentId || '',
        orderIndex: menu.orderIndex || 0,
      })
    }
  }, [menu, reset])

  const onFormSubmit = (data: CreateMenuInput | UpdateMenuInput) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Menu Name</Label>
          <Input
            id="name"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="path">Path</Label>
          <Input
            id="path"
            placeholder="/dashboard"
            {...register('path')}
            className={errors.path ? 'border-red-500' : ''}
          />
          {errors.path && (
            <span className="text-sm text-red-500">{errors.path.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="icon">Icon</Label>
          <Select
            value={watchedValues.icon}
            onValueChange={(value) => setValue('icon', value)}
          >
            <SelectTrigger className={errors.icon ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((icon) => (
                <SelectItem key={icon.value} value={icon.value} >
                  <div className="flex flex-row gap-2">
                    <Icons icon={icon.value as keyof typeof IconMap} size={16} />
                    <span>{icon.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.icon && (
            <span className="text-sm text-red-500">{errors.icon.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="parent">Parent Menu</Label>
          <Select
            value={watchedValues.parentId}
            onValueChange={(value) => setValue('parentId', value === "none" ? "" : value)}
          >
            <SelectTrigger className={errors.parentId ? 'border-red-500' : ''}>
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
          {errors.parentId && (
            <span className="text-sm text-red-500">{errors.parentId.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="orderIndex">Order Index</Label>
          <Input
            id="orderIndex"
            type="number"
            {...register('orderIndex', { valueAsNumber: true })}
            className={errors.orderIndex ? 'border-red-500' : ''}
          />
          {errors.orderIndex && (
            <span className="text-sm text-red-500">{errors.orderIndex.message}</span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Saving..." : menu ? "Update Menu" : "Create Menu"}
        </Button>
      </div>
    </form>
  );
}
