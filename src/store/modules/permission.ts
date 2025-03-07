import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  RouteRecordRaw,
  RouteMeta as VueRouteMeta,
  RouteComponent,
  RouteRecordRedirectOption,
} from "vue-router";
import { constantRoutes, asyncRoutes } from "@/router";
import router from "@/router";
import { getUserMenus } from "@/api/auth";
import type { MenuItem } from "@/api/auth";

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface MenuResponse {
  menus: MenuItem[];
}

// 修改为实际的响应类型
interface MenuApiResponse {
  menus: MenuItem[];
}

// 获取组件
export const findComponentByPath = (path: string): RouteComponent => {
  // 如果是布局组件
  if (path === 'Layout' || path === 'layouts/default/index') {
    return () => import('@/layouts/default/index.vue')
  }

  // 移除开头的 views/ 和结尾的 .vue（如果有）
  const normalizedPath = path.replace(/^views\//, '').replace(/\.vue$/, '')

  // 使用 Vite 的动态导入模式
  const modules = import.meta.glob('@/views/**/*.vue')
  const componentPath = `/src/views/${normalizedPath}.vue`
  
  const matchedModule = modules[componentPath]
  if (!matchedModule) {
    console.error(`找不到组件: ${componentPath}`)
    // 返回一个空组件作为后备方案
    return () => import('@/components/NotFound.vue')
  }
  
  return matchedModule
}

// 将后端返回的菜单转换为路由配置
const transformRoutes = (menus: MenuItem[]): RouteRecordRaw[] => {
  return menus.map((menu) => {
    const { path, name, redirect, meta, children, component } = menu;

    // 构建基础路由配置
    const baseRoute: RouteRecordRaw = {
      path,
      name,
      component: component ? findComponentByPath(component) : undefined,
      meta,
      children: children && children.length > 0 ? transformRoutes(children) : [],
    };

    // 添加重定向配置（如果有）
    if (redirect) {
      baseRoute.redirect = redirect;
    }

    return baseRoute;
  });
};

// 修正子路由的路径
const fixRoutePaths = (menu: MenuItem, parentPath = ''): MenuItem => {
  const result = { ...menu };

  // 如果是根路由，保持原样
  if (result.path === '/') {
    // 递归处理子路由
    if (result.children?.length) {
      result.children = result.children.map(child => fixRoutePaths(child, result.path));
    }
    return result;
  }

  // 处理非根路由的路径
  const normalizedPath = result.path.startsWith('/') ? result.path.slice(1) : result.path;
  
  // 如果有父路径，拼接父路径
  if (parentPath) {
    const normalizedParentPath = parentPath === '/' ? '' : parentPath;
    result.path = `${normalizedParentPath}/${normalizedPath}`;
  } else {
    result.path = `/${normalizedPath}`;
  }

  // 递归处理子路由
  if (result.children?.length) {
    result.children = result.children.map(child => fixRoutePaths(child, result.path));
  }

  return result;
};

// 去重菜单项
const deduplicateMenus = (menus: MenuItem[]): MenuItem[] => {
  const seen = new Map<string, MenuItem>();
  
  const processMenu = (menu: MenuItem) => {
    // 使用路径和名称的组合作为唯一键
    const key = `${menu.path}:${menu.name || ''}`;
    
    if (!seen.has(key)) {
      const processedMenu = { ...menu };
      
      // 如果有子菜单，递归处理
      if (processedMenu.children && processedMenu.children.length > 0) {
        processedMenu.children = deduplicateMenus(processedMenu.children);
      } else if (processedMenu.children === null) {
        // 将 null 转换为空数组
        processedMenu.children = [];
      }
      
      seen.set(key, processedMenu);
    }
  };

  // 处理所有菜单项
  menus.forEach(processMenu);
  
  // 返回去重后的菜单数组
  const uniqueMenus = Array.from(seen.values());
  
  // 对菜单进行排序，确保顺序一致
  return uniqueMenus.sort((a, b) => {
    // 首页始终排在最前面
    if (a.path === '/dashboard') return -1;
    if (b.path === '/dashboard') return 1;
    // 其他菜单按名称排序
    return (a.name || '').localeCompare(b.name || '');
  });
};

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const menus = ref<MenuItem[]>([]);

  // 获取侧边栏菜单
  const sidebarMenus = computed(() => {
    const findLayoutRoute = (routes: MenuItem[]): MenuItem[] => {
      for (const route of routes) {
        if (route.name === "Layout" && route.children) {
          // 移除 hidden 过滤条件，直接返回所有子菜单
          return route.children;
        }
      }
      return [];
    };
    return findLayoutRoute(menus.value);
  });

  // 生成路由
  const generateRoutes = async () => {
    try {
      console.log('开始获取菜单数据')
      const {data} = await getUserMenus()
      const response = data as unknown as MenuApiResponse
      console.log('菜单响应:', response)

      if (!response || !response.menus) {
        throw new Error('获取菜单失败：响应数据为空')
      }

      if (!Array.isArray(response.menus)) {
        throw new Error('无效的菜单数据')
      }

      // 去重处理
      const uniqueMenus = deduplicateMenus(response.menus)
      console.log('去重后的菜单:', uniqueMenus)

      // 确保只保留一个根路由
      const rootMenu = uniqueMenus.find(menu => menu.path === '/')
      if (!rootMenu) {
        throw new Error('找不到根路由')
      }

      // 修正路由路径
      const fixedMenus = [fixRoutePaths(rootMenu)]
      console.log('修正后的菜单:', fixedMenus)
      
      // 转换为vue-router格式
      const asyncRoutes = transformRoutes(fixedMenus)
      console.log('生成的路由配置:', asyncRoutes)
      
      // 保存路由和菜单信息
      routes.value = [...constantRoutes]
      menus.value = fixedMenus

      // 清除现有的动态路由
      router.getRoutes().forEach(route => {
        if (route.name && !constantRoutes.find(r => r.name === route.name)) {
          router.removeRoute(route.name)
        }
      })

      // 动态添加路由
      asyncRoutes.forEach(route => {
        if (!router.hasRoute(route.name as string)) {
          router.addRoute(route)
        }
      })

      console.log('路由生成完成')
      return routes.value
    } catch (error) {
      console.error('生成路由失败:', error)
      if (error instanceof Error) {
        console.error('错误信息:', error.message)
        console.error('错误堆栈:', error.stack)
      }
      throw error
    }
  }

  // 重置路由
  const resetRoutes = () => {
    // 清除路由和菜单状态
    routes.value = [];
    menus.value = [];

    // 清除所有动态添加的路由
    router.getRoutes().forEach(route => {
      if (route.name && !constantRoutes.find(r => r.name === route.name)) {
        router.removeRoute(route.name)
      }
    })
  };

  return {
    routes,
    menus,
    sidebarMenus,
    generateRoutes,
    resetRoutes
  };
});
