/**
 * 定义「AI 回复展示类型」的选项，下拉框里选择用户希望的展示方式
 */
export const RESPONSE_SHOW_TYPE_OPTIONS = [
  { label: '自动', value: 1 },
  { label: '文本', value: 2 },
  { label: '音频(自动播放)', value: 3 },
  { label: '音频(不自动播放)', value: 4 },
]

/**
 * 定义聊天消息的类型常量：自动 / 文本 / 音频
 * - 1: 自动
 * - 2: 文本
 * - 3: 音频
 */
export const CHAT_MESSAGE_CONTENT_TYPE = {
  auto: 1, // 自动
  text: 2, // 文本
  audio: 3, // 音频
}

/**
 * 音频合成位置：客户端(web)或服务端
 * - client: 客户端
 * - server: 服务端
 */
export const AUDIO_SYNTHESIZER_SIDE = {
  client: 'client',
  server: 'server',
}
