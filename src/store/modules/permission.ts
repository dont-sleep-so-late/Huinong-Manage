import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteRecordRaw, RouteMeta as VueRouteMeta, RouteComponent, RouteRecordRedirectOption } from 'vue-router'
import { constantRoutes, asyncRoutes } from '@/router'
import router from '@/router'
import { getUserMenus } from '@/api/auth'
import type { MenuItem } from '@/api/auth'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface MenuResponse {
  menus: MenuItem[]
}

// 检查当前用户是否有该路由权限
const hasPermission = (route: RouteRecordRaw, roles: string[]): boolean => {
  if (route.meta && route.meta.roles) {
    return roles.some(role => (route.meta?.roles as string[]).includes(role))
  }
  // 默认允许访问
  return true
}

// 根据角色过滤可访问路由
const filterAsyncRoutes = (routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] => {
  const res: RouteRecordRaw[] = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(tmp, roles)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  
  return res
}

// 获取组件
export const findComponentByPath = (path: string): any => {
  try {
    const component = import.meta.glob('@/views/**/*.vue')
    for (const key in component) {
      if (key.includes(path)) {
        return component[key]
      }
    }
    return null
  } catch (error) {
    console.error('获取组件失败', error)
    return null
  }
}

// 自定义路由元信息，扩展Vue Router的RouteMeta
interface CustomRouteMeta extends VueRouteMeta {
  title?: string
  icon?: string
  roles?: string[]
  hidden?: boolean
  breadcrumb?: boolean
  activeMenu?: string
  keepAlive?: boolean
  [key: string]: any
}

// 路由项接口
interface RouteItem {
  path: string
  component?: string
  name?: string
  redirect?: string
  meta?: CustomRouteMeta
  children?: RouteItem[]
}

// 将后端返回的路由数据转换为vue-router需要的格式
export const generateRoutes = (routes: RouteItem[]): RouteRecordRaw[] => {
  return routes.map(route => {
    const newRoute: RouteRecordRaw = {
      path: route.path,
      name: route.name,
      redirect: route.redirect,
      meta: route.meta as VueRouteMeta,
      children: route.children ? generateRoutes(route.children) : undefined
    }

    if (route.component) {
      if (route.component === 'Layout') {
        newRoute.component = () => import('@/layouts/default/index.vue')
      } else {
        // 动态加载组件
        const path = route.component.replace('@/views', '')
        newRoute.component = findComponentByPath(path)
      }
    }

    return newRoute
  })
}

// 获取组件
const getComponent = (component: string): RouteComponent => {
  if (component === 'Layout') {
    return () => import('@/layouts/default/index.vue')
  }
  // 动态加载组件
  return () => import(`@/views/${component}.vue`)
}

// 将后端返回的菜单转换为路由配置
const transformRoutes = (menus: MenuItem[]): RouteRecordRaw[] => {
  return menus.map(menu => {
    const { path, name, redirect, meta, children, component } = menu
    
    // 构建基础路由配置
    const baseRoute = {
      path,
      name,
      component: component ? getComponent(component) : undefined,
      meta
    }

    // 添加重定向配置（如果有）
    if (redirect) {
      ;(baseRoute as any).redirect = typeof redirect === 'string' 
        ? { path: redirect } 
        : { path: redirect.path }
    }

    // 添加子路由配置（如果有）
    if (children && children.length > 0) {
      ;(baseRoute as any).children = transformRoutes(children)
    }

    return baseRoute as unknown as RouteRecordRaw
  })
}

interface PermissionState {
  routes: RouteRecordRaw[]
  addRoutes: RouteRecordRaw[]
  menus: MenuItem[]
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    addRoutes: [],
    menus: []
  }),

  getters: {
    getRoutes: (state): RouteRecordRaw[] => state.routes,
    getMenus: (state): MenuItem[] => state.menus,
    // 添加一个新的 getter 用于侧边栏
    sidebarMenus: (state): MenuItem[] => {
      const findLayoutRoute = (routes: MenuItem[]): MenuItem[] => {
        for (const route of routes) {
          if (route.name === 'Layout' && route.children) {
            return route.children.filter(child => !child.meta?.hidden)
          }
        }
        return []
      }
      return findLayoutRoute(state.menus)
    }
  },

  actions: {
    // 根据角色生成路由
    async generateRoutesFromRole(role: string) {
      try {
        // 1. 从后端获取菜单数据
        const { data: { menus } } = await getUserMenus() as unknown as ApiResponse<MenuResponse>
        this.menus = menus

        // 2. 如果是超级管理员或管理员角色，可以访问所有菜单
        if (role === 'super_admin' || role === 'admin') {
          const accessRoutes = transformRoutes(this.menus)
          this.addRoutes = accessRoutes
          this.routes = [...constantRoutes, ...accessRoutes]
          return accessRoutes
        }

        // 3. 根据角色过滤菜单
        const filterMenus = (items: MenuItem[]): MenuItem[] => {
          return items.filter(item => {
            // 检查当前菜单是否需要权限
            if (item.meta?.roles) {
              const hasPermission = item.meta.roles.includes(role)
              if (!hasPermission) {
                return false
              }
            }

            // 如果有子菜单，递归过滤
            if (item.children) {
              item.children = filterMenus(item.children)
              // 如果过滤后没有子菜单，且当前菜单也没有组件，则不显示
              if (item.children.length === 0 && !item.component) {
                return false
              }
            }

            return true
          })
        }

        // 4. 过滤菜单并转换为路由
        const filteredMenus = filterMenus(JSON.parse(JSON.stringify(this.menus)))
        const accessRoutes = transformRoutes(filteredMenus)
        
        // 5. 保存路由信息
        this.addRoutes = accessRoutes
        this.routes = [...constantRoutes, ...accessRoutes]
        
        return accessRoutes
      } catch (error) {
        console.error('生成路由失败:', error)
        return []
      }
    },

    // 重置路由
    resetRoutes() {
      this.routes = []
      this.addRoutes = []
      this.menus = []
    }
  }
}) 