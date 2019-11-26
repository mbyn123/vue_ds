<template>
  <div class="login_container">

    <div class="login_box">
      <div class='title'><h3>DS后台管理系统</h3></div>
      <el-form ref="loginForm1" :model="loginForm" label-width="80px" :rules="rules">
        <el-form-item label="用户名" class="login-input frist" prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item label="密码" class="login-input" prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="buts">
          <el-button type="primary" @click="submitForm('loginForm1')">登录</el-button>
          <el-button type="info" @click="resetForm('loginForm1')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 登录验证
    submitForm (formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          // 验证通过
          const { data: res } = await this.$axios.post('login', this.loginForm) // 发送登录请求
          if (res.meta.status !== 200) {
            return this.$notify.error({
              title: '登录失败',
              message: res.meta.msg,
              duration: 1000
            })
          } else {
            this.$message.success('登录成功')
            window.sessionStorage.setItem('token', res.data.token) // 将token存储到sessionStorage中
            this.$router.push('/home') // 通过路由进行跳转
          }
        } else {
        }
      })
    },
    // 表单重置
    resetForm (formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang='less' scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  .title{
    text-align: center;
    font-size: 20px
  }
}
.login-input {
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}
.frist {
  padding: 20px;
}
.buts {
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}
</style>
