import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
  }
]

// 动态路由
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Layout",
    component: () => import("@/layouts/default/index.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: {
          title: "首页",
          icon: "dashboard",
        },
      },
      {
        path: "system",
        name: "System",
        meta: {
          title: "系统管理",
          icon: "setting",
        },
        children: [
          {
            path: "user",
            name: "User",
            component: () => import("@/views/system/user/index.vue"),
            meta: {
              title: "用户管理",
              icon: "user",
            },
          },
          {
            path: "role",
            name: "Role",
            component: () => import("@/views/system/role/index.vue"),
            meta: {
              title: "角色管理",
              icon: "role",
            },
          },
          {
            path: "menu",
            name: "Menu",
            component: () => import("@/views/system/menu/index.vue"),
            meta: {
              title: "菜单管理",
              icon: "menu",
            },
          },
        ],
      },
      {
        path: "product",
        name: "Product",
        meta: {
          title: "商品管理",
          icon: "shopping",
        },
        children: [
          {
            path: "list",
            name: "ProductList",
            component: () => import("@/views/product/list/index.vue"),
            meta: {
              title: "商品列表",
              icon: "shopping-cart",
            },
          },
          {
            path: "category",
            name: "Category",
            component: () => import("@/views/product/category/index.vue"),
            meta: {
              title: "商品分类",
              icon: "category",
            },
          },
          {
            path: "spec",
            name: "Spec",
            component: () => import("@/views/product/spec/index.vue"),
            meta: {
              title: "规格管理",
              icon: "spec",
            },
          },
        ],
      },
      {
        path: "order",
        name: "Order",
        meta: {
          title: "订单管理",
          icon: "file-text",
        },
        children: [
          {
            path: "list",
            name: "OrderList",
            component: () => import("@/views/order/list/index.vue"),
            meta: {
              title: "订单列表",
              icon: "list",
            },
          },
          {
            path: "after-sale",
            name: "AfterSale",
            component: () => import("@/views/order/after-sale/index.vue"),
            meta: {
              title: "售后管理",
              icon: "after-sale",
            },
          },
        ],
      },
      {
        path: "marketing",
        name: "Marketing",
        meta: {
          title: "营销管理",
          icon: "gift",
        },
        children: [
          {
            path: "banner",
            name: "Banner",
            component: () => import("@/views/marketing/banner/index.vue"),
            meta: {
              title: "轮播图管理",
              icon: "picture",
            },
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

export default router 