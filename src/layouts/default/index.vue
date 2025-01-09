<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="appStore.collapsed"
      :trigger="null"
      collapsible
      class="layout-sider"
    >
      <div class="logo">
        <img src="@/assets/logo.png" alt="logo" />
        <h1 v-show="!appStore.collapsed">惠农商城</h1>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
      >
        <template v-for="menu in menus" :key="menu.path">
          <!-- 有子菜单 -->
          <template v-if="menu.children && menu.children.length > 0">
            <a-sub-menu :key="menu.path">
              <template #icon>
                <component :is="menu.meta?.icon" />
              </template>
              <template #title>{{ menu.meta?.title }}</template>
              <a-menu-item
                v-for="child in menu.children"
                :key="menu.path + '/' + child.path"
                @click="handleMenuClick(menu.path + '/' + child.path)"
              >
                <template #icon v-if="child.meta?.icon">
                  <component :is="iconMap[child.meta.icon]" />
                </template>
                {{ child.meta?.title }}
              </a-menu-item>
            </a-sub-menu>
          </template>
          <!-- 无子菜单 -->
          <template v-else>
            <a-menu-item :key="menu.path" @click="handleMenuClick(menu.path)">
              <component :is="menu.meta?.icon" />
              <span>{{ menu.meta?.title }}</span>
            </a-menu-item>
          </template>
        </template>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- 顶部栏 -->
      <a-layout-header class="layout-header">
        <menu-unfold-outlined
          v-if="appStore.collapsed"
          class="trigger"
          @click="appStore.toggleCollapsed"
        />
        <menu-fold-outlined
          v-else
          class="trigger"
          @click="appStore.toggleCollapsed"
        />
        
        <!-- 面包屑 -->
        <a-breadcrumb v-if="appStore.layout.showBreadcrumb" class="breadcrumb">
          <a-breadcrumb-item 
            v-for="(item, index) in breadcrumbs" 
            :key="item.path"
          >
            <a class="breadcrumb-text" @click.prevent="handleBreadcrumbClick(breadcrumbs.slice(0, index + 1))">{{ item.meta?.title }}</a>
          </a-breadcrumb-item>
        </a-breadcrumb>

        <div class="header-right">
          <!-- 全屏按钮 -->
          <a-button type="link" @click="toggleFullscreen">
            <fullscreen-outlined v-if="!isFullscreen" />
            <fullscreen-exit-outlined v-else />
          </a-button>

          <!-- 用户信息 -->
          <a-dropdown>
            <div class="user-info">
              <a-avatar :src="userStore.userInfo?.avatar" />
              <span class="username">{{ userStore.userInfo?.nickname }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <user-outlined />
                  个人中心
                </a-menu-item>
                <a-menu-item key="settings">
                  <setting-outlined />
                  系统设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <logout-outlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 标签页 -->
      <a-tabs
        v-if="appStore.layout.showTags"
        v-model:activeKey="activeTab"
        type="editable-card"
        class="layout-tabs"
        :hide-add="true"
        @edit="handleTabEdit"
      >
        <a-tab-pane
          v-for="tab in visitedViews"
          :key="tab.path"
          :tab="tab.meta?.title"
          :closable="visitedViews.length > 1"
        />
      </a-tabs>

      <!-- 主要内容区域 -->
      <a-layout-content class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationMatched, RouteMeta as VueRouteMeta } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  TeamOutlined,
  KeyOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  ToolOutlined,
  OrderedListOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons-vue'
import { useAppStore, useUserStore, usePermissionStore } from '@/store'
import { message } from 'ant-design-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

interface RouteMeta extends VueRouteMeta {
  title: string
  icon?: string
  hidden?: boolean
}

interface MenuItem {
  path: string
  name?: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
  }
  children?: MenuItem[]
}

// 图标映射
const iconMap: Record<string, any> = {
  dashboard: DashboardOutlined,
  setting: SettingOutlined,
  shopping: ShoppingOutlined,
  'file-text': FileTextOutlined,
  user: TeamOutlined,
  role: KeyOutlined,
  menu: MenuOutlined,
  'shopping-cart': ShoppingCartOutlined,
  category: AppstoreOutlined,
  spec: ToolOutlined,
  list: OrderedListOutlined,
  'after-sale': CustomerServiceOutlined
}

// 菜单相关
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])
const menus = computed(() => {
  const routes = permissionStore.filterRoutes as MenuItem[]
  return routes.map(route => ({
    ...route,
    meta: {
      ...route.meta,
      icon: route.meta?.icon ? iconMap[route.meta.icon] : null
    },
    children: route.children?.map(child => ({
      ...child,
      meta: {
        ...child.meta,
        icon: child.meta?.icon ? iconMap[child.meta.icon] : null
      }
    }))
  }))
})

// 标签页相关
const activeTab = ref(route.path)
const visitedViews = ref<Array<{ path: string; meta: RouteMeta }>>([
  {
    path: '/dashboard',
    meta: { title: '首页' }
  }
])

// 面包屑相关
const breadcrumbs = computed(() => {
  return route.matched.filter(item => {
    return item.meta?.title && !item.meta?.hidden
  })
})

// 全屏相关
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听路由变化
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
    activeTab.value = path
    
    // 添加新访问的页面到标签页
    const { meta, path: routePath } = route
    if (meta?.title) {
      const exists = visitedViews.value.some(v => v.path === routePath)
      if (!exists) {
        visitedViews.value.push({
          path: routePath,
          meta: meta as RouteMeta
        })
      }
    }
  },
  { immediate: true }
)

// 菜单点击
const handleMenuClick = (path: string) => {
  router.push(path)
}

// 标签页编辑（关闭）
const handleTabEdit = (targetKey: string) => {
  if (visitedViews.value.length <= 1) return
  const index = visitedViews.value.findIndex(item => item.path === targetKey)
  visitedViews.value.splice(index, 1)
  
  // 如果关闭的是当前页，则跳转到最后一个标签页
  if (targetKey === activeTab.value) {
    const lastView = visitedViews.value[visitedViews.value.length - 1]
    router.push(lastView.path)
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await userStore.logout()
    message.success('退出成功')
    router.push('/login')
  } catch (error) {
    message.error('退出失败')
  }
}

// 面包屑点击
const handleBreadcrumbClick = (items: RouteLocationMatched[]) => {
  console.log(items)
  if (items.length > 0) {
    const lastItem = items[items.length - 1]
    try {
      if (lastItem.path) {
        router.push(lastItem.path)
      } else if (lastItem.name) {
        router.push({ name: lastItem.name as string })
      }
    } catch (error) {
      console.error('导航失败:', error)
      message.error('页面跳转失败')
    }
  }
}
</script>

<style lang="less" scoped>
.layout-container {
  min-height: 100vh;

  .layout-sider {
    .logo {
      height: 64px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #002140;
      overflow: hidden;
      white-space: nowrap;
      
      img {
        width: 32px;
        height: 32px;
        margin-right: 8px;
        transition: margin-right 0.3s;
      }
      
      h1 {
        color: #fff;
        font-size: 18px;
        margin: 0;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        opacity: 1;
        transition: all 0.3s;
      }
    }

    &.ant-layout-sider-collapsed {
      .logo {
        padding: 16px 8px;
        
        img {
          margin-right: 0;
        }
        
        h1 {
          width: 0;
          opacity: 0;
          display: inline-block;
        }
      }
      
      :deep(.ant-menu) {
        .ant-menu-item, 
        .ant-menu-submenu-title {
          padding: 0 24px !important;
          
          .ant-menu-item-icon {
            min-width: 14px;
            font-size: 16px;
          }
          
          .ant-menu-title-content {
            opacity: 0;
            display: none;
          }
        }
        
        &.ant-menu-inline-collapsed {
          .ant-menu-item-icon {
            margin-right: 0;
          }
        }
      }
    }
  }

  .layout-header {
    background: #fff;
    padding: 0;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .trigger {
      padding: 0 24px;
      font-size: 18px;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .breadcrumb {
      margin-left: 16px;
      user-select: none;
      
      :deep(.ant-breadcrumb-item) {
        .breadcrumb-text {
          color: rgba(0, 0, 0, 0.65);
          transition: color 0.3s;
          cursor: pointer;
          
          &:hover {
            color: #1890ff;
          }
        }

        &:last-child {
          .breadcrumb-text {
            color: rgba(0, 0, 0, 0.85);
            cursor: default;
            
            &:hover {
              color: rgba(0, 0, 0, 0.85);
            }
          }
        }
      }
    }

    .header-right {
      margin-left: auto;
      padding-right: 24px;
      display: flex;
      align-items: center;

      .user-info {
        display: flex;
        align-items: center;
        margin-left: 16px;
        cursor: pointer;

        .username {
          margin-left: 8px;
        }
      }
    }
  }

  .layout-tabs {
    margin: 6px 4px 0;
    background: #fff;
  }

  .layout-content {
    margin: 24px 16px;
    padding: 24px;
    background: #fff;
    min-height: 280px;
  }
}

// 路由切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 