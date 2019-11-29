<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="6">
          <!-- 搜索框 -->
          <el-form ref="form" :model="orderform">
            <el-input placeholder="请输入内容" v-model="orderform.query" clearable>
              <el-button slot="append" icon="el-icon-search" @click="seachOrdersList "></el-button>
            </el-input>
          </el-form>
        </el-col>
        <el-col :span="24">
          <!-- 表格 -->
          <el-table :data="orderTableData" border stripe style="width: 100%">
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column prop="order_number" label="订单编号"></el-table-column>
            <el-table-column prop="order_price" label="订单价格" width="50"></el-table-column>
            <el-table-column prop="pay_status" label="是否付款" width="100">
              <template slot-scope="scope">
                <el-tag type="success" v-if="scope.row.pay_status!=='0'">已付款</el-tag>
                <el-tag type="danger" v-else>未付款</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="is_send" label="是否发货" width="50"></el-table-column>
            <el-table-column prop="create_time" label="下单时间" width="300">
              <template slot-scope="scope">{{scope.row.create_time | date}}</template>
            </el-table-column>
            <el-table-column label="操作" width="300">
              <template>
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox">修改地址</el-button>
                <el-button
                  type="success"
                  icon="el-icon-location"
                  size="mini"
                  @click="showddBox"
                >查看物流</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页器 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="orderform.pagenum"
            :page-sizes="[1, 5, 10, 15]"
            :page-size="orderform.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </el-col>
      </el-row>
      <!-- 修改地址对话框 -->
      <el-dialog title="修改地址" :visible.sync="dialogVisible" width="40%" @close="restdialog">
        <!-- 表单 -->
        <el-form :model="editAddress" :rules="rules" ref="ruleForm" label-width="100px">
          <el-form-item label="省市区/县" prop="selectedOptions">
            <el-cascader
              expand-trigger="hover"
              :options="options"
              v-model="editAddress.selectedOptions"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="editAddress.address"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 查看物流信息对话框 -->
      <el-dialog title="物流信息" :visible.sync="dialogVisible2" width="40%">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './city_data2017_element'
export default {
  created () {
    this.getOrdersList()
  },
  data () {
    return {
      orderform: {
        query: '',
        pagenum: 1,
        pagesize: 10
        // user_id: '',
        // pay_status: '',
        // is_send: '',
        // order_fapiao_title: [],
        // order_fapiao_company: '',
        // order_fapiao_content: '',
        // consignee_addr: ''
      },
      total: 0,
      orderTableData: [],
      dialogVisible: false,
      dialogVisible2: false,
      options: cityData,
      editAddress: {
        address: '',
        selectedOptions: []
      },
      activities: [],
      rules: {
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        selectedOptions: [
          { required: true, message: '请选择城市', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    async getOrdersList () {
      const { data: res } = await this.$axios.get('orders', {
        params: this.orderform
      })
      if (res.meta.status !== 200) {
        return this.$notify.error({
          title: '错误',
          message: res.meta.msg
        })
      }
      this.orderTableData = res.data.goods
      this.total = res.data.total
    },
    //
    handleSizeChange (newsize) {
      this.orderform.pagesize = newsize
      this.getOrdersList()
    },
    //
    handleCurrentChange (newpage) {
      this.orderform.pagenum = newpage
      this.getOrdersList()
    },
    //
    seachOrdersList () {
      this.getOrdersList()
    },
    //
    showBox () {
      this.dialogVisible = true
    },
    //
    restdialog () {
      this.$refs.ruleForm.resetFields()
    },
    // 发送请求，获取物流信息
    async showddBox () {
      this.dialogVisible2 = true
      const { data: res } = await this.$axios.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$notify.error({
          title: '错误',
          message: '获取物流信息失败'
        })
      }
      this.$notify({
        title: '成功',
        message: res.meta.message,
        type: 'success'
      })
      this.activities = res.data
    }
  }
}
</script>

<style lang='less' scoped>
.el-input {
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
