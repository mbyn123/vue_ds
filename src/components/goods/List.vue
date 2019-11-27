<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <!-- 搜索框 -->
          <el-form ref="form" :model="searchform">
            <el-input
              placeholder="请输入内容"
              v-model="searchform.query"
              clearable
              @clear="getGoodsList"
            >
              <el-button slot="append" icon="el-icon-search" @click="seachGoodsList "></el-button>
            </el-input>
          </el-form>
        </el-col>
        <el-col :span="6">
          <!-- 添加商品列表按钮 -->
          <el-button type="primary" @click='goAddGoods'>添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="goodsList" border stripe style="width: 100%;margin:15px 0">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="120px"></el-table-column>
        <el-table-column label="创建时间" width="200px">
          <template slot-scope="scope">{{scope.row.add_time | date}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deleatGoodsList(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchform.pagenum"
        :page-size="searchform.pagesize"
        :page-sizes="[5, 10, 15, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  created () {
    this.getGoodsList()
  },
  data () {
    return {
      searchform: {
        // 搜索框的值 请求参数
        query: '',
        pagenum: 1, // 当前商品页数
        pagesize: 10 // 当前页面显示条数
      },
      goodsList: [], // 表格数据
      total: 0
    }
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$axios.get('goods', {
        params: this.searchform
      })
      if (res.meta.status !== 200) {
        this.$notify.error({
          title: '商品数据获取失败',
          message: res.meta.msg,
          duration: 2000
        })
      } else {
        this.goodsList = res.data.goods
        this.total = res.data.total
        console.log(this.goodsList)
      }
    },
    // 监听page-size变化
    handleSizeChange (newSize) {
      this.searchform.pagesize = newSize
      this.getGoodsList()
    },
    // 监听pagenum变化
    handleCurrentChange (newPage) {
      this.searchform.pagenum = newPage
      this.getGoodsList()
    },
    // 查询数据
    seachGoodsList () {
      this.getGoodsList()
    },
    // 删除数据
    async deleatGoodsList (ID) {
      const result = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result === 'confirm') {
        const { data: res } = await this.$axios.delete(`goods/${ID}`)
        if (res.meta.status !== 200) {
          this.$message.info('删除失败')
        }
        this.getGoodsList()
        this.$message.success(res.meta.msg)
      } else {
        this.$message.info('取消删除')
      }
    },
    //
    goAddGoods () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang='less' scoped>
</style>
