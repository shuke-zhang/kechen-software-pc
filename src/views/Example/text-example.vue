<!-- DemoTextPage.vue -->
<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue'
// 替换为你的组件真实路径
import Text from '@/views/message/Text.vue'

const inversion = ref(false)
const asRawText = ref(false)
const loading = ref(false)
const sample = ref<string>(getDefaultSample())

// 滚动容器 ref
const scrollRef = ref<HTMLDivElement>()

/**
 * 自动滚动到底部
 */
async function scrollToBottom() {
  await nextTick()
  const el = scrollRef.value
  if (!el)
    return
  el.scrollTop = el.scrollHeight
}

// 初始化时滚到底
onMounted(() => {
  scrollToBottom()
})

// 监听文本变化：渲染后滚到底
watch(sample, () => {
  scrollToBottom()
})

// 也可以在 loading 切换/反转时滚动（按需保留）
watch([loading, inversion, asRawText], () => {
  scrollToBottom()
})

function resetSample() {
  sample.value = getDefaultSample()
}

function appendChunk() {
  // 模拟流式追加（会触发 watch → 自动滚动到底）
  sample.value += `

**追加一段（${new Date().toLocaleTimeString()}）**：
\`\`\`ts
const now = new Date().toISOString()
console.log('chunk at', now)
\`\`\`

行内数学再来一个 $\\int_0^1 x^2\\,dx = \\frac{1}{3}$ 。
`
}

/** 示例 Markdown（代码 + 数学） */
function getDefaultSample(): string {
  return `# 渲染组件调用示例

这是一个混合文本的演示：普通段落、**加粗**、_斜体_、以及行内数学 $E = mc^2$。

---

## 1. 数学公式（KaTeX）
块级公式：
$$
\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0},\\quad
\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}
$$

行内求和：$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$

---

## 2. 代码块（带复制按钮）

**TypeScript:**
\`\`\`ts
function sum(a: number, b: number): number {
  return a + b
}

console.log('2 + 3 =', sum(2, 3))
\`\`\`

**Python:**
\`\`\`python
def fib(n: int):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fib(10)))
\`\`\`

**JSON:**
\`\`\`json
{
  "name": "demo",
  "version": "1.0.0",
  "features": ["markdown", "katex", "highlight.js"]
}
\`\`\`

---

## 3. 列表与链接
- 支持外链：<https://example.com>
- 普通链接：[打开 MDN](https://developer.mozilla.org/)
- 待办（若启用 task-lists 插件可勾选）
  - [ ] 待完成项
  - [x] 已完成项

---

## 4. 表格
| 序号 | 名称     | 描述                     |
| ---- | -------- | ------------------------ |
| 1    | KaTeX    | 渲染数学公式             |
| 2    | hljs     | 代码语法高亮             |
| 3    | DOMPurify| HTML 白名单安全清洗      |

---

## 5. 混合段落
> 你可以在同一个消息里同时包含**数学**与\`代码\`，渲染组件会自动处理。
>
> 例如：在推导 $y = mx + b$ 后，给出一段 \`ts\` 代码演示拟合过程。

\`\`\`ts
type Point = { x: number; y: number }

function linearReg(points: Point[]) {
  const n = points.length
  const sx = points.reduce((s, p) => s + p.x, 0)
  const sy = points.reduce((s, p) => s + p.y, 0)
  const sxx = points.reduce((s, p) => s + p.x * p.x, 0)
  const sxy = points.reduce((s, p) => s + p.x * p.y, 0)

  // 斜率 m 与截距 b 的闭式解
  const m = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const b = (sy - m * sx) / n
  return { m, b }
}

console.log(linearReg([{x:1,y:2},{x:2,y:2.9},{x:3,y:4.1}]))
\`\`\`

收尾：行内再来一个公式 $\\int_0^{\\pi} \\sin(x)\\,dx = 2$，OK！
`
}
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] dark:bg-[#0b0c0f] text-[#0f172a] dark:text-white p-4 md:p-8">
    <h1 class="text-2xl font-bold mb-4">
      AI 文本渲染组件 Demo（代码 + 数学 + 滚动）
    </h1>

    <!-- 控制区 -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <label class="flex items-center gap-2">
        <input v-model="inversion" type="checkbox">
        inversion（气泡反转）
      </label>
      <label class="flex items-center gap-2">
        <input v-model="asRawText" type="checkbox">
        asRawText（纯文本，不解析 Markdown）
      </label>
      <label class="flex items-center gap-2">
        <input v-model="loading" type="checkbox">
        loading（尾部光标闪烁）
      </label>

      <button class="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:opacity-90" @click="resetSample">
        重置示例文本
      </button>
      <button class="px-3 py-1.5 rounded-md bg-slate-700 text-white hover:opacity-90" @click="appendChunk">
        追加一段文本（模拟流式）
      </button>
    </div>

    <!-- 独立滚动容器（固定高度） -->
    <div
      ref="scrollRef"
      class="max-w-3xl h-[420px] overflow-y-auto rounded-md border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-[#111] custom-scroll"
    >
      <Text
        :inversion="inversion"
        :as-raw-text="asRawText"
        :loading="loading"
        :text="sample"
      />
    </div>

    <!-- 可编辑输入：实时查看渲染效果 -->
    <div class="grid md:grid-cols-2 gap-4 mt-6">
      <div>
        <h2 class="font-semibold mb-2">
          编辑示例 Markdown
        </h2>
        <textarea
          v-model="sample"
          class="w-full h-[360px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-[#14161a] outline-none"
        />
      </div>
      <div>
        <h2 class="font-semibold mb-2">
          当前示例说明
        </h2>
        <ul class="list-disc pl-5 leading-7 opacity-90">
          <li>混合展示：段落、列表、链接、表格、<strong>行内/块级 LaTeX</strong> 与多语言 <strong>代码块</strong>。</li>
          <li>代码块自带“复制”按钮（你的组件里通过事件委托实现）。</li>
          <li>KaTeX 渲染数学公式；highlight.js 渲染语法高亮；DOMPurify 做安全清洗（若你采用了改进版）。</li>
          <li>勾选 <code>asRawText</code> 可对比纯文本 vs Markdown 渲染。</li>
          <li>勾选 <code>inversion</code> 切换气泡底色，适合区分“我/AI”两类消息。</li>
          <li>滚动容器固定高度，内容溢出时出现滚动条，并在内容变更后自动滚动到底部。</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  resize: vertical;
}

/* 简单滚动条美化（WebKit 内核） */
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(120, 120, 120, 0.4);
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
