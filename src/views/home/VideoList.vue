<template>
  <div class="video-content" v-if="finished">
    <div class="video-item" v-for="i in videoList" :key="i.vid">
      <router-link :to="{path:i.vurl, query: {vid: i.vid, t: Date.now()}}">
        <div class="item-cover">
          <img :src="i.cover" v-lazy="i.cover" alt="">
        </div>
        <div class="duration">{{ i.duration }}</div>
        <div class="item-info">
          <div class="info-title">{{ i.title }}</div>
          <div class="info-c">
            <div style="float: left">{{ formatNow(i.created) }}</div>
            <div style="float: right;overflow:hidden;max-width: 78px;max-height: 20px">查看：{{ i.views }}</div>
          </div>
        </div>
      </router-link>
    </div>
    <div class="pagination" v-if="totalItems">
      <van-pagination
          @change="change"
          v-model="currentPage" :total-items="totalItems"
          :show-page-size="3" :items-per-page="6">
        <template #prev-text>
          <van-icon name="arrow-left"/>
        </template>
        <template #next-text>
          <van-icon name="arrow"/>
        </template>
      </van-pagination>
    </div>
  </div>
  <van-loading v-if="!finished" color="#1989fa" style="text-align: center;margin-top: 150px"/>
</template>
<script>
import {onMounted, reactive, toRefs} from 'vue'
import {Notify} from 'vant'
import {getHome, getPage} from "@/api"
import {formatNow} from "@/uitls"

export default {
  name: "List",
  setup() {
    const state = reactive({
      currentPage: 1,
      totalItems: '',
      videoList: [],
      finished:false
    })
    const change = async page => {
      state.finished = false
      const {status, result, message} = await getPage(page)
      if (status === 0) {
        state.videoList = result
      } else {
        Notify({type: 'danger', message, duration: 1500})
      }
      state.finished = true
    }
    onMounted(async () => {
      const {status, message, result, count} = await getHome()
      if (status === 0) {
        state.videoList = result
        state.totalItems = count
      } else {
        Notify({type: 'danger', message, duration: 1500})
      }
      state.finished = true
    })
    return {
      ...toRefs(state),
      change,
      formatNow
    }
  }
}
</script>

<style scoped lang="less">
.video-content {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  margin-bottom: 54px;


  .video-item {
    width: 46%;
    background-color: #fff;
    overflow: hidden;
    margin-top: 2.5%;
    margin-bottom: 4px;
    margin-left: 2.5%;
    border: 1px solid #d7d7d7;
    position: relative;

    .item-cover {
      img {
        width: 100%;
        height: 120px;
        object-fit: cover;
      }
    }

    .duration {
      position: absolute;
      font-size: 12px;
      top: 92px;
      right: 6px;
      padding: 2px 6px;
      border-radius: 2px;
      background: rgba(0, 0, 0, .6);
      color: #fff;
    }

    .item-info {
      .info-title {
        padding: 0 4%;
        height: 40px;
        //padding-bottom: 6px;
        margin-top: 6px;
        line-height: 20px;
        overflow: hidden;
        display: -webkit-box;
        word-break: break-all;
        font-weight: 600;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        color: #323233;
      }

      .info-c {
        height: 20px;
        line-height: 20px;
        padding: 2% 4% 4%;
        color: #777;
        font-size: 12px;
      }
    }
  }
}

.pagination {
  width: 50%;
  margin: 4px 50%;
  transform: translate(-50%);
}
</style>