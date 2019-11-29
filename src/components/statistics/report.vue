<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 1.为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 100%;height:400px"></div>
      <div id="main2" style="width: 100%;height:400px;"></div>
      <div id="main3" style="width: 100%;height:400px;"></div>
      <div id="main4" style="width: 100%;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash' // 引入深拷贝依赖项
export default {
  // 在mounted中进行echarts的相关操作
  async mounted () {
    // 2.基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    var myChart2 = echarts.init(document.getElementById('main2'))
    var myChart3 = echarts.init(document.getElementById('main3'))
    var myChart4 = echarts.init(document.getElementById('main4'))
    // 3.发送请求获取图表的配置项和数据
    const { data: res } = await this.$axios.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('图表数据获取失败')
    }
    // 使用lodash依赖中的meerge合并echarts中配置的两个数据对象
    const result = _.merge(res.data, this.options)
    // 4.使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
    myChart2.setOption(result)
    myChart3.setOption(result)
    myChart4.setOption(result)
    // 页面中只有一张图表需要自适应时使用
    // window.onresize = myChart.resize;
    // 页面中只有多张图表需要自适应时使用
    window.addEventListener('resize', function () {
      myChart.resize()
      myChart2.resize()
      myChart3.resize()
      myChart4.resize()
    })
  },
  data () {
    return {
      options: {
        // echarts 需要合并的数据和配置
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  }
}
</script>

<style lang='less' scoped>
</style>
