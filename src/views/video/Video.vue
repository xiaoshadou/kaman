<template>
  <nav-common>卡曼视频</nav-common>
  <van-loading v-if="!videoLen" class="loading" color="#1989fa" size="35"/>
  <div v-if="videoLen">
    <div class="video-container" ref="scrollTop">
      <div style="height: 10px"></div>
      <h2 class="v-title">
        {{ video.title }}
      </h2>
      <div class="auth">
        <router-link :to="{path: video.uid!==uid?`/person`:'/profile', query: {uid: video.uid}}">
          <div class="avatar">
            <van-image
                round
                fit="cover"
                width="45"
                height="45"
                :src="video.avatar"
            />
          </div>
        </router-link>
        <div style="margin-left: 5px;width: 85%">
          <div>
            <span :class="video.role==='admin'?'username role':'username'">{{ video.nickname }}</span>
            <span class="tag"><i class="level"
                                 :style="{backgroundPosition: formatLevel(video.EXP).split(';')[0]}"/></span>
            <span class="tag admin" v-if="video.role==='admin'">管理员</span>
            <span class="tag lz">楼主</span>
          </div>
          <div class="time">
            <div style="flex: 1">
              <img class="sj" src="@/assets/images/shijian.png" alt=""/>
              <span class="text">{{ formatNow(video.created) }}</span>
            </div>
            <div class="v-p">
              <div style="padding-right: 5px;">
                <img style="vertical-align:top" src="@/assets/images/chakan.png" alt="">
                <span style="padding-left: 2px;">{{ video.views }}</span>
              </div>
              <div>
                <img src="@/assets/images/huifu.png" alt="">
                <span style="padding-left: 2px;">{{ total }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="player">
        <video style="height: 100%;width: 100%;background-color: #000;"
               webkit-playsinline="true"
               x5-playsinline
               playsinline
               controls
               :src="video.vurl">
        </video>
      </div>
      <div class="desc">
        <div class="title">
          视频简介:
        </div>
        <div class="content">{{ video.desc }}</div>
      </div>
    </div>
    <div class="comments">
      <div class="title">
        <div class="active hf" @click="lookAll">全部回复 ( {{ total }} 条)</div>
        <div class="lz" @click="lookUp">只看楼主</div>
      </div>
      <van-skeleton title avatar :row="4" :loading="commentsLoading" style="margin-bottom: 20px;padding: 20px">
        <Comment v-for="item in comments"
                 :key="item.id" :comment="item"
                 :author="video.nickname"
                 :reply="reply"
                 :del="del"
                 :report="report"
                 :like="like"
        />
      </van-skeleton>
      <!--占位-->
      <van-skeleton
          v-for="i in 2"
          title avatar :row="5"
          :loading="commentsLoading"
          style="margin-bottom: 20px;padding: 20px"
      />
    </div>
    <div class="page" v-if="commentsCount>0">
      <van-pagination
          @change="onChangePage"
          v-model="currentPage"
          :total-items="commentsCount"
          :items-per-page="6"/>
    </div>
    <div class="reply-bar">
      <div class="reply" @click="replyClick">
        <van-icon style="vertical-align: middle;margin-bottom: 4px;" name="chat-o" size="20px"/>
        {{ total ? '我也说一句' : '我来抢沙发' }}
      </div>
      <div class="actions">
        <div class="star">
          <div class="icon">
            <van-icon name="star-o" size="20"/>
          </div>
          <div>收藏</div>
        </div>
        <div class="report">
          <div class="icon">
            <van-icon name="warning-o" size="20"/>
          </div>
          <div>举报</div>
        </div>
      </div>
    </div>
    <div class="reply-area" v-show="areaShow">
      <div class="content">
        <div class="area">
          <van-field
              @update:model-value="getAreaValue"
              v-model="replyValue"
              rows="2"
              autosize
              clear-trigger="none"
              type="textarea"
              maxlength="150"
              :placeholder="placeholder"
          />
        </div>
        <div class="bar">
          <div @click="cancelReply">取消</div>
          <div @click="send">回复</div>
        </div>
      </div>
    </div>
    <transition name="van-fade">
      <div class="back-top" ref="backToTop" v-show="backTopVisible">
        <van-icon name="back-top" size="30" @click="backTop"/>
      </div>
    </transition>
    <van-overlay z-index="99" duration="0" :show="show" @click="cancelReply"/>
    <van-dialog v-model:show="reportShow"
                @confirm="reportConfirm"
                @cancel="reportCancel"
                title="举报理由"
                :show-confirm-button="!!reportChecked"
                show-cancel-button>
      <van-radio-group v-model="reportChecked">
        <van-cell title="垃圾广告信息" @click="reportChecked = '1'">
          <template #right-icon>
            <van-radio name="1"/>
          </template>
        </van-cell>
        <van-cell title="辱骂、人身攻击等不友善行为" @click="reportChecked = '2'">
          <template #right-icon>
            <van-radio name="2"/>
          </template>
        </van-cell>
        <van-cell title="有害信息" @click="reportChecked = '3'">
          <template #right-icon>
            <van-radio name="3"/>
          </template>
        </van-cell>
      </van-radio-group>
    </van-dialog>
  </div>
</template>

<script>
import {useRoute, useRouter} from 'vue-router'
import {onMounted, reactive, ref, toRefs} from 'vue'
import {useStore} from "vuex"
import {Toast, Notify, Dialog} from 'vant'
import NavCommon from "@/components/NavCommon"
import Comment from "@/views/comments/Comment"
import {addComment, delComment, getComments, getVideoInfo, likeComment, me, reportComment} from "@/api"
import {checkLocal, formatLevel, formatNow} from "@/uitls"

export default {
  name: "Video",
  components: {NavCommon, Comment},
  setup() {
    const {vid, f} = useRoute().query
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const {uid, role} = store.state
    const state = reactive({
      uid,
      backTopVisible: false,
      currentPage: f ? Math.ceil(f / 6) : 1, // 跳转过来的页数
      replyValue: '',   // 评论或回复内容
      areaShow: false,  // 回复框
      show: false,      // 遮罩层
      model: 1,         // 回复显示状态 1为所有  0为只看楼主
      comments: [],
      commentsCount: 0,
      commentsLoading: true,
      total: 0,          // 网友回复总数
      video: {},
      videoLen: 0,
      videoAuthorUid: '', // 视频作者uid
      placeholder: '',    // 评论回复框默认显示
      replyModel: false,  // 是否为回复他人(true为回复他人)
      replyInfo: '',      // 回复引用的信息
      reportShow: false,  // 举报框
      reportChecked: '',  // 举报选中的理由的id
      reportInfo: ''       // 被举报的评论信息
    })
    // 每次评论点击下一页需要滚动的高度
    const scrollTop = ref(null)
    // 回到顶部
    const backToTop = ref(null)
    onMounted(async () => {
      // 监听滚动条 显示/隐藏回到顶部
      let t1 = 0, t2 = 0, timer = null
      let t3 = document.documentElement.scrollHeight / 2

      document.onscroll = function () {
        clearTimeout(timer)
        timer = setTimeout(isScrollEnd, 500)
        t1 = document.documentElement.scrollTop || document.body.scrollTop
      }

      function isScrollEnd() {
        t2 = document.documentElement.scrollTop || document.body.scrollTop
        if (t2 === t1) {
          if (backToTop.value) {
            state.backTopVisible = t2 > t3
          }
        }
      }

      isScrollEnd()
      if (!uid || !role) {
        const {status, userinfo} = await me()
        state.uid = userinfo?.uid
        if (status === 0)
          store.commit('updateUserInfo', userinfo)
      }
      await getVideo()
      await getComment(vid, state.currentPage)
      // 回复我的页面跳转过来显示链接的评论
      if (f) {
        // document.getElementById(f).scrollIntoView()
        const el = document.getElementById(f)
        const h = el.offsetHeight
        setTimeout(() => {
          el.style.backgroundColor = '#e6f7ff'
          window.scrollTo({
            top: el.offsetTop - h,
            behavior: "smooth"
          })
        }, 100)
      }
    })
    // 获取视频信息
    const getVideo = async () => {
      const {status, video, message} = await getVideoInfo(vid)
      if (status !== 0) Notify({type: 'danger', message})
      state.video = video[0]
      state.videoLen = video.length
      if (state.videoLen > 0) state.videoAuthorUid = video[0].uid
    }
    // 所有评论
    const lookAll = async e => {
      // 修改背景色
      changeAttr(e, '.title .lz')
      // 被选中时再点击不发送请求
      if (state.model !== 1) {
        state.currentPage = 1
        // 重新获取所有回复
        await getComment(vid)
        state.model = 1
      }
    }
    // 只看楼主
    const lookUp = async e => {
      // 修改背景色
      changeAttr(e, '.title .hf')
      if (state.model !== 0) {
        state.currentPage = 1
        // 切换为只看楼主模式
        state.model = 0
        await getComment(vid, 1, 0, state.videoAuthorUid)
      }
    }
    // 获取评论（默认为所有）
    const getComment = async (vid, page, model, authUid) => {
      state.commentsLoading = true
      const {status, upCount, upComments, count, comments, message} = await getComments(vid, page, model, authUid)
      if (status !== 0) return Notify({type: 'danger', message})
      // 防止切换到只看楼主模式网友回复不显示评论总数
      if (count) state.total = count
      state.commentsCount = count || upCount
      state.comments = comments || upComments
      state.commentsLoading = false
    }
    // 分页获取评论
    const onChangePage = async (page) => {
      if (state.model === 1) {
        await getComment(vid, page)
      } else {
        await getComment(vid, page, 0, state.videoAuthorUid)
      }
      // 滚动条转到评论区头部
      window.scrollTo({
        top: scrollTop.value.offsetHeight + 50,
        behavior: "smooth"
      })
    }
    // 点击显示评论框
    const replyClick = () => {
      state.placeholder = '吐个槽呗...'
      state.replyModel = false
      if (!checkLocal()) {
        Dialog.confirm({
          title: '登录后才能评论哦',
          confirmButtonText: '去登录',
        }).then(() => {
          router.push({path: '/login', query: {redirect: route.fullPath}})
        }).catch(() => {
          // on cancel
        })
        return
      }
      state.areaShow = true
      // 背景遮罩
      state.show = true
    }
    // 绑定输入数据
    const getAreaValue = val => {
      state.replyValue = val
    }
    // 点击回复按钮
    const send = async () => {
      // 获取输入内容
      const value = state.replyValue
      // 对输入内容进行处理
      if (value.trim()) {
        Toast.loading({loadingType: 'spinner', forbidClick: true})
        // 防止回复他人后再评论还是回复他人
        const info = state.replyModel ? state.replyInfo : ''
        const {status, id, quote: isReply, message} = await addComment({vid, comment: value, info})
        if (status === 0) {
          // 清空输入信息 相当于调用了此方法
          cancelReply()
          // 显示到最后一页
          state.currentPage = Math.ceil(state.commentsCount / 6) + 1
          const {nickname, content, created} = state.replyInfo
          // 防止回复他人后再评论还是回复他人
          const quote = state.replyModel ? isReply : ''
          state.comments = [...state.comments, {
            id,
            vid,
            ...store.state,
            quote_id: quote,
            quote_name: quote ? nickname : '',
            quote_content: quote ? content : '',
            quote_created: quote ? created : '',
            floor: state.total + 1,
            created: Date.now(),
            content: value,
            reply: '',
            report: 0,
            show: 1,
            likes: 0
          }]
          setTimeout(() => {
            window.scrollTo({
              top: 9999,
              behavior: "smooth"
            })
          }, 500)
          state.commentsCount += 1
          state.total += 1
          Toast.clear()
          Toast.success(message)
          // await getComments(vid)
        } else {
          Toast.clear()
          Toast.fail(message)
        }
      } else {
        Toast.fail('内容不能为空')
      }
    }
    // 点击取消回复
    const cancelReply = () => {
      state.areaShow = false
      state.show = false
      state.placeholder = ''
      state.replyValue = ''
    }
    // 回复他人 传给子组件点击
    const reply = info => {
      replyClick()
      state.replyValue = ''
      state.replyModel = true
      state.placeholder = `回复: ${info.nickname}`
      state.replyInfo = info
    }
    // 删除评论
    const del = async comment => {
      Dialog.confirm({
        title: '确定要删除此内容吗?'
      }).then(async () => {
        Toast.loading({loadingType: 'spinner', forbidClick: true})
        const {status, message} = await delComment(comment.id)
        if (status === 0) {
          // 更新数据
          state.comments = [...state.comments].map(item => {
            if (item.id === comment.id) {
              return {
                ...item,
                show: 0,
                content: '',
                quote_id: null
              }
            } else {
              return {
                ...item
              }
            }
          })
          Toast.clear()
          Toast.success(message)
        } else {
          Toast.clear()
          Toast.fail(message)
        }
      }).catch(() => {
      })
    }
    // 点击举报评论触发
    const report = async comment => {
      if (!checkLocal()) return Toast.fail('请登录')
      state.reportShow = true
      state.reportInfo = comment
    }
    // 取消举报
    const reportCancel = () => {
      setTimeout(() => state.reportChecked = '', 500)
    }
    // 确认举报触发
    const reportConfirm = async () => {
      const {status, message} = await reportComment({id: state.reportInfo.id, reason: state.reportChecked})
      // 失败提示
      if (status !== 0) {
        Notify({type: 'danger', message})
      } else {
        // 成功提示
        Toast.success(message)
      }
      state.reportChecked = ''
    }
    // 点赞
    const like = async info => {
      if (!checkLocal()) Toast.fail('请登录')
      const {status, message} = await likeComment({id: info.id, uid: info.uid, vid: info.vid})
      if (status === 0) {
        state.comments = [...state.comments].map(item => {
          if (item['id'] === info.id) {
            return {
              ...item,
              likes: item['likes'] + 1
            }
          } else {
            return {...item}
          }
        })
      } else {
        Toast.fail(message)
      }
    }
    // 回到顶部
    const backTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    }

    return {
      ...toRefs(state),
      scrollTop,
      backToTop,
      formatNow,
      formatLevel,
      lookAll,
      lookUp,
      onChangePage,
      replyClick,
      getAreaValue,
      send,
      cancelReply,
      reply,
      del,
      report,
      reportCancel,
      reportConfirm,
      like,
      backTop,
    }
  }
}

function changeAttr(e, tag) {
  e.target.style.background = '#ff6239'
  e.target.style.color = '#fff'
  const dom = document.querySelector(tag)
  dom.style.background = '#e7e7e7'
  dom.style.color = '#4c4c4c'
}
</script>

<style scoped lang="less">
.video-container {
  background-color: #fff;
  padding: 7px 7px 20px 7px;

  #player {
    height: 250px;
  }

  .v-title {
    padding: 8px 8px;
    margin: 0;
    font-size: 18px;
    line-height: 1.5rem;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    display: -webkit-box;
    word-break: break-all;
    overflow: hidden;
  }

  .auth {
    display: flex;
    height: 55px;
    padding: 7px 0 7px 7px;

    .username {
      color: #324b82;
      height: 25px;
      line-height: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    .tag {
      height: 16px;
      display: inline-block;
      padding: 0 3px;
      color: #fff;
      font-size: 12px;
      line-height: 16px;
      border-radius: 3px;
      text-align: center;
      margin-left: 5px;

      .level {
        display: inline-block;
        width: 28px;
        height: 18px;
        vertical-align: middle;
        background: url("../../assets/images/level.png");
      }
    }

    .admin {
      background-color: #ee0a24;
    }

    .role {
      color: red;
    }

    .lz {
      background-color: #5dc3f8;
    }

    .time {
      padding-top: 8px;
      display: flex;
      font-size: 12px;
      color: #C0C0C0;
      align-items: center;

      .sj {
        width: 13px;
        vertical-align: text-top;
      }

      .text {
        padding-left: 4px;
      }

      .v-p {
        justify-content: flex-end;
        display: flex;
        line-height: 20px;

        img {
          width: 18px;
          vertical-align: middle;
        }
      }
    }
  }

  .desc {
    height: 60px;
    padding: 14px;
    overflow: hidden;
    background: #f2f3f4;
    font-size: 15px;
    color: #4C4C4C;

    .title {
      font-weight: 700;
    }

    .content {
      padding: 10px 0;
      display: -webkit-box;
      word-break: break-all;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }
}

.comments {
  .title {
    display: flex;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    color: #fff;
    text-align: center;
    background-color: #e7e7e7;

    div {
      flex: 1;
    }

    .active {
      background-color: #ff6239;
    }

    .lz {
      color: #4C4C4C;
    }
  }
}

.page {
  display: flex;
  text-align: center;
  align-items: center;
  margin-bottom: 60px;
  justify-content: center;
}

.reply-bar {
  position: fixed;
  bottom: 0;
  z-index: 2;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 50px;
  border-top: 1px solid #e5e5e5;
  background: #f6f6f6;
  color: #0086ce;

  .reply {
    float: left;
    margin: 8px 10px 0 10px;
    padding: 0 10px;
    height: 32px;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    background: #fff;
    text-align: center;
    font-size: 14px;
    line-height: 32px;
    cursor: pointer;
  }

  .reply:active, .star:active, .report:active {
    background-color: #A8DCF0;
  }

  .actions {
    float: right;
    display: flex;
    font-size: 10px;
    height: 50px;
    cursor: pointer;

    .star, .report {
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: center;
      width: 66px;
    }
  }
}

.reply-area {
  //display: none;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 100;
  width: 100%;
  background: #fff;

  .content {
    display: flex;
    padding: 10px 6px;

    .area {
      flex: 4;
      border: 1px solid #eee;
    }

    .bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      color: #888;

      > div {
        border: .01rem solid #ddd;
        font-size: .12rem;
        width: 40px;
        text-align: center;
        height: 25px;
        line-height: 25px;
      }

      > div:last-child {
        background-color: #3498db;
        color: #fff;
      }
    }
  }
}

.loading {
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.back-top {
  position: fixed;
  width: 30px;
  height: 30px;
  right: 8px;
  bottom: 60px;
  background-color: #f2f2f2;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  opacity: 0.9;
}
</style>