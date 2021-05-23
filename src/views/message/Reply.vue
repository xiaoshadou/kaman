<template>
  <nav-common>回复我的
    <template #right>
      <div @click="delAll">清空</div>
    </template>
  </nav-common>
  <div style="min-height: 632px">
    <van-swipe-cell v-for="i in reply" :key="i.id">
      <router-link :to="{path: `/video`, query: {vid: i.vid,f:i.floor}}">
        <van-cell :style="{padding:'10px 10px;', backgroundColor: i.is_read?'': '#e6f7ff'}"
                  @click="changeRead(i.id)">
          <template #title>
            <div style="display: flex">
              <div style="display: flex;flex: 1">
                <van-image
                    round
                    fit="cover"
                    width="48"
                    height="48"
                    :src="i.avatar"
                />
                <div style="flex: 1" class="name-content">
              <span>
                <span class="name">{{ i.reply_name }}</span>
                回复了我的评论
              </span>
                  <span class="content">
              <div class="van-multi-ellipsis--l2">
                  {{ i.to_content }}
              </div>
            </span>
                  <span class="time">{{ formatNow(i.reply_time) }}</span>
                </div>
              </div>
              <div style="width: 100px;padding-left: 10px;">
                <div class="van-multi-ellipsis--l3" style="text-align: right;color: #969799;font-size: 12px;">
                  {{ i.content }}
                </div>
              </div>
            </div>
          </template>
        </van-cell>
      </router-link>
      <template #right>
        <van-button square @click="del(i.id)" type="danger" text="删除" style="height: 100%"/>
      </template>
    </van-swipe-cell>
    <van-loading v-if="loading" color="#1989fa" style="text-align: center;padding-top: 100px"/>
    <van-empty v-if="showEmpty" image="/images/custom-empty-image.png" description="暂时没有人理你"/>
  </div>
  <Footer/>
</template>

<script>
import {onMounted, reactive, toRefs} from "vue"
import {Toast} from "vant"
import {delReplyMe, getReply, setIsRead} from "@/api"
import {formatNow} from "@/uitls"
import NavCommon from "@/components/NavCommon"
import Footer from "@/components/Footer"
import Tabbar from "@/components/TabBar"


export default {
  name: "Reply",
  components: {NavCommon, Footer},
  setup() {
    const state = reactive({
      reply: [],
      loading: true,
      showEmpty: false
    })

    onMounted(async () => {
      const {status, reply, message} = await getReply()
      if (status === 0) {
        state.reply = reply
        state.showEmpty = !reply.length
      } else {
        Toast.fail(message)
      }
      state.loading = false
    })
    // 点击修改为已读
    const changeRead = async id => {
      await setIsRead(id)
    }
    // 删除回复我的
    const del = async id => {
      const {status} = await delReplyMe({id})
      if (status === 0) {
        state.reply = [...state.reply].filter(item => {
          return item.id !== id
        })
      }
    }
    // 删除全部
    const delAll = async () => {
      if (state.reply.length) {
        const {status} = await delReplyMe({id: null, all: true})
        if (status === 0) state.reply = []
      }
    }

    return {
      ...toRefs(state),
      formatNow,
      changeRead,
      del,
      delAll
    }
  }
}
</script>

<style scoped lang="less">
.name-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 8px;

  .name {
    font-weight: 700;
  }

  .time {
    color: #99a2aa;
    font-size: 12px;
  }
}

</style>