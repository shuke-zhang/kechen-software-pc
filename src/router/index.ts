import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      redirect: '/knowledge',
      children: [
        {
          path: '/knowledge',
          name: 'Knowledge',
          component: () => import('@/views/knowledge/index.vue'),
          meta: {
            title: '知识库',
            hidden: true,
          },
        },
        {
          path: '/knowledge-detail/:id',
          name: 'KnowledgeDetail',
          component: () => import('@/views/knowledge/detail.vue'),
          meta: {
            title: '知识库详情',
            hidden: true,
          },
        },
        {
          path: '/model',
          name: 'Model',
          component: () => import('@/views/ai-model/index.vue'),
          meta: {
            title: 'AI模型',
            hidden: true,
          },
        },
        {
          path: '/ai-tools',
          name: 'AiTools',
          component: () => import('@/views/tools/index.vue'),
          meta: {
            title: 'AI工具',
            hidden: true,
          },
        },
        {
          path: '/message-board',
          name: 'MessageBoard',
          component: () => import('@/views/message-board/index.vue'),
          meta: {
            title: '留言板',
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
  // if (!token) {
  //   return { path: '/login', query: { redirect: to.fullPath } }
  // }

  // 3) 有 token
  const userStore = useUserStore()
  try {
    // 只在首次进入或刷新后拉一次用户信息
    if (!userStore.userName) {
      // await userStore.getInfo()
    }
    return true
  }
  catch (err: any) {
    // 失败兜底：清理登录态 + 提示 + 去登录
    // await userStore.logout()
    // ElMessage.error(err?.message || '登录状态已失效，请重新登录')
    // return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export default router
