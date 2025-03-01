import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './router/permission'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import * as Icons from '@ant-design/icons-vue'
import permissionDirectives from './directives/permission'

// 创建Vue应用实例
const app = createApp(App)

// 注册全局图标组件
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons])
})

// 注册状态管理
app.use(createPinia())

// 注册路由
app.use(router)

// 注册权限指令
app.use(permissionDirectives)

// 挂载应用
app.mount('#app')
