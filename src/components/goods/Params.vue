<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告提示 -->
      <el-alert title="注意:只允许删除第三级分类设置相关参数!" type="warning" :closable="false" show-icon></el-alert>
      <!-- 级联选择器 -->
      <el-row class="el-cascader">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
            expandTrigger="hover"
            v-model="value"
            :options="paramsoptions"
            :props="paramsCascader"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tabs标签页 -->
      <el-tabs v-model="TabsName" @tab-click="TabshandleClick">
        <!-- 动态参数页面 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数的按钮 -->
          <el-button type="primary" size="mini" :disabled="isoptfor" @click="openDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyData" style="width: 100%">
            <!-- 展开列 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="editopenDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态参数页面 -->
        <el-tab-pane label="静态参数" name="only">
          <!-- 添加静态参数的按钮 -->
          <el-button type="primary" size="mini" :disabled="isoptfor" @click="openDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="onlyData" style="width: 100%">
            <!-- 展开列 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="editopenDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="dialogVisible" width="40%" @close="resetForm">
      <!-- 表单 -->
      <el-form :model="addForm" :rules="addrulesForm" ref="addForm1" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addsubmitForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="dialogVisible2"
      width="40%"
      @close="resetForm2"
    >
      <!-- 表单 -->
      <el-form :model="editForm" :rules="editrulesForm" ref="addForm2" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="editsubmitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created () {
    this.getParamsList()
  },
  data () {
    return {
      paramsoptions: [], // 级联选择器数据源
      value: [], // 级联选择器选中值
      paramsCascader: {
        // :props配置数据
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      TabsName: 'many', // 当前选中的Tabs标签页选项
      manyData: [], // 动态参数数据
      onlyData: [], // 静态参数数据
      dialogVisible: false,
      dialogVisible2: false,
      addForm: { // 添加参数表单数据
        attr_name: ''
      },
      editForm: { // 修改参数表单数据
        attr_name: ''
      },
      addrulesForm: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editrulesForm: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    isoptfor () {
      // 监听级联的选中value值,控制按钮是否禁用
      if (this.value.length !== 3) {
        return true
      } else {
        return false
      }
    },
    cascaderId () {
      // 监听级联的选中value值,作为请求参数
      if (this.value.length !== 3) {
        return null
      } else {
        return this.value[2]
      }
    },
    titleText () {
      if (this.TabsName !== 'many') {
        return '静态参数'
      } else {
        return '动态参数'
      }
    }
  },
  methods: {
    // 发送请求 获取所有商品分类数据
    async getParamsList () {
      const { data: res } = await this.$axios.get('categories', {
        params: { type: 3 }
      })
      if (res.meta.status !== 200) {
        this.$notify.error({
          title: '获取商品分类失败',
          message: res.meta.msg,
          duration: 2000
        })
      }
      this.paramsoptions = res.data
    },
    // 发送请求 获取当前选择的商品的参数
    async gethandleChange () {
      if (this.value.length !== 3) {
        // 控制只能选择级联第三级的数据
        this.value = []
      }
      const { data: res } = await this.$axios.get(
        `categories/${this.cascaderId}/attributes`,
        { params: { sel: this.TabsName } }
      )
      if (res.meta.status !== 200) {
        this.$notify.error({
          title: '错误',
          message: '请先选择商品',
          duration: 2000
        })
      } else {
        if (this.TabsName === 'many') {
          this.manyData = res.data
          console.log(this.manyData)
        } else {
          this.onlyData = res.data
        }
      }
    },
    // 监听级联选择器值的变化
    handleChange () {
      if (this.value.length !== 3) {
        // 控制只能选择级联第三级的数据
        this.value = []
      }
      this.gethandleChange() // 调用请求函数,发送请求
    },
    // 监听Tabs标签页变化
    TabshandleClick () {
      this.gethandleChange() // 调用请求函数,发送请求
      this.addForm.attr_sel = this.TabsName
    },
    // 打开添加参数对话框
    openDialog () {
      this.dialogVisible = true
    },
    // 打开修改参数对话框 发送请求获取当前id的参数
    async editopenDialog (attrId) {
      this.dialogVisible2 = true
      const { data: res } = await this.$axios.get(`categories/${this.cascaderId}/attributes/${attrId}`, { params: { attr_sel: this.TabsName } })
      this.editForm = res.data
    },
    // 关闭添加参数对话框,重置表单
    resetForm () {
      this.$refs.addForm1.resetFields()
    },
    // 关闭修改参数对话框,重置表单
    resetForm2 () {
      this.$refs.addForm2.resetFields()
    },
    // 发送请求 点击确定按钮,提交新增后的参数
    addsubmitForm () {
      this.$refs.addForm1.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post(
          `categories/${this.cascaderId}/attributes`,
          { attr_name: this.addForm.attr_name, attr_sel: this.TabsName }
        )
        if (res.meta.status !== 201) {
          this.$notify.error({
            title: '添加失败',
            message: res.meta.msg,
            duration: 2000
          })
        } else {
          this.gethandleChange()// 刷新数据
          this.dialogVisible = false
          this.$message.success(res.meta.msg)
        }
      })
    },
    // 发送请求 点击确定按钮,提交修改后的参数
    editsubmitForm () {
      this.$refs.addForm2.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.put(`categories/${this.cascaderId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name, attr_sel: this.TabsName
        })
        if (res.meta.status !== 200) {
          this.$notify.error({
            title: '更新失败',
            message: res.meta.msg,
            duration: 2000
          })
        } else {
          this.$message.success(res.meta.msg)
          this.dialogVisible2 = false
          this.gethandleChange()
        }
      })
    }

  }
}
</script>

<style lang='less' scoped>
.el-cascader {
  margin: 15px 0;
  span {
    margin-right: 10px;
  }
}
</style>
