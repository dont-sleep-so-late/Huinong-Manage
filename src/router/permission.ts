import router from '@/router'
import { useUserStore, usePermissionStore } from '@/store'
import { message } from 'ant-design-vue'

const whiteList = ['/login'] // 白名单

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const token = userStore.token
  if (token) {
    if (to.path === '/login') {
      // 已登录且要跳转的页面是登录页
      next({ path: '/' })
    } else {
      try {
        // 判断是否已获取用户信息
        if (!userStore.userInfo) {
          // 获取用户信息
          await userStore.getUserInfo()
        }
        
        // 判断是否已生成动态路由
        if (permissionStore.dynamicRoutes.length === 0) {
          // 生成动态路由
          await permissionStore.generateRoutes()
          // 添加动态路由后需要重新进入当前路由
          next({ ...to, replace: true })
        } else {
          next()
        }
      } catch (error) {
        // 获取用户信息失败，可能token过期
        await userStore.logout()
        message.error('登录状态已过期，请重新登录')
        next(`/login?redirect=${to.path}`)
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 在免登录白名单中，直接进入
      next()
    } else {
      // 其他没有访问权限的页面将被重定向到登录页面
      next(`/login?redirect=${to.path}`)
    }
  }
}) 