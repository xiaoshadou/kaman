<template>
  <nav-common>查看资料</nav-common>
  <div class="content-header"
       :style="{background: `url(${bgc}) no-repeat`,backgroundSize: 'cover'}">
    <div style="height: 52px;"/>
    <div class="avatar-img">
      <van-image
          round
          fit="cover"
          width="80"
          height="80"
          :src="avatar"
          @click="clickAvatar"
      >
      </van-image>
    </div>
  </div>
  <van-cell title="用户名" center>
    {{ nickname }}
  </van-cell>
  <van-cell title="性别" center>
    {{ gender === -1 ? '保密' : gender === 0 ? '女' : '男' }}
  </van-cell>
  <van-cell title="等级" center>
    <i class="level" :style="{backgroundPosition: formatLevel(EXP).split(';')[0]}"></i>
  </van-cell>
  <van-cell center :to="{path: '/chat', query: {uid,name: nickname}}">
    <template #title>
      <van-button color="#91d5ff" class="send-message">发送消息</van-button>
    </template>
  </van-cell>
  <Tabbar/>
</template>

<script>
import {onMounted, reactive, toRefs} from 'vue'
import {ImagePreview} from 'vant'
import {useRoute, useRouter} from 'vue-router'
import NavCommon from "@/components/NavCommon"
import Tabbar from "@/components/TabBar"
import {getPersonInfo} from "@/api"
import {formatLevel} from "@/uitls"

export default {
  name: "Person",
  components: {NavCommon, Tabbar},
  setup() {
    const {uid} = useRoute().query
    const router = useRouter()
    const state = reactive({
      nickname: '',
      avatar: '',
      EXP: '',
      gender: '',
      bgc: '',
      uid
    })
    onMounted(async () => {
      const {status, info} = await getPersonInfo(uid)
      if (status === 0) {
        state.nickname = info.nickname
        state.avatar = info.avatar
        state.EXP = info.EXP
        state.gender = info.gender
        state.bgc = info.bgc
      } else {
        router.replace('/404')
      }
    })
    const clickAvatar = () => {
      ImagePreview([state.avatar])
    }
    return {
      ...toRefs(state),
      formatLevel,
      clickAvatar
    }
  }
}
</script>

<style scoped lang="less">
.content-header {
  height: 264px;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.level {
  display: inline-block;
  width: 28px;
  height: 18px;
  vertical-align: middle;
  background: url("../../assets/images/level.png");
}

.send-message {
  text-align: center;
  width: 100%;
}
</style>