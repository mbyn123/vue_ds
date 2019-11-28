import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'// 引入全局样式表
import './assets/fonts/iconfont.css'// 引入图标
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid' // 引入树形表格依赖
import VueQuillEditor from 'vue-quill-editor' // 引入富文本编辑器
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 请求接口的基地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器
axios.interceptors.request.use(
  config => { // 添加请求头Authorization,提供token
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  }
)
Vue.prototype.$axios = axios

// 注册成全局组件，树形表格
Vue.component('tree-table', TreeTable)

// 注册成全局组件，富文本编辑器
Vue.use(VueQuillEditor /* { default global options } */)

// 注册全局Vue过滤器，显示时间格式
Vue.filter('date', function (dateVal) {
  const dt = new Date(dateVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const h = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const s = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${h}:${mm}:${s}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
