<template>
  <nav-common>我的上传</nav-common>
  <div style="min-height: 550px;">
    <div class="title">
      <span style="width: 40%">名称</span>
      <span style="width: 30%;padding-left: 10px">上传时间</span>
      <span style="width: 20%;text-align: center">操作</span>
    </div>
    <van-cell v-if="finished" style="padding: 10px 6px" v-for="i in list" :key="i.vid">
      <template #title>
        <div class="item">
          <div class="name">{{ i.title }}</div>
          <div class="time">{{ formatNow(i.created) }}</div>
          <div class="actions">
            <router-link :to="`/video/${i.title}?vid=${i.vid}`">
              <van-tag type="primary" size="medium">查看</van-tag>
            </router-link>
            <van-tag type="danger" size="medium" @click="delClick(i.vid)">删除</van-tag>
          </div>
        </div>
      </template>
    </van-cell>
    <van-dialog v-model:show="delShow" @confirm="confirmDel" title="确定要删除此视频吗?" show-cancel-button/>
    <van-loading v-if="!finished" color="#1989fa" style="text-align: center;margin-top: 100px"/>
    <van-empty v-if="showEmpty" image="/images/custom-empty-image.png" description="空空如也"/>
  </div>
  <div class="page" v-if="finished">
    <van-pagination v-if="total" v-model="currentPage" @change="pageChange" :total-items="total" :items-per-page="8"/>
  </div>
  <TabBar/>
</template>

<script>
import {onMounted, toRefs, reactive} from 'vue'
import {Toast} from 'vant'
import NavCommon from "@/components/NavCommon"
import Footer from "@/components/Footer"
import TabBar from "@/components/TabBar"
import {delVideo, uploadList} from "@/api"
import {formatNow} from "@/uitls"

export default {
  name: "MyUploads",
  components: {NavCommon, Footer, TabBar},
  setup() {
    const state = reactive({
      list: [],
      vid: '',
      finished: false,
      showEmpty: false,
      delShow: false,
      total: 0,
      currentPage: 1
    })
    onMounted(async () => {
      const {status, list, total, message} = await uploadList()
      if (status === 0) {
        state.list = list
        state.total = total
        state.showEmpty = !list.length
      } else {
        Toast.fail(message)
      }
      state.finished = true
    })
    // 显示删除框
    const delClick = vid => {
      state.delShow = true
      state.vid = vid
    }
    // 确认删除
    const confirmDel = async () => {
      const {status, message} = await delVideo({vid: state.vid})
      if (status === 0) {
        state.list = [...state.list.filter(item => {
          return state.vid !== item.vid
        })]
        state.total -= 1
        Toast.success(message)
      } else {
        Toast.fail(message)
      }
    }
    // 翻页
    const pageChange = async page => {
      state.finished = false
      const {status, list, message} = await uploadList(page)
      if (status === 0) {
        state.list = list
        state.finished = true
      } else {
        Toast.fail(message)
      }
    }
    return {
      ...toRefs(state),
      formatNow,
      delClick,
      confirmDel,
      pageChange
    }
  }
}
</script>

<style scoped lang="less">
.title {
  background-color: #fafafa;
  height: 55px;
  color: rgba(0, 0, 0, .85);
  display: flex;
  text-align: left;
  justify-content: space-around;

  span {
    padding: 16px;
  }
}

.item {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .name {
    width: 40%;
  }

  .time {
    width: 30%;
  }

  .actions {
    width: 20%;
    text-align: center;
  }
}

.page {
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 50px;
}
</style>