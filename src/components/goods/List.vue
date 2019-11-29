<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
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
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
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
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="editGoodsList(scope.row.goods_id)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deleteGoodsList(scope.row.goods_id)"
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
    <!-- 编辑商品对话框 -->
    <el-dialog title="编辑商品" :visible.sync="dialogVisible" width="80%" @close="resetTbsName">
      <!-- Tbs标签页 -->
      <el-form :model="editGoodsForm" :rules="editGoodsrules" ref="editGoods" label-position="top">
        <el-tabs v-model="activeName">
          <el-tab-pane label="基本信息" name="1">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="editGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="editGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="editGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in editGoodsForm.attrs"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_value"></el-input>
            </el-form-item>
             <span v-if='editGoodsForm.attrs.length===0'>暂无参数</span>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="headerObj"
              :action="uploadURL"
              :on-success="uploadSuccess"
              :on-remove="handleRemove"
              :on-preview="handlePreview"
              :file-list="pics"
              list-type="picture"
              :multiple="true"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品介绍" name="4">
            <quill-editor v-model="editGoodsForm.goods_introduce" style="min-height:300px"></quill-editor>
            <div class="but">
              <el-button type="primary" @click="submitEditGoods">提交</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-dialog>
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
      total: 0,
      dialogVisible: false,
      dialogVisible2: false,
      activeName: '1', // Tbs标签页
      pics: [], // 图片临时存放
      picture: '', // 图片预览
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      editGoodsForm: {
        // 编辑商品表单数据
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        attrs: [], // 商品参数
        pics: {}, // 商品图片
        goods_introduce: '' // 商品介绍
      },
      editGoodsrules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'change' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'change' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'change' }
        ]
      }
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
    async deleteGoodsList (ID) {
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
    // 路由跳转到添加商品页面
    goAddGoods () {
      this.$router.push('/goods/add')
    },
    // 发送请求,根据商品id,获取商品数据,打开编辑商品对话框
    async editGoodsList (Id) {
      this.dialogVisible = true
      const { data: res } = await this.$axios.get(`goods/${Id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('商品数据获取失败')
      }
      this.$message.success(res.meta.msg)
      this.editGoodsForm = res.data
      this.editGoodsForm.pics.forEach(item => {
        const p = {
          url: item.pics_big_url,
          tmp_url: item.pics_big
        }
        this.pics.push(p)
      })
    },
    // 重置tbs标签页默认位置
    resetTbsName () {
      this.activeName = '1'
      this.pics = []
    },
    // 图片上传成功时调用的钩子函数
    uploadSuccess (response) {
      const picURL = {
        pic: response.data.tmp_path
      }
      // 将上传的临时图片地址tm_path传递给form表单中的图片储存数组
      this.editGoodsForm.pics.push(picURL)
    },
    // 图片移除时调用的钩子函数
    handleRemove (file) {
      const filePath = file.tmp_path
      const i = this.editGoodsForm.pics.findIndex(x => x.pic === filePath)
      this.editGoodsForm.pics.splice(i, 1)
    },
    // 用于图片预览时的钩子函数
    handlePreview (file) {
      this.picture = file.response.data.url
      this.dialogVisible2 = true
    },
    // 发送请求，提交数据
    submitEditGoods () {
      this.$refs.editGoods.validate(async valid => {
        if (!valid) {
          return this.$message.error('验证未通过')
        }
        const { data: res } = await this.$axios.put(
          `goods/${this.editGoodsForm.goods_id}`,
          this.editGoodsForm
        )
        if (res.meta.status !== 200) {
          return this.$message.error('数据更新失败')
        }
        this.$message.success('商品数据更新成功')
        this.getGoodsList()
        this.dialogVisible = false
      })
    }
  }
}
</script>

<style lang='less' scoped>
.but {
  display: flex;
  justify-content: flex-end;
}
.dialog-img {
  width: 100%;
}
</style>
