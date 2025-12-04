<script setup lang="ts">
import type { PropType } from 'vue';
import type { IconFontType } from '../icon-font/iconfont';

// defineEmits<{
//   (e: 'click', row: UploadRow): void
// }>()
defineProps<{
icon:IconFontType
}>()
function handleClick() {
  console.log('按钮')
}
</script>

<template>
  <div class=" button">
    <icon-font v-if="icon" :name="icon"></icon-font>
    <button  @click="handleClick">
      <slot name="default" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.button {
  padding: 8px 15px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  background-color: #eae1ff;
  box-shadow: 0px 0px 4.36px  #636363;
  &:hover{
    background-color: --el-color-primary;
  }
}
</style>
