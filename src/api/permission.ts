import http from '@/utils/http'

// 权限类型
export type PermissionType = 'menu' | 'button' | 'data' | null

// 权限项接口
export interface PermissionItem {
  id: number
  parentId: number | null
  name: string
  code: string
  type: PermissionType
  path: string
  component: string
  icon: string | null
  sortOrder: number
  status: number
  children: PermissionItem[] | null
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 获取权限树
export const getPermissionTree = () => {
  return http.get<PermissionItem[]>('/auth/permission/tree')
}

// 创建权限
export const createPermission = (data: Omit<PermissionItem, 'id' | 'children'>) => {
  return http.post('/auth/permission', data)
}

// 更新权限
export const updatePermission = (id: number, data: Omit<PermissionItem, 'id' | 'children'>) => {
  return http.put(`/auth/permission/${id}`, data)
}

// 删除权限
export const deletePermission = (id: number) => {
  return http.delete(`/auth/permission/${id}`)
}

// 获取权限详情
export const getPermissionDetail = (id: number) => {
  return http.get<ApiResponse<PermissionItem>>(`/auth/permission/${id}`)
}

// 更新权限状态
export const updatePermissionStatus = (id: number, status: 0 | 1) => {
  return http.put(`/auth/permission/${id}/status`, { status })
}

// 获取菜单列表
export interface MenuItem {
  path: string
  name: string
  component: string
  redirect?: string
  meta?: {
    title: string
    icon: string
  }
  children?: MenuItem[]
}

export const getMenuList = () => {
  return http.get<ApiResponse<{ menus: MenuItem[] }>>('/auth/menus')
} 