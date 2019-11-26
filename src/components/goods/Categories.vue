 <template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-button type="primary" style="margin-bottom:15px" @click="AddClassification">添加分类</el-button>
      <!-- 商品分类列表 -->
      <tree-table
        :data="classifyList"
        :columns="columns"
        :expand-type="false"
        border
        :selection-type="false"
        :show-index="true"
      >
        <!-- 第二列 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 第三列 排序 -->
        <template slot="tag" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level===2">三级</el-tag>
        </template>
        <!-- 第四列 操作 -->
        <template slot="but">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[1, 3, 5, 10]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类 对话框 -->
    <el-dialog title="添加分类" :visible.sync="dialogVisible" width="40%" @close="resetForm">
      <el-form ref="ClassificationForm1" :model="ClassificationForm" :rules="ClassificationRules">
        <!-- 新增父级分类 输入框 -->
        <el-form-item label="分类名称:" label-width="90px" prop="cat_name">
          <el-input v-model="ClassificationForm.cat_name"></el-input>
        </el-form-item>
        <!-- 级联选择器 :props用来指定配置对象 :options用来指定数据源 -->
        <el-form-item label="父级分类:" label-width="90px">
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            clearable
            change-on-select
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created () {
    this.getlaCssifyList()
  },
  data () {
    return {
      classifyList: [], // 页面商品分类列表数据
      queryInfo: {
        // 请求参数
        type: 3, // 获取列表层级数
        pagenum: 1, // 当前页码
        pagesize: 5 // 每页显示条数
      },
      total: 0, // 表格数据总条数,
      columns: [
        // tree-table的各列属性及名称
        {
          // 第一列
          label: '分类名称', // 标题名称
          prop: 'cat_name' // 属性
        },
        {
          // 第二列
          label: '是否有效', // 标题名称
          type: 'template', // 表示将此列定以为 自定义模板列
          template: 'isok' // 表示这一列使用的模板名称,可以使用slot作用域插槽
        },
        {
          // 第三列
          label: '排序',
          type: 'template',
          template: 'tag'
        },
        {
          // 第四列
          label: '操作',
          type: 'template',
          template: 'but'
        }
      ],
      dialogVisible: false,
      ClassificationForm: {
        // 请求参数
        cat_name: '', // 添加分类的名称
        cat_pid: 0, // 父级分类的id
        cat_level: 0 // 分类的等级
      },
      ClassificationRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      selectedKeys: [], // 级联选择器选中的值
      parentCateList: [], // 级联选择器数据源
      cascaderProps: {
        // :props用来指定级联选择器配置对象
        value: 'cat_id', // 关联的id
        label: 'cat_name', // 关联的标题内容
        children: 'children' // 关联的子级属性
      }
    }
  },
  methods: {
    // 发送请求,获取商品分类列表数据
    async getlaCssifyList () {
      const { data: res } = await this.$axios.get('categories', {
        params: this.queryInfo
      })
      this.classifyList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize 当前显示条数,实时刷新页面数据
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getlaCssifyList()
    },
    // 监听pagenum  当前页码值,实时刷新页面数据
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getlaCssifyList()
    },
    // 点击按钮添加分类
    AddClassification () {
      this.dialogVisible = true
      this.getCategoriesList()
    },
    // 发送请求获取2级商品数据数据分类数据
    async getCategoriesList () {
      const { data: res } = await this.$axios.get('categories', {
        params: { type: 2 }
      })
      this.parentCateList = res.data
    },
    // 实时监听级联选择器的值,是否发生变化
    parentCateChange () {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        // 表示选中了值
        this.ClassificationForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1] // 给当前选中的父类id赋值,数组中的最后一项
        this.ClassificationForm.cat_level = this.selectedKeys.length // 给当前选中的父类等级赋值
      } else {
        // 没有选中值
        this.ClassificationForm.cat_pid = 0 // 重置
        this.ClassificationForm.cat_level = 0 // 重置
      }
    },
    // 发送请求 点击确定按钮,添加新的分类
    addForm () {
      this.$refs.ClassificationForm1.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post(
          'categories',
          this.ClassificationForm
        )
        if (res.meta.status !== 201) {
          this.$notify.error({
            title: '添加父类失败',
            message: res.meta.msg,
            duration: 2000
          })
        } else {
          this.$message.success(res.meta.msg)
          this.getlaCssifyList()// 刷新数据
          this.dialogVisible = false
        }
      })
    },
    // 对话框关闭,清空所有的值
    resetForm () {
      this.$refs.ClassificationForm1.resetFields()
      this.selectedKeys = []
      this.ClassificationForm.cat_pid = 0 // 重置
      this.ClassificationForm.cat_level = 0 // 重置
    }
  }
}
</script>

<style lang='less' scoped>
.el-cascader {
  width: 100%;
}
</style>
