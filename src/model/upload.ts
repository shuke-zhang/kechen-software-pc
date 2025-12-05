import type { UploadStatus } from 'element-plus'

/**
 * 拖拽文件上传示例
 */
export interface UploadRow {
  uid: string
  /**
   * 文件上传的文件名 - 前端获取
   */
  name: string
  /**
   * 文件扩展名 - 前端获取
   */
  type: string
  /**
   * 文件大小 - 前端获取 MB
   */
  size: string
  /**
   * 文件大小 - 前端获取 字节
   */
  sizeBytes: number
  /**
   * 文件最后修改时间 - 前端获取
   */
  createdAt: string
  /**
   * 上传进度百分比 0~100 - 前端获取
   */
  progress: number
  /**
   * @deprecated  已废弃 请在response中获取
   */
  url: string
  /**
   * 上传状态 - 前端获取
   */
  status: UploadStatus
  message?: string
  response?: ResponseData<UploadFileModel>
}

/**
 * 接口返回的模型
 */
export interface UploadFileModel {
  /**
   * 返回的实际文件地址-完整路径
   * http://192.168.3.22:11020/upload/2025/12/05/WeChat_20250515130652950737.mp4
   */
  accessPath: string
  /**
   * 返回的实际文件地址-截取的路径
   * 2025/12/05/WeChat_20250515130652034241.mp4
   */
  relativePath: string
  /**
   * 当前文件名
   */
  currentName: string
  /**
   * 返回的实际文件时长 - 秒
   */
  duration: number
  /**
   * 文件扩展名
   */
  fileExtension: string
  /**
   * 原始文件名称
   */
  originalName: string
}
