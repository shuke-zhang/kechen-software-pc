<script setup lang="ts">
import type { ReportModel } from '@/model/report'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import ReportDialog from './reportDialog.vue'

/** 假定项目里已有这些类型/工具：ListQueryParams<T>、confirmWarning、resetForm、Pagination 组件 */

const total = ref(0)
const dialogVisible = ref(false)
const isAdd = ref(false)
const dialogData = ref<ReportModel>({})
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)

const queryRef = useTemplateRef('queryEl')
const queryParams = ref<ListQueryParams<ReportModel> & {
  patientName?: string
  reportType?: string
  status?: ReportModel['status'] | ''
  dateRange?: [string, string] | undefined
}>({
  pageNum: 1,
  pageSize: 10,
  patientName: '',
  reportType: '',
  status: undefined,
  dateRange: undefined,
})

const loading = ref(false)
const list = ref<ReportModel[]>([
  {
    id: 5001,
    patientId: 1,
    patientName: '张三',
    reportType: '检验报告',
    reportDate: '2025-08-20 10:15:00',
    doctor: '王医生',
    status: '已出具',
    findings: '血常规：Hb 140g/L，WBC 正常',
    impression: '未见明显异常',
  },
  {
    id: 5002,
    patientId: 2,
    patientName: '李四',
    reportType: '影像报告',
    reportDate: '2025-08-22 16:40:00',
    doctor: '赵医生',
    status: '草稿',
    findings: '胸片：双肺纹理增多',
    impression: '建议复查',
  },
])

function getList() {
  if (loading.value)
    return
  loading.value = true
  console.log('获取报告列表', queryParams.value)
  // TODO: 调接口
  setTimeout(() => {
    loading.value = false
  }, 300)
}

function handleAdd() {
  isAdd.value = true
  dialogData.value = {}
  dialogVisible.value = true
}

function handlePut(row: ReportModel) {
  isAdd.value = false
  dialogData.value = { ...row }
  dialogVisible.value = true
}

function handleDel(_ids: number[] | ReportModel) {
  const delIds = Array.isArray(_ids) ? _ids : [_ids.id!]
  confirmWarning('是否确认删除所选报告？').then(() => {
    console.log('删除 IDs:', delIds)
    // TODO: 删除接口
  })
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
  getList()
}

function handleSelectionChange(selection: ReportModel[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
</script>

<template>
  <div class="container">
    <!-- 查询区域 -->
    <el-form ref="queryEl" :inline="true" :model="queryParams" class="mb-3">
      <el-form-item>
        <el-input v-model="queryParams.patientName" placeholder="患者姓名" clearable size="large" style="width: 200px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.reportType" placeholder="报告类型" clearable size="large" style="width: 160px">
          <el-option label="检验报告" value="检验报告" />
          <el-option label="影像报告" value="影像报告" />
          <el-option label="病理报告" value="病理报告" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="状态" clearable size="large" style="width: 140px">
          <el-option label="草稿" value="草稿" />
          <el-option label="已出具" value="已出具" />
          <el-option label="作废" value="作废" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="queryParams.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          size="large"
        />
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

    <!-- 表格 -->
    <el-table v-loading="loading" :data="list" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="报告ID" align="center" width="100" />

      <el-table-column prop="patientName" label="患者姓名" align="center" show-overflow-tooltip />

      <el-table-column prop="reportType" label="报告类型" align="center" width="120" />

      <el-table-column prop="reportDate" label="报告时间" align="center" width="180" />

      <el-table-column prop="doctor" label="医生" align="center" width="120" />

      <el-table-column prop="status" label="状态" align="center" width="100" />

      <el-table-column prop="impression" label="结论/印象" align="center" show-overflow-tooltip />

      <el-table-column align="center" label="操作" width="220" fixed="right">
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

    <!-- 分页 -->
    <Pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 弹窗 -->
    <ReportDialog v-model="dialogVisible" :is-add="isAdd" :data="dialogData" />
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
