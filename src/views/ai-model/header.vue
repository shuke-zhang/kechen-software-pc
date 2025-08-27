<script setup lang="ts">
import { ClickOutside as vClickOutside } from 'element-plus'

const buttonRef = useTemplateRef('buttonEl')
const popoverRef = useTemplateRef('popoverEl')
const activeModel = defineModel()
const modelList = [
  {
    id: 1,
    name: '豆包无敌大模型-1',
  },
  {
    id: 2,
    name: '豆包无敌大模型-2',
  },
  {
    id: 3,
    name: '豆包无敌大模型-3',
  },
  {
    id: 4,
    name: '豆包无敌大模型-4',
  },
  {
    id: 5,
    name: '豆包无敌大模型-5',
  },
]
function onClickOutside() {
  popoverRef.value?.hide()
}
function handleSelectModel(item: { id: number, name: string }) {
  activeModel.value = item.name
  // 主动关闭
  popoverRef.value?.hide()
}
onMounted(() => {
  activeModel.value = modelList[0].name
})
</script>

<template>
  <el-header class="border-b border-[#efeff5] flex items-center">
    <el-button ref="buttonEl" v-click-outside="onClickOutside">
      {{ activeModel }}
    </el-button>

    <el-popover
      ref="popoverEl"
      :virtual-ref="buttonRef"
      trigger="click"
      virtual-triggering
      :popper-style="{ padding: '8px', width: '200px', maxHeight: '300px', overflowY: 'auto' }"
    >
      <div
        v-for="item in modelList"
        :key="item.id"
        class="h-[36px] flex items-center px-3 cursor-pointer transition-colors rounded-[4px]"
        :class="{ 'bg-primary-300': activeModel === item.name, 'hover:bg-[#f5f5f5]': activeModel !== item.name }"
        role="button"
        @click="handleSelectModel(item)"
      >
        {{ item.name }}
      </div>
    </el-popover>
  </el-header>
</template>

<style scoped lang="scss">
</style>
