<script setup lang="ts">
import { Microphone, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import NativeChatInput from './NativeChatInput.vue'

// ✅ 请根据你的路径调整

// 占位文案（也可改成 props 传入）
const placeholder = '请输入消息'

// 输入值
const prompt = ref('')

// 键盘处理（按需实现）
function handleUp() {}
function handleDown() {}
function handleEnter(evt: KeyboardEvent | Event) {
  if (!(evt instanceof KeyboardEvent))
    return // 只处理键盘事件
  if (evt.isComposing)
    return // 中文输入法合成中不提交
  handleSubmit()
}

// 提交按钮禁用态
const buttonDisabled = computed(() => !prompt.value.trim())

// 提交逻辑（按需替换为你的发送函数）
function handleSubmit() {
  const text = prompt.value.trim()
  if (!text) {
    ElMessage.warning('请输入内容')
    return
  }
  // TODO: 在这里调用你的发送消息逻辑
  // sendMessage(text)
  ElMessage.success(`已提交：${text}`)
}

// 语音录制弹窗
const showAudioRecorderModal = ref(false)
function handleShowAudioRecorderModal() {
  showAudioRecorderModal.value = true
}
function handleAudioRecorded(audioUrl: string, blob: Blob, durationSec: number) {
  // TODO: 录制完成回调
  console.log('recorded', { audioUrl, durationSec, blob })
}
function handleAudioSubmitted(uuid: string, url: string, durationSec: number) {
  // TODO: 提交完成回调
  console.log('submitted', { uuid, url, durationSec })
}
function onEnter() {
  console.log('提交按钮触发')
}

function openAttach() {
  console.log('左侧按钮触发')
}

function openRecorder() {
  console.log('右侧录音按钮触发')
}
</script>

<template>
  <div class="flex items-center space-x-2">
    <NativeChatInput
      v-model="prompt"
      :min-rows="1"
      :max-rows="4"
      @submit="onEnter"
      @attach="openAttach"
      @record="openRecorder"
    />
    <!-- <el-input
      v-model="prompt"
      type="textarea"
      :placeholder="placeholder"
      :autosize="{ minRows: 1, maxRows: 6 }"
      autocomplete="on"
      resize="none"
      @keyup.up="handleUp"
      @keyup.down="handleDown"
      @keydown.enter.exact.prevent="handleEnter"
    >
      <template #prefix>
        <icon-font name="plus" />
      </template>
      <template #suffix>
        <icon-font name="recorder-fill" />
      </template>
    </el-input> -->
    <!-- 提交 -->
    <!-- <el-button class="flex-none" type="primary" :disabled="buttonDisabled" @click="handleSubmit">
      <template #icon>
        <el-icon><Promotion /></el-icon>
      </template>
    </el-button> -->

    <!-- 语音按钮 -->
    <!-- <el-button class="flex-none" type="primary" @click="handleShowAudioRecorderModal">
      <template #icon>
        <el-icon><Microphone /></el-icon>
      </template>
    </el-button> -->

    <!-- 语音对话弹窗（Element Plus） -->
    <el-dialog
      v-model="showAudioRecorderModal"
      title="语音对话"
      width="600px"
      :close-on-click-modal="false"
      align-center
    >
      <AudioRecorder
        @recorded="handleAudioRecorded"
        @submitted="handleAudioSubmitted"
        @exit="showAudioRecorderModal = false"
      />
      <template #footer>
        <el-button @click="showAudioRecorderModal = false">
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.prompt-autocomplete {
  max-width: 600px;
}

/* 作用到内部原生 textarea（el-input 的真实滚动容器） */
:deep(.el-textarea__inner) {
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(144, 147, 153, 0.6) transparent; /* thumb / track */

  /* 让超出时只显示竖向滚动条的细样式 */
  overflow-y: auto;
  overflow-x: hidden;
}

/* WebKit 系列（Chrome/Edge/Safari） */
:deep(.el-textarea__inner::-webkit-scrollbar) {
  width: 8px; /* 滚动条宽度 */
}
:deep(.el-textarea__inner::-webkit-scrollbar-track) {
  background: transparent; /* 轨道透明 */
}
:deep(.el-textarea__inner::-webkit-scrollbar-thumb) {
  background: rgba(144, 147, 153, 0.6); /* thumb 颜色，接近 EP 灰 */
  border-radius: 8px;
  border: 2px solid transparent; /* 留出缝隙，显得更轻 */
  background-clip: content-box;
}
:deep(.el-textarea__inner:hover::-webkit-scrollbar-thumb) {
  background: rgba(144, 147, 153, 0.75);
}
/* 暗色主题下稍亮一点 */
:deep(html.dark .el-textarea__inner) {
  scrollbar-color: rgba(255, 255, 255, 0.35) transparent;
}
:deep(html.dark .el-textarea__inner::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.35);
}
</style>
