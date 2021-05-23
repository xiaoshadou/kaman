<template>
  <nav-common>重置密码</nav-common>
  <van-form @submit="onSubmit" :disabled="finished" style="padding: 8px">
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
    <div style="margin-top: 10px;">
      <van-button block type="primary" native-type="submit">
        确认
      </van-button>
    </div>
  </van-form>
</template>

<script>
import {reactive, toRefs} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {Notify, Toast} from 'vant'
import NavCommon from "@/components/NavCommon"
import {patternFn} from "@/uitls"
import {reset} from '@/api'

export default {
  name: "Reset",
  components: {NavCommon},
  setup() {
    const router = useRouter()
    const {t} = useRoute().query
    if (!t) {
      router.replace('/forget')
    }
    const state = reactive({
      password: '',
      confirmPwd: '',
      finished: false,
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
      }
    })
    const onSubmit = async v => {
      const {status, message} = await reset(v)
      if (status === 0) {
        Notify({
          type: 'success', message, onOpened: () => {
            router.replace('/login')
          }
        })
      } else if (status === 1) {
        Toast.fail(message)
      } else {
        Notify({
          type: 'danger', message, onOpened: () => {
            router.replace('/forget')
          }
        })
      }
    }
    return {
      ...toRefs(state),
      onSubmit
    }
  }
}
</script>

<style scoped>

</style>