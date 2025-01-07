import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { constantRoutes, asyncRoutes } from '@/router'
import router from '@/router'

export const usePermissionStore = defineStore('permission', () => {
  // 动态路由
  const dynamicRoutes = ref<RouteRecordRaw[]>([])
  
  // 菜单权限列表
  const menuPermissions = ref<string[]>([])
  
  // 按钮权限列表
  const buttonPermissions = ref<string[]>([])

  // 过滤后的路由（根据权限）
  const filterRoutes = computed(() => {
    const filterRoute = (route: RouteRecordRaw): boolean => {
      if (route.meta?.permission) {
        return menuPermissions.value.includes(route.meta.permission as string)
      }
      return true
    }

    const filterRoutesByPermission = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
      return routes.filter(route => {
        if (filterRoute(route)) {
          if (route.children) {
            route.children = filterRoutesByPermission(route.children)
          }
          return true
        }
        return false
      })
    }

    return filterRoutesByPermission(asyncRoutes)
  })

  // 生成动态路由
  const generateRoutes = async () => {
    try {
      // 过滤后的路由
      const accessRoutes = filterRoutes.value
      
      // 清空旧的动态路由
      dynamicRoutes.value.forEach(route => {
        router.removeRoute(route.name as string)
      })
      
      // 添加新的动态路由
      accessRoutes.forEach(route => {
        router.addRoute(route)
      })
      
      // 保存动态路由
      dynamicRoutes.value = accessRoutes
      
      return accessRoutes
    } catch (error) {
      return []
    }
  }

  // 设置权限
  const setPermissions = async (menus: string[], buttons: string[]) => {
    menuPermissions.value = menus
    buttonPermissions.value = buttons
    return await generateRoutes()
  }

  // 重置权限
  const resetPermissions = () => {
    menuPermissions.value = []
    buttonPermissions.value = []
    // 清空动态路由
    dynamicRoutes.value.forEach(route => {
      router.removeRoute(route.name as string)
    })
    dynamicRoutes.value = []
  }

  // 检查按钮权限
  const hasButtonPermission = (permission: string): boolean => {
    return buttonPermissions.value.includes(permission)
  }

  return {
    dynamicRoutes,
    menuPermissions,
    buttonPermissions,
    filterRoutes,
    generateRoutes,
    setPermissions,
    resetPermissions,
    hasButtonPermission
  }
}) 