import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)

  // 登录
  const login = async (loginParams: { username: string; password: string}) => {
    try {
      // TODO: 调用登录接口
      const { username, password } = loginParams
      // 模拟登录成功
      token.value = 'mock_token'
      return true
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      // TODO: 调用获取用户信息API
      userInfo.value = {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        avatar: '',
        roles: ['admin']
      }
      return true
    } catch (error) {
      return false
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
  }

  return {
    token,
    userInfo,
    login,
    getUserInfo,
    logout
  }
}) 