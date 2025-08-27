<script setup lang="ts">
import type { UploadProgressEvent, UploadRequestOptions, UploadUserFile } from 'element-plus'
import type { PropType } from 'vue'
import axios from 'axios'
import { dayjs, ElMessage } from 'element-plus'
import { computed } from 'vue'

export type UploadStatus = 'uploading' | 'success' | 'error'
export interface UploadRow {
  uid: string
  name: string
  type: string
  size: string // 带单位的尺寸：如 "823.42 KB" / "3.10 MB" / "1.02 GB"
  sizeBytes: number // 原始字节
  createdAt: string
  progress: number
  url: string
  status: UploadStatus
  message?: string
  response?: any
}

const props = defineProps({
  action: { type: String, default: '/upload' },
  uploadUrl: { type: String },
  resolveUrl: {
    type: Function as PropType<(resp: any) => string>,
    default: (resp: any) =>
      resp?.data?.url
      ?? resp?.data?.public_url
      ?? resp?.data?.download_url
      ?? resp?.url
      ?? '',
  },
  method: { type: String as PropType<'POST' | 'PUT' | 'PATCH'>, default: 'POST' },
  headers: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  withCredentials: { type: Boolean, default: false },
  extraForm: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
})

const emit = defineEmits<{
  (e: 'progress', row: UploadRow): void
  (e: 'success', row: UploadRow): void
  (e: 'error', row: UploadRow): void
}>()

const files = defineModel<UploadRow[]>('files', { default: () => [] })

const finalUploadUrl = computed(
  () => props.uploadUrl ?? `${import.meta.env.VITE_API_URL || ''}${props.action}`,
)

function formatBytes(bytes: number): string {
  const KB = 1024
  const MB = KB * 1024
  const GB = MB * 1024
  if (bytes < MB)
    return `${(bytes / KB).toFixed(2)} KB`
  if (bytes < GB)
    return `${(bytes / MB).toFixed(2)} MB`
  return `${(bytes / GB).toFixed(2)} GB`
}

function upsert(uid: string, patch: Partial<UploadRow> & Pick<UploadRow, 'uid'>) {
  const i = files.value.findIndex(r => r.uid === uid)
  if (i === -1)
    files.value.push(patch as UploadRow)
  else files.value[i] = { ...files.value[i], ...patch }
}
const getRow = (uid: string) => files.value.find(r => r.uid === uid)!

function handleChange(uploadFile: UploadUserFile) {
  const uid = (uploadFile as any).uid as string
  if (files.value.some(r => r.uid === uid))
    return
  const f = uploadFile.raw as File
  const sizeBytes = f?.size ?? 0
  upsert(uid, {
    uid,
    name: uploadFile.name || f?.name || '',
    type: f?.type || '',
    size: formatBytes(sizeBytes),
    sizeBytes,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    progress: 0,
    url: '',
    status: 'uploading',
  })
  emit('progress', getRow(uid))
}

function makeUploadProgressEvent(percent: number, loaded = 0, total = 100): UploadProgressEvent {
  const evt = new ProgressEvent('progress', {
    lengthComputable: true,
    loaded,
    total,
  })
  ;(evt as any).percent = percent
  return evt as UploadProgressEvent
}

async function doUpload({ file, onProgress, onSuccess, onError }: UploadRequestOptions) {
  const f = file as File
  const uid = (file as any).uid as string

  if (!files.value.some(r => r.uid === uid)) {
    const sizeBytes = f.size
    upsert(uid, {
      uid,
      name: f.name,
      type: f.type || '',
      size: formatBytes(sizeBytes),
      sizeBytes,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      progress: 0,
      url: '',
      status: 'uploading',
    })
  }

  try {
    const form = new FormData()
    form.append('file', f)
    Object.entries(props.extraForm).forEach(([k, v]) => form.append(k, String(v)))

    let last = 0
    const res = await axios.request({
      method: props.method,
      url: finalUploadUrl.value,
      data: form,
      headers: { 'Content-Type': 'multipart/form-data', ...props.headers },
      withCredentials: props.withCredentials,
      onUploadProgress: (e) => {
        if (!e.total)
          return
        let p = Math.floor((e.loaded / e.total) * 100)
        if (p >= 100)
          p = 99
        if (p > last) {
          last = p
          upsert(uid, { uid, progress: p, status: 'uploading' })
          onProgress?.(makeUploadProgressEvent(p, e.loaded, e.total))
          emit('progress', getRow(uid))
        }
      },
    })

    const data = res.data
    if (data?.code && data.code !== 200)
      throw new Error(data?.msg || '上传失败')

    const url = props.resolveUrl(data)
    upsert(uid, { uid, progress: 100, status: 'success', url, response: data })
    onSuccess?.(data)
    onProgress?.(makeUploadProgressEvent(100, 1, 1))
    emit('success', getRow(uid))
    ElMessage.success('上传成功')
  }
  catch (err: any) {
    upsert(uid, { uid, status: 'error', message: err?.message || '上传失败' })
    onError?.(err)
    emit('error', getRow(uid))
    ElMessage.error(err?.message || '上传失败')
  }
}
</script>

<template>
  <el-upload
    class="upload-demo h-full"
    drag
    action=""
    :show-file-list="false"
    :http-request="doUpload"
    :on-change="handleChange"
    multiple
    style="background-color:#f1f1f1;height: 100%;"
  >
    <div class="h-full flex flex-col justify-center items-center text-[#1b79ff]">
      <svg viewBox="0 0 1024 1024" focusable="false" data-icon="inbox" width="1.5em" height="1.5em" fill="currentColor" aria-hidden="true"><path d="M885.2 446.3l-.2-.8-112.2-285.1c-5-16.1-19.9-27.2-36.8-27.2H281.2c-17 0-32.1 11.3-36.9 27.6L139.4 443l-.3.7-.2.8c-1.3 4.9-1.7 9.9-1 14.8-.1 1.6-.2 3.2-.2 4.8V830a60.9 60.9 0 0060.8 60.8h627.2c33.5 0 60.8-27.3 60.9-60.8V464.1c0-1.3 0-2.6-.1-3.7.4-4.9 0-9.6-1.3-14.1zm-295.8-43l-.3 15.7c-.8 44.9-31.8 75.1-77.1 75.1-22.1 0-41.1-7.1-54.8-20.6S436 441.2 435.6 419l-.3-15.7H229.5L309 210h399.2l81.7 193.3H589.4zm-375 76.8h157.3c24.3 57.1 76 90.8 140.4 90.8 33.7 0 65-9.4 90.3-27.2 22.2-15.6 39.5-37.4 50.7-63.6h156.5V814H214.4V480.1z" /></svg>
      <div class="text-[#000000]">
        单击或拖动文件到此区域进行上传
      </div>
      <div class="mt-[4px] text-[12px] text-gray-400">
        支持批量上传
      </div>
    </div>
  </el-upload>
</template>

<style scoped>
:deep(.el-upload) {
  height: 100%;
}
:deep(.el-upload-dragger) {
  background-color: #f1f1f1; /* 自定义颜色 */
  height: 100%;
}
</style>
