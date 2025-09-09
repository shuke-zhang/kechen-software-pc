<script setup lang="ts">
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'

import ReportDialog from './reportDialog.vue'

export interface ReportRow {
  id?: number
  patientName?: string
  recordNo?: string
  picoSn?: string
  itemName?: string
  createdAt?: string
  reportUrl?: string
}

type DateRange = [string, string] | undefined

interface ReportQuery extends ReportRow {
  dateRange?: DateRange
}

const total = ref(0)
const dialogVisible = ref(false)
const isAdd = ref(false)
const dialogData = ref<ReportRow>({})
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const loading = ref(false)

const queryRef = useTemplateRef('queryEl')

const queryParams = ref<ListQueryParams<ReportQuery>>({
  pageNum: 1,
  pageSize: 10,
  patientName: '',
  recordNo: '',
  picoSn: '',
  itemName: '',
  dateRange: undefined,
})

const list = ref<ReportRow[]>([
  {
    id: 6001,
    patientName: '张三',
    recordNo: 'VR-202508-0001',
    picoSn: 'PICO-AX9-001',
    itemName: '颈椎牵引',
    createdAt: '2025-08-28 10:12:00',
    reportUrl: '/report/VR-202508-0001',
  },
  {
    id: 6002,
    patientName: '李四',
    recordNo: 'VR-202508-0002',
    picoSn: 'PICO-AX9-017',
    itemName: '眼部理疗',
    createdAt: '2025-08-30 15:40:12',
    reportUrl: 'https://example.com/report/VR-202508-0002',
  },
])

function getList(): void {
  if (loading.value)
    return
  loading.value = true
  console.log('获取报告列表', queryParams.value)
  setTimeout(() => {
    loading.value = false
  }, 300)
}

function handleAdd(): void {
  isAdd.value = true
  dialogData.value = {}
  dialogVisible.value = true
}

function handlePut(row: ReportRow): void {
  isAdd.value = false
  dialogData.value = { ...row }
  dialogVisible.value = true
}

function handleDel(_ids: number[] | ReportRow): void {
  const delIds = Array.isArray(_ids) ? _ids : [_ids.id!]
  confirmWarning('是否确认删除所选报告？').then(() => {
    console.log('删除 IDs:', delIds)
  })
}

function retQuery(): void {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    patientName: '',
    recordNo: '',
    picoSn: '',
    itemName: '',
  } as any
  resetForm(queryRef.value)
  getList()
}

function handleSelectionChange(selection: ReportRow[]): void {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function openReport(row: ReportRow): void {
  if (!row)
    return
  if (row.reportUrl && row.reportUrl.startsWith('http')) {
    window.open(row.reportUrl, '_blank')
    return
  }
  if (row.reportUrl) {
    const r = useRouter()
    r.push(row.reportUrl)
    return
  }
  ElMessage.warning('未配置报告链接')
}
</script>

<template>
  <div class="container">
    <el-form ref="queryEl" :inline="true" :model="queryParams">
      <el-form-item>
        <el-input v-model="queryParams.patientName" placeholder="患者名称" clearable size="large" style="width: 200px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.recordNo" placeholder="诊疗编号" clearable size="large" style="width: 200px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.picoSn" placeholder="Pico 编号" clearable size="large" style="width: 180px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.itemName" placeholder="诊疗项名称" clearable size="large" style="width: 200px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-date-picker v-model="queryParams.dateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD HH:mm:ss" size="large" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="getList">
          查询
        </el-button>
        <el-button type="primary" plain :icon="Refresh" @click="retQuery">
          查询重置
        </el-button>
        <el-button type="success" :icon="CirclePlus" @click="handleAdd">
          新增
        </el-button>
        <el-button type="danger" :disabled="ids.length <= 0" :icon="CircleClose" @click="handleDel(ids)">
          删除
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="patientName" label="患者名称" align="center" width="120" show-overflow-tooltip />
      <el-table-column prop="recordNo" label="诊疗编号" align="center" width="160" />
      <el-table-column prop="picoSn" label="Pico 编号" align="center" width="140" />
      <el-table-column prop="itemName" label="诊疗项名称" align="center" width="160" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" align="center" width="180" />
      <el-table-column label="报告链接" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openReport(row)">
            查看
          </el-button>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handlePut(row)">
            修改
          </el-button>
          <el-button size="small" type="danger" @click="handleDel(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <ReportDialog v-model="dialogVisible" :is-add="isAdd" :data="dialogData" @ok="getList" />
  </div>
</template>

<style scoped lang="scss">

</style>
