import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠状态
  const collapsed = ref(false)
  
  // 主题设置
  const theme = ref({
    primaryColor: '#1890ff',
    darkMode: false
  })

  // 布局设置
  const layout = ref({
    showTags: true,
    fixedHeader: true,
    showBreadcrumb: true
  })

  // 切换侧边栏折叠状态
  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  // 更新主题设置
  const updateTheme = (newTheme: typeof theme.value) => {
    theme.value = { ...theme.value, ...newTheme }
  }

  // 更新布局设置
  const updateLayout = (newLayout: typeof layout.value) => {
    layout.value = { ...layout.value, ...newLayout }
  }

  return {
    collapsed,
    theme,
    layout,
    toggleCollapsed,
    updateTheme,
    updateLayout
  }
}) 