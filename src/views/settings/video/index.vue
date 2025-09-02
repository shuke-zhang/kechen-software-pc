<!-- VideoManagementTailwind.vue -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

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
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pager.pageSize)))
const pageRows = computed(() => {
  const start = (pager.pageNum - 1) * pager.pageSize
  return filteredRows.value.slice(start, start + pager.pageSize)
})

function applySearch() {
  pager.pageNum = 1
}
function resetSearch() {
  query.keyword = ''
  query.category = ''
  query.status = ''
  applySearch()
}

/* ---------------- 选择/批量 ---------------- */
const checkedMap = reactive<Record<string, boolean>>({})
const selectedIds = computed(() => Object.entries(checkedMap).filter(([,v]) => v).map(([k]) => k))

/* ---------------- 提示条 ---------------- */
const notice = reactive<{ show: boolean, type: 'ok' | 'warn', text: string }>({ show: false, type: 'ok', text: '' })
function toastOk(text: string) {
  notice.type = 'ok'
  notice.text = text
  notice.show = true
  setTimeout(() => notice.show = false, 1500)
}
function toastWarn(text: string) {
  notice.type = 'warn'
  notice.text = text
  notice.show = true
  setTimeout(() => notice.show = false, 1800)
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
const tagInput = ref('')

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
function addTag() {
  if (tagInput.value) {
    if (!form.tags.includes(tagInput.value))
      form.tags.push(tagInput.value)
    tagInput.value = ''
  }
}
function addTagQuick(t: string) {
  if (!form.tags.includes(t))
    form.tags.push(t)
}

function pickCover(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f)
    return
  form.coverUrl = URL.createObjectURL(f)
}
function pickVideo(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f)
    return
  form.videoUrl = URL.createObjectURL(f)
}

function submitForm() {
  if (!form.title || !form.category) {
    toastWarn('请填写必填项')
    return
  }
  if (dialog.mode === 'create') {
    const id = String(Date.now())
    db.value.unshift({ ...form, id, createdAt: new Date().toISOString(), views: 0 })
    toastOk('新增成功')
  }
  else {
    const i = db.value.findIndex(x => x.id === form.id)
    if (i >= 0)
      db.value[i] = { ...db.value[i], ...form }
    toastOk('保存成功')
  }
  dialog.visible = false
}

/* ---------------- 单条 / 批量操作 ---------------- */
function confirmDelete(v: VideoModel) {
  confirmWarning(`是否确认删除设备？`).then(() => {
    db.value = db.value.filter(x => x.id !== v.id)
    checkedMap[v.id] = false
    toastOk('已删除')
    if ((pager.pageNum - 1) * pager.pageSize >= filteredRows.value.length)
      pager.pageNum = 1
  })
}
function confirmBatchDelete() {
  if (!selectedIds.value.length)
    return

  confirmWarning(`是否确认删除设备？`).then(() => {
    db.value = db.value.filter(x => !selectedIds.value.includes(x.id))
    selectedIds.value.forEach(id => checkedMap[id] = false)
    toastOk('批量删除成功')
    if ((pager.pageNum - 1) * pager.pageSize >= filteredRows.value.length)
      pager.pageNum = 1
  })
}
function togglePublish(v: VideoModel) {
  v.status = v.status === 'published' ? 'draft' : 'published'
  toastOk(v.status === 'published' ? '已发布' : '已设为草稿')
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
  <main class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 p-4 md:p-8">
    <!-- 提示条 -->
    <transition name="fade">
      <div
        v-if="notice.show"
        class="mb-4 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm" :class="[
          notice.type === 'ok' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
        ]"
      >
        <span class="text-sm">{{ notice.text }}</span>
        <button class="ml-auto text-xs underline" @click="notice.show = false">
          关闭
        </button>
      </div>
    </transition>

    <!-- 工具栏 -->
    <section
      class="mb-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3"
    >
      <div class="flex items-center gap-2">
        <div class="relative">
          <input
            v-model="query.keyword"
            type="text"
            placeholder="搜索标题、标签、描述…"
            class="peer w-72 max-w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-indigo-500/60"
            @keyup.enter="applySearch"
          >
          <svg class="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-400 peer-focus:text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clip-rule="evenodd" /></svg>
        </div>

        <select v-model="query.category" class="w-36 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/60">
          <option value="">
            全部分类
          </option>
          <option v-for="c in categories" :key="c" :value="c">
            {{ c }}
          </option>
        </select>

        <select v-model="query.status" class="w-36 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/60">
          <option value="">
            全部状态
          </option>
          <option value="published">
            已发布
          </option>
          <option value="draft">
            草稿
          </option>
          <option value="archived">
            下架
          </option>
        </select>
      </div>

      <div class="flex-1" />

      <div class="flex items-center gap-2">
        <button class="inline-flex items-center gap-1 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700" @click="applySearch">
          查询
        </button>
        <button class="inline-flex items-center gap-1 rounded-lg bg-slate-200 dark:bg-slate-700 px-3 py-2 text-sm hover:bg-slate-300 dark:hover:bg-slate-600" @click="resetSearch">
          重置
        </button>
        <button class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700" @click="openCreate">
          新增视频
        </button>
        <button
          :disabled="!selectedIds.length"
          class="inline-flex items-center gap-1 rounded-lg bg-rose-600 text-white px-3 py-2 text-sm disabled:opacity-40 hover:bg-rose-700"
          @click="confirmBatchDelete"
        >
          批量删除
        </button>
      </div>
    </section>

    <!-- 网格 -->
    <section>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <article
          v-for="v in pageRows"
          :key="v.id"
          class="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden"
        >
          <div class="relative aspect-video bg-slate-900">
            <img :src="v.coverUrl" alt="" class="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition">
            <!-- 选择框 -->
            <label class="absolute left-2 top-2 inline-flex items-center gap-2 rounded-lg bg-white/80 dark:bg-slate-900/60 px-2 py-1 text-xs">
              <input v-model="checkedMap[v.id]" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
              选择
            </label>
            <!-- 播放按钮 -->
            <button class="absolute inset-0 m-auto h-12 w-12 rounded-full bg-white/90 text-slate-900 shadow-md grid place-items-center hover:scale-105 transition" @click="preview(v)">
              ▶
            </button>
            <!-- 时长 -->
            <span class="absolute right-2 bottom-2 rounded-md bg-black/70 text-white text-xs px-2 py-0.5">{{ fmtDuration(v.durationSec) }}</span>
          </div>

          <div class="p-3">
            <h3 class="font-semibold line-clamp-2" :title="v.title">
              {{ v.title }}
            </h3>
            <p class="mt-1 text-xs text-slate-500">
              {{ v.views }} 次观看 · {{ fmtDate(v.createdAt) }}
            </p>

            <div v-if="v.tags.length" class="mt-2 flex flex-wrap gap-1">
              <span v-for="t in v.tags.slice(0, 3)" :key="t" class="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs">{{ t }}</span>
              <span v-if="v.tags.length > 3" class="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs">+{{ v.tags.length - 3 }}</span>
            </div>

            <div class="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700 pt-2">
              <button class="px-2 py-1 text-sm rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/60" @click="openEdit(v)">
                编辑
              </button>
              <button class="px-2 py-1 text-sm rounded-md bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/60" @click="confirmDelete(v)">
                删除
              </button>
              <div class="ml-auto">
                <button class="px-2 py-1 text-sm rounded-md bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60" @click="togglePublish(v)">
                  {{ v.status === 'published' ? '设为草稿' : '发布' }}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- 空态 -->
      <div v-if="!pageRows.length" class="text-center text-slate-500 py-20">
        暂无数据
      </div>

      <!-- 分页 -->
      <div class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-sm text-slate-500">
          已选 {{ selectedIds.length }} 项
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm">每页</label>
          <select v-model.number="pager.pageSize" class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm">
            <option v-for="s in [12, 24, 48, 96]" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
          <div class="ml-4 flex items-center gap-2">
            <button class="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700" @click="pager.pageNum = Math.max(1, pager.pageNum - 1)">
              上一页
            </button>
            <span class="text-sm">第 {{ pager.pageNum }} / {{ totalPages }} 页</span>
            <button class="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700" @click="pager.pageNum = Math.min(totalPages, pager.pageNum + 1)">
              下一页
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 新增/编辑弹窗 -->
    <transition name="zoom">
      <div v-if="dialog.visible" class="fixed inset-0 z-50 grid place-items-center">
        <div class="absolute inset-0 bg-black/50" @click="dialog.visible = false" />
        <div class="relative w-[92vw] max-w-2xl rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-xl">
          <h3 class="text-lg font-semibold mb-4">
            {{ dialog.mode === 'create' ? '新增视频' : '编辑视频' }}
          </h3>

          <form class="space-y-3" @submit.prevent="submitForm">
            <div class="grid md:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm mb-1">标题 <span class="text-rose-500">*</span></label>
                <input v-model.trim="form.title" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/60" required maxlength="80">
              </div>
              <div>
                <label class="block text-sm mb-1">分类 <span class="text-rose-500">*</span></label>
                <select v-model="form.category" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm" required>
                  <option value="" disabled>
                    选择分类
                  </option>
                  <option v-for="c in categories" :key="c" :value="c">
                    {{ c }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm mb-1">标签（回车添加）</label>
              <div class="flex flex-wrap items-center gap-2">
                <input
                  v-model.trim="tagInput"
                  type="text"
                  placeholder="输入后回车"
                  class="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none"
                  @keydown.enter.prevent="addTag"
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="t in suggestTags"
                    :key="t"
                    type="button"
                    class="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-600"
                    @click="addTagQuick(t)"
                  >
                    {{ t }}
                  </button>
                </div>
              </div>
              <div v-if="form.tags.length" class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="(t, i) in form.tags"
                  :key="i"
                  class="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 text-xs"
                >
                  {{ t }}
                  <button type="button" class="opacity-70 hover:opacity-100" @click="form.tags.splice(i, 1)">✕</button>
                </span>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm mb-1">状态</label>
                <div class="flex items-center gap-3 text-sm">
                  <label class="inline-flex items-center gap-1"><input v-model="form.status" type="radio" value="published" class="text-indigo-600"> 已发布</label>
                  <label class="inline-flex items-center gap-1"><input v-model="form.status" type="radio" value="draft" class="text-indigo-600"> 草稿</label>
                  <label class="inline-flex items-center gap-1"><input v-model="form.status" type="radio" value="archived" class="text-indigo-600"> 下架</label>
                </div>
              </div>
              <div>
                <label class="block text-sm mb-1">时长（秒）</label>
                <input v-model.number="form.durationSec" type="number" min="0" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm mb-1">封面图</label>
                <div class="flex items-center gap-2">
                  <input v-model="form.coverUrl" type="text" placeholder="https://…" class="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                  <input type="file" accept="image/*" class="block text-sm" @change="pickCover">
                  <button type="button" class="rounded-lg bg-slate-200 dark:bg-slate-700 px-2 py-1 text-sm" @click="form.coverUrl = randomCover()">
                    随机
                  </button>
                </div>
                <img v-if="form.coverUrl" :src="form.coverUrl" class="mt-2 h-28 w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-cover">
              </div>
              <div>
                <label class="block text-sm mb-1">视频地址</label>
                <div class="flex items-center gap-2">
                  <input v-model="form.videoUrl" type="text" placeholder="https://…" class="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                  <input type="file" accept="video/*" class="block text-sm" @change="pickVideo">
                </div>
                <p class="mt-1 text-xs text-slate-500">
                  可选择本地文件做预览（不会上传）。
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm mb-1">描述</label>
              <textarea v-model="form.description" rows="3" maxlength="500" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
            </div>

            <div class="pt-2 flex items-center justify-end gap-2">
              <button type="button" class="rounded-lg px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600" @click="dialog.visible = false">
                取消
              </button>
              <button type="submit" class="rounded-lg px-3 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700">
                {{ dialog.mode === 'create' ? '提交' : '保存' }}
              </button>
            </div>
          </form>

          <button class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" @click="dialog.visible = false">
            ✕
          </button>
        </div>
      </div>
    </transition>

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
