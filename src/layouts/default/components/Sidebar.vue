<template>
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
      :selectedKeys="selectedKeys"
      :openKeys="openKeys"
      mode="inline"
      theme="dark"
      @openChange="handleOpenChange"
    >
      <template v-for="menu in menus" :key="menu.path">
        <!-- 有子菜单 -->
        <template v-if="menu.children && menu.children.length > 0">
          <a-sub-menu :key="menu.path">
            <template #icon>
              <component :is="renderIcon(menu.meta?.icon)" />
            </template>
            <template #title>{{ menu.meta?.title }}</template>
            <a-menu-item
              v-for="child in menu.children"
              :key="child.path"
              @click="handleMenuClick(child.path)"
            >
              <template #icon v-if="child.meta?.icon">
                <component :is="renderIcon(child.meta.icon)" />
              </template>
              {{ child.meta?.title }}
            </a-menu-item>
          </a-sub-menu>
        </template>
        <!-- 无子菜单 -->
        <template v-else>
          <a-menu-item :key="menu.path" @click="handleMenuClick(menu.path)">
            <template #icon v-if="menu.meta?.icon">
              <component :is="renderIcon(menu.meta.icon)" />
            </template>
            <span>{{ menu.meta?.title }}</span>
          </a-menu-item>
        </template>
      </template>
    </a-menu>
  </a-layout-sider>
</template>

<script lang="ts" setup>
import { ref, computed, watch, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore, usePermissionStore } from '@/store'
import type { MenuItem } from '@/api/auth'
import type { Key } from 'ant-design-vue/es/_util/type'
import IconProvider from '@/components/IconProvider.vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

// 渲染图标
const renderIcon = (icon?: string) => {
  if (!icon) return null
  return () => h(IconProvider, { name: icon })
}

// 菜单相关
const selectedKeys = computed(() => [route.path])
const openKeys = ref<string[]>([])

// 获取菜单数据
const menus = computed(() => {
  const sidebarMenus = permissionStore.sidebarMenus
  return sidebarMenus
})

// 获取所有可展开的菜单路径
const getAllMenuPaths = (menuItems: MenuItem[]): string[] => {
  let paths: string[] = []
  menuItems.forEach(menu => {
    if (menu.path) {
      paths.push(menu.path)
    }
    if (menu.children && menu.children.length > 0) {
      paths = [...paths, ...getAllMenuPaths(menu.children)]
    }
  })
  return paths
}

// 初始化默认展开所有菜单
const initOpenKeys = () => {
  // 获取所有有子菜单的菜单路径
  const allPaths = menus.value
    .filter(menu => menu.children && menu.children.length > 0)
    .map(menu => menu.path)
  
  openKeys.value = allPaths
}

// 监听路由变化
watch(
  () => route.matched,
  (matched) => {
    // 更新展开的子菜单
    if (matched.length > 1) {
      // 保持当前路由的父菜单展开
      const matchedPaths = matched.slice(0, -1).map(item => item.path)
      // 合并已展开的菜单和当前路由的父菜单
      openKeys.value = Array.from(new Set([...openKeys.value, ...matchedPaths]))
    }
  },
  { immediate: true }
)

// 监听菜单数据变化，初始化展开状态
watch(
  () => menus.value,
  () => {
    initOpenKeys()
  },
  { immediate: true }
)

// 处理子菜单展开/收起
const handleOpenChange = (keys: Key[]) => {
  openKeys.value = keys.map(key => key.toString())
}

// 菜单点击
const handleMenuClick = (path: string) => {
  try {
    router.push(path)
  } catch (error) {
    console.error('路由跳转失败:', error)
  }
}
</script>

<style lang="less" scoped>
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
</style> 