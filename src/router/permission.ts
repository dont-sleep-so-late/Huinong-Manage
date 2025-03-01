import router from '@/router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { message } from 'ant-design-vue'

// 白名单路由（不需要登录即可访问）
const whiteList = ['/login', '/register', '/forgot-password']

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 显示页面加载进度条
  // NProgress.start()
  
  // 设置页面标题
  document.title = to.meta?.title ? `${to.meta.title} - 惠农管理系统` : '惠农管理系统'
  
  // 获取用户信息和权限信息
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const token = userStore.token
  
  // 判断是否已登录（有token）
  if (token) {
    // 如果访问登录页，直接跳转到首页
    if (to.path === '/login') {
      next({ path: '/' })
      // NProgress.done()
    } else {
      try {
        // 判断是否已获取用户信息
        if (!userStore.currentUser) {
          // 获取用户信息
          const { userInfo } = await userStore.getUserInfo()
          
          // 根据角色生成可访问路由
          const accessRoutes = await permissionStore.generateRoutesFromRole(userInfo.role)
          
          // 动态添加可访问路由
          accessRoutes.forEach((route: RouteRecordRaw) => {
            router.addRoute(route)
          })
          
          // 重新导航到目标路由，确保路由能被正确加载
          next({ ...to, replace: true })
          return
        }
        
        // 判断是否有权限访问当前路由
        if (to.meta?.roles) {
          const roles = to.meta.roles as string[]
          // 检查是否有权限访问
          const hasPermission = roles.includes(userStore.currentRole)
          
          if (!hasPermission) {
            // 没有权限，跳转到403页面
            message.error('您没有权限访问该页面')
            next({ path: '/403' })
            return
          }
        }
        
        next()
      } catch (error) {
        // 获取用户信息失败，清除token并跳转到登录页
        console.error('路由权限控制错误:', error)
        await userStore.logout()
        message.error('登录状态已过期，请重新登录')
        next({ path: '/login', query: { redirect: to.fullPath } })
        // NProgress.done()
      }
    }
  } else {
    // 未登录，判断是否可以访问
    if (whiteList.includes(to.path)) {
      // 白名单路由，可以直接访问
      next()
    } else {
      // 非白名单路由，跳转到登录页
      next({ path: '/login', query: { redirect: to.fullPath } })
      // NProgress.done()
    }
  }
})

// 全局后置守卫
router.afterEach(() => {
  // 关闭页面加载进度条
  // NProgress.done()
}) 