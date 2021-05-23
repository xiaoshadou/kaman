<template>
  <nav-common>
    视频上传
    <template #right>
      <router-link to="/uploads/my">
        <span style="color:#fff">我的</span>
      </router-link>
    </template>
  </nav-common>
  <div style="min-height: 500px">
    <van-form @submit="onSubmit" style="padding: 6px">
      <van-field
          v-model="title"
          required
          name="title"
          label="名称"
          :rules="[{ required: true, message: '请填写名称' }]"
      />
      <van-field
          v-model="desc"
          rows="2"
          name="desc"
          label="简介"
          type="textarea"
          maxlength="50"
          show-word-limit
      />
      <van-field name="uploader" label="文件" required>
        <template #input>
          <van-uploader v-model="fileList"
                        :max-count="1"
                        result-type="file"
                        :max-size="1000 * 1024 * 200"
                        @oversize="oversize"
                        :after-read="afterRead"
                        :before-delete="beforeDelete"
                        accept="video/mp4,video/x-msvideo,video/quicktime">
            <van-button icon="upgrade" type="default">点击上传</van-button>
          </van-uploader>
          <van-progress v-if="progress" style="margin: 20px 0 20px 10px;width: 50%" :percentage="progress"/>
        </template>
      </van-field>
      <div style="margin: 16px 0;">
        <van-button block :disabled="!(title && uploaded)" type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
  <Footer/>
  <Tabbar/>
</template>

<script>
import {reactive, toRefs} from 'vue'
import {Toast} from 'vant'
import NavCommon from "@/components/NavCommon"
import Footer from "@/components/Footer"
import Tabbar from "@/components/TabBar"
import {isExist, merge, upload, uploadFinished} from "@/api"
import {calculate} from "@/uitls"

export default {
  name: "Uploads",
  components: {NavCommon, Footer, Tabbar},
  setup() {
    const state = reactive({
      title: '',
      desc: '',
      fileList: [],
      progress: 0,
      md5: '',
      uploaded: false
    })
    const afterRead = file => {
      state.progress = 0
      const File = file.file
      if (!['video/mp4', 'video/x-msvideo', 'video/quicktime'].includes(File.type)) {
        Toast.fail('请上传MP4/AVI格式文件')
        state.fileList = []
        return false
      }
      file.status = 'uploading'
      file.message = '上传中...'
      calculate(File, async md5 => {
        // 上传前判断是否已经上传过了
        const {status: stat, exist, message: meg} = await isExist({md5})
        if (stat === 0) {
          if (exist) {
            state.fileList = []
            state.uploaded = false
            return Toast.fail(meg)
          }
        } else {
          return
        }
        state.md5 = md5
        state.size = File.size
        const eachSize = 1024 * 1000 // 每个chunks的大小
        const blockCount = Math.ceil(File.size / eachSize) // 分片总数
        // const axiosArray = [] // axiosPromise数组
        let ext = File.name.split('.')
        ext = ext[ext.length - 1] // 获取文件后缀名
        // 处理每个分片的上传操作
        for (let i = 0; i < blockCount; i++) {
          let start = i * eachSize,
              end = Math.min(File.size, start + eachSize)
          const form = new FormData()
          form.append('video', File.slice(start, end, File.type + ''))
          form.append('name', File.name)
          form.append('total', blockCount)
          form.append('ext', ext)
          form.append('index', i)
          form.append('size', File.size)
          form.append('hash', md5)
          // axiosArray.push(upload(form))
          const {status} = await upload(form)
          if (status === 0) {
            // 显示进度
            state.progress = Math.floor(((i + 1) / blockCount) * 100)
          }
        }
        // 发送合并文件请求
        const {status, message} = await merge({
          name: File.name,
          total: blockCount,
          ext,
          hash: md5,
        })
        if (status === 0) {
          file.status = 'done'
          file.message = '上传成功'
          state.uploaded = true
          state.progress = 0
          // Toast.success(message)
        } else {
          file.status = 'failed'
          file.message = '上传失败'
          // Toast.fail(message)
        }
        // Promise.all(axiosArray).then(async () => {
        //   const data = {
        //     name: File.name,
        //     total: blockCount,
        //     ext,
        //     hash: md5
        //   }
        //   // 所有分片上传完后请求合并
        //   const {status, message} = await merge(data)
        //   if (status === 0) {
        //     Toast.success(message)
        //   }
        // })
      })
    }
    // 删除当前上传
    const beforeDelete = () => {
      state.uploaded = false
      state.fileList = []
    }
    const oversize = () => {
      Toast.fail('文件不能超过200M')
    }
    // 添加视频
    const onSubmit = async v => {
      const {title, desc, uploader} = v
      const fileName = uploader[0].file.name
      const {status, message} = await uploadFinished({title, fileName, hash: state.md5, desc, size: state.size})
      if (status === 0) {
        Toast.success(message)
      } else {
        Toast.fail(message)
      }
      state.title = ''
      state.desc = ''
      state.fileList = []
      state.md5 = ''
      state.uploaded = false
    }
    return {
      ...toRefs(state),
      afterRead,
      beforeDelete,
      oversize,
      onSubmit,
    }
  }
}
</script>

<style scoped lang="less">
.progress {
  height: 40px;
  background-color: #fff;
  width: 300px;
}

</style>