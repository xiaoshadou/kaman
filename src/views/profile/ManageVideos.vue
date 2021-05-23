<template>
  <nav-common>视频管理
    <template #right>
      <router-link to="/manage/review"><span style="color:#fff">审核</span></router-link>
    </template>
  </nav-common>
  <van-cell v-if="finished" style="padding: 10px 6px" v-for="i in list" :key="i.id">
    <template #title>
      <div class="item">
        <div class="title">{{ i.title }}</div>
        <div class="author">{{ i.nickname }}</div>
        <div class="time">{{ formatNow(i.created) }}</div>
        <div class="desc">{{ i.desc }}</div>
        <div class="size">{{ i.size }}</div>
        <div class="views">{{ i.views }}</div>
        <div class="show">{{ i.show }}</div>
        <div class="actions">
          <van-tag type="primary" size="medium" @click="onEdit(i)">编辑</van-tag>
        </div>
      </div>
    </template>
  </van-cell>
  <van-dialog v-model:show="showEdit" title="编辑" show-cancel-button @confirm="onSubmit">
    <van-form label-align="center" colon>
      <van-field v-model="video.title" label="title" name="title"/>
      <van-field v-model="video.author" label="作者" name="author"/>
      <van-field v-model="video.created" label="上传时间" name="created"/>
      <van-field v-model="video.desc" label="简介" name="desc"/>
      <van-field v-model="video.size" label="大小" name="size"/>
      <van-field v-model="video.views" label="浏览" name="views"/>
      <van-field v-model="video.show" label="show" name="show"/>
    </van-form>
  </van-dialog>
  <van-loading v-if="!finished" color="#1989fa" style="text-align: center;padding-top: 100px"/>
  <div class="page" v-if="finished">
    <van-pagination v-if="total" v-model="currentPage" @change="pageChange" :total-items="total" :items-per-page="6"/>
  </div>
  <TabBar/>
</template>

<script>
import {onMounted, reactive, toRefs} from 'vue'
import {useRouter} from 'vue-router'
import {Notify, Toast} from 'vant'
import NavCommon from "@/components/NavCommon"
import TabBar from "@/components/TabBar"
import {getVideos, updateVideo} from "@/api"
import {formatNow} from '@/uitls'

export default {
  name: "Manage",
  components: {NavCommon, TabBar},
  setup() {
    const router = useRouter()
    const state = reactive({
      list: [],
      video: {},
      total: 0,
      showEdit: false,
      finished: false,
      currentPage: 1
    })
    onMounted(async () => {
      const {status, list, total, message} = await getVideos()
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
    // 点击编辑按钮
    const onEdit = i => {
      state.showEdit = true
      state.video = {
        vid: i.vid,
        title: i.title,
        author: i.nickname,
        created: i.created,
        desc: i.desc,
        size: i.size,
        views: i.views,
        show: i.show
      }
    }
    // 翻页
    const pageChange = async page => {
      state.finished = false
      const {status, list, message} = await getVideos(page)
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
    // 修改视频信息
    const onSubmit = async () => {
      const {status, message} = await updateVideo(state.video)
      if (status === 0) {
        state.list = [...state.list].map(item => {
          if (item.vid === state.video.vid) {
            return {
              ...item,
              ...state.video
            }
          } else return {...item}
        })
        Toast.success(message)
      } else {
        Toast.fail(message)
      }
    }
    return {
      ...toRefs(state),
      formatNow,
      onEdit,
      pageChange,
      onSubmit
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

  .author, .time, .views {
    width: 10%;
  }

  .desc {
    width: 15%;
    word-break: break-all;
  }

  .show {
    width: 5%;
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