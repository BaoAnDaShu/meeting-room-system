import { createApp } from 'vue'
import ElementPlus from 'element-plus' // 引入Element Plus（UI组件）
import 'element-plus/dist/index.css' // 引入Element Plus样式
import zhCn from 'element-plus/dist/locale/zh-cn.mjs' // 引入中文语言包
import App from './App.vue' // 引入根组件

const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn, // 使用中文语言包
}) // 注册Element Plus组件
app.mount('#app') // 挂载到页面