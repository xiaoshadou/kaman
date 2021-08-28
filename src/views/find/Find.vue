<template>
  <div class="tips">敬请期待...</div>
  <Tabbar active="find"></Tabbar>
</template>

<script>
import Tabbar from "@/components/TabBar"

export default {
  name: "Find",
  components: {Tabbar}
}
</script>

<style scoped>
.tips {
  color: rgba(0,0,0,.5);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%);
}
</style>
