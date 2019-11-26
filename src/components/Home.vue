<template>
  <div>
    <el-container>
      <!-- 头部区域 -->
      <el-header>
        <h1 class="header-title">DS后台管理系统</h1>
        <div class="header-but">
          <el-button type="info" @click="layout">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <!-- 菜单 侧边栏 -->
        <el-aside :width="isCollapse?'64px':'200px'">
          <div class="aside-but">
            <i :class="isCollapse?'el-icon-s-unfold':'el-icon-s-fold'" @click="clickCollapse"></i>
          </div>
          <el-menu
            background-color="#373d41"
            text-color="#fff"
            active-text-color="#ffd04b"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            :router="true"
            :default-active="activePath"
          >
            <!-- 导航菜单Menu属性设置
            background-color="#545c64" 菜单的背景色
            text-color="#fff"  菜单的文字颜色
            active-text-color="#ffd04b" 当前激活菜单的文字颜色
            :unique-opened="true" 是否只保持一个子菜单的展开
            :collapse="isCollapse" 是否水平折叠收起菜单
            :collapse-transition="false" 是否开启折叠动画
            :router='true' 以 (index值='/'+value.path) 作为 path 进行路由跳转
            :default-active="activePath" 当前激活菜单的 (index值=activePath) 当前菜单点击高亮
            -->

            <!-- 一级菜单 -->
            <el-submenu :index="item.id+''" v-for="item in MenuList" :key="item.id">
              <template slot="title">
                <!-- 一级菜单图标 -->
                <i :class="MenuFont[item.id]"></i>
                <!-- 一级菜单名称 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item
                :index="'/'+value.path"
                v-for="value in item.children"
                :key="value.id"
                @click="savaNavState('/'+value.path)"
              >
                <template slot="title">
                  <!-- 二级菜单图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 二级菜单名称 -->
                  <span>{{value.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 主要内容区域 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      MenuList: [],
      MenuFont: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: true,
      activePath: ''
    }
  },
  created () {
    // 发送请求,获取菜单数据
    this.getMenuList()
    // 获取菜单点击时候保存的状态,缓存,,当前菜单点击高亮
    this.activePath = window.sessionStorage.getItem('state')
  },
  methods: {
    // 退出
    layout () {
      window.sessionStorage.clear() // 删除token
      this.$router.push('/login') // 路由跳转到登录页
    },
    // 发送请求,获取菜单数据
    async getMenuList () {
      const { data: res } = await this.$axios.get('menus')
      if (res.meta.status !== 200) {
        this.$notify.error({
          title: '菜单数据获取失败',
          message: res.meta.msg,
          duration: 2000
        })
      } else {
        // this.$message.success(res.meta.msg)
        this.MenuList = res.data
      }
    },
    // 侧边栏折叠
    clickCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存菜单点击的状态,当前菜单点击高亮
    savaNavState (State) {
      window.sessionStorage.setItem('state', State) // 用菜单的路径,作为缓存,存入sessionStorage
      this.activePath = State
    }
  }
}
</script>

<style lang='less' scoped>
.el-container {
  height: 100vh;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  .header-title {
    color: #fff;
    display: flex;
    align-items: center;
  }
  .header-but {
    display: flex;
    align-items: center;
  }
}

.el-aside {
  background-color: #373d41;
  .el-menu {
    border: 0;
  }
  .aside-but {
    text-align: right;
    cursor: pointer;
    .el-icon-s-unfold,
    .el-icon-s-fold {
      color: #fff;
      font-size: 20px;
      margin: 5px;
    }
  }
}
.iconfont {
  margin: 0 5px;
}
</style>
