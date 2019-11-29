<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
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
            <el-form-item label="商品名称-(不能为空/重复,否则创建失败)" prop="goods_name">
              <el-input v-model="TbsruleForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="TbsruleForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_number" >
              <el-input v-model="TbsruleForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_weight" >
              <el-input v-model="TbsruleForm.goods_weight" type="number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="value.attr_name"
              v-for="value in manyTbsData"
              :key="value.attr_id"
            >
              <el-checkbox-group v-model="value.attr_vals">
                <el-checkbox
                  border
                  :label="value2"
                  v-for="(value2,index) in value.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTbsData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="headerObj"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              style='width:500px'
              :multiple='true'
            >
              <el-button size="small" type="primary">点击上传图片</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="TbsruleForm.goods_introduce" ></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" @click='add'>添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'// 引入深拷贝依赖项
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
        goods_cat: [], // 商品分类列表级联选中的值
        pics: [], // 上传图片的临时储存地址
        goods_introduce: '', // 商品详情描述
        attrs: [] // 商品参数
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
      manyTbsData: [], // 商品参数页面的值,动态参数
      onlyTbsData: [], // 商品属性页面的值，静态参数
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload', // 图片上传地址接口
      // 图片上传需要提供token，手动设置请求头Authorization字段获取
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      picture: '', // 图片预览地址
      dialogVisible: false
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
    // 发送请求,获取商品分类列表数据
    async getclassification () {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取失败')
      }
      this.cateoptions = res.data// 赋值给级联选择器
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
      // 切换到商品参数页面
      if (this.activeIndex === '1') {
        // 发起请求,获取many动态参数
        const { data: res } = await this.$axios.get(
          `categories/${this.cateID}/attributes`,
          { params: { sel: 'many' } }
        )
        if (res.meta.status !== 200) {
          this.$message.error('商品参数获取失败')
        }
        res.data.forEach(item => {
          // 将商品参数分割成数组
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTbsData = res.data
        // 切换到商品属性页面
      } else if (this.activeIndex === '2') {
        // 发起请求,获取only静态参数
        const { data: res } = await this.$axios.get(
          `categories/${this.cateID}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          this.$message.error('商品参数获取失败')
        }
        this.onlyTbsData = res.data
      }
    },
    // 处理图片预览效果，获取图片信息
    handlePreview (file) {
      this.picture = file.response.data.url
      this.dialogVisible = true
    },
    // 处理图片移除时候的操作
    handleRemove (file) {
      const filePath = file.response.data.tmp_path // 获取移除图片的临时地址
      const i = this.TbsruleForm.pics.findIndex(x => x.pic === filePath) // 获取图片索引
      this.TbsruleForm.pics.splice(i, 1) // 删除图片
    },
    // 图片上传成功时候的操作
    handleSuccess (response) {
      const pictureUrl = {
        pic: response.data.tmp_path
      }
      // 将图片的临时存储地址，传递给form表单中的图片存储对象
      this.TbsruleForm.pics.push(pictureUrl)
    },
    // 发送请求,添加商品
    add () {
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) {
          return this.$notify.error({
            title: '提示',
            message: '请完成基本信息的填写'
          })
        }
        // 处理商品参数页面的值,动态参数
        this.manyTbsData.forEach(item => {
          const attr = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.TbsruleForm.attrs.push(attr)
        })
        // 处理商品属性页面的值，静态参数
        this.onlyTbsData.forEach(item => {
          const attr = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.TbsruleForm.attrs.push(attr)
        })
        //  将form表单数据，深拷贝为一个新对象
        const form = _.cloneDeep(this.TbsruleForm)
        // 将新form对象中的级联选择器值，变成字符床，而不影响原form中级联选择器的值
        form.goods_cat = form.goods_cat.join(',')
        //  发起请求
        const { data: res } = await this.$axios.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$notify.error({
            title: '错误',
            message: res.meta.msg
          })
        }
        this.$message.success(res.meta.msg)
        this.activeIndex = '6'
      })
    }
  }
}
</script>

<style lang='less' scoped>
.el-checkbox {
  margin: 0 10px !important;
}
.dialog-img {
  width: 100%;
}
.quill-editor{
  min-height:300px;
  margin-bottom: 50px
}
.el-input{
  width:300px
}
</style>
