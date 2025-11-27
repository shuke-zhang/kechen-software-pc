<script setup lang="ts">
import type { MenuItemRegistered } from 'element-plus'
import type { TopNavValueModel } from '@/model/head'
import { routes } from '@/router/routes'
import sidebarItem from './sidebarItem.vue'
import { sidebarVideo } from './video'

defineProps({
  scrollbarHeight: {
    type: String,
    required: true,
  },
})
const emit = defineEmits<{
  (e: 'menu-item-click', item: MenuItemRegistered): void
}>()
const route = useRoute()
const sidebarRef = useTemplateRef('sidebarRef')
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
onMounted(() => {

})
</script>

<template>
  <div ref="sidebarRef" class="sidebar-container">
    <el-scrollbar wrap-class="scrollbar-wrapper pt-[30px]" :max-height="scrollbarHeight">
      <el-menu
        text-color="#ffffff"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
        :default-active="activeKey"
        class="h-full"
        style="background-color: unset;"
      >
        <sidebarItem v-for="item in sidebars" :key="item.name" v-model:current-index="currentIndex" :item="item" />
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
  top: vars.$header-height;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
  .scrollbar-wrapper {
    // background-color: #d7bdfd !important;
    background-color: #860f2f !important;
  }

  :deep(.el-sub-menu__title) {
    padding-left: 10px !important;
    padding-right: 10px !important;
    &:hover {
      background-color: #d7bdfd !important;
    }
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
:deep(.sidebar-container .el-sub-menu__title) {
  padding-left: 10px !important;
  padding-right: 10px !important;
  &:hover {
    background-color: #d7bdfd !important;
  }
}
:deep(.el-icon svg) {
  width: 20px;
  height: 20px;
}
</style>
