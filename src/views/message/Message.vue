<template>
  <nav-common>消息中心</nav-common>
  <div class="message-menu">
    <router-link to="/message/reply">
      <div class="menu-item">
        <van-badge :content="reply?reply:''" max="99" :offset="[-10, 0]">
          <span><van-icon name="chat" size="30" color="#87d068"/></span>
        </van-badge>
        <span class="text">回复我的</span>
      </div>
    </router-link>
    <router-link to="/message/likes">
      <div class="menu-item">
        <van-badge :content="likes?likes:''" max="99" :offset="[-10, 0]">
          <span><van-icon name="good-job" size="30" color="#f50"/></span>
        </van-badge>
        <span class="text">收到的赞</span>
      </div>
    </router-link>
    <router-link to="/message/notices">
      <div class="menu-item">
        <van-badge :content="notices?notices:''" max="99" :offset="[-10, 0]">
          <span><van-icon name="volume" size="30" color="#2db7f5"/></span>
        </van-badge>
        <span class="text">系统通知</span>
      </div>
    </router-link>
  </div>
  <div class="chat-list">
    <div class="chat-title">聊天列表</div>
    <div class="chat-body">
      <van-swipe-cell v-for="i in chatList" :key="i.last_time">
        <van-cell center :to="{path: '/chat', query: {uid: i.cur_uid, name: i.nickname}}">
          <template #title>
            <div style="display: flex">
              <van-image
                  round
                  fit="cover"
                  width="48"
                  height="48"
                  :src="i.avatar"
              />
              <div class="name-content">
                <div style="display:flex;justify-content: space-between">
                  <span class="name">{{ i.nickname }}</span>
                  <span class="time">{{ formatNow(i.last_time) }}</span>
                </div>
                <span class="content" v-if="i.type===1" v-html="i.last_content"/>
                <span class="content" v-if="i.type===2">[图片]</span>
                <span class="content" v-if="i.type===0">{{ i.last_content }}</span>
              </div>
            </div>
          </template>
        </van-cell>
        <template #right>
          <van-button square @click="del(i.last_time)" type="danger" text="删除" style="height: 100%"/>
        </template>
      </van-swipe-cell>
    </div>
  </div>
  <Footer/>
  <TabBar active="message"/>
</template>

<script>
import {onMounted, reactive, toRefs} from "vue"
import NavCommon from "@/components/NavCommon"
import {delChat, getChatList, getMeg} from "@/api"
import {formatNow} from '@/uitls'
import Footer from "@/components/Footer"
import TabBar from "@/components/TabBar"

export default {
  name: "Message",
  components: {NavCommon, Footer,TabBar},
  setup() {
    const state = reactive({
      reply: '',
      likes: '',
      notices: '',
      chatList: []
    })
    onMounted(async () => {
      const {status, reply, likes, notices} = await getMeg()
      if (status === 0) {
        state.reply = reply
        state.likes = likes
        state.notices = notices
      }
      const {chatList} = await getChatList()
      state.chatList = chatList
    })
    const del = async id => {
      const {status} = await delChat(id)
      if (status === 0) {
        state.chatList = [...state.chatList].filter(item => {
          return item.last_time !== id
        })
      }
    }
    return {
      ...toRefs(state),
      formatNow,
      del
    }
  }
}
</script>

<style scoped lang="less">
.message-menu {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  padding: 18px 16px;

  .menu-item {
    display: flex;
    flex-direction: column;
    text-align: center;

    .text {
      color: #99a2aa;
      font-size: 14px;
    }
  }
}

.chat-list {
  padding-top: 8px;

  .chat-title {
    background-color: #fff;
    height: 40px;
    line-height: 40px;
    padding-left: 16px;
    border-bottom: 1px solid #f2f2f2;
    color: rgba(0, 0, 0, .65);
  }

  .chat-body {
    min-height: 476px;
    background-color: #fff;
    overflow-y: scroll;
    .name-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-left: 8px;

      .name {
        font-size: 15px;
        font-weight: 700;
      }

      .content {
        font-size: 14px;
        color: rgba(0, 0, 0, .65);
        padding-left: 2px;
        width: 286px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }

    .time {
      color: #969799;
      font-size: 12px;
    }

    .empty {
      text-align: center;
    }
  }
}

</style>