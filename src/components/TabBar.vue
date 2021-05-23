<template>
  <van-tabbar v-model="active">
    <van-tabbar-item name='home' to='/' icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item name='find' to='/find' icon="search">发现</van-tabbar-item>
    <van-tabbar-item name='message' to='/message' icon="chat-o">消息</van-tabbar-item>
    <van-tabbar-item name='profile' to='/profile' icon="user-circle-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script>
import {ref} from 'vue'

export default {
  name: "TabBar",
  props: ['active'],
  setup(props) {
    const active = ref(props.active)
    return {
      active
    }
  }
}
</script>

<style scoped>

</style>