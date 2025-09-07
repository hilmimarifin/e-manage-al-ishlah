'use client'

import { useState, useEffect } from 'react'
import { useRoles } from '@/hooks/use-roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User } from '@/types'

interface UserFormProps {
  user?: User
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function UserForm({ user, onSubmit, isLoading }: UserFormProps) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    password: '',
    roleId: user?.roleId || ''
  })

  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useRoles()


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }
 
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="password">
            {user ? 'New Password (leave empty to keep current)' : 'Password'}
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!user}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          {rolesError ? (
            <div className="text-sm text-red-500">Failed to load roles</div>
          ) : (
            <Select
              value={formData.roleId}
              onValueChange={(value) => setFormData({ ...formData, roleId: value })}
              disabled={rolesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role: any) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  )
}