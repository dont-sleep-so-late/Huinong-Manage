import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as userLogin, logout as userLogout, getUserInfo as fetchUserInfo, getUserMenus } from '@/api/auth'
import type { LoginParams, LoginResponse, UserInfoResponse } from '@/api/auth'
import { usePermissionStore } from '@/store/modules/permission'
import router from '@/router'

const TOKEN = 'token'
const USER_INFO_KEY = 'user_info'

// API响应接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 登录响应数据类型
interface LoginResponseData {
  userId: number
  username: string
  role: string
  token: string
  userInfo: UserInfoResponse
}

// 用户状态接口
interface UserState {
  userId: number | null
  username: string
  role: string
  token: string
  userInfo: UserInfoResponse | null
}

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 获取初始值
  const token = ref<string>('')
  const userInfo = ref<UserInfoResponse | null>(null)
  const role = ref<string>('')

  // 登录
  const login = async (loginParams: LoginParams) => {
    try {
      console.log('开始登录，参数:', loginParams)
      const response = await userLogin(loginParams)
      console.log('登录响应:', response)

      if (!response) {
        throw new Error('登录失败：响应数据为空')
      }

      // 保存 token 和用户信息
      token.value = response.token
      userInfo.value = response.userInfo
      role.value = response.role

      // 保存到 localStorage
      localStorage.setItem(TOKEN, response.token)
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.userInfo))

      console.log('登录成功，用户信息已保存')
      return response
    } catch (error) {
      console.error('登录失败:', error)
      if (error instanceof Error) {
        console.error('错误信息:', error.message)
        console.error('错误堆栈:', error.stack)
      }
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await fetchUserInfo()
      const { data } = response as ApiResponse<UserInfoResponse>
      userInfo.value = data
      // 更新 localStorage
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(data))
      return { userInfo: data }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await userLogout()
    } finally {
      token.value = ''
      userInfo.value = null
      // 清除 localStorage
      localStorage.removeItem(TOKEN)
      localStorage.removeItem(USER_INFO_KEY)
      // 重置路由
      router.push('/login')
    }
  }

  return {
    token,
    userInfo,
    role,
    login,
    getUserInfo,
    logout
  }
}) 