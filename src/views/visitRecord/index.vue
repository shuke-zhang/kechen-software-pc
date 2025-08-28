<!-- VisitRecordPage.vue -->
<script setup lang="ts">
import type { VisitRecordModel } from '@/model/visitRecord'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import VisitRecordDialog from './visitRecordDialog.vue'

// 假定项目里已有这些工具类型/函数，与患者页面保持一致风格

const total = ref(0)
const dialogVisible = ref(false)
const isAdd = ref(false)
const dialogData = ref<VisitRecordModel>({})
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)

const queryRef = useTemplateRef('queryEl')

const queryParams = ref<ListQueryParams<VisitRecordModel & {
  dateRange?: [string, string] | undefined
}>>({
  pageNum: 1,
  pageSize: 10,
  patientName: '',
  department: '',
  doctor: '',
  dateRange: undefined,
})

const loading = ref(false)
const list = ref<VisitRecordModel[]>([
  {
    id: 1001,
    patientId: 1,
    patientName: '张三',
    visitDate: '2025-08-20 14:30:00',
    department: '内科',
    diagnosis: '高血压',
    treatment: '口服降压药',
    doctor: '王医生',
    cost: 260.0,
    notes: '建议两周复诊',
  },
  {
    id: 1002,
    patientId: 2,
    patientName: '李四',
    visitDate: '2025-08-22 09:10:00',
    department: '内分泌科',
    diagnosis: '糖尿病',
    treatment: '控制饮食 + 二甲双胍',
    doctor: '赵医生',
    cost: 340.5,
    notes: '监测血糖，记录饮食',
  },
])

function getList() {
  if (loading.value)
    return
  loading.value = true
  console.log('获取诊疗记录列表', queryParams.value)
  // TODO: 调接口：基于 queryParams 获取数据
  setTimeout(() => {
    loading.value = false
  }, 300)
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
  confirmWarning(`是否确认删除所选诊疗记录？`).then(() => {
    console.log('删除 IDs:', delIds)
    // TODO: 调用删除接口
  })
}

function retQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    patientName: '',
    department: '',
    doctor: '',
  }
  resetForm(queryRef.value)
  getList()
}

function handleSelectionChange(selection: VisitRecordModel[]) {
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
        <el-input
          v-model="queryParams.patientName"
          placeholder="患者姓名"
          clearable
          size="large"
          style="width: 200px"
          @keyup.enter="getList"
        />
      </el-form-item>

      <el-form-item>
        <el-input
          v-model="queryParams.department"
          placeholder="科室"
          clearable
          size="large"
          style="width: 160px"
          @keyup.enter="getList"
        />
      </el-form-item>

      <el-form-item>
        <el-input
          v-model="queryParams.doctor"
          placeholder="医生"
          clearable
          size="large"
          style="width: 160px"
          @keyup.enter="getList"
        />
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
      <el-table-column prop="id" label="记录ID" align="center" width="100" />
      <el-table-column prop="patientName" label="患者姓名" align="center" show-overflow-tooltip />
      <el-table-column prop="visitDate" label="就诊时间" align="center" width="180" />
      <el-table-column prop="department" label="科室" align="center" width="120" />
      <el-table-column prop="doctor" label="医生" align="center" width="120" />
      <el-table-column prop="diagnosis" label="诊断" align="center" show-overflow-tooltip />
      <el-table-column prop="treatment" label="治疗方案" align="center" show-overflow-tooltip />
      <el-table-column prop="cost" label="费用(¥)" align="center" width="110" />

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
    <Pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />

    <!-- 弹窗 -->
    <VisitRecordDialog v-model="dialogVisible" :is-add="isAdd" :data="dialogData" />
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
