<!-- ChatInput.vue -->
<script setup lang="ts">
interface Props {
  placeholder?: string
  minRows?: number
  maxRows?: number
  width?: string | number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '询问任何问题',
  minRows: 1,
  maxRows: 4,
  width: '100%',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'submit', text: string): void
  (e: 'attach'): void
  (e: 'record'): void
}>()

const entryText = defineModel({ type: String, default: '' })
const disabled = computed(() => {
  return !!props.disabled
})
const hasText = computed(() => {
  return entryText.value.trim().length > 0
})

const wrap = ref<HTMLDivElement | null>(null)
const ta = ref<HTMLTextAreaElement | null>(null)
const mirror = ref<HTMLDivElement | null>(null)

const lineH = ref(0)
const padY = ref(0)
const rowsShown = ref(1)
const expanded = ref(false)

const minRows = computed(() => {
  const base = props.minRows ?? 1
  return Math.max(1, base)
})
const maxRows = computed(() => {
  const base = props.maxRows ?? 4
  return Math.max(minRows.value, base)
})

const wrapStyle = computed(() => {
  const w = typeof props.width === 'number' ? `${props.width}px` : props.width
  const finalW = w || '100%'
  return { width: finalW }
})

watch(
  () => {
    return entryText.value
  },
  (v) => {
    const same = v === entryText.value
    if (same) {
      return
    }
    entryText.value = v as string
    nextTick(scheduleLayout)
  },
)

/* ---------- Mirror 同步 ---------- */
function syncMirrorStyles() {
  const el = ta.value
  if (!el) {
    return
  }
  const m = mirror.value
  if (!m) {
    return
  }
  const cs = getComputedStyle(el)

  m.style.position = 'absolute'
  m.style.visibility = 'hidden'
  m.style.pointerEvents = 'none'
  m.style.whiteSpace = 'pre-wrap'
  m.style.wordBreak = 'break-word'
  m.style.overflowWrap = 'anywhere'
  m.style.boxSizing = 'border-box'

  m.style.font = cs.font
  m.style.fontFamily = cs.fontFamily
  m.style.fontSize = cs.fontSize
  m.style.lineHeight = cs.lineHeight
  m.style.letterSpacing = cs.letterSpacing
  m.style.textIndent = cs.textIndent
  m.style.textTransform = cs.textTransform

  m.style.paddingTop = cs.paddingTop
  m.style.paddingBottom = cs.paddingBottom
  m.style.paddingLeft = cs.paddingLeft
  m.style.paddingRight = cs.paddingRight
  m.style.border = '0'
}

function measureLineAndPadding() {
  const el = ta.value
  if (!el) {
    return
  }
  const cs = getComputedStyle(el)
  let lh = Number.parseFloat(cs.lineHeight)
  const bad = !lh || Number.isNaN(lh)
  if (bad) {
    const fs = Number.parseFloat(cs.fontSize) || 14
    lh = Math.round(fs * 1.4)
  }
  lineH.value = lh

  const pt = Number.parseFloat(cs.paddingTop) || 0
  const pb = Number.parseFloat(cs.paddingBottom) || 0
  padY.value = pt + pb
}

/* ---------- 计算行数所需的宽度与工具 ---------- */
function getRowMetrics() {
  const w = wrap.value
  const row = w ? (w.querySelector('.row') as HTMLElement | null) : null
  const plus = w ? (w.querySelector('.plus') as HTMLElement | null) : null
  const actions = w ? (w.querySelector('.actions') as HTMLElement | null) : null

  if (!row) {
    return {
      rowW: 0,
      gap: 0,
      plusW: 0,
      actionsW: 0,
    }
  }

  const cs = getComputedStyle(row)
  const gapValue = Number.parseFloat(cs.columnGap || '0') || 0
  const plusW = plus ? plus.offsetWidth : 0
  const actionsW = actions ? actions.offsetWidth : 0
  const rowW = row.clientWidth

  return {
    rowW,
    gap: gapValue,
    plusW,
    actionsW,
  }
}

/** 用指定宽度测量行数（mirror 负责样式，同 textarea 一致） */
function measureLinesForWidth(widthPx: number) {
  const el = ta.value
  const m = mirror.value
  if (!el || !m) {
    return 1
  }
  syncMirrorStyles()
  const safeWidth = Math.max(0, Math.floor(widthPx))
  m.style.width = `${safeWidth}px`
  m.textContent = `${entryText.value}\n`
  const h = m.scrollHeight
  const lines = Math.ceil((h - padY.value) / lineH.value)
  const finalLines = Math.max(1, lines)
  return finalLines
}

/* ---------- 布局核心：用 mirror 测量真实内容高度 ---------- */
let rafLock = false
let debounceId: number | null = null

function scheduleLayout() {
  if (rafLock) {
    return
  }
  rafLock = true
  requestAnimationFrame(() => {
    rafLock = false
    layout()
  })
}

function layout() {
  const el = ta.value
  if (!el) {
    return
  }
  const m = mirror.value
  if (!m) {
    return
  }

  // 先同步 mirror 样式，再基于当前 textarea 的宽度计算高度
  syncMirrorStyles()
  m.style.width = `${el.clientWidth}px`
  m.textContent = `${entryText.value}\n`

  const contentH = m.scrollHeight
  const minH = minRows.value * lineH.value + padY.value
  const maxH = maxRows.value * lineH.value + padY.value

  const need = Math.min(Math.max(contentH, minH), maxH)
  const prevRaw = el.style.height || '0'
  const prev = Number.parseFloat(prevRaw)
  const diff = Math.abs(prev - need)
  const big = diff > 0.5
  if (big) {
    el.style.height = `${need}px`
  }

  const scrollTooHigh = contentH > maxH
  el.style.overflowY = scrollTooHigh ? 'auto' : 'hidden'

  const shown = Math.ceil((need - padY.value) / lineH.value)
  const shownSafe = Math.max(1, shown)
  rowsShown.value = shownSafe

  // —— 使用“折叠宽度”来判定是否需要展开，并加入滞后 —— //
  const metrics = getRowMetrics()
  const rowW = metrics.rowW
  const gap = metrics.gap
  const plusW = metrics.plusW
  const actionsW = metrics.actionsW

  const collapsedWidthRaw = rowW - plusW - actionsW - 2 * gap
  const collapsedWidth = Math.max(0, collapsedWidthRaw)
  const linesCollapsed = measureLinesForWidth(collapsedWidth)

  // 滞后策略：
  // - 未展开时：折叠宽度下行数 >= 2 才展开
  // - 已展开时：折叠宽度下行数 <= 1 才收起
  let wantExpanded = expanded.value
  const shouldExpand = !expanded.value && linesCollapsed >= 2
  const shouldCollapse = expanded.value && linesCollapsed <= 1

  if (shouldExpand) {
    wantExpanded = true
  }
  else if (shouldCollapse) {
    wantExpanded = false
  }

  if (debounceId !== null) {
    window.clearTimeout(debounceId)
  }
  const needToggle = expanded.value !== wantExpanded
  if (!needToggle) {
    return
  }
  debounceId = window.setTimeout(() => {
    expanded.value = wantExpanded
  }, 100)
}

/* ---------- IME 与回车 ---------- */
const composing = ref(false)

function onCompStart() {
  composing.value = true
}

function onCompEnd() {
  composing.value = false
  scheduleLayout()
}

function onKeydown(e: KeyboardEvent) {
  const isEnter = e.key === 'Enter'
  if (!isEnter) {
    return
  }
  if (composing.value) {
    return
  }
  if (disabled.value) {
    return
  }
  const plain = !e.shiftKey && !e.ctrlKey && !e.metaKey
  if (!plain) {
    return
  }
  e.preventDefault()
  doSubmit()
}

function doSubmit() {
  const text = entryText.value.trim()
  const ok = text.length > 0
  if (!ok) {
    return
  }
  emit('submit', text)
}

/* ---------- 生命周期 ---------- */
let ro: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    measureLineAndPadding()
    scheduleLayout()
    const target = wrap.value
    const supported = 'ResizeObserver' in window && !!target
    if (supported) {
      ro = new ResizeObserver(() => {
        scheduleLayout()
      })
      ro.observe(target as Element)
    }
    else {
      window.addEventListener('resize', scheduleLayout)
    }
  })
})

onUnmounted(() => {
  if (ro) {
    ro.disconnect()
  }
  ro = null
  if (debounceId !== null) {
    window.clearTimeout(debounceId)
  }
  window.removeEventListener('resize', scheduleLayout)
})

defineExpose({
  focus: () => {
    const el = ta.value
    if (!el) {
      return
    }
    el.focus()
  },
  clear: () => {
    entryText.value = ''
    nextTick(scheduleLayout)
  },
})
</script>

<template>
  <div
    ref="wrap"
    :data-expanded="expanded ? '' : null"
    class="chat-input rounded-[20px] py-2 px-2.5 border transition-colors duration-150
           bg-[var(--el-bg-color,#fff)] border-[var(--el-border-color,#dcdfe6)]
           focus-within:border-[var(--el-color-primary,#409eff)]
           focus-within:shadow-[0_0_0_2px_rgba(64,158,255,0.2)]"
    :style="wrapStyle"
  >
    <!-- mirror 仅用于测量，不显示 -->
    <div ref="mirror" aria-hidden="true" />

    <div class="row">
      <button
        class="plus w-8 h-8 rounded-[10px] border-0 flex items-center justify-center
               bg-[var(--el-fill-color-light,#f5f7fa)]
               text-[var(--el-text-color-regular,#606266)] cursor-pointer ml-0.5
               disabled:opacity-50 disabled:cursor-not-allowed"
        title="添加文件等"
        @click="$emit('attach')"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11 10V5h2v5h5v2h-5v5h-2v-5H6v-2h5z" />
        </svg>
      </button>

      <textarea
        ref="ta"
        v-model="entryText"
        :rows="minRows"
        :placeholder="placeholder"
        class="ta w-full min-w-0 border-0 outline-none resize-none bg-transparent py-1.5 px-0
               leading-[1.6] text-sm
               text-[var(--el-text-color-primary,#303133)]
               placeholder-[var(--el-text-color-placeholder,#a8abb2)]
               overflow-y-auto overflow-x-hidden tw-scrollbar"
        :disabled="disabled"
        @input="scheduleLayout"
        @keydown="onKeydown"
        @compositionstart="onCompStart"
        @compositionend="onCompEnd"
      />

      <div class="actions flex gap-1.5">
        <button
          class="w-8 h-8 rounded-[10px] border-0 flex items-center justify-center
                 bg-[var(--el-fill-color-light,#f5f7fa)]
                 text-[var(--el-text-color-regular,#606266)] cursor-pointer
                 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled"
          title="语音"
          @click="$emit('record')"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H9v2h6v-2h-2v-3.08A7 7 0 0 0 19 11z" />
          </svg>
        </button>

        <button
          class="send w-8 h-8 rounded-[10px] border-0 flex items-center justify-center cursor-pointer
                 bg-[var(--el-color-primary,#409eff)] text-white
                 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled || !hasText"
          title="发送 (Enter)"
          @click="doSubmit"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="m3.5 8.9 7.1-7.1a2 2 0 0 1 2.8 0l7.1 7.1a1 1 0 0 1 0 1.4l-.7.7a1 1 0 0 1-1.4 0L13.3 6v15.7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6.3L5.6 11a1 1 0 0 1-1.4 0l-.7-.7a1 1 0 0 1 0-1.4" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 单行：左右布局 */
.chat-input .row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-input .plus {
  flex: 0 0 2rem;
}

.chat-input .ta {
  flex: 1 1 auto;
  min-width: 0;
}

.chat-input .actions {
  flex: 0 0 auto;
  justify-content: flex-end;
}

/* 多行：根存在 data-expanded 时变上下布局 */
.chat-input[data-expanded] .row {
  flex-wrap: wrap;
  align-items: stretch;
}

.chat-input[data-expanded] .ta {
  flex-basis: 100%;
  flex-grow: 1;
  flex-shrink: 1;
}

.chat-input[data-expanded] .plus {
  order: 2;
}

.chat-input[data-expanded] .actions {
  order: 2;
  margin-left: auto;
}
</style>
