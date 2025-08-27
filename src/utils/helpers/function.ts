import type { AudioPlayState, Conversation } from '@/model/chat'
import { CHAT_MESSAGE_CONTENT_TYPE } from './constant'

export function emptyAudioPlayState(): AudioPlayState {
  return {
    audioUrl: '',
    playDuration: 0,
    playing: false,
    audio: null, // Audio object
    text: '', // Text to be read
    showText: false, // Whether to show the text
    audioUuid: '', // UUID of the audio file
    msgPart: '', // 聊天时不断接收到的消息片段，即时播放时使用
    audioFrame: '', // audio frame
  }
}

export function emptyChatMessage(): Chat.ChatMessage {
  return {
    uuid: '',
    createTime: '',
    thinkingContent: '',
    remark: '',
    audioUuid: '',
    audioUrl: '',
    audioDuration: 0, // in seconds
    messageRole: 0,
    children: [{ // for reply
      uuid: '',
      createTime: '',
      thinkingContent: '',
      remark: '',
      audioUuid: '',
      audioUrl: '',
      audioDuration: 0,
      messageRole: 0,
      children: [],
      aiModelPlatform: '',
      attachmentUrls: [],
      audioPlayState: emptyAudioPlayState(),
      contentType: CHAT_MESSAGE_CONTENT_TYPE.text, // 2: text, 3: audio
    }], // for reply
    aiModelPlatform: '',
    attachmentUrls: [],
    audioPlayState: emptyAudioPlayState(),
    contentType: CHAT_MESSAGE_CONTENT_TYPE.text, // 2: text, 3: audio
  }
}

export function emptyConv(): Conversation {
  return {
    uuid: '',
    title: '',
    remark: '',
    aiSystemMessage: '',
    understandContextEnable: false,
    loadedAll: false,
    loadedFirstPageMsg: false,
    minMsgUuid: '',
    mcpIds: [],
    answerContentType: CHAT_MESSAGE_CONTENT_TYPE.auto, // 1: auto, 2: text, 3: audio
    isAutoplayAnswer: false, // 聊天时音频类型的响应内容是否自动播放
    isEnableThinking: false, // 是否启用思考过程
  }
}
