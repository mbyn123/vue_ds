<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 表格 -->
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <el-table-column type="index" width="50"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag type="danger" v-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="warning" v-if="scope.row.level==='2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      rightsList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    // 发送请求 获取权限列表数据
    async getRightsList () {
      const { data: res } = await this.$axios.get('rights/list')
      if (res.meta.status !== 200) {
        // 请求失败
        this.$notify.error({
          title: '权限列表数据获取失败',
          message: res.meta.msg,
          duration: 2000
        })
      } else {
        // 请求成功
        this.rightsList = res.data // 赋值给表格数据
        this.$message.success(res.meta.msg)
      }
    }
  }
}
</script>

<style lang='less' scoped>
</style>
