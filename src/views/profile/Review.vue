<template>
  <nav-common>review</nav-common>
  <van-cell v-if="finished" style="padding: 10px 6px" v-for="i in list" :key="i.id">
    <template #title>
      <div class="item">
        <div class="title">{{ i.title }}</div>
        <div class="author">{{ i.nickname }}</div>
        <div class="time">{{ formatNow(i.created) }}</div>
        <div class="desc">{{ i.desc }}</div>
        <div class="size">{{ i.size }}</div>
        <div class="actions">
          <van-tag type="primary" size="medium" @click="showPopup(i)">预览</van-tag>
          <div v-if="i.is_pass===0">
            <van-tag type="success " size="medium" @click="prompt('passShow',i)">通过</van-tag>
            <van-tag type="danger" size="medium" @click="prompt('rejectShow',i)">拒绝</van-tag>
          </div>
          <div v-if="i.is_pass===1">
            <van-tag type="success " size="medium">已通过</van-tag>
          </div>
          <div v-if="i.is_pass===-1">
            <van-tag type="danger" size="medium">已拒绝</van-tag>
          </div>
        </div>
      </div>
    </template>
  </van-cell>
  <van-popup style="background: #000"
             :duration="0"
             v-model:show="videoShow"
             closeable
             @open="videoShow=true"
             @click-overlay="videoShow=false">
    <video v-if="videoShow"
           :src="`/video/${hash}/${name}`"
           width="320"
           webkit-playsinline="true"
           x5-playsinline
           playsinline
           controls="controls"></video>
  </van-popup>
  <van-dialog v-model:show="rejectShow" title="reason" show-cancel-button @confirm="rejectConfirm" @cancel="reason=''">
    <van-field v-model="reason" rows="2" autosize type="textarea"/>
  </van-dialog>
  <van-dialog v-model:show="passShow" title="确认通过?" show-cancel-button @confirm="passConfirm"/>
  <van-loading v-if="!finished" color="#1989fa" style="text-align: center;padding-top: 100px"/>
  <div class="page" v-if="finished">
    <van-pagination v-if="total" v-model="currentPage" @change="pageChange" :total-items="total" :items-per-page="6"/>
  </div>
  <TabBar/>
</template>

<script>
import {onMounted, toRefs, reactive} from 'vue'
import {useRouter} from 'vue-router'
import {Notify, Toast} from 'vant'
import NavCommon from "@/components/NavCommon"
import TabBar from "@/components/TabBar"
import {review, reviewVideo, updateVideo} from "@/api"
import {formatNow} from '@/uitls'

export default {
  name: "Review",
  components: {NavCommon, TabBar},
  setup() {
    const router = useRouter()
    const state = reactive({
      list: [],          // 每一页的审核视频
      videoShow: false,  // 视频预览
      hash: '',
      name: '',
      passShow: false,   // 通过提示
      reason: '',        // 拒绝原因
      rejectShow: false,  // 拒绝提示
      video: {},
      finished: false,
      currentPage: 1,
      total: 0,
    })
    onMounted(async () => {
      const {status, list, total, message} = await review()
      if (status === 0) {
        state.total = total
        state.list = list
        state.finished = true
      } else {
        Notify({
          type: 'danger', message, onOpened: () => {
            // 无权限跳转到个人中心
            router.replace('/profile')
          }
        })
      }
    })
    //  点击预览显示视频
    const showPopup = info => {
      state.videoShow = true
      const {hash, video_name} = info
      state.hash = hash
      state.name = video_name
      setTimeout(() => {
        const video = document.querySelector('video')
        state.duration = video.duration
      }, 500)
    }
    // 确认前提示
    const prompt = (type, i) => {
      state.id = i.id
      state[type] = true
      state.name = i.video_name
      state.info = i
    }
    // 确认通过
    const passConfirm = async () => {
      const {status, message} = await reviewVideo({
        type: 'pass',
        info: state.info
      })
      if (status === 0) {
        state.list = [...state.list].map(item => {
          if (item.id === state.id) {
            return {
              ...item,
              is_pass: 1
            }
          } else return {...item}
        })
      } else {
        Notify({type: 'danger', message})
      }
    }
    // 确认不通过
    const rejectConfirm = async () => {
      const {status, message} = await reviewVideo({
        type: 'reject',
        info: {
          ...state.info,
          reason: state.reason
        }
      })
      if (status === 0) {
        state.list = [...state.list].map(item => {
          if (item.id === state.id) {
            return {
              ...item,
              is_pass: -1
            }
          } else return {...item}
        })
      } else {
        Notify({type: 'danger', message})
      }
      state.reason = ''
    }
    // 翻页
    const pageChange = async page => {
      state.finished = false
      const {status, list, message} = await review(page)
      if (status === 0) {
        state.list = list
        state.finished = true
      } else {
        Notify({
          type: 'danger', message, onOpened: () => {
            router.replace('/profile')
          }
        })
      }
    }

    return {
      ...toRefs(state),
      formatNow,
      showPopup,
      prompt,
      passConfirm,
      rejectConfirm,
      pageChange
    }
  }
}
</script>

<style scoped lang="less">
.item {
  display: flex;
  align-items: center;
  justify-content: space-around;
  text-align: center;

  .title {
    width: 20%;
  }

  .time, .size {
    font-size: 12px;
  }

  .author, .time{
    width: 10%;
  }

  .desc {
    width: 20%;
    word-break: break-all;
  }

  .actions {
    width: 10%;
    text-align: center;
  }
}

.page {
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
</style>
