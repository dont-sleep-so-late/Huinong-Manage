import { defineStore } from 'pinia'
import { login as userLogin, logout as userLogout, getUserInfo as fetchUserInfo, getUserMenus } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/api/auth'
import { usePermissionStore } from '@/store/modules/permission'
import router from '@/router'

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
  userInfo: UserInfo
}

// 用户状态接口
interface UserState {
  userId: number | null
  username: string
  role: string
  token: string
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userId: null,
    username: '',
    role: '',
    token: '',
    userInfo: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.userInfo,
    currentRole: (state) => state.role
  },
  
  actions: {
    // 设置用户信息
    setUserInfo(data: LoginResponseData) {
      this.userId = data.userId
      this.username = data.username
      this.role = data.role
      this.token = data.token
      this.userInfo = data.userInfo

      // 存储 token 到 localStorage
      localStorage.setItem('token', data.token)
    },
    
    // 登录
    async login(loginParams: LoginParams) {
      try {
        // 1. 登录获取用户信息
        const response = await userLogin(loginParams)
        this.setUserInfo(response)
        
        // 2. 获取用户菜单
        const permissionStore = usePermissionStore()
        const accessRoutes = await permissionStore.generateRoutesFromRole(this.role)
        
        // 3. 动态添加路由
        accessRoutes.forEach(route => {
          router.addRoute(route)
        })

        // 4. 跳转到首页或者重定向页面
        const redirect = router.currentRoute.value.query.redirect as string
        router.push(redirect || '/')
        
        return response
      } catch (error) {
        // 清空用户信息
        this.clearUserInfo()
        throw error
      }
    },
    
    // 登出
    async logout() {
      try {
        await userLogout()
      } finally {
        this.clearUserInfo()
        // 重置路由
        location.reload()
      }
    },
    
    // 清空用户信息
    clearUserInfo() {
      this.userId = null
      this.username = ''
      this.role = ''
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
    },
    
    // 从 localStorage 恢复用户会话
    async restoreSession() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        try {
          // 获取用户信息
          const userInfo = await this.getUserInfo()
          
          // 获取用户菜单
          const permissionStore = usePermissionStore()
          const accessRoutes = await permissionStore.generateRoutesFromRole(this.role)
          
          // 动态添加路由
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          
          return userInfo
        } catch (error) {
          this.clearUserInfo()
          throw error
        }
      }
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await fetchUserInfo()
        this.setUserInfo(response)
        return response
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },
    
    // 检查用户是否有指定角色
    hasRole(roleToCheck: string): boolean {
      return this.userInfo?.role === roleToCheck
    }
  }
}) 