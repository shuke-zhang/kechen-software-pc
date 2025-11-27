<!-- src/components/DocsLayout.vue -->
<script setup lang="ts">
import type { MenuItemRegistered } from 'element-plus'
import AppMain from './AppMain.vue'
import Head from './components/head/index.vue'

/**
 * 当前点击的是公共还是私有侧边栏菜单
 */
const currentSidebarItem = ref<MenuItemRegistered | null>(null)

onMounted(() => {

})
</script>

<template>
  <div class="app-main-container">
    <!-- 固定头部 -->
    <Head />

    <div
      class="app-wrapper"
    >
      <AppMain />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-wrapper {
  position: absolute;
  top: vars.$header-height;
  left: vars.$sidebar-menu-width;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 16px;
  &.no-sidebar {
    left: 0;
  }
  &.no-head {
    top: 0;
  }
}
.app-main-container {
  height: 100vh;
  background-image: url('/src/assets/theme/page-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
