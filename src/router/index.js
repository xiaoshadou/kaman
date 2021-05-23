import {createRouter, createWebHashHistory} from 'vue-router'
import {checkLocal} from "@/uitls"

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/home/Home')
    },
    {
        path: '/find',
        name: 'Find',
        component: () => import('../views/find/Find')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/login/Login')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/register/Register')
    },
    {
        path: '/forget',
        name: 'Forget',
        component: () => import('../views/forget/Forget')
    },
    {
        path: '/reset',
        name: 'Reset',
        component: () => import('../views/forget/Reset')
    },
    {
        path: '/video/:name*',
        name: 'Video',
        component: () => import('../views/video/Video')
    },
    {
        path: '/manage/users',
        name: 'ManageUsers',
        component: () => import('../views/profile/ManageUsers'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/manage/videos',
        name: 'ManageVideos',
        component: () => import('../views/profile/ManageVideos'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/manage/review',
        name: 'Review',
        component: () => import('../views/profile/Review'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/profile/Profile'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/profile/people',
        name: 'People',
        component: () => import('../views/profile/People'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/message',
        name: 'Message',
        component: () => import('../views/message/Message'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/message/reply',
        name: 'Reply',
        component: () => import('../views/message/Reply'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/message/likes',
        name: 'Likes',
        component: () => import('../views/message/Likes'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/message/notices',
        name: 'Notices',
        component: () => import('../views/message/Notices'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/uploads',
        name: 'Uploads',
        component: () => import('../views/uploads/Uploads'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/uploads/my',
        name: 'MyUploads',
        component: () => import('../views/uploads/MyUploads'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/person',
        name: 'Person',
        component: () => import('../views/person/Person')
    },
    {
        path: '/chat',
        name: 'Chat',
        component: () => import('../views/chat/Chat'),
        meta: {
            requireAuth: true
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/404/NotFound')
    }
]

const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.meta.requireAuth && !checkLocal()) {
        next({
            path: '/login',
            query: {redirect: to.fullPath},
        })
    } else if (to.name === 'Login' && checkLocal()) {
        next('/profile')
    } else {
        next()
    }
})
export default router
