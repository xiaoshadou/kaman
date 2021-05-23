<template>
  <div>
    <nav-common>
      <template v-slot:default>登录</template>
    </nav-common>
    <div class="login-content">
      <van-form @submit="onSubmit" :disabled="finished">
        <van-field
            v-model="username"
            name="username"
            label="用户名"
            placeholder="用户名"
            clearable
            :rules="[nameRules]"
        />
        <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="密码"
            clearable
            :rules="[pwdRules]"
        />
        <div style="margin-top: 10px;">
          <van-button block type="primary" native-type="submit">
            确认
          </van-button>
          <van-button style="margin-top: 10px;" to="/forget" block type="default">
            忘记密码
          </van-button>
          <van-button style="margin-top: 10px;" to="/register" block type="default" >
            还没有账号?
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import NavCommon from "@/components/NavCommon"
import {reactive, toRefs} from "vue"
import {useRouter, useRoute} from 'vue-router'
import {Notify} from 'vant'
import {patternFn} from "@/uitls"
import {login} from "@/api"
import {useStore} from "vuex"

export default {
  name: "Login",
  components: {NavCommon},
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const state = reactive({
      username: '',
      password: '',
      nameRules: {
        required: true,
        message: '请填写用户名',
        validator: v => {
          return patternFn('namePattern', v, '用户名不合法')
        }
      },
      pwdRules: {
        required: true,
        message: '请填写密码',
        validator: v => {
          return patternFn('pwdPattern', v, '密码不合法')
        }
      },
      finished: false
    })
    const onSubmit = async values => {
      state.finished = true
      const {status, token, userinfo, message} = await login(values)
      if (status === 0) {
        localStorage.setItem('TOKEN', token)
        store.commit('updateUserInfo', userinfo)
        Notify({
          type: 'success', message, duration: 1500,
          onOpened: () => router.push(route.query.redirect ? route.query.redirect : '/')
        })
      } else {
        Notify({type: 'danger', message: String(message), duration: 1500})
      }
      state.finished = false
    }
    return {
      ...toRefs(state),
      onSubmit
    }
  }
}
</script>

<style scoped lang="less">
.login-content {
  padding: 10px;
}
</style>