import request from './config'

// 首页视频数据
export const getHome = () => request({url: '/home'})
// 分页获取视频
export const getPage = page => request({url: '/page', params: {p: page}})
// 注册验证码
export const regCaptcha = () => request({url: '/captcha'})
// 注册
export const register = data => request({url: '/register', method: 'post', data})
// 找回密码时验证邮箱是否存在
export const emailIsExisted = email => request({url: '/getEmail', method: 'post', data: {email}})
// 重置密码发送验证码
export const resetCaptcha = email => request({url: '/resetCaptcha', params: {email}})
// 获取重置密码权限
export const resetPwd = (email, captcha) => request({url: '/resetAuth', method: 'post', data: {email, captcha}})
// 重置密码
export const reset = data => request({url: '/resetPwd', method: 'post', data})
// 登录
export const login = data => request({url: '/login', method: 'post', data})
// 当前用户信息
export const me = () => request({url: '/me', params: {t: Date.now()}})
// 获取他人信息
export const getPersonInfo = uid => request({url: '/person', params: {uid}})
// 视频详情
export const getVideoInfo = vid => request({url: '/getVideo', params: {vid}})
// 获取评论
export const getComments = (vid, page = 1, model = 1, authUid) => request({
    url: '/comments',
    params: {vid, page, model, authUid}
})
// 添加评论
export const addComment = comment => request({url: '/addComment', method: 'post', data: {comment}})
// 删除评论
export const delComment = id => request({url: '/delComment', params: {id}})
// 举报评论
export const reportComment = ({id, reason}) => request({url: '/reportComment', params: {id, reason}})
// 点赞
export const likeComment = ({id, uid, vid}) => request({url: '/like', params: {id, uid, vid}})
// 每日签到
export const sign = () => request({url: 'sign', params: {t: Date.now()}})
// 上传头像
export const uploadAvatar = (img, md5) => request({url: '/uploadAvatar', method: 'post', data: {img, md5}})
// 上传背景图片
export const uploadBgc = (img, hash) => request({url: '/uploadBgc', method: 'post', data: {img, hash}})
// 修改头像
export const setAvatar = () => request({url: '/setAvatar', method: 'post'})
// 修改性别
export const setSex = sex => request({url: '/setSex', params: {sex}})
// 修改用户名
export const setName = name => request({url: '/setName', params: {name}})
// 修改密码
export const setPwd = pwd => request({url: '/setPwd', method: 'post', data: {pwd}})
// 获取未读消息
export const getMeg = () => request({url: '/getUnRead', params: {t: Date.now()}})
// 获取聊天用户列表
export const getChatList = () => request({url: '/getChatList', params: {t: Date.now()}})
// 删除指定聊天用户对话框
export const delChat = id => request({url: '/delChat', method: 'POST', data: {id}})
// 获取回复消息列表
export const getReply = () => request({url: '/getReply', params: {t: Date.now()}})
// 回复修改为已读状态
export const setIsRead = id => request({url: '/setIsRead', params: {id}})
// 删除回复我的
export const delReplyMe = ({id, all = false}) => request({url: '/delReplyMe', method: 'post', data: {id, all}})
// 获取点赞消息列表
export const getLikes = () => request({url: '/getLikes', params: {t: Date.now()}})
// 回复修改为已读状态
export const setLikesIsRead = id => request({url: '/setLikesIsRead', params: {id}})
// 删除回复我的
export const delLikes = ({id, all = false}) => request({url: '/delLikes', method: 'post', data: {id, all}})
// 系统通知消息
export const getNotices = () => request({url: '/notices'})
// 删除系统通知消息
export const delNotices = ({type, id}) => request({url: '/delNotices', params: {type, id}})
// 获取聊天记录
export const getChat = ({room, page = 1}) => request({url: '/getChat', method: 'POST', data: {room, page}})
// 获取聊天表情
export const getChatFace = () => request({url: '/getChatFace'})
// 获取视频审核列表
export const review = (page = 1) => request({url: '/review', method: 'POST', data: {page}})
// 审核视频
export const reviewVideo = ({type, info}) => request({
    url: '/reviewVideo',
    method: 'POST',
    data: {type, info}
})
// 获取所有视频信息
export const getVideos = (page = 1) => request({url: '/getVideos',params: {page}})
// 修改视频基本信息
export const updateVideo = data => request({url: '/updateVideo', method: 'POST', data})
// 上传视频前判断是否已经上传过了
export const isExist = md5 => request({url: '/isUploaded', method: 'post', data: md5})
// 上传视频
export const upload = data => request({
    url: '/uploads',
    method: 'post',
    data: data,
    contentType: 'multipart/form-data'
})
// 上传完成合并视频
export const merge = data => request({url: '/merge', method: 'post', data: data})
// 添加视频
export const uploadFinished = info => request({url: '/addVideo', method: 'post', data: info})
// 获取用户视频上传列表
export const uploadList = (page=1) => request({url: '/myUploads', params: {page}})
// 用户删除视频
export const delVideo = vid => request({url: '/delVideo', method: 'post', data: vid})
