<!-- src/components/DocsLayout.vue -->
<script setup lang="ts">
import sidebar from './components/sidebar/index.vue'

const appRef = useTemplateRef('appRef')
const scrollbarHeight = computed(() => {
  return `${(appRef.value?.getBoundingClientRect().height || 0) + 32}px`
})
</script>

<template>
  <!-- 中间内容区：可伸展 -->
  <section ref="appRef" class="app-main p-[16px]">
    <sidebar :scrollbar-height="scrollbarHeight" />
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </section>
</template>

<style scoped lang="scss">
.app-main {
  /* 60= navbar  60  */
  min-height: calc(100vh - vars.$header-height - 32px);
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: rgba(240, 237, 247, 0.7);
  box-shadow: 0px 0px 5.08px #919191;
}

.app-main:has(.copyright) {
  padding-bottom: 36px;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
/* fade-transform */
.fade-transform--move,
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
