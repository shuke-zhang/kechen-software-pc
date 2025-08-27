<script setup lang="ts">
import Chat from '@/views/chat/index.vue'
import Header from './header.vue'
import Sider from './sider.vue'

const activeKbUuid = ref<string | null>(null)
const activeModel = ref<string | null>(null)
</script>

<template>
  <el-container class="h-full">
    <Sider v-model="activeKbUuid" />
    <el-container direction="vertical">
      <Header v-model="activeModel" />
      <!-- 主要聊天界面 -->
      <el-main>
        <Chat />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
</style>
