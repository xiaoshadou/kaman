<template>
  <div class="container">
    <div style="color: #333;font-size: 20px;font-weight: 600;">
      你似乎来错了地方
    </div>
    <router-link to="/">
      <van-button type="primary">我要回去</van-button>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "NotFound"
}
</script>

<style scoped lang="less">
.container {
  text-align: center;
  margin-top: 200px;
}
</style>