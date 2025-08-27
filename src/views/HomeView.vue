<!-- src/components/DocsLayout.vue -->
<script setup lang="ts">
import Head from '@/views/head/index.vue'

const showCreate = ref(false)
</script>

<template>
  <div>
    <!-- 固定头部 -->
    <Head />

    <!-- 中间内容区：可伸展 -->
    <div class="flex-1 min-h-0 overflow-hidden">
      <router-view v-slot="{ Component }">
        <div class="h-full">
          <component :is="Component" />
        </div>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
</style>
