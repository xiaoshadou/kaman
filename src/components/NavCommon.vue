<template>
  <div class="nav-common">
    <div class="left" @click="$router.back()">
      <slot name="left">
        <van-icon name="arrow-left"/>
      </slot>
    </div>
    <div class="center">
      <slot>个人中心</slot>
    </div>
    <div class="right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {name: "Nav"}
</script>

<style scoped lang="less">
.nav-common {
  z-index: 10;
  background-color: #303538;
  height: 50px;
  display: flex;
  color: #ffffff;
  text-align: center;
  line-height: 50px;
  width: 100%;

  .left, .right {
    padding-top: 2px;
    width: 50px;
  }

  .right {
    font-size: 14px;
  }

  .center, .left {
    font-weight: 600;
    font-size: 20px;
  }

  .center {
    flex: 1;
  }
}
</style>