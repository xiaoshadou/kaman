<template>
  <nav-common>我的资料</nav-common>
  <Avatar :bgc="true" ref="setChildrenName"/>
  <van-cell @click="nameShow=true" title="用户名" :value="nickname" is-link/>
  <van-cell @click="pwdShow=true" title="密码" clickable value="修改" is-link/>
  <van-cell @click="sexShow=true" title="性别" :value=" gender === -1 ? '保密' : gender === 0 ? '女' : '男'" is-link/>
  <van-cell title="我的等级">
    <i class="level" :style="{backgroundPosition: formatLevel(EXP).split(';')[0]}"></i><span> ({{
      EXP
    }}/{{ formatLevel(EXP).split(';')[1] }})</span>
  </van-cell>
  <van-action-sheet
      v-model:show="sexShow"
      :actions="actions"
      cancel-text="取消"
      close-on-click-action
      @select="onSelect"
  />
  <van-dialog v-model:show="nameShow" @confirm="nameConfirm" @cancel="username=''" show-cancel-button>
    <div class="set-name">
      <van-field
          v-model="username"
          required
          placeholder="3-10字符"
      />
    </div>
  </van-dialog>
  <van-dialog v-model:show="pwdShow" @confirm="pwdConfirm" @cancel="password=''" show-cancel-button>
    <div class="set-pwd">
      <van-field
          v-model="password"
          required
          type="password"
          placeholder="4-16字符"
      />
    </div>
  </van-dialog>
</template>

<script>
import {onMounted, reactive, toRefs, ref} from 'vue'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'
import {Notify, Toast} from "vant"
import NavCommon from "@/components/NavCommon"
import Avatar from "@/views/profile/Avatar"
import {me, setName, setPwd, setSex} from "@/api"
import {formatLevel, pattern} from '@/uitls'

export default {
  name: "People",
  components: {NavCommon, Avatar},
  setup() {
    const router = useRouter()
    const store = useStore()
    const {nickname, gender, EXP} = store.state
    const state = reactive({
      nickname,
      gender,
      EXP,
      sexShow: false,
      username: '',
      nameShow: false,
      pwdShow: false,
      password: ''
    })
    const actions = [
      {name: '男'},
      {name: '女'},
      {name: '保密'},
    ]
    // 修改子组件(Avatar)中的昵称
    const setChildrenName = ref()

    onMounted(async () => {
      const {status, userinfo, message} = await me()
      if (status === 0) {
        const {nickname, gender, EXP} = userinfo
        state.nickname = nickname
        state.gender = gender
        state.EXP = EXP
      } else {
        Notify({
          type: 'danger', message, onOpened: () => router.replace('/login')
        })
        localStorage.removeItem('TOKEN')
      }
    })
    // 修改性别
    const onSelect = async (action, index) => {
      const {status, set, message} = await setSex(index)
      if (status === 0) {
        state.gender = set
        Toast.success(message)
      } else {
        Toast.fail(message)
      }
    }
    // 修改用户名
    const nameConfirm = async () => {
      if (pattern.namePattern.test(state.username)) {
        const {status, message} = await setName(state.username)
        if (status === 0) {
          state.nickname = state.username
          store.state.nickname = state.username
          // 修改Avatar组件中的昵称
          setChildrenName.value.nameChange(state.username)
          Toast.success(message)
        } else {
          Toast.fail(message)
        }
      } else {
        Toast.fail('用户名不合法')
      }
      setTimeout(() => state.username = '', 300)
    }
    // 修改密码
    const pwdConfirm = async () => {
      if (pattern.pwdPattern.test(state.password)) {
        const {status, message} = await setPwd(state.password)
        if (status === 0) {
          Toast.success(message)
        } else {
          Toast.fail(message)
        }
      } else {
        Toast.fail('密码不合法')
      }
      setTimeout(() => state.password = '', 300)
    }
    return {
      ...toRefs(state),
      formatLevel,
      actions,
      onSelect,
      nameConfirm,
      setChildrenName,
      pwdConfirm
    }
  }
}
</script>

<style lang="less" scoped>
.level {
  display: inline-block;
  width: 28px;
  height: 18px;
  vertical-align: middle;
  background: url("../../assets/images/level.png");
}

.set-name, .set-pwd {
  margin: 20px 50px 5px 50px;
}
</style>