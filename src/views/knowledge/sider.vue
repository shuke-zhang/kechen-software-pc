<script setup lang="ts">
import List from './list.vue'

const activeKbUuid = defineModel<string | null>()
</script>

<template>
  <n-layout-sider
    :width="200"
    bordered
    :native-scrollbar="true"
    content-style="
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      padding: 0;
    "
  >
    <List v-model="activeKbUuid" />
    <div class="p-4 border-t border-gray-200 dark:border-neutral-800">
      <n-button type="primary" block ghost @click="$router.push({ name: 'KnowledgeManage' })">
        管理我的知识库
      </n-button>
    </div>
  </n-layout-sider>
</template>

<style scoped lang="scss">
</style>
