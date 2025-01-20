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
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore, usePermissionStore } from '@/store'
import {
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
  CustomerServiceOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

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
const selectedKeys = ref<string[]>([route.path])
const openKeys = ref<string[]>([])

// 监听路由变化
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
    // 更新展开的子菜单
    const matched = route.matched
    if (matched.length > 1) {
      openKeys.value = matched.slice(0, -1).map(item => item.path)
    }
  },
  { immediate: true }
)

const menus = computed(() => {
  const routes = permissionStore.filterRoutes
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

// 菜单点击
const handleMenuClick = (path: string) => {
  router.push(path)
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