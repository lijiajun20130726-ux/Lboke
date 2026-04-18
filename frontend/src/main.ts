import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 禁用浏览器的滚动位置恢复，防止刷新后跳到底部
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
