<script setup lang="ts">
import type { TopNavValueModel, UserDropdownValueModel } from '@/model/head'

const router = useRouter()
const route = useRoute()
const title = import.meta.env.VITE_APP_TITLE

const UserStore = useUserStore()
const { userName, isLoggedIn } = storeToRefs(UserStore)

const activeNavItem = ref<TopNavValueModel | null>(null)
const dropdownItems: Array<{ label: string, value: UserDropdownValueModel }> = [
  // { label: '修改', value: 'put' },
  { label: '退出', value: 'logout' },
]

/**
 * 点击头像/登录按钮
 */
function handleAvatarClick() {
  if (!isLoggedIn.value) {
    // 未登录 -> 跳转登录页
    router.push('/login')
  }
}

function handleCommand(command: UserDropdownValueModel) {
  switch (command) {
    case 'put':
      router.push('/user/profile')
      break
    case 'logout':
      confirmError('是否确认退出登录', '提示').then(() => {
        UserStore.logout()
      })
      break
  }
}
function syncActive() {
  activeNavItem.value = route.meta.topNavCurrent as TopNavValueModel
}

onMounted(() => {
  syncActive()
})
</script>

<template>
  <header
    class="header-container fixed top-0 right-0 left-0  px-[20px] py-[15px]  flex items-center z-50 shadow-[inset_0_-2px_0_0_#e5e7eb]"
  >
    <div
      class="absolute bottom-0 left-0 w-full h-[10px]
              bg-[linear-gradient(180deg,#E6E6E6_0%,#D1BEF4_79.7%)]"
    />

    <div class="text-primary flex flex-col justify-between">
      <div class="text-[32px]">
        {{ title }}
      </div>
      <div class="text-[12px]">
        THE HEALING SPACE-TIME REHABILITATION SYSTEM
      </div>
    </div>

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

<style lang="scss" scoped>
.app-logo {
  width: vars.$sidebar-menu-width;
  height: vars.$header-height;
  background-image: url('@/assets/logo.png');
  background-size: cover;
  background-repeat: no-repeat; /* 防止图片重复 */
  cursor: pointer;
  // 添加右侧阴影
}
.header-container {
  height: vars.$header-height;
}
/* 如果是 <style scoped>，这一段直接写就行；不需要 deep */
:deep(.is-active-item) {
  color: var(--el-dropdown-menuItem-hover-color);
  background-color: var(--el-dropdown-menuItem-hover-fill);
}
/* 选中项被 hover 时，保持不变，避免“二次变色/闪动” */
:deep(.is-active-item:hover) {
  color: var(--el-dropdown-menuItem-hover-color);
  background-color: var(--el-dropdown-menuItem-hover-fill);
}
</style>
