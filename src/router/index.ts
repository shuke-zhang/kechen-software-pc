import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home.vue'),
      redirect: '/device',
      children: [
        {
          path: 'device',
          name: 'device',
          component: () => import('@/views/device/index.vue'),
          meta: {
            title: '设备管理',
            hidden: true,
          },
        },
        {
          path: 'patient',
          name: 'patient',
          component: () => import('@/views/patient/index.vue'),
          meta: {
            title: '患者',
            hidden: true,
          },
        },
        {
          path: 'visitRecord',
          name: 'visitRecord',
          component: () => import('@/views/visitRecord/index.vue'),
          meta: {
            title: '诊疗记录',
            hidden: true,
          },
        },
        {
          path: 'report',
          name: 'report',
          component: () => import('@/views/report/index.vue'),
          meta: {
            title: '报告',
            hidden: true,
          },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/index.vue'),
          meta: {
            title: '设置',
            hidden: true,
          },
        },
        {
          path: 'video',
          name: 'Video',
          component: () => import('@/views/settings/video/index.vue'),
          meta: {
            title: '视频',
            hidden: true,
          },
        },
        {
          path: 'videoCategory',
          name: 'VideoCategory',
          component: () => import('@/views/settings/videoCategory/index.vue'),
          meta: {
            title: '视频类别',
            hidden: true,
          },
        },
        {
          path: '/user/profile',
          name: 'UserProfile',
          component: () => import('@/views/settings/user/profile.vue'),
          meta: {
            title: '用户管理',
            hidden: true,
          },
        },
        {
          path: 'userManagement',
          name: 'UserManagement',
          component: () => import('@/views/settings/user/index.vue'),
          meta: {
            title: '用户信息修改',
            hidden: true,
          },
        },
        {
          path: 'logs',
          name: 'Logs',
          component: () => import('@/views/settings/logs/index.vue'),
          meta: {
            title: '日志',
            hidden: true,
          },
        },

      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login.vue'),
      meta: {
        title: '登录',
        hidden: true,
      },
    },

  ],
})
const whiteList = ['/login', '/register']

function isWhiteList(path: string) {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}
router.beforeEach(async (to) => {
  const token = getCacheToken().value

  // 1) 先放行白名单（如 /login、/404、/about 等）
  if (isWhiteList(to.path)) {
    // 如果是 /login 且已有 token，可选：跳首页
    if (to.path === '/login' && token) {
      return { path: '/' }
    }
    return true
  }

  // 2) 没有 token，跳登录并带上 redirect
  if (!token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 3) 有 token
  const userStore = useUserStore()
  try {
    // 只在首次进入或刷新后拉一次用户信息

    if (!userStore.userInfo?.userName) {
      await userStore.getInfo()
    }
    return true
  }
  catch (err: any) {
    // 失败兜底：清理登录态 + 提示 + 去登录
    await userStore.logout()
    showMessageError(err?.message || '登录状态已失效，请重新登录')
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export default router
