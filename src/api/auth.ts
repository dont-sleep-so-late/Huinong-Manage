import http from '@/utils/http'

// 登录方式
export type LoginType = 'phone' | 'email' | 'sms'

// 注册方式
export type RegisterType = 'phone' | 'email'

// 验证码类型
export type CodeType = 'login' | 'register' | 'reset'

// 登录参数接口
export interface LoginParams {
  mobile: string
  password: string
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
  userInfo: {
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
}

// 注册响应接口
export interface RegisterResult {
  token: string           // JWT Token
  refreshToken: string    // 刷新Token
  expires: number        // Token过期时间（秒）
  userInfo: UserInfo     // 用户信息
}

// 用户信息响应接口
export interface UserInfoResponse {
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

// 菜单项接口
export interface MenuItem {
  path: string;
  component?: string;
  name?: string;
  redirect?: string | { path: string };
  meta?: {
    title?: string;
    icon?: string;
    roles?: string[];
    hidden?: boolean;
    [key: string]: any;
  };
  children?: MenuItem[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface MenuResponse {
  menus: MenuItem[];
}

// 登录
export const login = (params: LoginParams): Promise<LoginResponse> => {
  return http.post('/auth/login', params)
}

/**
 * 注册API
 * @param params 注册参数
 * @returns Promise<RegisterResult>
 */
export function register(params: RegisterParams) {
  return http.post<RegisterResult>('/auth/register', params)
}

/**
 * 发送验证码
 * @param params 发送验证码参数
 * @returns Promise<void>
 */
export function sendCode(params: SendSmsParams) {
  return http.post<void>('/auth/send-code', params)
}

/**
 * 验证验证码
 * @param account 账号（手机号或邮箱）
 * @param code 验证码
 * @param type 验证码类型
 * @returns Promise<boolean>
 */
export function verifyCode(account: string, code: string, type: CodeType) {
  return http.post<boolean>('/auth/verify-code', { account, code, type })
}

// 登出
export const logout = () => {
  return http.post('/auth/logout')
}

// 获取用户信息
export const getUserInfo = (): Promise<ApiResponse<UserInfoResponse>> => {
  return http.get('/auth/user-info')
}

/**
 * 刷新Token
 * @param refreshToken 刷新Token
 * @returns Promise<{ token: string, expires: number }>
 */
export function refreshToken(refreshToken: string) {
  return http.post<{ token: string, expires: number }>('/auth/refresh-token', { refreshToken })
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
  return http.post<void>('/auth/change-password', params)
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
  return http.post<void>('/auth/reset-password', params)
}

/**
 * 获取用户权限列表
 * @returns Promise<string[]>
 */
export function getUserPermissions() {
  return http.get<string[]>('/auth/permissions')
}

/**
 * 获取用户菜单
 * @returns Promise<ApiResponse<MenuResponse>>
 */
export const getUserMenus = (): Promise<ApiResponse<MenuResponse>> => {
  return http.get('/auth/menus')
} 