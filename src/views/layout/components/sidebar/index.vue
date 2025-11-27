<script setup lang="ts">
import type { TopNavValueModel } from '@/model/head'
import { routes } from '@/router/routes'
import sidebarItem from './sidebarItem.vue'

defineProps({
  scrollbarHeight: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const sidebarRef = useTemplateRef('sidebarRef')
const currentIndex = ref('device')

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

// 统一用 el-menu 的 select 事件

onMounted(() => {
  activeKey.value = route.name as string
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
