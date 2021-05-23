import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'vant/lib/index.less'
// import SocketIO from 'socket.io-client'
// import VueSocketIO from 'vue-socket.io'
import {
    Icon, Image as VanImage, Button,
    Grid, GridItem, Cell, Badge, Lazyload,
    PullRefresh, Form, Field, ImagePreview,
    Pagination, Popover, Overlay,
    Dialog, RadioGroup, Radio, Tag,
    Loading, Skeleton, Uploader,
    ActionSheet, SwipeCell, Empty,
    Progress, Popup, Tabbar, TabbarItem
} from 'vant'


// const optionsVueIO = {
//     debug: true,
//     connection: SocketIO('http://localhost:3000')
// }
createApp(App)
    .use(Icon).use(VanImage).use(Grid).use(GridItem).use(Cell).use(ImagePreview)
    .use(PullRefresh).use(Form).use(Field).use(Button).use(Lazyload, {lazyComponent: true})
    .use(Pagination).use(Popover).use(Overlay).use(Loading).use(Empty).use(Tag)
    .use(Dialog).use(Uploader).use(ActionSheet).use(Badge).use(Progress)
    .use(Skeleton).use(RadioGroup).use(Radio).use(SwipeCell).use(Popup)
    .use(Tabbar).use(TabbarItem)
    .use(store).use(router).mount('#app')
