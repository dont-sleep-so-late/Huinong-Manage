import request from '@/utils/request'

interface UserInfo {
  nickname?: string
  phone?: string
  email?: string
  avatar?: string
}

interface PasswordUpdate {
  oldPassword: string
  newPassword: string
}

// 更新用户信息
export const updateUserInfo = (data: UserInfo) => {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

// 更新密码
export const updatePassword = (data: PasswordUpdate) => {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
} 