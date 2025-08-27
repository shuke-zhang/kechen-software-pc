<script setup lang="ts">
import type { UploadFile } from 'element-plus'

const fileList = ref<string[]>([
  'http://127.0.0.1:8000/下载.jpg',
  'http://127.0.0.1:8000/张三2.pdf',
  'http://127.0.0.1:8000/数字医疗管理平台.pdf',
])
</script>

<template>
  <div class="p-[16px]">
    <UploadFile
      v-model="fileList"
      upload-url="http://127.0.0.1:8000/upload"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
