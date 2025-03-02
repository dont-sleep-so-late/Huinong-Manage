import http from '@/utils/http'

// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  email: string | null
  phone: string
  avatar: string | null
  role: string
  status: 0 | 1
  isVerified: boolean
  realName: string | null
  idCardNumber: string | null
  createdTime: string | null
  updatedTime: string
  lastLoginTime: string
}

// 用户查询参数接口
export interface UserQuery {
  pageNum?: number
  pageSize?: number
  username?: string
  phone?: string
  status?: 0 | 1
  role?: string
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

// 分页结果接口
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// API响应接口
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 获取用户列表
export function getUserList(params: UserQuery) {
  return http.get<ApiResponse<PageResult<UserInfo>>>('/user/list', { params })
}

// 创建用户
export function createUser(data: CreateUserData) {
  return http.post<ApiResponse<UserInfo>>('/user', data)
}

// 更新用户
export function updateUser(id: number, data: UpdateUserData) {
  return http.put<ApiResponse<UserInfo>>(`/user/${id}`, data)
}

// 删除用户
export function deleteUser(id: number) {
  return http.delete<ApiResponse<void>>(`/user/${id}`)
}

// 重置用户密码
export function resetPassword(id: number) {
  return http.post<ApiResponse<{ newPassword: string }>>(`/user/${id}/reset-password`)
}

// 修改密码
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return http.post<ApiResponse<void>>('/user/change-password', data)
}

// 获取用户详情
export function getUserInfo(id: number) {
  return http.get<ApiResponse<UserInfo>>(`/user/${id}`)
}

// 更新用户状态
export function updateUserStatus(id: number, status: 0 | 1) {
  return http.put<ApiResponse<void>>(`/user/${id}/status`, { status })
} 