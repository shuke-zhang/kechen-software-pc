<!-- VideoCategoryPage.vue -->
<script setup lang="ts">
import type { ElForm } from 'element-plus'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import VideoCategoryDialog from './videoCategoryDialog.vue'

/** 基础模型（你也可以抽到 @/model/videoCategory） */
type CategoryStatus = 'enabled' | 'disabled'
interface VideoCategoryModel {
  id?: number
  name?: string
  code?: string
  parentId?: number | null
  status?: CategoryStatus
  sort?: number
  color?: string
  icon?: string
  description?: string
  createdAt?: string
  updatedAt?: string
  videoCount?: number
}

/** 查询模型 */
interface QueryModel {
  pageNum: number
  pageSize: number
  name?: string
  status?: CategoryStatus | ''
  dateRange?: [string, string] | undefined
}

/** 分页/弹窗等状态 */
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const isAdd = ref(false)
const dialogData = ref<VideoCategoryModel>({})
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)

/** 查询表单 */
const queryRef = useTemplateRef('queryEl')
const queryParams = ref<QueryModel>({
  pageNum: 1,
  pageSize: 10,
  name: '',
  status: '',
  dateRange: undefined,
})

/** 静态数据：模拟类别列表 */
const list = ref<VideoCategoryModel[]>([
  { id: 1, name: '冥想', code: 'meditation', parentId: null, status: 'enabled', sort: 10, color: '#10B981', icon: 'icon-mind', description: '舒缓与专注', createdAt: '2025-08-20 10:00:00', updatedAt: '2025-08-21 09:00:00', videoCount: 32 },
  { id: 2, name: '培训', code: 'training', parentId: null, status: 'enabled', sort: 20, color: '#6366F1', icon: 'icon-train', description: '员工或学员培训', createdAt: '2025-08-18 12:00:00', updatedAt: '2025-08-22 08:30:00', videoCount: 58 },
  { id: 3, name: '宣传', code: 'promo', parentId: null, status: 'enabled', sort: 30, color: '#F59E0B', icon: 'icon-promo', description: '营销与品牌', createdAt: '2025-08-10 09:10:00', updatedAt: '2025-08-19 17:20:00', videoCount: 21 },
  { id: 4, name: '案例', code: 'case', parentId: null, status: 'enabled', sort: 40, color: '#06B6D4', icon: 'icon-case', description: '成功案例与复盘', createdAt: '2025-08-05 16:10:00', updatedAt: '2025-08-23 10:10:00', videoCount: 12 },
  { id: 5, name: '其它', code: 'other', parentId: null, status: 'disabled', sort: 99, color: '#64748B', icon: 'icon-other', description: '未归类视频', createdAt: '2025-08-01 08:00:00', updatedAt: '2025-08-12 11:30:00', videoCount: 5 },
  { id: 6, name: '冥想 · 呼吸法', code: 'breath', parentId: 1, status: 'enabled', sort: 11, color: '#34D399', icon: 'icon-breath', description: '呼吸与放松', createdAt: '2025-08-20 11:00:00', updatedAt: '2025-08-21 09:30:00', videoCount: 7 },
  { id: 7, name: '培训 · 新员工', code: 'onboard', parentId: 2, status: 'enabled', sort: 21, color: '#8B5CF6', icon: 'icon-onboard', description: '入职培训', createdAt: '2025-08-18 13:00:00', updatedAt: '2025-08-22 08:40:00', videoCount: 15 },
])

/** 父类名称映射 */
const parentNameMap = computed<Record<number, string>>(() => {
  const map: Record<number, string> = {}
  list.value.forEach((c) => {
    if (c.id != null)
      map[c.id] = c.name ?? ''
  })
  return map
})

/** 获取列表（静态模拟） */
function getList(): void {
  if (loading.value)
    return
  loading.value = true
  console.log('获取视频类别列表', queryParams.value)
  setTimeout(() => {
    const rows = filterRows(list.value, queryParams.value)
    total.value = rows.length
    loading.value = false
  }, 200)
}

/** 本地筛选（根据 name / status / 时间范围） */
function filterRows(rows: VideoCategoryModel[], qp: QueryModel): VideoCategoryModel[] {
  let ret = rows.slice()
  if (qp.name && qp.name.trim()) {
    const kw = qp.name.trim().toLowerCase()
    ret = ret.filter(v => (v.name ?? '').toLowerCase().includes(kw) || (v.code ?? '').toLowerCase().includes(kw))
  }
  if (qp.status) {
    ret = ret.filter(v => v.status === qp.status)
  }
  if (qp.dateRange && qp.dateRange.length === 2) {
    const [start, end] = qp.dateRange
    ret = ret.filter((v) => {
      const ts = new Date(v.createdAt ?? '').getTime()
      const s = new Date(start).getTime()
      const e = new Date(end).getTime()
      return Number.isFinite(ts) && ts >= s && ts <= e
    })
  }
  return ret
}

/** 重置查询 */
function retQuery(): void {
  queryParams.value = { pageNum: 1, pageSize: 10, name: '', status: '', dateRange: undefined }
  resetForm(queryRef.value)
  getList()
}

/** 打开新增 */
function handleAdd(): void {
  isAdd.value = true
  dialogData.value = {}
  dialogVisible.value = true
}

/** 打开编辑 */
function handlePut(row: VideoCategoryModel): void {
  isAdd.value = false
  dialogData.value = { ...row }
  dialogVisible.value = true
}

/** 删除（支持批量） */
function handleDel(_ids: number[] | VideoCategoryModel): void {
  const delIds = Array.isArray(_ids) ? _ids : [_ids.id!]
  confirmWarning('是否确认删除所选视频类别？').then(() => {
    console.log('删除 IDs:', delIds)
    // TODO: 调用删除接口；当前为静态演示
  })
}

/** 选择变化 */
function handleSelectionChange(selection: VideoCategoryModel[]): void {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length !== 1
  multiple.value = selection.length === 0
}

/** 初次加载 */
onMounted(() => {
  total.value = list.value.length
})
</script>

<template>
  <div class="container">
    <!-- 查询区域 -->
    <el-form ref="queryEl" :inline="true" :model="queryParams" class="mb-3">
      <el-form-item>
        <el-input
          v-model="queryParams.name"
          placeholder="类别名称 / 编码"
          clearable
          size="large"
          style="width: 220px"
          @keyup.enter="getList"
        />
      </el-form-item>

      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="状态" clearable size="large" style="width: 160px">
          <el-option label="启用" value="enabled" />
          <el-option label="停用" value="disabled" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-date-picker
          v-model="queryParams.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="创建开始"
          end-placeholder="创建结束"
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
    <el-table v-loading="loading" :data="filterRows(list, queryParams)" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" align="center" width="90" />
      <el-table-column prop="name" label="类别名称" align="center" show-overflow-tooltip />
      <el-table-column prop="code" label="编码" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="父级" align="center" width="160">
        <template #default="{ row }">
          <span>{{ row.parentId ? parentNameMap[row.parentId] ?? '-' : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
            {{ row.status === 'enabled' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" align="center" width="90" />
      <el-table-column prop="videoCount" label="视频数" align="center" width="90" />
      <el-table-column prop="createdAt" label="创建时间" align="center" width="180" />
      <el-table-column prop="updatedAt" label="更新时间" align="center" width="180" />
      <el-table-column prop="description" label="说明" align="center" show-overflow-tooltip />
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

    <!-- 分页（静态演示：total 来自 list.length 或筛选长度） -->
    <Pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />

    <!-- 弹窗：把完整类别列表作为可选父级传入 -->
    <VideoCategoryDialog v-model="dialogVisible" :is-add="isAdd" :data="dialogData" :all-categories="list" />
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
