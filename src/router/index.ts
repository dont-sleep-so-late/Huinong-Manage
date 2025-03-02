import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 扩展路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    roles?: string[]
    hidden?: boolean
  }
}

// 公共路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/index.vue'),
    meta: {
      title: '个人中心',
      hidden: true
    }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/components/NotFound.vue'),
    meta: {
      title: '404',
      hidden: true
    }
  }
]

// 动态路由配置移除，改为从后端获取
export const asyncRoutes: RouteRecordRaw[] = []

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

export default router 