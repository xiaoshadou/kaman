<template>
  <nav-common>用户管理</nav-common>
  <van-cell v-if="finished" style="padding: 10px 6px" v-for="i in list" :key="i.uid">
    <template #title>
      <div class="item">
        <div>{{ i.uid }}</div>
        <div>{{ i.nickname }}</div>
        <div>{{ formatNow(i.created) }}</div>
        <div>{{ i.role }}</div>
        <div>{{ i.EXP }}</div>
        <div>
          <van-tag type="primary" size="medium" @click="onEdit(i)">编辑</van-tag>
        </div>
      </div>
    </template>
  </van-cell>
  <van-dialog v-model:show="showEdit" title="编辑" show-cancel-button @confirm="onSubmit">
    <van-form label-align="center" colon>
      <van-field v-model="user.uid" label="uid" name="uid"/>
      <van-field v-model="user.nickname" label="nickname" name="nickname"/>
      <van-field v-model="user.role" label="role" name="role"/>
      <van-field v-model="user.avatar" label="avatar" name="avatar"/>
      <van-field v-model="user.bgc" label="bgc" name="bgc"/>
      <van-field v-model="user.email" label="email" name="email"/>
      <van-field v-model="user.gender" label="gender" name="gender"/>
      <van-field v-model="user.created" label="created" name="created"/>
      <van-field v-model="user.EXP" label="EXP" name="EXP"/>
    </van-form>
  </van-dialog>
  <van-loading v-if="!finished" color="#1989fa" style="text-align: center;padding-top: 100px"/>
  <div class="page" v-if="finished">
    <van-pagination v-if="total" v-model="currentPage" @change="pageChange" :total-items="total" :items-per-page="6"/>
  </div>
  <TabBar/>
</template>
<script>
import {reactive, toRefs, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {Toast} from "vant"
import NavCommon from "@/components/NavCommon"
import TabBar from "@/components/TabBar"
import {getUsers, getVideos, updateUserInfo} from "@/api"
import {formatNow, redirectProfile} from '@/uitls'

export default {
  name: "ManageUsers",
  components: {NavCommon, TabBar},
  setup() {
    const router = useRouter()
    const state = reactive({
      list: [],
      total: 0,
      finished: false,
      showEdit: false,
      user: {},
      currentPage: 1
    })
    onMounted(async () => {
      const {status, list, message, total} = await getUsers()
      if (status === 0) {
        state.list = list
        state.total = total
        state.finished = true
      } else {
        redirectProfile(message, router)
      }
    })
    // 点击编辑按钮
    const onEdit = i => {
      state.showEdit = true
      state.user = i
    }
    const onSubmit = async () => {
      const {status, message} = await updateUserInfo(state.user)
      if (status === 0) {
        state.list = [...state.list].map(item => {
          return item.uid === state.user.uid ? {...item, ...state.user} : {...item}
        })
        Toast.success(message)
      } else {
        Toast.fail(message)
      }
    }
    const pageChange = async page => {
      state.finished = false
      const {status, list, message} = await getVideos(page)
      if (status === 0) {
        state.list = list
        state.finished = true
      } else {
        redirectProfile(message, router)
      }
    }

    return {
      ...toRefs(state),
      formatNow,
      onEdit,
      onSubmit,
      pageChange
    }
  }
}
</script>

<style scoped lang="less">
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: center;

  div {
    flex: 1;
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
