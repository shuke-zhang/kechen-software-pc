/**
 * 视频数据模型
 */
export interface VideoModel {
  /** 视频唯一标识（通常由数据库或时间戳生成） */
  id?: string

  /** 视频标题 */
  title?: string

  /** 视频简介/描述（简短文本，支持 1~2 行） */
  description?: string

  /** 视频所属分类，例如：冥想、培训、宣传等 */
  category?: string

  /** 视频标签（用于筛选/搜索），如 ["教育", "4K"] */
  tags?: string[]

  /** 视频封面图片地址（URL 或本地预览地址） */
  coverUrl?: string

  /** 视频播放地址（URL 或本地预览地址） */
  videoUrl?: string

  /** 视频时长（单位：秒） */
  durationSec?: number

  /** 创建时间（ISO 字符串，如 "2025-09-02T10:00:00Z"） */
  createdAt?: string

  /** 视频观看次数 */
  views?: number
  /** 视频文本是否被截断 */
  isTextTruncated?: boolean
}
