<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20" class="row-bg">
        <!-- 搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入用户名" v-model="queryInfo.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户按钮 -->
        <el-col :span="6">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-row>
        <el-col>
          <el-table :data="tableData" border stripe style="width: 100%;margin-top:10px">
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="username" label="姓名" width="180"></el-table-column>
            <el-table-column prop="email" label="邮箱"></el-table-column>
            <el-table-column prop="mobile" label="电话"></el-table-column>
            <el-table-column prop="role_name" label="角色"></el-table-column>
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <!--使用作用域插槽slot-scope 获取当前行row的数据 设置开关状态-->
                <el-switch v-model="scope.row.mg_state" @change="stateChange(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template slot-scope="scope">
                <!--使用作用域插槽slot-scope 获取当前行row的数据 设置操作选项-->
                <!-- 修改按钮 -->
                <el-button type="primary" @click="amendUser(scope.row.id)" size="mini">修改</el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" size="mini" @click="deleteUser(scope.row.id)">删除</el-button>
                <!-- 分配角色按钮 -->
                <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                  <el-button type="warning" size="mini">设置</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加用户 对话框 -->
      <el-dialog title="提示" :visible.sync="dialogVisible" @close="resetFrom" width="40%">
        <!-- 内容主体区域 表单 -->
        <el-form :model="UserForm" :rules="UserRules" ref="UserForm1" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model.trim="UserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model.trim="UserForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="UserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model.trim="UserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户 对话框 -->
      <el-dialog title="提示" :visible.sync="dialogVisible2" width="40%">
        <!-- 内容主体区域 表单 -->
        <el-form :model="amendUserForm" :rules="UserRules2" ref="UserForm2" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model.trim="amendUserForm.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="amendUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model.trim="amendUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible2 = false">取 消</el-button>
          <el-button type="primary" @click="submitAmendUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
  <!--  分页器属性设置
        @size-change="handleSizeChange" // 监听pagesize 每页显示条数 改变的事件
        @current-change="handleCurrentChange" // 监听页码值 改变的事件
        :current-page="queryInfo.pagenum" // 当前页码
        :page-size="queryInfo.pagesize" // 每页显示条数
        :total="total" //数据总条数
        :page-sizes="[1, 2, 5, 10]" //每页显示条数
        layout="total, sizes, prev, pager, next, jumper" //控制显示上述那些功能
  -->
</template>
<script>
export default {
  created () {
    this.getUsersList()
  },
  data () {
    // 自定义验证规则
    // 验证邮箱
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
      // if (!value) {
      //   return callback(new Error('邮箱不能为空'))
      // }
      if (regEmail.test(value)) {
        callback()
      } else {
        callback(new Error('请输入合法的邮箱'))
      }
    }
    // 验证手机号
    var checkMbolie = (rule, value, callback) => {
      const regMobile = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
      // if (!value) {
      //   return callback(new Error('手机号不能为空'))
      // }
      if (regMobile.test(value)) {
        callback()
      } else {
        callback(new Error('手机号必须为11位数字'))
      }
    }
    return {
      queryInfo: {
        query: '', // 查询参数,用来搜索,值为空时,刷新列表
        pagenum: 1, // 当前页码
        pagesize: 10 // 每页显示条数
      },
      total: 0, // 表格数据总条数
      tableData: [], // 表格数据
      dialogVisible: false, // 添加用户功能对话框是否隐藏
      dialogVisible2: false, // 修改用户功能对话框是否隐藏
      // 添加用户功能,表单数据
      UserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户功能,表单验证规则
      UserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度3-10位', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度最少6位', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail } // 自定义邮箱格式验证规则
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMbolie } // 自定义手机号格式验证规则
        ]
      },
      // 修改用户功能,表单数据
      amendUserForm: {},
      // 修改用户功能,表单验证规则
      UserRules2: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail } // 自定义邮箱格式验证规则
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMbolie } // 自定义手机号格式验证规则
        ]
      }
    }
  },
  methods: {
    // 发送请求 获取用户列表数据
    async getUsersList () {
      const { data: res } = await this.$axios.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取用户列表数据失败')
      } else {
        this.tableData = res.data.users // 绑定渲染数据
        this.total = res.data.total
      }
    },
    // 监听pagesize 每页显示条数 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUsersList() // 重新发送请求
    },
    // 监听页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUsersList() // 重新发送请求
    },
    // 发送请求 点击开关,修改用户状态
    async stateChange (change) {
      const { data: res } = await this.$axios.put(
        `users/${change.id}/state/${change.mg_state}`
      )
      if (res.meta.status !== 200) {
        this.change.mg_state = !this.change.mg_state // 修改失败,重置开关状态
        this.$notify.error({
          title: '修改用户状态失败',
          message: res.meta.msg,
          duration: 2000
        })
      } else {
        this.$message.success(res.meta.msg)
      }
    },
    // 关闭添加用户功能对话框,重置表单
    resetFrom () {
      this.$refs.UserForm1.resetFields()
    },
    // 关闭修改用户功能对话框,重置表单
    amendUserresetFrom () {
      this.$refs.UserForm2.resetFields()
    },
    // 发送请求 添加用户,点击确定,验证表单
    addUser () {
      this.$refs.UserForm1.validate(async valid => {
        if (valid) {
          // 验证通过,发起请求
          const { data: res } = await this.$axios.post('users1', this.UserForm)
          if (res.meta.status !== 201) {
            this.$notify.error({
              title: '请求失败',
              message: res.meta.msg,
              duration: 2000
            })
          } else {
            this.$message.success(res.meta.msg)
            this.dialogVisible = false // 创建成功,关闭对话框
            this.getUsersList() // 重新发送请求,刷新表格数据
          }
        } else {
          // 验证不通过,提示用户
          return this.$notify.error({
            title: '错误',
            message: '表单验证不通过',
            duration: 1000
          })
        }
      })
    },
    // 发送请求 获取,修改当前用户数据
    async amendUser (id) {
      this.dialogVisible2 = true
      const { data: res } = await this.$axios.get(`users/${id}`)
      console.log(res.data)
      if (res.meta.status !== 200) {
        this.$notify.error({
          title: '获取当前用户信息失败',
          message: res.meta.msg,
          duration: 2000
        })
      } else {
        this.amendUserForm = res.data // 将获取的数据传给修改用户的表单
      }
    },
    // 发送请求 提交,验证表单,提交修改后的当前用户数据
    submitAmendUser () {
      this.dialogVisible2 = false
      this.$refs.UserForm2.validate(async valid => {
        if (valid) {
          // 验证通过,发起请求
          const { data: res } = await this.$axios.put(
            `users/${this.amendUserForm.id}`,
            {
              email: this.amendUserForm.email,
              mobile: this.amendUserForm.mobile
            }
          )
          if (res.meta.status !== 200) {
            // 请求失败
            this.$notify.error({
              // 提示用户
              title: '修改失败',
              message: res.meta.msg,
              duration: 2000
            })
            this.dialogVisible2 = true // 对话框不能关闭
          } else {
            // 请求成功
            this.dialogVisible2 = false // 关闭对话框
            this.getUsersList() // 重新发送请求 ,刷新列表数据
            this.$message.success(res.meta.msg)
          }
        } else {
          // 验证不通过, 提示用户
          this.dialogVisible2 = true // 对话框不能关闭
          return this.$notify.error({
            title: '错误',
            message: '表单验证不通过',
            duration: 1000
          })
        }
      })
    },
    // 发送请求 删除当前用户操作
    async deleteUser (id) {
      // 弹框提示用户是否删除
      const result = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定', // 点击确定,result 返回confirm 字符串
          cancelButtonText: '取消', // 点击取消,result 返回cancel 字符串
          type: 'warning'
        }
      ).catch(err => err)
      if (result === 'confirm') { // 点击确定
        // 发送删除请求
        const { data: res } = await this.$axios.delete(`users/${id}`)
        if (res.meta.status !== 200) { // 请求失败
          this.$notify.error({
            // 提示用户
            title: '删除失败',
            message: res.meta.msg,
            duration: 2000
          })
        } else { // 请求成功
          this.$message.success(res.meta.msg)// 提示用户
          this.getUsersList() // 刷新表格数据
        }
      } else { // 点击取消
        this.$message.info('已取消删除')
      }
    }
  }
}
</script>

<style lang='less' scoped>
</style>
