import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)

  // 登录
  const login = async (username: string, password: string) => {
    try {
      // TODO: 调用登录API
      token.value = 'mock-token' // 模拟token
      return true
    } catch (error) {
      return false
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