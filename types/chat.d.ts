declare namespace Chat {
  interface AiModelInfo {

    // from api
    modelId: string
    modelName: string
    modelTitle: string
    modelPlatform: string
    enable: boolean
    isFree: boolean
    inputTypes: string
    isReasoner: boolean
    isThinkingClosable: boolean

    // for NSelector
    value: string
    key: string
    label: string
    disabled: boolean
  }

  interface SearchEngineInfo {

    // from api
    name: string
    enable: boolean

    // for NSelector
    key: string
    label: string
    disabled: boolean
  }

  interface AsrSetting {
    model_name: string
    platform: string
    max_record_duration: number // Maximum recording duration in seconds
    max_file_size: number // Maximum file size in bytes
  }

  interface TtsSetting {
    synthesizer_side: string // TTS synthesizer, eg: client or server
    model_name: string
    platform: string // TTS model platform
  }

  interface SysConfigInfo {
    asrSetting: AsrSetting
    ttsSetting: TtsSetting
  }

  interface AudioPlayState {
    /**
     * 音频文件的URL
     */
    audioUrl: string
    /**
     * 音频文件的唯一标识符
     */
    audioUuid: string
    /**
     * 播放时长
     */
    playDuration: number
    /**
     * 播放状态 true: 正在播放, false: 暂停
     */
    playing: boolean
    /**
     * 音频对象
     */
    audio: any
    /**
     * 对应音频的文本内容
     */
    text: string
    /**
     * 是否显示文本内容
     */
    showText: boolean
    /**
     * 聊天时不断接收到的消息片段，即时播放时使用
     */
    msgPart: string //
    /**
     * 聊天时不断接收到的音频片段(已经过base64编码)，即时播放时使用
     */
    audioFrame: string
  }

  /**
   * 会话（Conversation）对象结构
   */
  interface Conversation {
    /**
     * 会话标题（通常为第一条消息的摘要）
     */
    title: string

    /**
     * 会话唯一标识符（UUID）
     */
    uuid: string

    /**
     * 会话备注或描述信息
     */
    remark: string

    /**
     * AI 的系统提示词（system message）
     * - 用于控制模型的整体行为，例如“你是一个翻译助手”
     */
    aiSystemMessage: string

    /**
     * 是否启用上下文理解
     * - true：新消息会携带历史上下文
     * - false：每条消息独立，不带上下文
     */
    understandContextEnable: boolean

    /**
     * 是否已加载所有历史消息
     * - true：已完全加载
     * - false：可能需要翻页/懒加载
     */
    loadedAll: boolean

    /**
     * 是否已加载过第一页消息
     * - true：至少拉取过第一页
     * - false：还没加载过任何消息
     */
    loadedFirstPageMsg: boolean

    /**
     * 当前已加载消息的最小 uuid
     * - 用于翻页拉取时定位
     */
    minMsgUuid?: string | ''

    /**
     * 与会话绑定的 MCP（多组件插件）ID 列表
     */
    mcpIds: string[]

    /**
     * 会话的回答内容类型
     * - 1: auto（自动判断）
     * - 2: text（文本回答）
     * - 3: audio（音频回答）
     */
    answerContentType: number

    /**
     * 是否在聊天时自动播放音频类的响应内容
     */
    isAutoplayAnswer: boolean

    /**
     * 是否启用“思考过程”展示
     * - true：在流式输出时先展示模型的推理过程
     */
    isEnableThinking: boolean
  }
  interface ChatState {
    active: string
    usingContext: boolean
    conversations: Conversation[]
    chats: ConvWithMessages[]
    loadingMsgs: Set<string>
    presetConvs: ConversationPreset[]
  }

  interface ConvWithMessages {
    uuid: string
    data: ChatMessage[]
  }

  interface ConversationPreset {
    id: string
    uuid: string
    title: string
    remark: string
    aiSystemMessage: string
    used: boolean
  }

  interface ChatMessage {
    uuid: string | ''
    contentType: number // 2: text, 3: audio
    createTime: string
    thinkingContent: string // 思考过程
    remark: string
    audioUuid: string
    audioUrl: string
    audioDuration: number // in seconds
    messageRole?: number
    children: ChatMessage[] // AI回复的消息
    aiModelPlatform?: string
    attachmentUrls: string[]

    // Frontend only
    inversion?: boolean
    error?: boolean
    thinking?: boolean // 是否正在思考
    loading?: boolean
    audioPlayState: AudioPlayState
  }

  interface ConvToPresetRel {
    id: string
    uuid: string
    userConvId: string
    presetConvId: string
  }
}
