<!-- VisitRecordPage.vue (V2) -->
<script setup lang="ts">
import type { EpPropMergeType } from 'element-plus/es/utils/index.mjs'

import type { VisitRecordModel } from '@/model/visitRecord'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import { getVideoTreatList } from '@/api/visitRecord'
import VisitRecordDialog from './visitRecordDialog.vue'

type DateRange = [string, string] | undefined

interface VisitRecordQuery extends VisitRecordModel {
  dateRange?: DateRange
}

const total = ref(0)
const dialogVisible = ref(false)
const isAdd = ref(false)
const dialogData = ref<VisitRecordModel>({})
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const loading = ref(false)

const queryRef = useTemplateRef('queryEl')

const queryParams = ref<ListPageParamsWrapper<VisitRecordQuery>>({
  page: {
    current: 1,
    size: 10,
  },

})

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '启用', value: 'active' },
  { label: '暂停', value: 'paused' },
  { label: '已归档', value: 'archived' },
]

const list = ref<VisitRecordModel[]>([
  {
    id: 31001,
    patientName: '张三',
    videoPlanName: '颈椎康复·标准V1',
    itemName: '颈椎牵引',
    deviceSn: 'AX9-001',
    department: '康复科',
    status: 'active',
    createdAt: '2025-08-28 10:12:00',
  },
  {
    id: 31002,
    patientName: '李四',
    videoPlanName: '眼部舒缓·V2',
    itemName: '眼部理疗',
    deviceSn: 'AX9-017',
    department: '眼科',
    status: 'paused',
    createdAt: '2025-08-30 15:40:12',
  },
])

function getList() {
  if (loading.value)
    return
  loading.value = true
  getVideoTreatList(queryParams.value).then((res) => {
    list.value = res.data.records
    total.value = res.data.total
    ids.value = []
    single.value = true
    multiple.value = true
  }).finally(() => {
    loading.value = false
  })
}

function handleAdd() {
  isAdd.value = true
  dialogData.value = {}
  dialogVisible.value = true
}

function handlePut(row: VisitRecordModel) {
  isAdd.value = false
  dialogData.value = { ...row }
  dialogVisible.value = true
}

function handleDel(_ids: number[] | VisitRecordModel) {
  const delIds = Array.isArray(_ids) ? _ids : [_ids.id!]
  confirmWarning('是否确认删除所选诊疗记录？').then(() => {
    console.log('删除 IDs:', delIds)
  })
}

function retQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    patientName: '',
    videoPlanName: '',
    itemName: '',
    deviceSn: '',
    department: '',
    status: undefined,
  }
  resetForm(queryRef.value)
  getList()
}

function handleSelectionChange(selection: VisitRecordModel[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function tagType(status?: VisitRecordModel['status']): EpPropMergeType<StringConstructor, 'primary' | 'success' | 'warning' | 'info' | 'danger', unknown> | undefined {
  if (status === 'active')
    return 'success'
  if (status === 'paused')
    return 'warning'
  if (status === 'archived')
    return 'info'
  return undefined
}
onMounted(() => {
  getList()
})
</script>

<template>
  <div class="container">
    <el-form ref="queryEl" :inline="true" :model="queryParams" @submit.prevent>
      <el-form-item>
        <el-input v-model="queryParams.patientName" placeholder="患者姓名" clearable style="width: 200px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.videoPlanName" placeholder="视频方案名称" clearable style="width: 220px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.itemName" placeholder="诊疗项名称" clearable style="width: 200px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.deviceSn" placeholder="设备编号" clearable style="width: 180px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.department" placeholder="治疗科室" clearable style="width: 160px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="状态" clearable filterable style="width: 140px">
          <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
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
        <el-button type="success" :icon="CirclePlus" @click="handleAdd">
          新增
        </el-button>
        <el-button type="danger" :disabled="ids.length <= 0" :icon="CircleClose" @click="handleDel(ids)">
          删除
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="编号" align="center" width="90" />
      <el-table-column prop="patientName" label="患者姓名" align="center" width="120" show-overflow-tooltip />
      <el-table-column prop="videoPlanName" label="视频方案名称" align="center" show-overflow-tooltip />
      <el-table-column prop="itemName" label="诊疗项名称" align="center" width="160" show-overflow-tooltip />
      <el-table-column prop="deviceSn" label="设备编号" align="center" width="140" />
      <el-table-column prop="department" label="治疗科室" align="center" width="120" />
      <el-table-column prop="status" label="状态" align="center" width="120">
        <template #default="{ row }">
          <el-tag :type="tagType(row.status) ">
            {{ statusOptions.find(s => s.value === row.status)?.label || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" align="center" width="180" />
      <el-table-column label="操作" align="center" width="160" fixed="right">
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

    <VisitRecordDialog v-model="dialogVisible" :is-add="isAdd" :data="dialogData" @ok="getList" />
  </div>
</template>

<style scoped lang="scss">
.container {
  padding: 16px;
}
.mb-3 {
  margin-bottom: 12px;
}
</style>
