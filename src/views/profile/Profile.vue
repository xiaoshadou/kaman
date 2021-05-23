<template>
  <div>
    <nav-common></nav-common>
    <div class="profile-content">
      <Avatar/>
      <van-cell @click="signIn" :title="isSignIn()" is-link size="large" center>
        <template #icon>
          <van-icon class="icon" name="sign" size="20"/>
        </template>
      </van-cell>
      <van-cell title="我的资料" to="/profile/people" is-link size="large" center>
        <template #icon>
          <van-icon class="icon" name="/images/bl_ziliao.png" size="22"/>
        </template>
      </van-cell>
      <van-cell title="视频上传" to="/uploads" is-link size="large" center>
        <template #icon>
          <van-icon class="icon" name="/images/wodesc.png" size="22"/>
        </template>
      </van-cell>
      <van-cell title="我的消息" to="/message" is-link size="large" center>
        <template #default>
          <van-badge v-if="count" :content="count" max="99"/>
        </template>
        <template #icon>
          <van-icon class="icon" name="/images/bl_xiaoxi.png" size="22"/>
        </template>
      </van-cell>
      <van-cell v-if="r" title="用户管理" to="/manage/users" is-link size="large" center>
        <template #icon>
          <van-icon class="icon" name="manager-o" size="22"/>
        </template>
      </van-cell>
      <van-cell v-if="r" title="视频管理" to="/manage/videos" is-link size="large" center>
        <template #icon>
          <van-icon class="icon" name="video-o" size="22"/>
        </template>
      </van-cell>
      <van-cell title="返回首页" to="/" is-link size="large" center>
        <template #icon>
          <van-icon class="icon home" name="wap-home-o" size="22"/>
        </template>
      </van-cell>
      <van-cell @click="logOut" title="退出登录" is-link size="large" center>
        <template #icon>
          <van-icon class="icon" name="/images/home_tuichu.png" size="20"/>
        </template>
      </van-cell>
    </div>
  </div>
  <Footer/>
  <TabBar active="profile"/>
</template>

<script>
import {onMounted, reactive, toRefs} from 'vue'
import {useStore} from "vuex"
import {useRouter} from 'vue-router'
import {Notify, Toast} from 'vant'
import {getMeg, me, sign} from "@/api"
import NavCommon from "@/components/NavCommon"
import Avatar from "@/views/profile/Avatar"
import Footer from "@/components/Footer"
import TabBar from "@/components/TabBar"

export default {
  name: "Profile",
  components: {NavCommon, Avatar, Footer, TabBar},
  setup() {
    const router = useRouter()
    const store = useStore()
    const {r, uid, avatar, sign: Sign, nickname} = store.state
    const state = reactive({
      r,
      avatar,
      nickname,
      Sign,
      count: 0
    })
    onMounted(async () => {
      if (!uid) {
        const {status, userinfo, message} = await me()
        if (status === 0) {
          const {r, avatar, sign, nickname} = userinfo
          state.r = r
          state.avatar = avatar
          state.nickname = nickname
          state.Sign = sign
          store.commit('updateUserInfo', userinfo)
        } else {
          Notify({
            type: 'danger', message, onOpened: () => router.push('/login')
          })
          localStorage.removeItem('TOKEN')
        }
      }
      // 获取未读消息
      const {status, reply, likes, notices} = await getMeg()
      if (status === 0) {
        state.count = reply + likes + notices
      }
    })
    // 每日签到
    const signIn = async () => {
      const {status, message} = await sign()
      if (status === 0) {
        state.Sign = Date.now()
        store.state.sign = Date.now()
        Toast.success(message)
      } else {
        Toast.fail(message)
      }
    }
    // 退出登录
    const logOut = () => {
      localStorage.removeItem('TOKEN')
      store.commit('updateUserInfo', {})
      router.push('/')
    }

    // 判断当前用户是否已经签到
    function isSignIn() {
      return state.Sign > new Date(new Date().toLocaleDateString()).getTime() ?
          '今日已签' : '每日签到'
    }

    return {
      ...toRefs(state),
      signIn,
      logOut,
      isSignIn
    }
  }
}

</script>

<style scoped lang="less">
.profile-content {
  .icon {
    padding-right: 4px;
  }

  .home {
    color: #ff9800;
  }
}

</style>