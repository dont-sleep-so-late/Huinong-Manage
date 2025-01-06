// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  roles: string[]
  permissions?: string[]
  email?: string
  phone?: string
  status?: number
  createTime?: string
  lastLoginTime?: string
}

// 登录参数接口
export interface LoginParams {
  username: string
  password: string
  captcha?: string
  remember?: boolean
}

// 登录响应接口
export interface LoginResult {
  token: string
  tokenType: string
  expires: number
}

// 用户查询参数
export interface UserQueryParams {
  keyword?: string
  status?: number
  startTime?: string
  endTime?: string
  pageNum: number
  pageSize: number
}

// 用户列表项
export interface UserListItem extends UserInfo {
  departmentName?: string
  roleName?: string
} 