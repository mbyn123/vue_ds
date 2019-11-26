import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Hello from '../components/Hello'
import Users from '../components/users/User'
import RightsList from '../components/rights/RightsList'
import RoleList from '../components/rights/RoleList'
import Categories from '../components/goods/Categories'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'// 重定向到登录组件
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/hello', // 访问home页面,默认显示hello组件页面
    children: [
      {
        path: '/hello',
        component: Hello
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: RightsList
      },
      {
        path: '/roles',
        component: RoleList
      },
      {
        path: '/categories',
        component: Categories
      }

    ]
  }

]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') { // 如果进入的是登录页
    next()// 就允许跳转
  } else { // 如果进入的是home页
    const tokenStr = window.sessionStorage.getItem('token')// 先获取token
    if (!tokenStr) { // 如果token不存在表示还没有登录
      return next('/login')// 就跳转到登录页
    } else {
      next()// token存在表示已登录,就允许跳转到home页
    }
  }
})

export default router
