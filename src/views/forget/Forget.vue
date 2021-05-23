<template>
  <nav-common>找回密码</nav-common>
  <div class="container">
    <h2 class="title">{{ title }}</h2>
    <van-field v-model="email"
               style="padding: 10px 0;border-bottom: 1px solid #ebebeb"
               placeholder="邮箱"
               :border="false">
      <template #extra>
        <span v-if="errShow" style="color: red">{{ errInfo }}</span>
      </template>
    </van-field>
    <van-field v-if="showCaptcha"
               v-model="captcha"
               style="padding: 10px 0;border-bottom: 1px solid #ebebeb"
               placeholder="验证码"
               center
               :border="false">
      <template #extra>
        <span style="color: red;padding-right: 4px;">{{ captchaErr }}</span>
        <van-button
            size="small"
            type="primary"
            :disabled="disabled"
            @click="getCaptcha">
          {{ captchaText }}
        </van-button>
      </template>
    </van-field>
    <van-button style="margin-top: 40px;" block type="primary" @click="clickNext">
      下一步
    </van-button>
  </div>
</template>

<script>
import {reactive, toRefs} from 'vue'
import {useRouter} from 'vue-router'
import NavCommon from "@/components/NavCommon"
import {emailIsExisted, resetCaptcha, resetPwd} from "@/api"

export default {
  name: "Forget",
  components: {NavCommon},
  setup() {
    const router = useRouter()
    const state = reactive({
      title: '验证码将会发送至你的注册邮箱',
      model: 1,
      email: '',
      captcha: '',
      captchaText: '获取验证码',
      disabled: false,
      showCaptcha: false,
      errShow: false,
      errInfo: '',
      captchaErr: ''
    })
    const clickNext = async () => {
      if (!state.email.trim()) return
      if (state.model === 1) {
        const {status, message} = await emailIsExisted(state.email)
        if (status === 0) {
          state.model = 2
          state.showCaptcha = true
          state.errShow = false
        } else {
          state.showCaptcha = false
          state.errShow = true
          state.errInfo = message
        }
      } else {
        if (!state.captcha.trim()) return
        const {status, message} = await resetPwd(state.email, state.captcha)
        if (status === 0) {
          state.captchaErr = ''
          router.replace('/reset?t=' + Date.now())
        } else {
          state.captchaErr = message
        }
      }
    }
    const getCaptcha = async () => {
      let num = 60, timer
      state.disabled = true
      timer = setInterval(() => {
        num--
        state.captchaText = `${num} 秒后重试`
        if (num === 0) {
          clearInterval(timer)
          state.captchaText = '获取验证码'
          state.disabled = false
        }
      }, 1000)
      const {status, message} = await resetCaptcha(state.email)
      if (status !== 0) {
        state.errShow = true
        state.errInfo = message
      } else {
        state.errShow = false
        state.title = '验证码已发送至你的邮箱'
      }
    }

    return {
      ...toRefs(state),
      clickNext,
      getCaptcha
    }
  }
}
</script>

<style scoped>
.container {
  padding: 16px;
  background-color: #fff;
}

.title {
  margin: 4px 0 40px;
  font-size: 15px;
  font-weight: 400;
  color: #8590a6;
}
</style>