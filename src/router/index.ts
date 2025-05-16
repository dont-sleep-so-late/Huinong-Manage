import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { wsClient } from '@/utils/websocket'
import { message } from 'ant-design-vue'

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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (token && !wsClient.isConnected()) {
    console.log('路由守卫中连接WebSocket')
    wsClient.connect(token)
    
    // 注册消息处理器
    wsClient.on('SELLER_AUDIT', (msg) => {
      console.log('收到商家审核消息:', msg)
      message.info(msg.content)
    })
    
    wsClient.on('NEW_PRODUCT', (msg) => {
      console.log('收到新商品消息:', msg)
      message.info(msg.content)
    })
    
    wsClient.on('ORDER_STATUS', (msg) => {
      console.log('收到订单状态消息:', msg)
      message.info(msg.content)
    })
  }
  
  next()
})

export default router 