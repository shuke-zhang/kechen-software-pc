import type { UserModel } from '@/model/user'
import { defineStore } from 'pinia'
import { getUserInfo as _getUserInfo, loginApi } from '@/api/login'
import { removeCacheToken, setCacheToken } from '@/utils/cache'

const SUPER_ADMIN = 'admin'

export const useUserStore = defineStore('user', () => {
  const localUser = ref<UserModel | null>(getCache<UserModel>('USER_INFO')?.value || null)
  const userInfo = ref<UserModel | null>(localUser.value || null)
  const userName = ref<UserModel['userName'] | null>(localUser?.value ? localUser?.value.userName : null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const avater = ref()
  /** 是否已经登录 */
  const isLoggedIn = ref<boolean>(!!getCache<boolean>('IS_LOGGED_IN')?.value)
  return {
    userInfo,
    userName,
    roles,
    permissions,
    avater,
    isLoggedIn,
    login,
    logout,
    getInfo,
    resetAllState,
    hasPermission,
    hasRole,
  }

  async function login(...args: Parameters<typeof loginApi>) {
    const res = await loginApi(...args)
    isLoggedIn.value = true
    setCacheToken(res.token)
    setCache('IS_LOGGED_IN', true)
    // await getInfo()
  }
  function logout() {
    return new Promise<''>((resolve) => {
      resetAllState()
      removeCacheToken()
      resolve('')
    })
  }

  async function getInfo() {
    const res = await _getUserInfo()
    userName.value = res.user.userName || '默认'
    userInfo.value = res.user
    roles.value = res.roles
    setCache('IS_LOGGED_IN', true)
    setCache('USER_INFO', res.user)
  }

  function resetAllState() {
    userName.value = null
    roles.value = []
    permissions.value = []
    isLoggedIn.value = false
    removeCacheToken()
    removeCache('IS_LOGGED_IN')
  }

  function hasPermission(requiredPermission: string): boolean {
    return permissions.value.includes(requiredPermission)
  }

  function hasRole(requiredRole: string): boolean {
    if (roles.value.includes(SUPER_ADMIN))
      return true
    return roles.value.includes(requiredRole)
  }
})
