<script setup lang="ts">
import type { Awaitable } from '@vueuse/core'
import type {
  UploadFile,
  UploadFiles,
  UploadProgressEvent,
  UploadRawFile,
  UploadUserFile,
} from 'element-plus'
import type { EpPropMergeType } from 'element-plus/es/utils'
import type { PropType } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// pdf.js（v4）
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

/* ===================== Props ===================== */
const props = defineProps({
  action: { type: String, default: '/upload' },
  uploadUrl: { type: String },
  width: { type: String, default: '120px' },
  height: { type: String, default: '120px' },
  iconSize: { type: String, default: '16' },
  iconColor: { type: String, default: '#000000' },

  /** 'pdf' | ['png','jpg'] | '.zip' | 'application/pdf' | 'image/*' */
  fileTypes: {
    type: [Array, String] as PropType<string[] | string>,
    default: () => [] as string[],
  },

  listType: {
    type: String as PropType<EpPropMergeType<StringConstructor, 'picture-card' | 'text' | 'picture', unknown> | undefined>,
    default: 'picture-card',
  },
  btnText: { type: String, default: '上传' },

  drag: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },

  limit: { type: Number, default: 0 },
  fileSize: { type: Number, default: 100 },

  /** ✅ 是否显示右上角角标（你提的第 2 点） */
  isOccupyCorner: { type: Boolean, default: false },

  /** 是否显示下方文件名 */
  showFilename: { type: Boolean, default: true },
})

/* ===================== Emits / v-model ===================== */
const emit = defineEmits(['onProgress', 'onRemove', 'onSuccess', 'onError', 'onBeforeRemove', 'update:fileList'])

GlobalWorkerOptions.workerSrc = pdfjsWorker

type UploadFileWithThumb = UploadFile & { thumbnailUrl?: string, originUrl?: string }

/** v-model（string | string[]，值为 public_url） */
const fileLists = defineModel<string | string[]>()

/* ===================== State ===================== */
const fileData = ref<UploadUserFile[]>([]) // 传给 el-upload 的文件列表
const dialogImageUrl = ref('') // 预览缩略图
const dialogOriginalUrl = ref('') // 原文件URL
const dialogVisible = ref(false)

const uploadUrl = computed(() => props.uploadUrl ? props.uploadUrl : `${import.meta.env.VITE_API_URL || ''}${props.action}`)

const max = computed(() => props.limit)
const itemMarin = computed(() => (props.limit === 1 ? 0 : '10px'))
const width = computed(() => (props.width.includes('px') ? props.width : `${props.width}px`))
const height = computed(() => (props.height.includes('px') ? props.height : `${props.height}px`))
const progressSize = computed(() => (props.height.includes('px') ? `${Number.parseFloat(props.height) - 5}px` : `${Number(props.height) - 5}px`))
const oneLimitHeight = computed(() => (props.limit === 1 ? height.value : null))

/* ===================== 工具：类型/扩展名/accept ===================== */
function getExt(nameOrUrl = '') {
  const q = nameOrUrl.split('?')[0]
  const seg = q.split('/').pop() || ''
  const dot = seg.lastIndexOf('.')
  return dot >= 0 ? seg.slice(dot + 1).toLowerCase() : ''
}
function isImageExt(ext: string) {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
}

function matchTypeByRules(file: UploadRawFile, rules: string[]) {
  if (!rules.length)
    return true
  const ext = getExt(file.name)
  const mime = (file as any).type as string
  return rules.some((raw) => {
    const rule = raw.toLowerCase().trim()
    if (!rule)
      return false
    if (rule.startsWith('.'))
      return ext === rule.slice(1)
    if (!rule.includes('/'))
      return ext === rule
    if (rule.endsWith('/*'))
      return mime?.startsWith(rule.replace('/*', '/'))
    return mime === rule
  })
}

const acceptAttr = computed(() => {
  let list = props.fileTypes
  if (typeof list === 'string')
    list = [list]
  const exts = (list as string[])
    .filter(r => !r.includes('/'))
    .map(r => r.startsWith('.') ? r : `.${r}`)
  return exts.join(',') || undefined
})

/* ===================== PDF → 缩略图 ===================== */
async function pdfToThumbDataUrl(src: Blob | string, maxW = 480): Promise<string> {
  try {
    let buffer: ArrayBuffer
    if (src instanceof Blob) {
      buffer = await src.arrayBuffer()
    }
    else {
      const res = await fetch(src, { credentials: 'omit' })
      if (!res.ok)
        throw new Error(`HTTP ${res.status}`)
      buffer = await res.arrayBuffer()
    }
    const loadingTask = getDocument({ data: buffer })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)

    const viewport = page.getViewport({ scale: 1 })
    const scale = Math.min(1, maxW / viewport.width)
    const scaledViewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = Math.floor(scaledViewport.width)
    canvas.height = Math.floor(scaledViewport.height)

    await page.render({ canvas, canvasContext: ctx, viewport: scaledViewport } as any).promise
    return canvas.toDataURL('image/jpeg', 0.85)
  }
  catch (e) {
    console.error('pdfToThumbDataUrl error:', e)
    return iconDataUrl('pdf') // 兜底
  }
}

/* ===================== 类型图标 & 缩略图 ===================== */
const ICONS: Record<string, string> = {
  pdf: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#f6e9ea"/><text x="50%" y="55%" text-anchor="middle" font-size="48" fill="#d93025" font-family="Arial">PDF</text></svg>`,
  doc: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#e7efff"/><text x="50%" y="55%" text-anchor="middle" font-size="48" fill="#2b579a" font-family="Arial">DOC</text></svg>`,
  docx: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#e7efff"/><text x="50%" y="55%" text-anchor="middle" font-size="48" fill="#2b579a" font-family="Arial">DOCX</text></svg>`,
  xls: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#ebf7ec"/><text x="50%" y="55%" text-anchor="middle" font-size="48" fill="#217346" font-family="Arial">XLS</text></svg>`,
  xlsx: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#ebf7ec"/><text x="50%" y="55%" text-anchor="middle" font-size="48" fill="#217346" font-family="Arial">XLSX</text></svg>`,
  ppt: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#fff0e6"/><text x="50%" y="55%" text-anchor="middle" font-size="48" fill="#d24726" font-family="Arial">PPT</text></svg>`,
  pptx: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#fff0e6"/><text x="50%" y="55%" text-anchor="middle" font-size="48" fill="#d24726" font-family="Arial">PPTX</text></svg>`,
  txt: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#f4f6f8"/><text x="50%" y="55%" text-anchor="middle" font-size="48" fill="#5f6368" font-family="Arial">TXT</text></svg>`,
  zip: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#fff8e1"/><text x="50%" y="55%" text-anchor="middle" font-size="48" fill="#f4b400" font-family="Arial">ZIP</text></svg>`,
}
const DEFAULT_ICON
  = `data:image/svg+xml;utf8,${
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="100%" height="100%" fill="#eef0f5"/><text x="50%" y="55%" text-anchor="middle" font-size="42" fill="#6b7280" font-family="Arial">FILE</text></svg>`)}`

function iconDataUrl(ext: string) {
  const svg = ICONS[ext] || DEFAULT_ICON
  return svg.startsWith('data:') ? svg : `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** 缩略图：图片=原图；PDF=第一页封面；其它=类型图标 */
async function ensureThumbnail(uploadFile: UploadFile): Promise<string> {
  const f = uploadFile as UploadFileWithThumb
  const url = (f.originUrl || f.url || '') as string
  const nameOrUrl = url || f.name
  const ext = getExt(nameOrUrl)

  if (isImageExt(ext)) {
    const img = url || f.url || ''
    f.thumbnailUrl = img
    f.url = img
    return img
  }
  if (ext === 'pdf') {
    const placeholder = iconDataUrl('pdf')
    f.thumbnailUrl = placeholder
    f.url = placeholder
    const dataUrl = url
      ? await pdfToThumbDataUrl(url)
      : (f as any).raw
          ? await pdfToThumbDataUrl((f as any).raw as Blob)
          : iconDataUrl('pdf')
    f.thumbnailUrl = dataUrl
    f.url = dataUrl
    return dataUrl
  }
  const icon = iconDataUrl(ext)
  f.thumbnailUrl = icon
  f.url = icon
  return icon
}

/* ===================== 角标（后缀）渲染辅助 ===================== */
/**
 * 角标渲染
 */
async function updateExtBadges() {
  if (!props.isOccupyCorner)
    return
  await nextTick()
  const items = document.querySelectorAll('.el-upload-list__item')
  items.forEach((el, i) => {
    const it = fileData.value[i] as any
    const nameOrUrl = (it?.originUrl || it?.url || it?.name || '') as string
    const ext = getExt(nameOrUrl).toUpperCase()
    ;(el as HTMLElement).setAttribute('data-ext', ext || '')
  })
}

/* ===================== 公共：从列表和 v-model 中移除文件 ===================== */
function removeFromLists(uploadFile: UploadFile) {
  // 从 el-upload 的 fileData 移除
  const idx = fileData.value.findIndex((f: any) => (f.uid && (f as any).uid === (uploadFile as any).uid) || f.url === uploadFile.url)
  if (idx !== -1)
    fileData.value.splice(idx, 1)

  // 同步 v-model
  if (Array.isArray(fileLists.value)) {
    const i2 = fileLists.value.findIndex(u => u === uploadFile.url || (uploadFile as any).originUrl === u)
    if (i2 !== -1)
      fileLists.value.splice(i2, 1)
  }
  else {
    fileLists.value = ''
  }
}

/* ===================== Hooks ===================== */
function beforeUpload(file: UploadRawFile): Awaitable<boolean | void> {
  console.log('beforeUpload触发', fileLists.value)

  if (props.fileSize > 0 && props.fileSize * 1024 * 1024 < file.size) {
    ElMessage.error(`上传文件大小不能超过 ${props.fileSize}M`)
    return false
  }
  let rules = props.fileTypes
  if (typeof rules === 'string')
    rules = [rules]
  if ((rules as string[]).length && !matchTypeByRules(file, rules as string[])) {
    ElMessage.error(`只允许上传类型：${(rules as string[]).join(', ')}`)
    return false
  }
}

function handleProgress(_evt: UploadProgressEvent, _uploadFile: UploadFile, _uploadFiles: UploadFiles) {
  emit('onProgress')
}

/** 成功回调（非 200 也视为失败处理） */
async function handleSuccess(response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  if (response?.code === 200 && response?.data) {
    const publicUrl = response.data.public_url || response.data.download_url
    uploadFile.url = publicUrl
    ;(uploadFile as any).originUrl = publicUrl

    // 同步 v-model
    if (Array.isArray(fileLists.value))
      fileLists.value.push(publicUrl)
    else fileLists.value = publicUrl

    // 生成缩略图 + 角标
    await ensureThumbnail(uploadFile)
    await updateExtBadges()

    emit('onSuccess', { response, uploadFile, uploadFiles })
  }
  else {
    // ❗ 非 200：按失败处理并移除预览
    ElMessage.error(response?.msg || '上传失败')
    removeFromLists(uploadFile)
    await updateExtBadges()
  }
}

function handleExceed() {
  ElMessage.warning(`最多上传${props.limit}个文件`)
}

function handleRemove(uploadFile: UploadFile, uploadFiles: UploadFiles) {
  if (Array.isArray(fileLists.value)) {
    const idx = fileLists.value.findIndex(it => it === uploadFile.url || (uploadFile as any).originUrl === it)
    if (idx !== -1)
      fileLists.value.splice(idx, 1)
  }
  else {
    fileLists.value = ''
  }
  emit('onRemove', { uploadFile, uploadFiles })
  updateExtBadges()
}

/** 允许外部拦截删除 */
function beforeRemove(_uploadFile: UploadFile, _uploadFiles: UploadFiles): Awaitable<boolean> {
  emit('onBeforeRemove', { _uploadFile, _uploadFiles })
  return true
}

/** 失败回调：❗移除该文件，避免失败预览残留（你提的第 1 点） */
function handleError(_error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  ElMessage.error(_error?.message || '上传失败')
  removeFromLists(uploadFile)
  updateExtBadges()
  emit('onError', { error: _error, uploadFile, uploadFiles })
}

/** 预览：图片/封面/图标，并提供“在新窗口打开原文件” */
async function handlePictureCardPreview(uploadFile: UploadFile) {
  const f = uploadFile as UploadFileWithThumb
  const thumb = f.thumbnailUrl || await ensureThumbnail(uploadFile)
  dialogImageUrl.value = thumb
  dialogOriginalUrl.value = (f.originUrl || uploadFile.url || '') as string
  dialogVisible.value = true
}

/** 在新标签页内联预览原文件（Blob 方式） */
async function openOriginal() {
  const fileUrl = dialogOriginalUrl.value
  if (!fileUrl)
    return
  try {
    const res = await fetch(fileUrl, { credentials: 'omit' })
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
  }
  catch (e) {
    console.error(e)
    ElMessage.error('预览失败')
  }
}

/* ===================== v-model → el-upload ===================== */
watch(
  () => fileLists.value,
  async (val) => {
    if (!val) {
      fileData.value = []
      await updateExtBadges()
      return
    }
    const arr = Array.isArray(val) ? val : val.split(',')
    fileData.value = await Promise.all(arr.map(async (u) => {
      const f = { name: u, url: u } as any as UploadFile
      ;(f as any).originUrl = u
      const thumb = await ensureThumbnail(f)
      ;(f as any).thumbnailUrl = thumb
      return f as any
    }))
    await updateExtBadges()
  },
  { immediate: true },
)

onMounted(() => updateExtBadges())
watch(fileData, () => updateExtBadges(), { deep: true })
watch(() => props.isOccupyCorner, () => updateExtBadges())
</script>

<template>
  <!-- 根节点加 has-corner 类，用于控制角标开关 -->
  <div class="upload-wrap" :class="{ 'has-corner': isOccupyCorner }">
    <el-upload
      v-model:file-list="fileData"
      :class="{ readonly: readonly || (max > 0 && fileData.length >= max) }"
      :accept="acceptAttr"
      :action="uploadUrl"
      :disabled="disabled"
      :drag="drag"
      :multiple="multiple"
      :limit="max"
      :list-type="listType"
      :before-upload="beforeUpload"
      :before-remove="beforeRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
    >
      <div v-if="listType === 'picture-card'" class="flex-center flex-col text-center">
        <el-icon :size="iconSize" :color="iconColor">
          <Plus />
        </el-icon>
      </div>
      <div v-else>
        <el-button type="primary" :icon="Upload" plain :disabled="disabled">
          {{ btnText }}
        </el-button>
      </div>
    </el-upload>

    <!-- 可选：文件名 -->
    <!--
    <div v-if="showFilename && fileData.length" class="filename-grid">
      <div v-for="(f, i) in fileData" :key="i" class="name">
        {{ (f as any).name || (f as any).originUrl || f.url }}
      </div>
    </div>
    -->

    <el-dialog v-model="dialogVisible" append-to-body width="520px">
      <div class="mb-3 flex items-center justify-between">
        <div class="text-xs text-gray-500 truncate" :title="dialogOriginalUrl">
          {{ dialogOriginalUrl }}
        </div>
        <el-button v-if="dialogOriginalUrl" type="primary" text @click="openOriginal">
          在新窗口打开
        </el-button>
      </div>
      <img :src="dialogImageUrl" alt="预览">
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.upload-wrap {
  position: relative;
}

img {
  width: 100%;
  height: auto;
}

/* 达到上限隐藏添加按钮（并保持单个高度） */
.readonly {
  height: v-bind(oneLimitHeight) !important;
  :deep(.el-upload-list__item-status-label),
  :deep(.el-upload--picture-card) {
    display: none !important;
  }
}

/* 统一尺寸 */
:deep(.el-upload--picture-card) {
  width: v-bind(width) !important;
  height: v-bind(height) !important;
  margin-bottom: v-bind(itemMarin) !important;
  margin-right: v-bind(itemMarin) !important;
}
:deep(.is-uploading) {
  width: v-bind(width) !important;
  height: v-bind(height) !important;
}
:deep(.el-upload-list__item) {
  width: v-bind(width) !important;
  height: v-bind(height) !important;
  margin-bottom: v-bind(itemMarin) !important;
  margin-right: v-bind(itemMarin) !important;
  position: relative;
}
:deep(.is-success) {
  width: v-bind(width) !important;
  height: v-bind(height) !important;
  margin: 0;
}
:deep(.el-icon--close-tip) {
  display: none !important;
}

/* 进度条尺寸对齐卡片 */
:deep(.el-progress-circle),
:deep(.el-progress) {
  width: v-bind(progressSize) !important;
  height: v-bind(progressSize) !important;
}

/* ✅ 角标：仅在 has-corner 时启用 */
.has-corner :deep(.el-upload-list__item)::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  border-top: 36px solid #34c759;
  border-left: 36px solid transparent;
  border-top-right-radius: 6px;
}
.has-corner :deep(.el-upload-list__item)::before {
  content: attr(data-ext);
  position: absolute;
  top: 10px;
  right: 1px;
  width: 20px;
  transform: rotate(45deg);
  transform-origin: top right;
  text-align: right;
  color: #fff;
  font-size: 10px;
  z-index: 2;
}

/* 文件名展示（可开） */
.filename-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px 10px;
  margin-top: 6px;
}
.filename-grid .name {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
