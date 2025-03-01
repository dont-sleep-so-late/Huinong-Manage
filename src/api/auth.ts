import { request } from '@/utils/http'

// 登录方式
export type LoginType = 'phone' | 'email' | 'sms'

// 注册方式
export type RegisterType = 'phone' | 'email'

// 验证码类型
export type CodeType = 'login' | 'register' | 'reset'

// 登录参数接口
export interface LoginParams {
  account: string  // 账号（手机号或邮箱）
  password?: string  // 密码（密码登录时必填）
  code?: string    // 验证码（验证码登录时必填）
  loginType: LoginType  // 登录方式
}

// 注册参数接口
export interface RegisterParams {
  username: string  // 用户名
  password: string  // 密码
  code: string     // 验证码
  registerType: RegisterType  // 注册方式
  phone?: string   // 手机号（手机号注册时必填）
  email?: string   // 邮箱（邮箱注册时必填）
}

// 发送验证码参数
export interface SendSmsParams {
  phone?: string   // 手机号（发送短信验证码时必填）
  email?: string   // 邮箱（发送邮箱验证码时必填）
  type: CodeType   // 验证码类型
}

// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  phone: string | null
  email: string | null
  avatar: string | null
  role: string
  createTime: string | null
  verified: boolean
}

// 登录响应接口
export interface LoginResponse {
  userId: number
  username: string
  role: string
  token: string
  userInfo: UserInfo
}

// 注册响应接口
export interface RegisterResult {
  token: string           // JWT Token
  refreshToken: string    // 刷新Token
  expires: number        // Token过期时间（秒）
  userInfo: UserInfo     // 用户信息
}

// 菜单项接口
export interface MenuItem {
  path: string
  component: string
  name: string
  redirect?: {
    path: string
  }
  meta: {
    title: string
    icon?: string
    roles?: string[]
    hidden?: boolean
  }
  children?: MenuItem[]
}

/**
 * 登录API
 * @param params 登录参数
 * @returns Promise<LoginResponse>
 */
export function login(params: LoginParams) {
  return request.post<LoginResponse>('/auth/login', params)
}

/**
 * 注册API
 * @param params 注册参数
 * @returns Promise<RegisterResult>
 */
export function register(params: RegisterParams) {
  return request.post<RegisterResult>('/auth/register', params)
}

/**
 * 发送验证码
 * @param params 发送验证码参数
 * @returns Promise<void>
 */
export function sendCode(params: SendSmsParams) {
  return request.post<void>('/auth/send-code', params)
}

/**
 * 验证验证码
 * @param account 账号（手机号或邮箱）
 * @param code 验证码
 * @param type 验证码类型
 * @returns Promise<boolean>
 */
export function verifyCode(account: string, code: string, type: CodeType) {
  return request.post<boolean>('/auth/verify-code', { account, code, type })
}

/**
 * 登出API
 * @returns Promise<void>
 */
export function logout() {
  return request.post<void>('/auth/logout')
}

/**
 * 获取用户信息
 * @returns Promise<LoginResponse>
 */
export function getUserInfo() {
  return request.get<LoginResponse>('/auth/info')
}

/**
 * 刷新Token
 * @param refreshToken 刷新Token
 * @returns Promise<{ token: string, expires: number }>
 */
export function refreshToken(refreshToken: string) {
  return request.post<{ token: string, expires: number }>('/auth/refresh-token', { refreshToken })
}

/**
 * 修改密码
 * @param params 修改密码参数
 * @returns Promise<void>
 */
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export function changePassword(params: ChangePasswordParams) {
  return request.post<void>('/auth/change-password', params)
}

/**
 * 重置密码
 * @param params 重置密码参数
 * @returns Promise<void>
 */
export interface ResetPasswordParams {
  account: string   // 账号（手机号或邮箱）
  code: string     // 验证码
  password: string  // 新密码
  confirmPassword: string  // 确认密码
}

export function resetPassword(params: ResetPasswordParams) {
  return request.post<void>('/auth/reset-password', params)
}

/**
 * 获取用户权限列表
 * @returns Promise<string[]>
 */
export function getUserPermissions() {
  return request.get<string[]>('/auth/permissions')
}

/**
 * 获取用户菜单
 * @returns Promise<MenuItem[]>
 */
export function getUserMenus() {
  return request.get<MenuItem[]>('/auth/menus')
} 