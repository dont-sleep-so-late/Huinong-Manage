import router from '@/router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { message } from 'ant-design-vue'

// 白名单路由（不需要登录即可访问）
const whiteList = ['/login', '/register', '/forgot-password']

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  try {
    // 设置页面标题
    document.title = to.meta?.title ? `${to.meta.title} - 惠农管理系统` : '惠农管理系统'
    
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const token = userStore.token
    
    // 已登录状态
    if (token) {
      if (to.path === '/login') {
        // 已登录状态访问登录页，重定向到首页
        next({ path: '/' })
      } else {
        try {
          // 判断是否已获取用户信息和菜单
          if (!userStore.userInfo) {
            // 获取用户信息
            await userStore.getUserInfo()
          }

          if (!permissionStore.routes.length) {
            // 生成路由
            await permissionStore.generateRoutes()
            // 由于动态添加路由，需要重新导航一次
            next({ ...to, replace: true })
          } else {
            next()
          }
        } catch (error) {
          // 获取用户信息或生成路由失败，可能是 token 过期
          console.error('路由守卫错误:', error)
          message.error('登录状态已过期，请重新登录')
          // 清除用户信息
          await userStore.logout()
          // 重定向到登录页
          next({ path: '/login', query: { redirect: to.fullPath } })
        }
      }
    } else {
      // 未登录状态
      if (whiteList.includes(to.path)) {
        // 白名单路由，直接访问
        next()
      } else {
        // 非白名单路由，重定向到登录页
        next({ path: '/login', query: { redirect: to.fullPath } })
      }
    }
  } catch (error) {
    console.error('路由守卫全局错误:', error)
    message.error('系统错误，请稍后重试')
    next(false)
  }
})

// 全局后置守卫
router.afterEach((to) => {
  // 设置页面标题
  document.title = to.meta?.title ? `${to.meta.title} - 惠农管理系统` : '惠农管理系统'
}) 