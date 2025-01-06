import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
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
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/default/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'dashboard'
        }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/layouts/default/index.vue'),
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'setting'
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理'
        }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理'
        }
      }
    ]
  },
  {
    path: '/product',
    component: () => import('@/layouts/default/index.vue'),
    name: 'Product',
    meta: {
      title: '商品管理',
      icon: 'shopping'
    },
    children: [
      {
        path: 'list',
        name: 'ProductList',
        component: () => import('@/views/product/list/index.vue'),
        meta: {
          title: '商品列表'
        }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/product/category/index.vue'),
        meta: {
          title: '商品分类'
        }
      },
      {
        path: 'spec',
        name: 'Spec',
        component: () => import('@/views/product/spec/index.vue'),
        meta: {
          title: '规格管理'
        }
      }
    ]
  },
  {
    path: '/order',
    component: () => import('@/layouts/default/index.vue'),
    name: 'Order',
    meta: {
      title: '订单管理',
      icon: 'file-text'
    },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/list/index.vue'),
        meta: {
          title: '订单列表'
        }
      },
      {
        path: 'after-sale',
        name: 'AfterSale',
        component: () => import('@/views/order/after-sale/index.vue'),
        meta: {
          title: '售后管理'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 