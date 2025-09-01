<script setup lang="ts">
import type { ElDropdown } from 'element-plus'
import type { TopNavValueModel, UserDropdownValueModel } from '@/model/head'
import type { SettingDropdownValueModel } from '@/model/setting'

const UserStore = useUserStore()
const { userName, isLoggedIn } = storeToRefs(UserStore)
const router = useRouter()

console.log(isRef(userName), 'isRef')
const topNavList: Array<{ label: string, value: TopNavValueModel }> = [
  { label: '设备管理', value: 'device' },
  { label: '患者', value: 'patient' },
  { label: '诊疗记录', value: 'visitRecord' },
  { label: '报告', value: 'report' },
  { label: '设置', value: 'settings' },
]

const dropdownItems: Array<{ label: string, value: UserDropdownValueModel }> = [
  { label: '修改', value: 'put' },
  { label: '退出', value: 'logout' },
]

const settingDropdownItems: Array<{ label: string, value: SettingDropdownValueModel }> = [
  { label: '视频', value: 'video' },
  { label: '视频类别', value: 'videoCategory' },
  { label: '用户管理', value: 'userManagement' },
  { label: '日志', value: 'logs' },
]

const activeNavItem = ref<TopNavValueModel | null>(null)

function handleNavClick(value: TopNavValueModel) {
  if (value === 'settings')
    return
  activeNavItem.value = value
  router.push(`/${value}`)
}

function handleCommand(command: UserDropdownValueModel) {
  switch (command) {
    case 'put':
      console.log('修改')
      break
    case 'logout':
      confirmError('是否确认退出登录', '提示').then(() => {
        UserStore.logout()
          .then(() => {
            router.replace('/login')
          })
          .catch((error) => {
            console.error('退出登录失败', error)
          })
      })
      break
  }
}

/**
 * 设置点击
 */
function handleSettingCommand(command: SettingDropdownValueModel) {
  activeNavItem.value = 'settings'
  router.push(`/${command}`)
  // switch (command) {
  //   case 'video':
  //     console.log('视频')
  //     break
  //   case 'videoCategory':
  //     console.log('视频类别')
  //     break
  //   case 'userManagement':
  //     console.log('用户管理')
  //     break
  //   case 'logs':
  //     console.log('日志')
  //     break
  // }
}

/**
 * 点击头像/登录按钮
 */
function handleAvatarClick() {
  if (!isLoggedIn.value) {
    // 未登录 -> 跳转登录页
    router.push('/login')
  }
}

onMounted(() => {
  // 获取用户信息
  console.log(userName.value)

  // Set activeNavItem based on the current route
  const currentRoute = router.currentRoute.value.path.replace('/', '')
  if (topNavList.some(item => item.value === currentRoute)) {
    activeNavItem.value = currentRoute as TopNavValueModel
  }
  else {
    activeNavItem.value = 'device'
  }
})
</script>

<template>
  <header
    class="sticky top-0 h-[60px] px-5 bg-white flex items-center z-50 shadow-[inset_0_-2px_0_0_#e5e7eb] box-content"
  >
    <nav class="flex-1 h-full">
      <ul class="flex h-full">
        <li
          v-for="item in topNavList"
          :key="item.value"
          class="flex items-center h-full cursor-pointer"
        >
          <!-- 只有“设置”使用下拉 -->
          <template v-if="item.value === 'settings'">
            <el-dropdown
              trigger="click"
              @command="handleSettingCommand"
            >
              <div
                class="h-full px-4 py-2 border-b-[2px] border-transparent hover:text-primary flex-center"
                :class="[activeNavItem === item.value ? 'text-primary border-primary!' : '']"
              >
                {{ item.label }}
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="el in settingDropdownItems"
                    :key="el.value"
                    :command="el.value"
                  >
                    {{ el.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>

          <!-- 非“设置”：普通点击跳转 -->
          <template v-else>
            <div
              class="h-full px-4 py-2 border-b-[2px] border-transparent hover:text-primary flex-center"
              :class="[activeNavItem === item.value ? 'text-primary border-primary!' : '']"
              @click="handleNavClick(item.value)"
            >
              {{ item.label }}
            </div>
          </template>
        </li>
      </ul>
    </nav>

    <!-- 右侧登录/用户菜单 -->
    <div class="ml-auto">
      <el-dropdown
        v-if="isLoggedIn"
        trigger="click"
        @command="handleCommand"
      >
        <span
          class="flex-center size-[40px] bg-primary-300 rounded-full text-xs hover:cursor-pointer hover:bg-primary-500"
        >
          {{ userName }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in dropdownItems"
              :key="item.value"
              :command="item.value"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 未登录时：点击直接跳转 -->
      <span
        v-else
        class="flex-center size-[40px] bg-primary-300 rounded-full text-xs hover:cursor-pointer hover:bg-primary-500"
        @click="handleAvatarClick"
      >
        登录
      </span>
    </div>
  </header>
</template>
