import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
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
    console.log('没有token')
    return true
    // return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 3) 有 token
  const userStore = useUserStore()
  try {
    // 只在首次进入或刷新后拉一次用户信息

    if (!userStore.userInfo?.name) {
      await userStore.getInfo()
      return true
    }
    return true
  }
  catch (_err: any) {
    // 失败兜底：清理登录态 + 提示 + 去登录
    await userStore.logout()
    // 响应拦截器已经处理提示信息了， 不用重复提示
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export default router
