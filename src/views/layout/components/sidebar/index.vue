<script setup lang="ts">
import type { MenuItemRegistered } from 'element-plus'
import type { RouteRecordRaw } from 'vue-router'
import type { TopNavValueModel } from '@/model/head'
import { routes } from '@/router/routes'
import { sidebarVideo } from './video'

const emit = defineEmits<{
  (e: 'menu-item-click', item: MenuItemRegistered): void
}>()
const route = useRoute()
const isActiveCategory = ref(false)
const currentIndex = ref('')
const publicSidebars = [
  {
    label: '公共',
    value: 'public',
  },
  {
    label: '个人',
    value: 'private',
  },
]

const topNavList: {
  label: string
  value: TopNavValueModel
}[] = [
  { label: '患者', value: 'patient' },
  { label: '设备管理', value: 'device' },
  { label: '治疗记录', value: 'visitRecord' },
  { label: '报告', value: 'report' },
  { label: '设置', value: 'settings' },
]

function getSidebarIcon(icon: string) {
  return {
    width: '56px',
    height: '56px',
    backgroundImage: `url('/src/assets/theme/sidebar/${icon}.png')`,

    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }
}

const sidebars = computed(() => {
  const names = topNavList.map(it => it.value)
  const topRoute = routes.find(r => r.name === 'layout')?.children ?? []
  const res = topRoute.filter((r) => {
    return r.name !== undefined && names.includes(r.name as TopNavValueModel)
  })
  console.log(res, 'res')

  return res
})

const activeKey = ref('device')
function hasTitle(title: string) {
  if (title.length > 5) {
    return title
  }
  else {
    return ''
  }
}

function handleMenuItemClick(item: MenuItemRegistered) {
  // TODO 点击侧边栏菜单项的逻辑
  currentIndex.value = item.index
  console.log(currentIndex.value)

  emit('menu-item-click', item)
}
// 统一用 el-menu 的 select 事件

// 可选：首次挂载时主动触发一次（如果你需要立刻加载“公共”内容）
onMounted(() => {
  activeKey.value = 'device'
  // 获取当前页面路由中是否包含了category
})
// 监听路由变化
watch(
  () => route.fullPath,
  (newPath) => {
    console.log(route, '路由')
    const item = {
      index: newPath.includes('category') ? sidebarVideo[0].label : publicSidebars[0].label,
      indexPath: [newPath.includes('category') ? sidebarVideo[0].value : publicSidebars[0].value],
      active: true,
    } as MenuItemRegistered
    handleMenuItemClick(item)
    isActiveCategory.value = newPath.includes('category')
    activeKey.value = newPath.includes('category') ? sidebarVideo[0].value : publicSidebars[0].value
  },
  { immediate: true },
)
</script>

<template>
  <div class="sidebar-container">
    <el-scrollbar wrap-class="scrollbar-wrapper pt-[30px]">
      <el-menu
        text-color="#ffffff"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
        :default-active="activeKey"
        class="h-full"
        style="background-color: unset;"
      >
        <el-menu-item
          v-for="(item) in sidebars"
          :key="item.name"
          :item="item"
          :index="item.name"
          class="mt-[10px]"
          @click="handleMenuItemClick"
        >
          <template #title>
            <div class="flex items-center w-full h-full">
              <div :style="getSidebarIcon(item.meta.icon!)" />
              <div
                class="
                  ml-[10px]
                  w-[180px]
                  h-[50px]
                  text-[20px]
                  rounded-[20px]
                  flex items-center justify-center
                  tracking-[1.5px]
                  px-[6px]
                  bg-[url('/src/assets/theme/sidebar/sidebar-item-bg.png')]
                  bg-cover bg-center bg-no-repeat
                  shadow-[0_0_8px_rgba(0,0,0,0.4)]
                  "
                :class="[item.name === currentIndex ? 'text-primary' : '']"
                :title="hasTitle(item.meta.title)"
              >
                {{ item.meta.title }}
              </div>
            </div>
          </template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
  .sidebar-container {
  transition: width 0.28s;
  width: vars.$sidebar-menu-width !important;
  height: 100%;
  position: fixed !important;
  font-size: 0px;
  top: vars.$header-height;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
  .scrollbar-wrapper {
    background-color: #282c34 !important;
  }

  :deep(.el-sub-menu__title:hover) {
    background-color: #2e3033 !important;
  }
  :deep(.el-menu) {
    border: 0;
  }
  :deep(.el-menu-item) {
    display: flex !important;
    align-items: center !important;
    padding-left: 10px !important;
    padding-right: 10px !important;
    &:hover {
      background-color: #d7bdfd !important;
    }
  }

  :deep(.el-menu-item.is-active) {
    background-color: unset !important;
  }
}
</style>
