import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { routes } from '@/router'

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

    return filterRoutesByPermission([...routes])
  })

  // 设置权限
  const setPermissions = (menus: string[], buttons: string[]) => {
    menuPermissions.value = menus
    buttonPermissions.value = buttons
  }

  // 重置权限
  const resetPermissions = () => {
    menuPermissions.value = []
    buttonPermissions.value = []
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
    setPermissions,
    resetPermissions,
    hasButtonPermission
  }
}) 