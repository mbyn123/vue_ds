import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'// 引入全局样式表
import './assets/fonts/iconfont.css'// 引入图标
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid' // 引入树形表格依赖

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(// 设置请求拦截器
  config => { // 添加请求头Authorization,提供token
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  }
)
Vue.prototype.$axios = axios

Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)// 注册成全局组件
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
