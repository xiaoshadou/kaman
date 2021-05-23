<template>
  <div class="title">
    <span class="back" @click="$router.back()"><van-icon name="arrow-left" size="20"/></span>
    <span :class="online.includes(Number(toUid))?'name online': 'name'">{{ name }}</span>
    <span class="right"/>
  </div>
  <van-pull-refresh v-model="loading" @refresh="onRefresh">
    <div class="container">
      <div v-for="i in chatList" :key="i.id">
        <div v-if="i.show_stamp" class="time-stamp">{{ formatNow(i.time) }}</div>
        <div :class="i.uid==uid?'item-me':'item'" :style="{textAlign: i.uid==uid?'right':'left'}">
          <img class="avatar" :src="i.uid==uid?avatar:i.myAvatar?i.myAvatar:i.avatar" alt="">
          <span v-if="i.type===1" v-html="i.message"></span>
          <div class="img-wrapper" v-if="i.type===2"
               :style="{float: i.uid==uid?'right':'left'}">
            <van-image-preview
                v-model:show="imgShow"
                :images="images"
                :start-position="index"
                :loop="false"
            />
            <van-image
                :class="'t'+i.time + ' images'"
                fit="cover"
                lazy-load
                :src="i.message"
                :icon-size="36"
                @click="clickImage(i)"
                @error="imgLoadingError(i)"
            />
          </div>
          <span v-if="i.type===0">{{ i.message }}</span>
        </div>
      </div>
    </div>
  </van-pull-refresh>
  <div class="input">
    <div class="icon">
      <span class="emoji" @click="showEmoji"><van-icon name="smile-o" size="21"/></span>
      <van-popover v-model:show="showPopover" close-on-click-outside placement="top-start" :offset="[-37,10]">
        <van-grid
            square
            clickable
            icon-size="22"
            column-num="9"
            style="width: 280px;height:94px;overflow-y: auto"
        >
          <van-grid-item
              v-for="i in faceList"
              :key="i.url"
              :icon="i.url"
              @click="clickFace(i)"
          />
        </van-grid>
      </van-popover>
      <span class="img">
         <van-uploader
             accept="image/gif,image/jpeg,image/jpg,image/png"
             :preview-image="false"
             :max-count="1"
             :before-read="beforeRead"
             :after-read="afterRead">
           <van-icon name="photo-o" size="21"/>
        </van-uploader>
      </span>
    </div>
    <van-field
        v-model="message"
        rows="1"
        type="textarea"
    >
      <template #button>
        <button class="send" @click="sendMsg">发送</button>
      </template>
    </van-field>
  </div>
</template>

<script>
import {onMounted, toRefs, reactive, onUnmounted} from 'vue'
import {useStore} from 'vuex'
import {useRoute, useRouter} from 'vue-router'
import {Notify, Toast} from 'vant'
import io from 'socket.io-client'
import * as imageConversion from 'image-conversion'
import {getChat, getChatFace, me} from "@/api"
import {calculate, formatNow} from '@/uitls'

export default {
  name: "Chat",
  setup() {
    const {uid, avatar} = useStore().state
    const {uid: toUid, name} = useRoute().query
    const router = useRouter()
    const state = reactive({
      room: '',      // 聊天房间号，两人公用一个
      chatList: [],
      type: 0,       // 聊天类型 0为文本、1为表情、2为图片
      uid,           // 当前用户
      toUid,         // 和谁聊天
      name,          // 对方昵称
      avatar,        // 自己头像
      message: '',   // 聊天框内容
      now: 0,        // 最后一条消息时间戳
      page: 2,       // 获取第几页聊天记录
      loading: false,// 上拉显示刷新
      showPopover: false, // 显示表情
      faceList: [],
      fileExt: '',    // 图片文件后缀名
      online: [],     // 在线用户列表
      imgShow: false, // 显示图片预览
      index: 0,       // 图片预览的下标
      images: []      // 聊天图片列表
    })
    const socket = io('http://47.100.242.91:3001')
    // const socket = io('http://localhost:3001')
    onMounted(async () => {
      // 防止自己与自己聊天
      if (uid == toUid) return router.replace('/profile')
      if (!uid) {
        const {status, userinfo, message} = await me()
        if (status === 0) {
          const {uid, avatar} = userinfo
          state.uid = uid
          if (uid == toUid) return router.replace('/profile')
          state.avatar = avatar
        } else {
          Notify({
            type: 'danger', message, onOpened: () => router.replace('/login')
          })
          localStorage.removeItem('TOKEN')
        }
      }
      state.room = state.uid * toUid
      const {status, chatList, message} = await getChat({room: state.room})
      if (status === 0) {
        state.chatList = chatList
        let images = []
        // 聊天的所有图片添加到数组里面
        chatList.forEach(item => {
          if (item.type === 2) {
            images.push(item.message)
          }
        })
        state.images = images
        state.now = [...chatList].pop()?.time || 0
      } else {
        Notify.fail(message)
      }
      // 加入房间
      socket.emit('joinRoom', {room: state.room, uid: state.uid})
      // 获取当前在线用户
      socket.on('online', list => {
        state.online = list
      })
      // 收到消息 更新聊天记录列表
      socket.on('receiveMsg', (data) => {
        state.chatList = [...state.chatList, data]
        // 更新图片预览列表
        if (data.type === 2) {
          state.images.push(data.message)
        }
        scroll()
      })
      scroll()
    })
    onUnmounted(() => {
      socket.emit('leaveRoom')
    })
    const sendMsg = () => {
      if (!state.message.trim() || state.message.length > 100) return
      // 对输入内容进行转义
      const entry = {'<': '&lt', '>': '&gt', '&': '&amp'}
      state.message = state.message.replace(/[<>&]/g, match => {
        return entry[match]
      })
      // 判断消息中是否含有表情
      state.faceList.forEach(item => {
        if (new RegExp('\\' + item.value, 'g').test(state.message)) {
          state.type = 1
          // 表情替换成图片
          state.message = state.message.replace(new RegExp('\\' + item.value, 'g'), `<img width="22" src=${item.url} alt=${item.value}>`)
        }
      })
      const info = {
        type: state.type,
        uid: state.uid,
        myAvatar: state.avatar,
        toUid,
        message: state.message,
        room: state.room,
        show_stamp: Date.now() - state.now > 300000,  // 超过五分钟显示时间戳
        time: Date.now()
      }
      socket.emit('sendMsg', info)
      state.message = ''
      state.type = 0
      // 更新当前时间戳
      state.now = Date.now()
      // 聊天消息滚到最下面
      scroll()
    }
    // 上拉显示更多记录
    const onRefresh = async () => {
      const {status, chatList, message} = await getChat({room: state.room, page: state.page++})
      if (status === 0) {
        state.chatList = [...chatList, ...state.chatList]
        chatList.reverse().forEach(item => {
          if (item.type === 2) {
            state.images.unshift(item.message)
          }
        })
        state.loading = false
      } else {
        Notify.fail(message)
      }
    }
    // 获取表情
    const showEmoji = async () => {
      // 避免重复请求
      if (!state.faceList.length) {
        const {status, data} = await getChatFace()
        if (status === 0) {
          state.faceList = data
        }
      }
      state.showPopover = true
    }
    const clickFace = item => {
      state.message = state.message + item.value
    }
    const beforeRead = file => {
      if (!['image/gif', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        return Toast.fail('only send image')
      }
      state.fileExt = file.name.split('.').pop()
      const size = file.size / 1024 / 1024
      if (size > 4) return Toast.fail('只能发送小于4兆的图片哦')
      return new Promise((resolve, reject) => {
        calculate(file, md5 => {
          state.md5 = md5
          if (size < 0.5 || file.type === 'image/gif') {
            resolve(file)
          } else {
            imageConversion.compress(file, 0.5).then(res => {
              resolve(res)
            })
          }
        })
      })
    }
    const afterRead = file => {
      const info = {
        type: 2,
        md5: state.md5,
        uid: state.uid,
        myAvatar: state.avatar,
        toUid,
        message: file.content,
        fileExt: state.fileExt,
        room: state.room,
        show_stamp: Date.now() - state.now > 300000,  // 超过五分钟显示时间戳
        time: Date.now()
      }
      socket.emit('sendMsg', info)
      state.now = Date.now()
      // 聊天消息滚到最下面
      scroll()
    }
    const clickImage = i => {
      state.imgShow = true
      // 获取当前点击图片下标
      state.index = state.images.indexOf(i.message)
    }
    // 图片加载失败的样式
    const imgLoadingError = e => {
      const img = document.querySelector('.t' + e.time)
      img.style.padding = '0 20px'
    }

    function scroll() {
      setTimeout(() => {
        window.scrollTo({
          top: 99999,
          behavior: "smooth"
        })
      }, 300)
    }

    return {
      ...toRefs(state),
      formatNow,
      sendMsg,
      onRefresh,
      showEmoji,
      clickFace,
      beforeRead,
      afterRead,
      clickImage,
      imgLoadingError
    }
  }
}
</script>

<style scoped lang="less">
//::v-deep(.van-image__error) {
//  //position: relative;
//  //background-color: rgba(0, 0, 0, 0);
//}

.images {
  ::v-deep(.van-image__img) {
    width: 70%;
    height: 70%;
    display: inline-block;
  }

  ::v-deep(.van-image__loading) {
    position: relative;
    top: -32px;
  }
}

.title {
  display: flex;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 9;
  justify-content: space-between;
  height: 49px;
  line-height: 49px;
  border-bottom: 1px solid #e7e7e7;
  background-color: #f5f5f5;

  .back, .right {
    width: 50px;
    text-align: center;
    padding-top: 2px;
  }

  .name {
    font-size: 18px;
    color: #333;
    position: relative;
  }

  .name::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    top: 50%;
    right: -12px;
    transform: translate(0, -50%);
    border-radius: 50%;
    background-color: rgba(173, 173, 173);
  }

  .online::after {
    background-color: rgba(9, 241, 117);
  }
}

.container {
  min-height: 500px;
  margin-top: 50px;
  margin-bottom: 100px;
  text-align: center;
  padding: 10px;

  .item {
    .avatar {
      float: left;
      width: 36px;
      height: 36px;
      border-radius: 2px;
      vertical-align: middle;
    }

    span {
      background: #fff;
      padding: 8px 10px;
      border-radius: 4px;
      float: left;
      margin: 0 10px;
      max-width: 66%;
      border: 1px solid #ededed;
      position: relative;
      word-break: break-all;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
    }

    span::before {
      content: "";
      position: absolute;
      top: 10px;
      right: 100%;
      border: 6px solid transparent;
      border-right-color: #fff;
    }
  }

  .item-me {

    .avatar {
      float: right;
      width: 36px;
      height: 36px;
      border-radius: 2px;
      vertical-align: middle;
      object-fit: cover;
    }

    span {
      background: rgba(158, 234, 106);
      padding: 8px 10px;
      border-radius: 4px;
      margin: 0 10px;
      max-width: 66%;
      border: 1px solid rgba(158, 234, 106);
      position: relative;
      float: right;
      word-break: break-all;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
    }

    span::before {
      content: " ";
      position: absolute;
      top: 9px;
      right: 100%;
      border: 6px solid transparent;
      border-left-color: #9eea6a;
      left: 100%;
    }
  }

  .item, .item-me {
    text-align: left;
    margin-top: 10px;
    overflow: hidden;
    margin-bottom: 5px;
    font-size: 14px;
  }

  .img-wrapper {
    max-width: 200px;
    padding: 0 10px;

    .images {
      img {
        width: 50%;
      }
    }
  }

  .time-stamp {
    display: inline-block;
    background-color: rgb(218, 218, 218);
    margin-top: 5px;
    color: #fff;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 12px;
  }
}

.input {
  position: fixed;
  width: 100%;
  bottom: 0;
  border-top: 1px solid #ececec;
  height: 99px;
  background-color: #fff;

  .icon {
    display: flex;
    height: 28px;

    .emoji {
      margin-top: 8px;
      margin-left: 14px;
      width: 30px;
    }

    .img {
      margin-top: 8px;
    }
  }

  .send {
    border: 1px solid #e5e5e5;
    color: #666;
    padding: 0 8px;
    outline: 0;
    height: 26px;
    margin-top: 20px;
  }
}
</style>