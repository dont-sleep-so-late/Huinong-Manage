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

// 检查当前用户是否有该路由权限
const hasPermission = (route: RouteRecordRaw, roles: string[]): boolean => {
  if (route.meta && route.meta.roles) {
    return roles.some((role) => (route.meta?.roles as string[]).includes(role));
  }
  // 默认允许访问
  return true;
};

// 根据角色过滤可访问路由
const filterAsyncRoutes = (
  routes: RouteRecordRaw[],
  roles: string[]
): RouteRecordRaw[] => {
  const res: RouteRecordRaw[] = [];

  routes.forEach((route) => {
    const tmp = { ...route };
    if (hasPermission(tmp, roles)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles);
      }
      res.push(tmp);
    }
  });

  return res;
};

// 获取组件
export const findComponentByPath = (path: string): any => {
  try {
    const component = import.meta.glob("@/views/**/*.vue");
    for (const key in component) {
      if (key.includes(path)) {
        return component[key];
      }
    }
    return null;
  } catch (error) {
    console.error("获取组件失败", error);
    return null;
  }
};

// 自定义路由元信息，扩展Vue Router的RouteMeta
interface CustomRouteMeta extends VueRouteMeta {
  title?: string;
  icon?: string;
  roles?: string[];
  hidden?: boolean;
  breadcrumb?: boolean;
  activeMenu?: string;
  keepAlive?: boolean;
  [key: string]: any;
}

// 路由项接口
interface RouteItem {
  path: string;
  component?: string;
  name?: string;
  redirect?: string;
  meta?: CustomRouteMeta;
  children?: RouteItem[];
}

// 将后端返回的路由数据转换为vue-router需要的格式
export const generateRoutes = (routes: RouteItem[]): RouteRecordRaw[] => {
  return routes.map((route) => {
    const newRoute = {
      path: route.path,
      name: route.name,
      meta: route.meta as VueRouteMeta,
      children: route.children ? generateRoutes(route.children) : undefined,
      component: undefined as RouteComponent | undefined,
    } as RouteRecordRaw;

    if (route.redirect) {
      newRoute.redirect = route.redirect;
    }

    if (route.component) {
      if (
        route.component === "Layout" ||
        route.component === "layouts/default/index"
      ) {
        newRoute.component = () => import("@/layouts/default/index.vue");
      } else {
        // 动态加载组件
        const path = route.component.replace("views/", "");
        newRoute.component = findComponentByPath(path);
      }
    }

    return newRoute;
  });
};

// 获取组件
const getComponent = (component: string): RouteComponent => {
  if (component === "Layout" || component === "layouts/default/index") {
    return () => import("@/layouts/default/index.vue");
  }
  // 动态加载组件
  const path = component.replace(/^views\//, "");
  return () => import(`@/views/${path}.vue`);
};

// 将后端返回的菜单转换为路由配置
const transformRoutes = (menus: MenuItem[]): RouteRecordRaw[] => {
  return menus.map((menu) => {
    const { path, name, redirect, meta, children, component } = menu;

    // 构建基础路由配置
    const baseRoute: RouteRecordRaw = {
      path,
      name,
      component: component ? getComponent(component) : undefined,
      meta,
      children:
        children && children.length > 0 ? transformRoutes(children) : [],
    };

    // 添加重定向配置（如果有）
    if (redirect) {
      baseRoute.redirect =
        typeof redirect === "string" ? redirect : redirect.path;
    }

    return baseRoute;
  });
};

// 去除重复的菜单项
const deduplicateMenus = (menus: MenuItem[]): MenuItem[] => {
  const seen = new Map<string, MenuItem>();

  menus.forEach((menu) => {
    const key = `${menu.path}-${menu.name}`;
    if (!seen.has(key)) {
      seen.set(key, menu);
    }
  });

  const result = Array.from(seen.values());

  // 递归处理子菜单
  result.forEach((menu) => {
    if (menu.children && menu.children.length > 0) {
      menu.children = deduplicateMenus(menu.children);
    }
  });

  return result;
};

interface PermissionState {
  routes: RouteRecordRaw[];
  addRoutes: RouteRecordRaw[];
  menus: MenuItem[];
}

export const usePermissionStore = defineStore("permission", {
  state: (): PermissionState => ({
    routes: [],
    addRoutes: [],
    menus: [],
  }),

  getters: {
    getRoutes: (state): RouteRecordRaw[] => state.routes,
    getMenus: (state): MenuItem[] => state.menus,
    // 添加一个新的 getter 用于侧边栏
    sidebarMenus: (state): MenuItem[] => {
      const findLayoutRoute = (routes: MenuItem[]): MenuItem[] => {
        for (const route of routes) {
          if (route.name === "Layout" && route.children) {
            return route.children.filter((child) => !child.meta?.hidden);
          }
        }
        return [];
      };
      return findLayoutRoute(state.menus);
    },
  },

  actions: {
    // 根据角色生成路由
    async generateRoutesFromRole(role: string) {
      try {
        // 1. 从后端获取菜单数据
        const response =
          (await getUserMenus()) as unknown as MenuResponse;

        // 打印原始响应数据
        console.log("API响应数据:", response);

        // 修改数据校验逻辑
        if (!response?.menus) {
          console.error("菜单数据无效");
          return this.getDefaultRoutes();
        }

        // 去重处理
        const dedupedMenus = deduplicateMenus(response.menus);
        console.log("去重后的菜单数据:", dedupedMenus);

        // 获取第一个根路由（Layout）
        const rootRoute = dedupedMenus[0];
        if (!rootRoute?.path || !rootRoute?.name) {
          console.error("根路由配置无效");
          return this.getDefaultRoutes();
        }

        // 修正子路由的路径
        const fixRoutePaths = (menu: MenuItem, parentPath = ""): MenuItem => {
          const result = { ...menu };

          // 如果是根路由的直接子路由，且路径以/开头，去掉开头的/
          if (parentPath === "/" && result.path.startsWith("/")) {
            result.path = result.path.slice(1);
          }

          // 如果不是以/开头的路径，且有父路径，拼接父路径
          if (
            !result.path.startsWith("/") &&
            parentPath &&
            parentPath !== "/"
          ) {
            result.path = `${parentPath}/${result.path}`;
          }

          // 递归处理子路由
          if (result.children?.length) {
            result.children = result.children.map((child) =>
              fixRoutePaths(child, result.path === "/" ? "" : result.path)
            );
          }

          return result;
        };

        // 修正路由路径
        const fixedRootRoute = fixRoutePaths(rootRoute);
        console.log("修正路径后的根路由:", JSON.stringify(fixedRootRoute, null, 2));

        // 转换为vue-router格式
        const transformedRootRoute = transformRoutes([fixedRootRoute])[0];
        console.log("转换后的根路由:", JSON.stringify(transformedRootRoute, null, 2));

        // 保存路由信息
        this.addRoutes = [transformedRootRoute];
        this.routes = [...constantRoutes, transformedRootRoute];
        this.menus = dedupedMenus;

        // 动态添加路由
        try {
          router.addRoute(transformedRootRoute);
          console.log("成功添加路由:", transformedRootRoute);
        } catch (error) {
          console.error("添加路由失败:", error);
        }

        return this.routes;
      } catch (error) {
        console.error("生成路由失败:", error);
        return this.getDefaultRoutes();
      }
    },

    // 重置路由
    resetRoutes() {
      this.routes = [];
      this.addRoutes = [];
      this.menus = [];
    },

    // 添加一个新的方法来获取默认路由
    getDefaultRoutes(): RouteRecordRaw[] {
      const baseRoute: RouteRecordRaw = {
        path: "/",
        component: () => import("@/layouts/default/index.vue"),
        redirect: "/dashboard",
        children: [
          {
            path: "dashboard",
            name: "Dashboard",
            component: () => import("@/views/dashboard/index.vue"),
            meta: {
              title: "Dashboard",
              icon: "dashboard",
            },
          },
        ],
      };
      return [baseRoute];
    },
  },
});
