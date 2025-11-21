<script setup lang="ts">
import type { ReportModel } from '@/model/report'
import { Refresh, Search } from '@element-plus/icons-vue'
import VueOfficeDocx from '@vue-office/docx'
import { saveAs } from 'file-saver'

import { getReportList } from '@/api/report'
import '@vue-office/docx/lib/index.css'

export interface ReportRow {
  id?: number
  patientName?: string
  recordNo?: string
  picoSn?: string
  itemName?: string
  createdAt?: string
  reportUrl?: string
}

// planName|创建人、link、用户名称、
// const list =
const total = ref(0)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const loading = ref(false)
const list = ref<ReportModel[]>([])
const visible = ref(false)
const queryRef = useTemplateRef('query')
const currentDocUrl = ref('')

const queryParams = ref<ListPageParamsWrapper<ReportModel>>({
  page: {
    current: 1,
    size: 10,
  },
})

function getList(): void {
  if (loading.value)
    return
  loading.value = true
  getReportList(queryParams.value).then((res) => {
    list.value = res.data.records
    total.value = res.data.total
  }).finally(() => {
    loading.value = false
  })
}

function retQuery(): void {
  queryParams.value = {
    page: {
      current: 1,
      size: 10,
    },
  }
  resetForm(queryRef.value)
  getList()
}

function handleSelectionChange(selection: ReportRow[]): void {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function openReport(row: ReportModel): void {
  let url = row.link?.trim() || ''

  // 如果不是 http / https 开头 → 自动加 __api__
  if (!/^https?:\/\//i.test(url)) {
    url = `${__API_URL__}${url}`
  }

  currentDocUrl.value = url
  visible.value = true
}

function cancel() {
  visible.value = false
}

// 下载 Word
async function handleDownload() {
  const url = currentDocUrl.value
  // 直接下载 URL 文件
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    saveAs(blob, getFilenameFromUrl(url))
  }
  catch (e) {
    console.error('文件下载失败', e)
  }
}

function getFilenameFromUrl(url: string) {
  try {
    return url.split('/').pop() || '下载文件.docx'
  }
  catch {
    return '下载文件.docx'
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="container">
    <el-form ref="query" :inline="true" :model="queryParams" @submit.prevent>
      <el-form-item>
        <el-input v-model="queryParams.patientName" placeholder="患者名称" clearable style="width: 200px" @keyup.enter="getList" />
      </el-form-item>

      <el-form-item>
        <el-input v-model="queryParams.picoNumber" placeholder="Pico 编号" clearable style="width: 180px" @keyup.enter="getList" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="getList">
          查询
        </el-button>
        <el-button type="primary" plain :icon="Refresh" @click="retQuery">
          查询重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column prop="id" label="报告编号" align="center" width="120" show-overflow-tooltip />

      <el-table-column prop="patientName" label="患者名称" align="center" width="120" show-overflow-tooltip />
      <el-table-column prop="exeDoctor" label="治疗医生" align="center" width="120" show-overflow-tooltip />

      <el-table-column prop="picoNumber" label="Pico 编号" align="center" width="140" show-overflow-tooltip />

      <el-table-column prop="planName" label="视频方案" align="center" width="180" />

      <el-table-column prop="link" label="报告链接" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <el-link :href="row.link" target="_blank">
            {{ row.link }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column prop="createdTime" label="创建时间" align="center" show-overflow-tooltip />

      <el-table-column align="center" label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openReport(row)">
            报告查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total > 0" v-model:page="queryParams.page.current" v-model:limit="queryParams.page.size" :total="total" @pagination="getList" />

    <el-dialog
      v-model="visible"
      title="文件预览"
      width="900px"
      :close-on-click-modal="false"
      @close="cancel"
    >
      <!-- 下载按钮 -->
      <template #header>
        <div class="flex justify-between items-center">
          <span>文件预览</span>
          <el-button type="primary" size="small" @click="handleDownload">
            下载
          </el-button>
        </div>
      </template>

      <div class="card">
        <!-- 预览 Word -->
        <VueOfficeDocx
          :src="currentDocUrl"
          style="height: calc(100vh - 200px);"
        />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
