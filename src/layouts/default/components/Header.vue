<template>
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
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationMatched } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useAppStore, useUserStore } from '@/store'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

// 面包屑
const breadcrumbs = computed(() => {
  return route.matched.filter(item => {
    return item.meta?.title && !item.meta?.hidden
  })
})

// 面包屑点击
const handleBreadcrumbClick = (items: RouteLocationMatched[]) => {
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
</script>

<style lang="less" scoped>
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
</style> 