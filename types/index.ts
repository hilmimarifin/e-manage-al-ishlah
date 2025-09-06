export interface User {
  id: string
  email: string
  username: string
  password?: string
  roleId: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description?: string | null
  users?: User[]
  roleMenus?: RoleMenu[]
  _count?: {
    users: number
  }
  createdAt: string
  updatedAt: string
}

export interface Menu {
  id: string
  name: string
  path: string
  icon?: string | null
  parentId?: string | null
  orderIndex: number
  parent?: Menu
  children?: Menu[]
  roleMenus?: RoleMenu[]
  createdAt: string
  updatedAt: string
}

export interface RoleMenu {
  id: string
  roleId: string
  menuId: string
  canRead: boolean
  canWrite: boolean
  canUpdate: boolean
  canDelete: boolean
  role: Role
  menu: Menu
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken?: string
}
