import { request } from '@/utils/http'
import { ApiResponse } from './auth'
// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  password?: string
  nickname: string | null
  email: string | null
  phone: string
  avatar: string | null
  role: 'super_admin' | 'admin' | 'user'
  status: 0 | 1
  isVerified: boolean
  realName: string | null
  idCardNumber: string | null
  createdTime: string | null
  updatedTime: string | null
  lastLoginTime: string | null
}

// 分页结果接口
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  orders: any[]
  optimizeCountSql: boolean
  searchCount: boolean
  maxLimit: number | null
  countId: string | null
  pages: number
}

// 用户查询参数接口
export interface UserQuery {
  username?: string
  phone?: string
  status?: 0 | 1
  role?: string
  pageNum?: number
  pageSize?: number
  createTimeRange?: [string, string]
}

// 创建用户数据接口
export interface CreateUserData {
  username: string
  password: string
  nickname?: string
  phone: string
  email?: string
  role: string
  avatar?: string
}

// 更新用户数据接口
export interface UpdateUserData {
  nickname?: string
  phone?: string
  email?: string
  avatar?: string
  status?: 0 | 1
}

// 修改密码数据接口
export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

// 获取用户列表
export const getUserList = (params: UserQuery) => {
  return request.get<ApiResponse<PageResult<UserInfo>>>('/user/list', { params })
}

// 创建用户
export const createUser = (data: CreateUserData) => {
  return request.post<ApiResponse<UserInfo>>('/user/create', data)
}

// 更新用户
export const updateUser = (data: UpdateUserData) => {
  return request.put<ApiResponse<UserInfo>>(`/user/info`, data)
}

// 删除用户
export const deleteUser = (id: number) => {
  return request.delete<void>(`/user/${id}`)
}

// 重置密码
export const resetPassword = (id: number) => {
  return request.post<ApiResponse<{ newPassword: string }>>(`/user/${id}/reset-password`)
}

// 修改密码
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request.post<ApiResponse<void>>('/user/change-password', data)
}

// 获取用户详情
export function getUserInfo(id: number) {
  return request.get<ApiResponse<UserInfo>>(`/user/${id}`)
}

// 更新用户状态
export const updateUserStatus = (id: number, status: 0 | 1) => {
  return request.patch<void>(`/user/${id}/status`, { status })
}

// ===== 个人信息相关接口 =====

// 获取当前登录用户的个人信息
export const getProfile = () => {
  return request.get<ApiResponse<UserInfo>>('/profile')
}

// 更新当前登录用户的个人信息
export const updateProfile = (data: UpdateUserData) => {
  return request.put<ApiResponse<UserInfo>>('/profile', data)
}

// 修改当前登录用户的密码
export const updatePassword = (data: ChangePasswordData) => {
  return request.put<ApiResponse<void>>('/profile/password', data)
}
