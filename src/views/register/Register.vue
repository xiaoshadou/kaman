<template>
  <div>
    <nav-common>
      <template v-slot:default>注册</template>
    </nav-common>
    <div class="reg-content">
      <van-form @submit="onSubmit" :disabled="finished">
        <van-field
            v-model="username"
            name="username"
            label="用户名"
            placeholder="支持中文、英文、数字包括下划线"
            clearable
            :rules="[nameRules]"
        />
        <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="必须包含数字和字母"
            clearable
            :rules="[pwdRules]"
        />
        <van-field
            v-model="confirmPwd"
            type="password"
            name="confirmPwd"
            label="确认密码"
            placeholder="再次输入密码"
            clearable
            :rules="[confirmPwdRules]"
        />
        <van-field
            v-model="email"
            type="email"
            name="email"
            label="邮箱"
            placeholder="这将用于找回你的密码"
            clearable
            :rules="[emailRules]"
        />
        <van-field
            v-model="captcha"
            name="captcha"
            center
            clearable
            label="验证码"
            placeholder="验证码"
            :rules="[{required: true,message:'请输入验证码'}]"
        >
          <template #button>
            <van-button size="small" type="primary" v-if="btnShow" @click="()=>{getCaptcha();btnShow=false}">获取验证码
            </van-button>
            <div v-html="svg" @click="finished?'':getCaptcha()"></div>
          </template>
        </van-field>
        <div style="margin-top: 10px;">
          <van-button block type="primary" native-type="submit">
            确认
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import NavCommon from "@/components/NavCommon"
import {reactive, toRefs} from "vue"
import {useRouter} from "vue-router"
import {Notify} from 'vant'
import {patternFn} from "@/uitls"
import {regCaptcha, register} from "@/api"

export default {
  name: "Register",
  components: {NavCommon},
  setup() {
    const state = reactive({
      username: '',
      password: '',
      confirmPwd: '',
      email: '',
      captcha: '',
      btnShow: true,
      svg: '',
      finished: false,
      nameRules: {
        required: true,
        message: '请输入用户名',
        validator: v => {
          return patternFn('namePattern', v, '用户名不合法')
        }
      },
      pwdRules: {
        required: true,
        message: '请输入密码',
        validator: v => {
          return patternFn('pwdPattern', v, '密码不合法')
        }
      },
      confirmPwdRules: {
        required: true,
        message: '请再次输入密码',
        validator: v => {
          if (state.password !== state.confirmPwd) {
            return '密码不一致'
          }
        }
      },
      emailRules: {
        required: true,
        message: '请输入邮箱',
      },
    })
    const router = useRouter()
    const getCaptcha = async () => {
      const res = await regCaptcha()
      if (res.status === 1) {
        state.svg = '<span style="color: red">获取验证码失败</span>'
      } else {
        state.svg = res
      }
    }
    const onSubmit = async values => {
      state.finished = true
      const {status, message} = await register(values)
      if (status === 0) {
        Notify({
          type: 'success', message, duration: 1500,
          onOpened: () => {
            router.push('/login')
          }
        })
      } else {
        Notify({type: 'danger', message: String(message), duration: 1500})
      }
      state.finished = false
    }

    return {
      ...toRefs(state),
      onSubmit,
      getCaptcha
    }
  },

}
</script>

<style scoped lang="less">
.reg-content {
  padding: 10px;
}
</style>