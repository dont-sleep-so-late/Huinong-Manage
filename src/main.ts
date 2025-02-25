import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'

// 引入权限控制
import './router/permission'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(Antd)

app.mount('#app')
