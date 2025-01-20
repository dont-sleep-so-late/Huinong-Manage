<template>
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
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteMeta } from 'vue-router'
import { useAppStore } from '@/store'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// 标签页相关
const activeTab = ref(route.path)
const visitedViews = ref<Array<{ path: string; meta: RouteMeta }>>([
  {
    path: '/dashboard',
    meta: { title: '首页' }
  }
])

// 监听路由变化
watch(
  () => route.path,
  (path) => {
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
</script>

<style lang="less" scoped>
.layout-tabs {
  margin: 6px 4px 0;
  background: #fff;
}
</style> 