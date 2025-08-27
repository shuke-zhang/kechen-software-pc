export interface SysConfigInfo {
  ttsSetting: TtsSetting
  asrSetting: AsrSetting
}

export interface SearchEngineInfo {

  // from api
  name: string
  enable: boolean

  // for NSelector
  key: string
  label: string
  disabled: boolean
}

interface TtsSetting {
  synthesizer_side: string // TTS synthesizer, eg: client or server
  model_name: string
  platform: string // TTS model platform
}

interface AsrSetting {
  model_name: string
  platform: string
  max_record_duration: number // Maximum recording duration in seconds
  max_file_size: number // Maximum file size in bytes
}
