import http from '@/utils/http'
import { ApiResponse } from './auth'
// 角色信息接口
export interface RoleInfo {
  id: number
  name: string
  code: string
  description: string
  status: 0 | 1
  createdTime: string
  updatedTime: string
}

// 分页响应接口
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 创建角色
export const createRole = (data: Pick<RoleInfo, 'name' | 'code' | 'description'>) => {
  return http.post<ApiResponse<RoleInfo>>('/role', data)
}

// 更新角色
export const updateRole = (id: number, data: Pick<RoleInfo, 'name' | 'code' | 'description'>) => {
  return http.put<ApiResponse<RoleInfo>>(`/role/${id}`, data)
}

// 删除角色
export const deleteRole = (id: number) => {
  return http.delete(`/role/${id}`)
}

// 获取角色详情
export const getRoleDetail = (id: number) => {
  return http.get<ApiResponse<RoleInfo>>(`/role/${id}`)
}

// 获取角色列表（分页）
export interface RoleQuery {
  pageNum?: number
  pageSize?: number
  name?: string
  code?: string
  status?: 0 | 1
}

export const getRoleList = (params: RoleQuery) => {
  return http.get<ApiResponse<PageResult<RoleInfo>>>('/role/list', { params })
}

// 获取所有角色
export const getAllRoles = () => {
  return http.get<ApiResponse<RoleInfo[]>>('/role/all')
}

// 更新角色状态
export const updateRoleStatus = (id: number, status: 0 | 1) => {
  return http.put(`/auth/role/${id}/status`, { status })
}

// 更新角色权限
export const updateRolePermissions = (id: number, permissionIds: number[]) => {
  return http.put(`/role/${id}/permissions`, permissionIds)
}

// 权限树节点接口
export interface PermissionNode {
  id: number
  parentId: number | null
  name: string
  code: string
  type: 'menu' | 'button' | 'data'
  path?: string
  component?: string | null
  permission?: string | null
  icon?: string | null
  sortOrder: number
  status: 0 | 1
  isVisible: 0 | 1
  children?: PermissionNode[]
}

// 权限树响应接口
export interface PermissionTreeResult {
  permissionTree: PermissionNode[]
  checkedKeys: number[]
}

// 获取角色权限树
export const getRolePermissionTree = (roleId: number) => {
  return http.get<PermissionTreeResult>(`/auth/${roleId}/permissions`)
} 