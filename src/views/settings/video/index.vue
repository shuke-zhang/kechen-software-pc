<!-- VideoManagementTailwind.vue -->
<script setup lang="ts">
import type { ElForm } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import VideoDialog from './videoDialog.vue'

type VideoStatus = 'published' | 'draft' | 'archived'
interface VideoModel {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  status: VideoStatus
  coverUrl: string
  videoUrl: string
  durationSec: number
  createdAt: string
  views: number
}

const categories = ['冥想', '培训', '宣传', '案例', '其它']
const suggestTags = ['疗程', '英语', '演讲', '风光', '夜景', '4K', '教育', '编程']
const isAdd = ref(false)
const queryRef = ref<InstanceType<typeof ElForm> | null>(null)
const queryParams = ref({
  deviceName: '',
  status: '' as '' | VideoStatus,
})
/* ---------------- Mock 数据 ---------------- */
function makeMock(n = 40): VideoModel[] {
  return Array.from({ length: n }).map((_, i) => ({
    id: String(i + 1),
    title: `示例视频 ${i + 1}`,
    description: '示例描述',
    category: categories[i % categories.length],
    tags: suggestTags.slice(0, (i % 4) + 1),
    status: (['published', 'draft', 'archived'] as VideoStatus[])[i % 3],
    coverUrl: `https://picsum.photos/seed/v${i}/640/360`,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    durationSec: 60 + (i % 300),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    views: 500 + i * 13,
  }))
}
const db = ref<VideoModel[]>(makeMock())

/* ---------------- 查询/分页 ---------------- */
const query = reactive({ keyword: '', category: '', status: '' as '' | VideoStatus })
const pager = reactive({ pageNum: 1, pageSize: 12 })

const filteredRows = computed(() => {
  let rows = db.value.slice()
  if (query.keyword) {
    const kw = query.keyword.toLowerCase()
    rows = rows.filter(v =>
      v.title.toLowerCase().includes(kw)
      || v.description.toLowerCase().includes(kw)
      || v.tags.some(t => t.toLowerCase().includes(kw)),
    )
  }
  if (query.category)
    rows = rows.filter(v => v.category === query.category)
  if (query.status)
    rows = rows.filter(v => v.status === query.status)
  return rows
})
const pageRows = computed(() => {
  const start = (pager.pageNum - 1) * pager.pageSize
  return filteredRows.value.slice(start, start + pager.pageSize)
})

function retQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    patientName: '',
    reportType: '',
    status: '',
    dateRange: undefined,
  } as any
  resetForm(queryRef.value)
  // getList()
}

function handleVideoAdd() {
  openCreate()
}

/* ---------------- 选择/批量 ---------------- */
const checkedMap = reactive<Record<string, boolean>>({})

/* ---------------- 提示条 ---------------- */
const notice = reactive<{ show: boolean, type: 'ok' | 'warn', text: string }>({ show: false, type: 'ok', text: '' })
function toastOk(text: string) {
  notice.type = 'ok'
  notice.text = text
  notice.show = true
  setTimeout(() => notice.show = false, 1500)
}

/* ---------------- 弹窗/表单 ---------------- */
const dialog = reactive<{ visible: boolean, mode: 'create' | 'edit' }>({ visible: false, mode: 'create' })
const form = reactive<VideoModel>({
  id: '',
  title: '',
  description: '',
  category: '',
  tags: [],
  status: 'draft',
  coverUrl: '',
  videoUrl: '',
  durationSec: 120,
  createdAt: '',
  views: 0,
})

function randomCover() {
  return `https://picsum.photos/seed/c${Math.random().toString(36).slice(2, 7)}/640/360`
}
function openCreate() {
  dialog.mode = 'create'
  Object.assign(form, {
    id: '',
    title: '',
    description: '',
    category: '',
    tags: [],
    status: 'draft',
    coverUrl: randomCover(),
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    durationSec: 120,
    createdAt: '',
    views: 0,
  })
  dialog.visible = true
}
function openEdit(row: VideoModel) {
  dialog.mode = 'edit'
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialog.visible = true
}

/* ---------------- 单条 / 批量操作 ---------------- */
function confirmDelete(v: VideoModel) {
  confirmWarning('是否确认删除视频？').then(() => {
    db.value = db.value.filter(x => x.id !== v.id)
    checkedMap[v.id] = false
    toastOk('已删除')
    if ((pager.pageNum - 1) * pager.pageSize >= filteredRows.value.length)
      pager.pageNum = 1
  }).catch(() => {})
}

/* ---------------- 预览 ---------------- */
const previewVisible = ref(false)
const current = ref<VideoModel | null>(null)
function preview(v: VideoModel) {
  current.value = v
  previewVisible.value = true
}

/* ---------------- 工具 ---------------- */
function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60).toString()
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
function fmtDate(iso: string) {
  return iso ? iso.slice(0, 10) : ''
}

onMounted(() => {
  db.value.forEach(v => checkedMap[v.id] = false)
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900  p-4">
    <div class="flex flex-1 ">
      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item style="margin-bottom: 0;">
          <el-input
            v-model="queryParams.deviceName"
            placeholder="请输入视频名称"
            clearable

            style="width: 240px"
          />
        </el-form-item>

        <el-form-item style="margin-bottom: 0;">
          <el-select
            v-model="queryParams.status"

            placeholder="请选择视频分类"
            page-size="large"
            style="width: 240px"
          >
            <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item style="margin-bottom: 0;">
          <el-button type="primary" :icon="Search">
            查询
          </el-button>
          <el-button type="primary" plain :icon="Refresh" @click="retQuery">
            查询重置
          </el-button>
          <el-button type="success" :icon="Plus" @click="handleVideoAdd">
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-divider />
    <!-- 卡片区域：固定宽度容器 + 平均分配横向空白 -->
    <div class="flex flex-wrap justify-between gap-y-[10px]">
      <article
        v-for="v in pageRows"
        :key="v.id"
        class="w-[320px] h-[240px] rounded-xl border border-slate-200  bg-white  overflow-hidden flex flex-col gap-10px"
      >
        <!-- 固定缩略图区域，高度 180px -->
        <div class="relative w-full h-[180px] bg-slate-900 overflow-hidden">
          <img :src="v.coverUrl" class="absolute inset-0 w-full h-full object-cover">

          <!-- 选择框 -->
          <!-- <label class="absolute left-2 top-2 inline-flex items-center gap-1 rounded   p-0 cursor-pointer">
            <input v-model="checkedMap[v.id]" type="checkbox" class="w-[20px] h-[20px] text-indigo-600 cursor-pointer">
          </label> -->

          <!-- 播放按钮 -->
          <div class="absolute inset-0 m-auto h-10 w-10 rounded-full bg-white/90 text-slate-900 shadow grid place-items-center hover:scale-105 transition cursor-pointer" @click="preview(v)">
            ▶
          </div>

          <!-- 时长 -->
          <span class="absolute right-2 bottom-2 rounded bg-black/70 text-white text-xs px-2">
            {{ fmtDuration(v.durationSec) }}
          </span>
        </div>

        <!-- 信息区 -->
        <div class="flex-1 p-2 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-semibold line-clamp-2" :title="v.title">
              {{ v.title }}
            </h3>
            <p class="text-xs text-slate-500 mt-1">
              {{ v.views }} 次观看 · {{ fmtDate(v.createdAt) }}
            </p>
          </div>
          <div class="flex justify-end gap-2 mt-2 text-xs">
            <el-button type="primary" plain size="small" @click="openEdit(v)">
              编辑
            </el-button>
            <el-button type="danger" plain size="small" @click="confirmDelete(v)">
              删除
            </el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 预览弹窗 -->
    <transition name="zoom">
      <div v-if="previewVisible" class="fixed inset-0 z-40 grid place-items-center">
        <div class="absolute inset-0 bg-black/60" @click="previewVisible = false" />
        <div class="relative w-[94vw] max-w-4xl rounded-2xl bg-black p-3 shadow-xl">
          <video v-if="current?.videoUrl" :src="current.videoUrl" controls class="w-full rounded-lg" />
          <button class="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-sm" @click="previewVisible = false">
            关闭
          </button>
        </div>
      </div>
    </transition>
  </main>

  <VideoDialog :is-add="isAdd" />
</template>

<style scoped>
/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.zoom-enter-active,
.zoom-leave-active {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.96);
  opacity: 0;
}
</style>
