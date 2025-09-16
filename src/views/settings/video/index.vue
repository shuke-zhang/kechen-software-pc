<!-- VideoManagementTailwind.vue -->
<script setup lang="ts">
import type { ElForm } from 'element-plus'
import type { VideoModel } from '@/model/video'
import type { VideoCategoryModel } from '@/model/videoCategory'
import { CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import { getVideoCategoryTree } from '@/api/videoCategory'
import VideoDialog from './videoDialog.vue'

type MeasurableEl = HTMLElement | {
  getBoundingClientRect: () => DOMRect
  clientWidth: number
  clientHeight: number
}
type VideoStatus = 'published' | 'draft' | 'archived'

const categories = ['冥想', '培训', '宣传', '案例', '其它']
const suggestTags = ['疗程', '英语', '演讲', '风光', '夜景', '4K', '教育', '编程']
const videoTree = ref<VideoCategoryModel[]>([])
const isAdd = ref(false)
const visible = ref(false)
const currentData = ref<VideoModel>({
  id: '',
  description: '',
  coverUrl: '',
  videoUrl: '',
  durationSec: 120,
  createdAt: '',
  views: 0,
})
const queryRef = ref<InstanceType<typeof ElForm> | null>(null)
const queryParams = ref<ListQueryParams<VideoModel>>({
  pageNum: 1,
  pageSize: 10,
})
const triggerRefMap = ref<Record<string, MeasurableEl | undefined>>({})
const tooltipVisibleMap = ref<Record<string, boolean>>({})

/**
 * 设置对应的ref
 */
function setTriggerRef(id: string) {
  return (el: Element | ComponentPublicInstance | null): void => {
    if (el instanceof HTMLElement) {
      triggerRefMap.value[id] = el
      return
    }
    const root = (el as any)?.$el as HTMLElement | undefined
    if (root instanceof HTMLElement) {
      triggerRefMap.value[id] = root
      return
    }
    triggerRefMap.value[id] = undefined
  }
}
function randomDescription(i: number): string {
  const chars = '这是一个用于展示的视频内容测试随机文本示例标题简介说明更多信息演示效果非常不错'
  const length = Math.floor(Math.random() * 26) + 5 // 5~30
  let result = ''
  for (let j = 0; j < length; j++) {
    const index = Math.floor(Math.random() * chars.length)
    result += chars[index]
  }
  return `${result}（编号 ${i + 1}）`
}
/* ---------------- Mock 数据 ---------------- */
function makeMock(n = 40): VideoModel[] {
  return Array.from({ length: n }).map((_, i) => ({
    id: String(i + 1),
    title: `示例视频 ${i + 1}`,
    description: randomDescription(i),
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
const list = ref<VideoModel[]>([])

function getVideoTree() {
  getVideoCategoryTree().then((res) => {
    videoTree.value = res.data
  })
}

/**
 * 获取视频列表
 */
function getList() {
  list.value = makeMock()
}

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
  isAdd.value = true
  visible.value = true
}

function openEdit(row: VideoModel) {
  currentData.value = JSON.parse(JSON.stringify(row))
  isAdd.value = false
  visible.value = true
}

/* ---------------- 单条 / 批量操作 ---------------- */
function confirmDelete(v: VideoModel) {
  confirmWarning('是否确认删除视频？').then(() => {
    console.log(v)
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

onMounted(() => {
  getList()
  getVideoTree()
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900  p-4">
    <div class="flex flex-1 ">
      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item style="margin-bottom: 0;">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入视频名称"
            clearable

            style="width: 240px"
          />
        </el-form-item>

        <el-form-item style="margin-bottom: 0;">
          <el-select
            v-model="queryParams"
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
          <el-button type="success" :icon="CirclePlus" @click="handleVideoAdd">
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-divider />
    <!-- 卡片区域：固定宽度容器 + 平均分配横向空白 -->
    <div class="grid [grid-template-columns:repeat(auto-fit,320px)] justify-center gap-[10px]">
      <article
        v-for="v in list"
        :key="v.id"
        class="w-[320px] h-[240px] rounded-xl border border-slate-200  bg-white  overflow-hidden flex flex-col gap-10px"
      >
        <!-- 固定缩略图区域，高度 180px -->
        <div class="relative w-full h-[180px] bg-slate-900 overflow-hidden">
          <img :src="v.coverUrl" class="absolute inset-0 w-full h-full object-cover">

          <!-- 视频类型 -->
          <div
            class="absolute left-0 top-[10px] h-[22px] flex-center
            rounded-tr rounded-br bg-gray-700/60
            text-gray-100 text-[12px] px-2"
          >
            MP4
          </div>

          <!-- 播放按钮 -->
          <div class="absolute inset-0 m-auto h-10 w-10 rounded-full bg-white/90 text-slate-900 shadow grid place-items-center hover:scale-105 transition cursor-pointer" @click="preview(v)">
            ▶
          </div>

          <!-- 时长 -->
          <span class="absolute right-2 bottom-2 rounded bg-black/70 text-white text-xs px-2">
            {{ fmtDuration(v.durationSec!) }}
          </span>
        </div>

        <!-- 信息区 -->
        <div class="flex-1 p-2 flex flex-col justify-between">
          <div class="flex items-center" :title="v.title">
            <div class="text-sm font-semibold line-clamp-1">
              {{ v.title }}
            </div>
            <el-tag type="info" size="small" class="ml-[4px]">
              {{ v.category }}
            </el-tag>
          </div>

          <el-tooltip
            v-model:visible="tooltipVisibleMap[v.id!]"
            :content="v.description"
            placement="bottom"
            effect="light"
            trigger="hover"
            virtual-triggering
            :virtual-ref="triggerRefMap[v.id!]"
            :disabled="!v.isTextTruncated"
            append-to="body"
          />

          <!-- 触发源：用函数模板 ref 把当前元素放到 triggerRefMap -->
          <div
            :ref="setTriggerRef(v.id!)"
            v-trunc="{ item: v, key: 'isTextTruncated' }"
            class="text-xs h-[16px] m-[4px] line-clamp-1 cursor-pointer"
          >
            简介：{{ v.description || '-' }}
          </div>

          <div class="flex items-center justify-between">
            <div class="text-xs  mt-1">
              {{ $formatDefaultDate(v.createdAt!) }}
            </div>
            <div class="gap-[4px]">
              <el-button type="primary" plain size="small" @click="openEdit(v)">
                编辑
              </el-button>
              <el-button type="danger" plain size="small" @click="confirmDelete(v)">
                删除
              </el-button>
            </div>
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

  <VideoDialog v-model="visible" :is-add="isAdd" :data="currentData" :video-tree="videoTree" />
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
