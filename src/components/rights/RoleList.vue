<template>
  <div>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card>
        <!-- 添加按钮 -->
        <el-button type="primary" style="margin-bottom:15px" @click="addUserBox">添加用户</el-button>
        <!-- 表格 -->
        <el-table :data="rolesList" border stripe>
          <!-- 展开列 -->
          <el-table-column type="expand">
            <!-- 作用域插槽 -->
            <template slot-scope="scope">
              <!-- 渲染一级权限 -->
              <el-row
                :class="['row-bottom',index===0?'row-top':'','venter']"
                v-for="(item1,index) in scope.row.children"
                :key="item1.id"
              >
                <el-col :span="5">
                  <el-tag closable @close="removeTag(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <!-- 渲染二级权限 -->
                  <el-row
                    :class="[index2===0?'':'row-top','venter']"
                    v-for="(item2,index2) in item1.children"
                    :key="item2.id"
                  >
                    <el-col :span="6">
                      <el-tag
                        type="success"
                        closable
                        @close="removeTag(scope.row,item2.id)"
                      >{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <!-- 渲染三级权限 -->
                      <el-tag
                        type="warning"
                        closable
                        @close="removeTag(scope.row,item3.id)"
                        v-for="item3 in item2.children"
                        :key="item3.id"
                      >{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!-- 索引列 -->
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
          <el-table-column label="操作" width="300">
            <!-- 作用域插槽 -->
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="openEditBox(scope.row.id)"
              >编辑</el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="openDeleteBox(scope.row.id)"
              >删除</el-button>
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="allotRights(scope.row)"
              >分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限" :visible.sync="dialogVisible" @close="removeTreekey" width="40%">
        <!-- 树形控件 -->
        <el-tree
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defaultTree"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="AddAllotRights">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="dialogVisible2" width="40%" @close="resetAdduser">
        <el-form :model="addUserForm" :rules="addrules" ref="addruleForm" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addUserForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addUserForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible2 = false">取 消</el-button>
          <el-button type="primary" @click="submitAddUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑用户对话框 -->
      <el-dialog title="编辑用户" :visible.sync="dialogVisible3" width="40%" @close="resetEdituser">
        <el-form :model="editUserForm" :rules="editrules" ref="editruleForm" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editUserForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editUserForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible3 = false">取 消</el-button>
          <el-button type="primary" @click="submitEditUser">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      rolesList: [], // 所有角色列表数据
      dialogVisible: false, // 分配权限弹窗打开/关闭
      dialogVisible2: false, // 添加用户对话框打开/
      dialogVisible3: false,
      rightsList: [], // 所有权限数据
      treeProps: {
        // 树形控件属性,结构数据
        label: 'authName', // 一级节点
        children: 'children' // 子节点
      },
      defaultTree: [], // 树形控件,默认选中节点
      keyId: '', // 保存角色id,用来发送请求
      addUserForm: {
        // 添加用户的表单数据
        roleName: '',
        roleDesc: ''
      },
      editUserForm: {
        // 编辑用户的表单数据
        roleName: '',
        roleDesc: ''
      },
      addrules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      editrules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 发送请求 获取角色列表数据
    async getRolesList () {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) {
        // 请求失败
        return this.$notify.error({
          title: '角色列表数据获取失败',
          message: res.meta.msg,
          duration: 2000
        })
      } else {
        // 请求成功
        this.rolesList = res.data
        // this.$message.success(res.meta.msg);
      }
    },
    // 发送请求,点击标签,删除权限
    async removeTag (role, rightId) {
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
        // 点击确定
        // 发送请求
        const { data: res } = await this.$axios.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) {
          // 请求失败
          this.$notify.error({
            // 提示用户
            title: '删除失败',
            message: res.meta.msg,
            duration: 2000
          })
        } else {
          // 请求成功
          this.$message.success(res.meta.msg)
          role.children = res.data // 将最新权限数据赋值给当前scope的值,重新渲染页面 role表示slot-scope作用域插槽的值
        }
        this.$message.success(res.meta.msg)
      } else if (result === 'cancel') {
        // 点击取消
        this.$message.info('已取消删除')
      }
    },
    // 发送请求,获取当前所有权限
    async allotRights (role) {
      this.keyId = role.id // 给角色id赋值,传递出去,用于分配权限进行发送请求
      const { data: res } = await this.$axios.get('rights/tree')
      this.rightsList = res.data
      // 调用递归函数,获取当前组件的三级权限id
      this.getTreekey(role, this.defaultTree)
      this.dialogVisible = true
    },
    // 递归,获取当前组件的三级权限id
    getTreekey (node, array) {
      if (!node.children) {
        return array.push(node.id)
      }
      node.children.forEach(item => {
        this.getTreekey(item, array)
      })
    },
    // 关闭树形控件时,清空重置defaultTree数组
    removeTreekey () {
      this.defaultTree = []
    },
    // 发送请求,分配(选定)的权限
    async AddAllotRights () {
      // 获取当前角色,所有被选定的权限id
      const Keys = [
        ...this.$refs.treeRef.getCheckedKeys(), // 半选中状态的id
        ...this.$refs.treeRef.getHalfCheckedKeys() // 选中状态的id
      ]
      const idStr = Keys.join(',') // 转化成,连接成的字符串
      // 发送请求
      const { data: res } = await this.$axios.post(
        `roles/${this.keyId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        // 请求失败
        this.$notify.error({
          // 提示用户
          title: '权限分配失败',
          message: res.meta.msg,
          duration: 2000
        })
      } else {
        // 请求成功
        this.$message.success(res.meta.msg)
        this.getRolesList() // 重新获取页面数据,刷新
      }
      this.dialogVisible = false // 关闭对话框
    },
    // 打开添加用户对话框
    addUserBox () {
      this.dialogVisible2 = true
    },
    // 重置添加用户表单
    resetAdduser () {
      this.$refs.addruleForm.resetFields()
    },
    // 发送请求,提交新添加用户的数据
    submitAddUser () {
      this.$refs.addruleForm.validate(async valid => {
        if (!valid) {
          return this.$notify.error({
            title: '提示',
            message: '用户信息未填写完整'
          })
        }
        // 发起请求
        const { data: res } = await this.$axios.post('roles', this.addUserForm)
        if (res.meta.status !== 201) {
          return this.$notify.error({
            title: '错误',
            message: res.meta.msg
          })
        }
        this.$message.success(res.meta.msg)
        this.getRolesList()
        this.dialogVisible2 = false
      })
    },
    // 发送请求,删除用户
    async openDeleteBox (Id) {
      const result = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result !== 'confirm') {
        this.$message.info('取消了删除')
      } else {
        const { data: res } = await this.$axios.delete(`roles/${Id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getRolesList()
      }
    },
    // 发送请求,打开添加用户对话框,根据用户id获取用户数据
    async openEditBox (Id) {
      this.dialogVisible3 = true
      const { data: res } = await this.$axios.get(`roles/${Id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('角色数据获取失败')
      }
      this.editUserForm = res.data
    },
    // 重置编辑用户表单
    resetEdituser () {
      this.$refs.editruleForm.resetFields()
    },
    // 发送请求,提交编辑的用户数据
    submitEditUser () {
      this.$refs.editruleForm.validate(async valid => {
        if (!valid) {
          return this.$notify.error({
            title: '提示',
            message: '用户信息未填写完整'
          })
        }
        const { data: res } = await this.$axios.put(`roles/${this.editUserForm.roleId}`, {
          roleName: this.editUserForm.roleName,
          roleDesc: this.editUserForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('角色更新失败')
        }
        this.$message.success('角色更新成功')
        this.getRolesList()
        this.dialogVisible3 = false
      })
    }
  }
}
</script>

<style lang='less' scoped>
.el-tag {
  margin: 10px;
}
.row-top {
  border-top: 1px solid #eee;
}
.row-bottom {
  border-bottom: 1px solid #eee;
}
.venter {
  display: flex;
  align-items: center;
}
</style>
