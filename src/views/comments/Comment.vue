<template>
  <div class="item" :id="comment.floor" ref="tag">
    <div class="user">
      <div class="avatar">
        <router-link :to="{path: comment.uid!==uid?`/person`:'/profile', query: {uid: comment.uid}}">
          <van-image
              round
              fit="cover"
              width="45"
              height="45"
              :src="comment.avatar"
          >
          </van-image>
        </router-link>
      </div>
      <div style="width: 100%;margin-left: 5px;">
        <div style="display: flex">
          <div style="flex: 1">
            <span :class="comment.role === 'admin'? 'name admin': 'name'">{{ comment.nickname }}</span>
            <span class="tag"><i class="level"
                                 :style="{backgroundPosition: formatLevel(comment.EXP).split(';')[0]}"/></span>
            <span class="tag auth" v-if="comment.role === 'admin'">管理员</span>
            <span class="tag lz" v-if="comment.nickname === videoAuthor">楼主</span>
          </div>
          <div>
            <span class="floor">{{ comment.floor === 1 ? '沙发' : comment.floor }}<sup
                v-if="comment.floor !== 1">#</sup></span>
          </div>
        </div>
        <div style=" padding-top: 8px;">
          <img class="sj" src="@/assets/images/shijian.png" alt=""/>
          <span class="time">{{ formatNow(comment.created) }}</span>
        </div>
      </div>
    </div>
    <div class="message">
      <div class="reply" v-if="comment.quote_id">
        <blockquote>
          <span class="quote">引用：{{ comment.quote_name }} 发表于 {{ formatDate(comment.quote_created) }}</span>
          <br>
          {{ comment.quote_content }}
        </blockquote>
      </div>
      <br>
      <div class="reply del" v-if="!comment.show">
        <blockquote>
          {{ comment.show ? comment.reply : '该内容已被删除或屏蔽' }}
        </blockquote>
      </div>
      {{ comment.content }}
      <br>
    </div>
    <div class="footer" v-if="comment.show">
      <div class="like">
        <van-icon @click="like(comment)" name="good-job-o" size="18px"/>
        <span class="like-num">{{ comment.likes === 0 ? '' : comment.likes }}</span>
      </div>
      <van-popover
          @select="onSelect"
          v-model:show="showPopover"
          theme="dark"
          placement="top-end"
          :actions="[{text: '回复', comment, e: $refs}, {text: uid === comment.uid?'删除':'举报', comment, e: $refs}]">
        <template #reference>
          <div class="actions">
            <van-icon name="ellipsis" size="30px"/>
          </div>
        </template>
      </van-popover>
    </div>
  </div>
</template>

<script>
import {reactive, toRefs} from "vue"
import {useStore} from 'vuex'
import {formatDate, formatLevel, formatNow} from "@/uitls"

export default {
  name: "Comment",
  props: ['comment', 'index', 'author', 'reply', 'del', 'report', 'like'],
  setup(props) {
    const {uid} = useStore().state
    const state = reactive({
      showPopover: false,
      comment: props.comment,
      videoAuthor: props.author,
      reply: props.reply,
      del: props.del,
      report: props.report,
      like: props.like,
      uid: uid
    })
    const onSelect = (val, index) => {
      if (index === 0) {
        state.reply(val.comment)
      } else {
        if (val.text === '删除') {
          state.del(val.comment)
        } else {
          state.report(val.comment)
        }
      }
    }
    return {
      ...toRefs(state),
      onSelect,
      formatNow,
      formatDate,
      formatLevel
    }
  }
}
</script>

<style scoped lang="less">
.item {
  padding: 7px 7px 0 0;
  background-color: #fff;
  border-bottom: 1px solid #f1f1f1;
  margin-bottom: 14px;

  .user {
    padding-left: 10px;
    margin-top: 5px;
    display: flex;

    .avatar {
      width: 45px;
    }

    .name {
      color: #324b82;
      line-height: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    .admin {
      color: red;
    }

    .lz {
      background-color: #5dc3f8;
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

    .auth {
      background-color: #ee0a24;
    }

    .floor {
      color: #2a84b8;
      font-size: 12px;
    }

    .sj {
      width: 13px;
      vertical-align: middle;
    }

    .time {
      font-size: 12px;
      color: #C0C0C0;
      padding-left: 4px;
    }
  }

  .message {
    padding-left: 10px;
    font-size: 16px;
    padding-bottom: 40px;

    .reply {
      padding: 10px;
      margin: 5px 0;
      border: 1px dashed #D7D7D7;
      font-size: 14px;
      background: #f9f9f9;
      color: #A5A5A5;

      blockquote {
        overflow: hidden;
        display: -webkit-box;
        word-break: break-all;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;

        .quote {
          color: #999999;
          font-size: 12px;
        }
      }
    }

    .del {
      text-align: center;
    }
  }

  .like {
    display: flex;
    //line-height: 20px;
    justify-content: start;

    .like-num {
      padding: 1px 4px;
      font-size: 14px;
      color: #C0C0C0;
      min-width: 16px;
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 10px;

    .actions {
      display: flex;
    }
  }
}
</style>