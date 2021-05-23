<template>
  <div class="content-header" @click.stop="bgcShow=true"
       :style="{background: `url(${bgc}) no-repeat`,backgroundSize: 'cover'}">
    <div style="height: 26px;"/>
    <div class="avatar-img">
      <van-image
          @click.stop="avatarShow=true"
          round
          fit="cover"
          width="80"
          height="80"
          :src="avatar"
      >
        <span @click.stop="show=true">修改头像</span>
      </van-image>
    </div>
    <div class="nickname">
      {{ nickname }}
    </div>
  </div>
  <van-dialog v-model:show="show"
              @confirm="confirm"
              @cancel="fileList=[]"
              title="修改头像"
              show-cancel-button>
    <div class="upload-container">
      <van-uploader v-model="fileList"
                    :max-count="1"
                    :before-read="beforeRead"
                    :after-read="afterRead"/>
    </div>
  </van-dialog>
  <van-image-preview v-model:show="avatarShow" :images="[avatar]"/>
  <van-action-sheet
      v-model:show="bgcShow"
      cancel-text="取消"
      :round="false"
      duration="0"
      close-on-click-action>
    <div class="upload-container">
      <van-uploader :max-count="1"
                    :max-size="10 * 1024 * 1024"
                    @oversize="onOversize"
                    :before-read="bgcBeforeRead"
                    :after-read="bgcAfterRead">
        <div style="padding: 10px 16px">修改背景图片</div>
      </van-uploader>
    </div>
  </van-action-sheet>
</template>

<script>
import {onMounted, reactive, toRefs} from 'vue'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'
import {Notify, Toast} from 'vant'
import * as imageConversion from 'image-conversion'
import {me, uploadAvatar, setAvatar, uploadBgc} from "@/api"
import {calculate} from "@/uitls"

export default {
  name: "Avatar",
  setup() {
    const store = useStore()
    const {uid, avatar, bgc, nickname} = store.state
    const router = useRouter()
    const state = reactive({
      avatar,
      nickname,
      bgc,
      show: false,   // 头像上传框是否显示
      avatarShow: false,  // 头像大图
      avatarMd5: '',
      bgcMd5: '',
      fileList: [],
      bgcShow: false
    })
    onMounted(async () => {
      if (!uid) {
        const {status, userinfo, message} = await me()
        if (status === 0) {
          const {avatar, bgc, nickname} = userinfo
          state.avatar = avatar
          state.bgc = bgc
          state.nickname = nickname
          store.commit('updateUserInfo', userinfo)
        } else {
          Notify({
            type: 'warning', message, onOpened: () => router.replace('/login')
          })
          localStorage.removeItem('TOKEN')
        }
      }
    })

    // 对头像上传前进行处理
    const beforeRead = file => {
      if (['image/jpeg', 'image/gif', 'image/png'].includes(file.type)) {
        if (file.size / 1024 / 1024 > 3) {
          Toast('图片大小不能超过3M')
          state.fileList = []
          return false
        }
      } else {
        Toast('请上传 jpg/gif 格式图片')
        state.fileList = []
        return false
      }
      calculate(file, md5 => {
        state.avatarMd5 = md5
      })
      return true
    }

    const afterRead = async file => {
      file.status = 'uploading'
      file.message = '上传中...'
      const {status, message} = await uploadAvatar(file, state.avatarMd5)
      if (status === 0) {
        file.status = 'done'
        file.message = '上传成功'
      } else {
        Toast(message)
        file.status = 'failed'
        file.message = '上传失败'
      }
    }

    // 确认修改头像
    const confirm = async () => {
      if (state.fileList.length) {
        const {status, message, avatar} = await setAvatar()
        if (status === 0) {
          state.avatar = avatar
          store.state.avatar = avatar
        }
        Toast(message)
      } else {
        Toast('还没有上传照片')
      }
      state.fileList = []
    }
    // 父组件调用修改当前昵称
    const nameChange = name => {
      state.nickname = name
    }
    const onOversize = file => {
      Toast('背景图片不能超过10M')
    }
    // 上传背景图片前进行处理
    const bgcBeforeRead = file => {
      if (file.type !== 'image/jpeg') {
        Toast('请上传 jpg 格式图片')
        return false
      }
      Toast.loading({message: '上传中...', forbidClick: true})
      return new Promise(async (resolve, reject) => {
        calculate(file, md5 => {
          state.bgcMd5 = md5
          let fileSize = file.size / 1024 / 1024
          if (fileSize < 0.5) {
            resolve(file)
          } else {
            const arg = fileSize > 5 ? 0.1 : 0.5
            imageConversion.compress(file, arg).then(res => {
              resolve(res)
              let reader = new FileReader()
              reader.readAsDataURL(res)
              reader.onload = function (e) {
                state.bgc = e.target.result
              }
            })
          }
        })
      })
    }
    // 修改背景图片
    const bgcAfterRead = async file => {
      state.bgcShow = false
      const {status, message, bgc} = await uploadBgc(file, state.bgcMd5)
      if (status === 0) {
        Toast.clear()
        state.bgc = bgc
        store.state.bgc = bgc
        Toast.success(message)
      } else {
        Toast.clear()
        Toast.fail(message)
      }
    }

    return {
      ...toRefs(state),
      beforeRead,
      afterRead,
      onOversize,
      confirm,
      nameChange,
      bgcBeforeRead,
      bgcAfterRead
    }
  }
}
</script>

<style scoped lang="less">
.content-header {
  position: relative;
  height: 176px;
  display: flex;
  flex-direction: column;
  text-align: center;

  .avatar-img {
    position: relative;
    overflow: hidden;

    span {
      position: absolute;
      bottom: 0;
      left: 0;
      display: block;
      width: 100%;
      padding: 1px 0 8px 1px;
      text-align: center;
      background: rgba(0, 0, 0, .3);
      color: #eee;
      font-size: 12px;
      letter-spacing: 1px;
    }
  }

  .nickname {
    color: #fff;
    text-shadow: 1px 1px 1px #000;
  }
}

.upload-container {
  margin: 10px 20px;
  text-align: center;
}
</style>