<template>
  <nav-common>收到的赞
    <template #right>
      <div @click="delAll">清空</div>
    </template>
  </nav-common>
  <div style="min-height: 612px">
    <van-swipe-cell v-for="i in likes" :key="i.id">
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
                <span class="name">{{ i.nickname }}</span>
                赞了我的评论
              </span>
                  <span class="content">
            </span>
                  <span class="time">{{ formatNow(i.time) }}</span>
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
    <van-empty v-if="showEmpty" image="/images/custom-empty-image.png" description="还没有人赞你"/>
  </div>
  <Footer/>
</template>

<script>
import {onMounted, reactive, toRefs} from "vue"
import {Toast} from "vant"
import {delLikes, getLikes, setLikesIsRead} from "@/api"
import {formatNow} from "@/uitls"
import NavCommon from "@/components/NavCommon"
import Footer from "@/components/Footer"

export default {
  name: "Likes",
  components: {NavCommon, Footer},
  setup() {
    const state = reactive({
      likes: [],
      loading: true,
      showEmpty: false
    })
    onMounted(async () => {
      const {status, likes, message} = await getLikes()
      if (status === 0) {
        state.likes = likes
        state.showEmpty = !likes.length
      } else {
        Toast.fail(message)
      }
      state.loading = false
    })
    // 点击修改为已读
    const changeRead = async id => {
      await setLikesIsRead(id)
    }
    // 删除单个
    const del = async id => {
      const {status} = await delLikes({id})
      if (status === 0) {
        state.likes = [...state.likes].filter(item => {
          return item.id !== id
        })
      }
    }
    // 删除全部
    const delAll = async () => {
      if (state.likes.length) {
        const {status} = await delLikes({id: null, all: true})
        if (status === 0) state.likes = []
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