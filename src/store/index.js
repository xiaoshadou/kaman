import {createStore} from 'vuex'

// const keepLiveRoute = ["Home", "NotFound"]
export default createStore({
    state: {
        uid: '',
        nickname: '',
        avatar: '',
        bgc: '',
        role: '',
        r: false,
        gender: '',
        EXP: '',
        sign: '',
        // keepLiveRoute
    },
    mutations: {
        updateUserInfo(state, {r, uid, nickname, avatar, bgc, role, gender, EXP, sign}) {
            state.r = r
            state.uid = uid
            state.nickname = nickname
            state.avatar = avatar
            state.bgc = bgc
            state.role = role
            state.EXP = EXP
            state.gender = gender
            state.sign = sign
        },
        // clearKeep(state) {
        //     if (state.keepLiveRoute.length > 0) state.keepLiveRoute = []
        //     console.log("清空缓存路由！")
        // },
        // setKeep(state) {
        //     if (!state.keepLiveRoute.length > 0) state.keepLiveRoute = keepLiveRoute
        //     console.log("设置缓存路由！")
        // }
    },
    actions: {},
    modules: {}
})
