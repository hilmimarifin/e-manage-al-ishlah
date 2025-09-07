'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Student } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface StudentFormProps {
  student?: Student
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function StudentForm({ student, onSubmit, isLoading }: StudentFormProps) {
  const [formData, setFormData] = useState({
    fullName: student?.fullName || '',
    address: student?.address || '',
    birthDate: student?.birthDate || '',
    phone: student?.phone || '',
    gender: student?.gender || '',
    photo: student?.photo || '',
    status: student?.status || '',
    guardian: student?.guardian || '',
  })


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Student Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Enter student address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="birthDate">Birth Date</Label>
        <Input
          type="date"
          id="birthDate"
          value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="gender">Gender</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => setFormData({ ...formData, gender: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">Laki-laki</SelectItem>
            <SelectItem value="FEMALE">Perempuan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="guardian">Orang Tua / Wali</Label>
        <Input
          type="text"
          id="guardian"
          value={formData.guardian}
          onChange={(e) => setFormData({ ...formData, guardian: e.target.value })}
          required
        />
      </div>
      
      {/* <div className="grid gap-2">
        <Label htmlFor="photo">Photo</Label>
        <Input
          type="file"
          id="photo"
          accept="image/*"
          onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] })}
          required
        />
      </div> */}
      
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
        </Button>
      </div>
    </form>
  )
}