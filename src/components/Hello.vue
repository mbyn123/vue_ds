<template>
  <div>
    <h1>欢迎进入,DS后台管理系统!!!!!</h1>
    <div>
      <el-image v-for="url in urls" :key="url" :src="url" lazy style="width:100%"></el-image>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      urls: [
        'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg'
      ]
    }
  }
}
</script>>
