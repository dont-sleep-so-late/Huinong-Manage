import { createPinia } from 'pinia'

const store = createPinia()

export default store

// 定义用户store
export { useUserStore } from './modules/user'
// 定义应用配置store
export { useAppStore } from './modules/app'
// 定义权限store
export { usePermissionStore } from './modules/permission' 