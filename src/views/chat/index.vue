<script setup lang="ts">
import InputEditor from './component/InputEditor.vue'

// —— 上下文状态（示例：按你实际来源替换）——
const curConvUuid = ref('') // 当前会话 ID
const imageUuids = ref<string[]>([]) // 选中的图片 ID 列表
const isChatting = ref(false) // 是否正在生成/聊天中

// —— 子组件 ref，带类型 ——
// 让 TS 知道这是 InputEditor 的公开实例（需在子组件里通过 defineExpose 暴露需要的方法）
type InputEditorExpose = InstanceType<typeof InputEditor>
const inputEditorRef = shallowRef<InputEditorExpose | null>(null)

// —— 事件处理（避免模板里写内联箭头，类型也更清晰）——
function onMessageReceiving(_payload: unknown) {
  // TODO: 处理“消息接收中”的回调
}
function onMessageCompleted(_id?: string) {
  // TODO: 处理“消息完成”的回调
}
</script>

<template>
  <div class="container">
    <header class="mb-2 text-lg font-semibold">
      聊天
    </header>

    <InputEditor
      :key="curConvUuid"
      ref="inputEditorRef"
      v-model:is-chatting="isChatting"
      :conversation-uuid="curConvUuid"
      :image-uuids="imageUuids"
      @message-receiving="onMessageReceiving"
      @message-completed="onMessageCompleted"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
