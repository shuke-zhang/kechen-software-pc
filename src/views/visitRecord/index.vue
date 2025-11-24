<!-- VisitRecordPage.vue (V2) -->
<script setup lang="ts">
import type { CssTypeModel } from '@/components/DictTag/index.vue'
import type { VisitRecordModel } from '@/model/visitRecord'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import { addVideoAddReport, DelVideoTreat, getVideoTreatList, videoIssued } from '@/api/visitRecord'
import VisitRecordDialog from './visitRecordDialog.vue'

type DateRange = [string, string] | undefined

interface VisitRecordQuery extends VisitRecordModel {
  dateRange?: DateRange
}
const { treat_project_type, treat_status } = useDict('treat_project_type', 'treat_status')
const total = ref(0)
const dialogVisible = ref(false)
const isAdd = ref(false)
const dialogData = ref<VisitRecordModel>({})
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const loading = ref(false)
const issuedLoading = ref(false)
const queryRef = useTemplateRef('queryEl')

const queryParams = ref<ListPageParamsWrapper<VisitRecordQuery>>({
  page: {
    current: 1,
    size: 10,
  },

})
function handleResetT(_row: VisitRecordModel) {
  addVideoAddReport('1').then(() => {
    showMessageSuccess('操作成功')
  })
}
// "success" | "primary" | "info" | "warning" | "danger"
const treatStatusCssType = computed(() => {
  return treat_status.value.map((it, i) => {
    return {
      ...it,
      cssType: (i === 0 ? 'primary' : i === 1 ? 'warning' : i === 2 ? 'success' : 'info') as CssTypeModel,
    }
  })
})

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '启用', value: 'active' },
  { label: '暂停', value: 'paused' },
  { label: '已归档', value: 'archived' },
]

const list = ref<VisitRecordModel[]>([])

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
  confirmWarning(`是否确认删除治疗记录编号：${delIds.join(', ')}？`).then(() => {
    delMsgLoading(DelVideoTreat(delIds), '删除中...').then(() => {
      showMessageSuccess('删除成功')
      getList()
    })
  })
}

function handleIssued(item: VisitRecordModel) {
  if (issuedLoading.value)
    return
  issuedLoading.value = true
  videoIssued({
    id: item.id!,
  }).then((res) => {
    console.log(res, '下发成功')
    getList()
  }).finally(() => {
    issuedLoading.value = false
  })
}

function retQuery() {
  queryParams.value = {
    page: {
      current: 1,
      size: 10,
    },
  }
  resetForm(queryRef.value)
  getList()
}

function handleSelectionChange(selection: VisitRecordModel[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
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

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />

      <el-table-column prop="id" label="编号" align="center" width="90" />

      <el-table-column prop="patientName" label="患者" align="center" width="120" show-overflow-tooltip />

      <el-table-column prop="devicePicoId" label="设备" align="center" width="160" show-overflow-tooltip />

      <el-table-column prop="planName" label="视频方案" align="center" show-overflow-tooltip />

      <el-table-column prop="status" label="状态" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <dict-tag :options="treatStatusCssType" :value="row.status" />
        </template>
      </el-table-column>

      <el-table-column prop="diagnosticDoctor" label="诊断医生姓名" align="center" width="140" />

      <el-table-column prop="executeDoctor" label="执行医生姓名" align="center" width="140" />

      <el-table-column prop="treatDepart" label="诊疗项" align="center" width="140" :formatter="$formatterTableEmpty" />

      <el-table-column prop="diagnostic" label="诊断内容" align="center" width="120" />

      <el-table-column prop="comment" label="备注" align="center" width="180" :formatter="$formatterTableEmpty" show-overflow-tooltip />

      <el-table-column prop="createdUserName" label="创建人" align="center" width="180" />

      <el-table-column prop="createdTime" label="创建时间" align="center" width="180" />

      <el-table-column label="操作" align="center" width="220" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 0" size="small" type="primary" @click="handleIssued(row)">
            下发
          </el-button>

          <el-button size="small" type="primary" @click="handlePut(row)">
            修改
          </el-button>
          <el-button size="small" type="danger" @click="handleDel(row)">
            删除
          </el-button>
          <el-button size="small" @click="handleResetT(row)">
            测试-新增报告
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total > 0" v-model:page="queryParams.page.current" v-model:limit="queryParams.page.size" :total="total" @pagination="getList" />

    <VisitRecordDialog
      v-model="dialogVisible"
      :is-add="isAdd"
      :data="dialogData"
      :treat-project-type="treat_project_type"
      :treat-status="treat_status"
      @success="getList"
    />
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
