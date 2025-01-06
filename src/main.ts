import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'ant-design-vue/dist/antd.less'
import './style.css'

const app = createApp(App)

app.use(router)
app.use(store)

app.mount('#app')
