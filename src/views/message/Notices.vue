<template>
  <nav-common>系统通知
    <template #right><span @click="delAll">清空</span></template>
  </nav-common>
  <div style="min-height: 600px">
    <van-swipe-cell v-for="i in list" :key="i.id">
      <van-cell>
        <template #title>
          <div class="item" v-if="i.is_pass===1">
            <span class="text">视频<span class="pass">{{ i.content }}</span>已通过审核</span>
          </div>
          <div class="item Reject" v-if="i.is_pass===-1">
            <span class="text">视频<span class="reject">{{ i.content }}</span>未通过审核,
              原因:<span class="reason">{{ i.reason }}</span></span>
          </div>
          <span style="color: #969799;font-size: 12px;">{{ formatNow(i.time) }}</span>
        </template>
      </van-cell>
      <template #right>
        <van-button @click="del(i.id)" square text="删除" type="danger" style="height: 100%"/>
      </template>
    </van-swipe-cell>
    <van-loading v-if="loading" color="#1989fa" style="text-align: center;padding-top: 100px"/>
    <van-empty v-if="showEmpty" image="/images/custom-empty-image.png" description="空空如也"/>
  </div>
  <Footer/>
</template>

<script>
import {onMounted, toRefs, reactive} from 'vue'
import {Toast} from 'vant'
import NavCommon from "@/components/NavCommon"
import Footer from "@/components/Footer"
import {delNotices, getNotices} from "@/api"
import {formatNow} from "@/uitls"

export default {
  name: "Notices",
  components: {NavCommon, Footer},
  setup() {
    const state = reactive({
      list: [],
      loading: true,
      showEmpty: false
    })
    onMounted(async () => {
      const {status, list, message} = await getNotices()
      if (status === 0) {
        state.list = list
        state.showEmpty = !list.length
      } else {
        Toast.fail(message)
      }
      state.loading = false
    })
    const del = async id => {
      const {status, message} = await delNotices({type: 'one', id})
      if (status === 0) {
        state.list = [...state.list].filter(item => {
          return item.id !== id
        })
      }else Toast.fail(message)
    }
    const delAll = async () => {
      if (!state.list.length) return
      await delNotices({type: 'all'})
      state.list = []
    }
    return {
      ...toRefs(state),
      formatNow,
      del,
      delAll
    }
  }

}
</script>

<style scoped lang="less">
.item {
  display: flex;
  align-items: center;

  .text {
    font-size: 15px;
    flex: 1;
    padding-right: 10px;

    .pass, .reject, .reason {
      margin: 0 .2em;
      padding: .2em .4em .1em;
      font-size: 85%;
      border: 1px solid hsla(0, 0%, 39.2%, .2);
      border-radius: 3px;
    }

    .pass {
      background-color: #f6ffed;
    }

    .reject {
      background-color: #fff2f0;
    }

    .reason {
      background: #ffccc7;
      color: rgba(0, 0, 0, .85);
    }
  }
}
</style>