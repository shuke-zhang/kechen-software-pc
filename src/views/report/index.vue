<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue'

import { getReportList } from '@/api/report'

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
// planName|创建人、link、用户名称、
// const list =
const total = ref(0)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const loading = ref(false)
const list = ref<ReportRow[]>([])

const queryRef = useTemplateRef('queryEl')

const queryParams = ref<ListPageParamsWrapper<ReportQuery>>({
  pageNum: 1,
  pageSize: 10,
  patientName: '',
  recordNo: '',
  picoSn: '',
  itemName: '',
  dateRange: undefined,
})

function getList(): void {
  if (loading.value)
    return
  loading.value = true
  getReportList(queryParams.value).then((res) => {
    list.value = res.data.records
    total.value = res.data.total
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

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="container">
    <el-form ref="queryEl" :inline="true" :model="queryParams" @submit.prevent>
      <el-form-item>
        <el-input v-model="queryParams.patientName" placeholder="患者名称" clearable style="width: 200px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.recordNo" placeholder="诊疗编号" clearable style="width: 200px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.picoSn" placeholder="Pico 编号" clearable style="width: 180px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.itemName" placeholder="诊疗项名称" clearable style="width: 200px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-date-picker v-model="queryParams.dateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD HH:mm:ss" />
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
      <el-table-column type="selection" width="55" />
      <el-table-column prop="patientName" label="患者名称" align="center" width="120" show-overflow-tooltip />
      <el-table-column prop="recordNo" label="诊疗编号" align="center" width="160" />
      <el-table-column prop="picoSn" label="Pico 编号" align="center" width="140" />
      <el-table-column prop="itemName" label="诊疗项名称" align="center" width="160" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" align="center" width="180" />
      <el-table-column prop="link" label="报告链接" align="center" />

      <el-table-column align="center" label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openReport(row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
  </div>
</template>

<style scoped lang="scss">

</style>
