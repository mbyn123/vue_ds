<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="24">
          <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
        </el-col>
        <!-- 步骤条 -->
        <el-col :span="24">
          <el-steps :active="activeIndex - 0" finish-status="success" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
          </el-steps>
        </el-col>
      </el-row>
      <!-- Tbs标签 -->
      <el-form :model="TbsruleForm" :rules="rules" ref="ruleForm" label-position="top">
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTable"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="TbsruleForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="TbsruleForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_number" type="number">
              <el-input v-model="TbsruleForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_weight" type="number">
              <el-input v-model="TbsruleForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="cateoptions"
                :props="cateProps"
                v-model="TbsruleForm.goods_cat"
                clearable
                @change="parentCateChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="value.attr_name"
              v-for="value in manyTbsData"
              :key="value.attr_id"
            >
              <el-checkbox-group v-model="value.attr_vals" >
                <el-checkbox border :label="value2" v-for="(value2,index) in value.attr_vals" :key="index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
              <el-form-item :label='item.attr_name' v-for="item in onlyTbsData" :key="item.attr_id">
                  <el-input v-model='item.attr_vals'></el-input>
              </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">商品图片</el-tab-pane>
          <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  created () {
    this.getclassification()
  },
  data () {
    return {
      activeIndex: '0',
      TbsruleForm: {
        // 基本信息页面的值
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [] // 商品分类列表级联选中的值
      },
      cateoptions: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      rules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          {
            required: true,
            message: '请输选择第三级商品分类',
            trigger: 'change'
          }
        ]
      },
      manyTbsData: [], // 商品参数页面的值
      onlyTbsData: [] // 商品属性页面的值
    }
  },
  computed: {
    cateID () {
      if (this.TbsruleForm.goods_cat.length === 3) {
        // 监听级联选择框的值
        return this.TbsruleForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    async getclassification () {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取失败')
      }
      this.cateoptions = res.data
    },
    // 监听级联选择器，只允许选择第三级数据
    parentCateChange () {
      if (this.TbsruleForm.goods_cat.length !== 3) {
        this.TbsruleForm.goods_cat = []
      }
    },
    // 允许Tabs标签页是否能切换 next即将进入的页面 old是现在处于的页面
    beforeTable (next, old) {
      // 如果当前处于的基本信息页面中,没有选择商品分类
      if (old === '0' && this.TbsruleForm.goods_cat.length !== 3) {
        this.$notify.warning({
          title: '提示',
          message: '请先选择商品分类,再进行后续操作'
        })
        return false // 就不允许切换
      }
    },
    // 监听tabs标签切换,发送请求
    async tabClicked () {
      if (this.activeIndex === '1') { // 切换到商品参数页面
        const { data: res } = await this.$axios.get(// 发起请求
          `categories/${this.cateID}/attributes`,
          { params: { sel: 'many' } }
        )
        if (res.meta.status !== 200) {
          this.$message.error('商品参数获取失败')
        }
        res.data.forEach(item => { // 将商品参数分割成数组
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTbsData = res.data
      } else if (this.activeIndex === '2') { // 切换到商品属性页面
        const { data: res } = await this.$axios.get(// 发起请求
          `categories/${this.cateID}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          this.$message.error('商品参数获取失败')
        }
        this.onlyTbsData = res.data
        console.log(this.onlyTbsData)
      }
    }
  }
}
</script>

<style lang='less' scoped>
.el-checkbox{
    margin: 0 10px !important
}
</style>
