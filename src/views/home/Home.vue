<template>
  <div>
    <div class="home-header">
      <div class="logo">
        <router-link to="/">
          <img src="@/assets/images/logo.png" alt="卡曼视频">
        </router-link>
      </div>
    </div>
    <div class="home-content">
      <video-list></video-list>
    </div>
  </div>
  <TabBar active="home"/>
</template>

<script>
import {reactive, toRefs, onMounted} from 'vue'
import {useStore} from "vuex"
import VideoList from './VideoList'
import {me} from "@/api"
import TabBar from "@/components/TabBar"

export default {
  name: "Home",
  components: {VideoList, TabBar},
  setup() {
    const store = useStore()
    const state = reactive({
      avatar: store.state.avatar
    })
    onMounted(async () => {
      if (!store.state.uid) {
        // 获取用户信息
        const {status, userinfo} = await me()
        if (status === 0) {
          state.avatar = userinfo.avatar
        } else {
          localStorage.removeItem('TOKEN')
        }
      }
    })

    return {
      ...toRefs(state)
    }
  }
}
</script>

<style lang="less" scoped>
.home-header {
  height: 56px;
  line-height: 56px;
  background-color: #fff;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 99;

  a {
    text-decoration: none;
  }

  img {
    width: 40%;
    height: 50px;
  }

}

</style>