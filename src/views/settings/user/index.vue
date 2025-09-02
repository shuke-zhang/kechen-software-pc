<!-- UserPage.vue -->
<script setup lang="ts">
import type { ElForm } from 'element-plus'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import UserDialog from './userDialog.vue'

type UserStatus = 'enabled' | 'disabled'

interface UserModel {
  id?: number
  username?: string
  nickname?: string
  phone?: string
  email?: string
  department?: string
  roleIds?: number[]
  roles?: string[]
  status?: UserStatus
  createdAt?: string
  lastLoginAt?: string
  remark?: string
}

interface QueryModel {
  pageNum: number
  pageSize: number
  username?: string
  status?: UserStatus | ''
  role?: string | ''
  dateRange?: [string, string] | undefined
}

const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const isAdd = ref(false)
const dialogData = ref<UserModel>({})
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)

const queryRef = useTemplateRef('queryEl')
const queryParams = ref<QueryModel>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  status: '',
  role: '',
  dateRange: undefined,
})

/** 静态角色与用户数据（示例） */
const allRoles = ref([
  { id: 1, name: '管理员' },
  { id: 2, name: '运营' },
  { id: 3, name: '编辑' },
  { id: 4, name: '访客' },
])

const list = ref<UserModel[]>([
  { id: 1001, username: 'admin', nickname: '系统管理员', phone: '13800000001', email: 'admin@example.com', department: '技术部', roleIds: [1], roles: ['管理员'], status: 'enabled', createdAt: '2025-08-01 09:00:00', lastLoginAt: '2025-08-23 10:10:00', remark: '拥有全部权限' },
  { id: 1002, username: 'op_zhang', nickname: '小张', phone: '13800000002', email: 'op_zhang@example.com', department: '运营部', roleIds: [2], roles: ['运营'], status: 'enabled', createdAt: '2025-08-05 14:20:00', lastLoginAt: '2025-08-22 08:40:00', remark: '' },
  { id: 1003, username: 'editor_li', nickname: '小李', phone: '13800000003', email: 'editor_li@example.com', department: '内容部', roleIds: [3], roles: ['编辑'], status: 'disabled', createdAt: '2025-08-10 12:00:00', lastLoginAt: '2025-08-12 11:00:00', remark: '停用中' },
  { id: 1004, username: 'guest_wang', nickname: '小王', phone: '13800000004', email: 'guest_wang@example.com', department: '—', roleIds: [4], roles: ['访客'], status: 'enabled', createdAt: '2025-08-12 16:30:00', lastLoginAt: '2025-08-21 09:30:00', remark: '' },
])

function filterRows(rows: UserModel[], qp: QueryModel): UserModel[] {
  let ret = rows.slice()
  if (qp.username && qp.username.trim()) {
    const kw = qp.username.trim().toLowerCase()
    ret = ret.filter(u => (u.username ?? '').toLowerCase().includes(kw) || (u.nickname ?? '').toLowerCase().includes(kw))
  }
  if (qp.status) {
    ret = ret.filter(u => u.status === qp.status)
  }
  if (qp.role) {
    ret = ret.filter(u => (u.roles ?? []).includes(qp.role as string))
  }
  if (qp.dateRange && qp.dateRange.length === 2) {
    const [start, end] = qp.dateRange
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    ret = ret.filter((u) => {
      const ts = new Date(u.createdAt ?? '').getTime()
      return Number.isFinite(ts) && ts >= s && ts <= e
    })
  }
  return ret
}

function getList(): void {
  if (loading.value)
    return
  loading.value = true
  console.log('获取用户列表', queryParams.value)
  setTimeout(() => {
    const rows = filterRows(list.value, queryParams.value)
    total.value = rows.length
    loading.value = false
  }, 200)
}

function retQuery(): void {
  queryParams.value = { pageNum: 1, pageSize: 10, username: '', status: '', role: '', dateRange: undefined }
  resetForm(queryRef.value)
  getList()
}

function handleAdd(): void {
  isAdd.value = true
  dialogData.value = {}
  dialogVisible.value = true
}

function handlePut(row: UserModel): void {
  isAdd.value = false
  dialogData.value = { ...row }
  dialogVisible.value = true
}

function handleDel(_ids: number[] | UserModel): void {
  const delIds = Array.isArray(_ids) ? _ids : [_ids.id!]
  confirmWarning('是否确认删除所选用户？').then(() => {
    console.log('删除 IDs:', delIds)
    // TODO 接口删除
  })
}

function handleSelectionChange(selection: UserModel[]): void {
  ids.value = selection.map(i => i.id!)
  single.value = selection.length !== 1
  multiple.value = selection.length === 0
}

onMounted(() => {
  total.value = list.value.length
})
</script>

<template>
  <div class="container">
    <!-- 查询 -->
    <el-form ref="queryEl" :inline="true" :model="queryParams" class="mb-3">
      <el-form-item>
        <el-input
          v-model="queryParams.username"
          placeholder="用户名 / 昵称"
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
        <el-select v-model="queryParams.role" placeholder="角色" clearable filterable size="large" style="width: 180px">
          <el-option v-for="r in allRoles" :key="r.id" :label="r.name" :value="r.name" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-date-picker
          v-model="queryParams.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="注册开始"
          end-placeholder="注册结束"
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
    <el-table
      v-loading="loading"
      :data="filterRows(list, queryParams)"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" align="center" width="90" />
      <el-table-column prop="username" label="用户名" align="center" width="140" show-overflow-tooltip />
      <el-table-column prop="nickname" label="昵称" align="center" width="140" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机号" align="center" width="140" />
      <el-table-column prop="email" label="邮箱" align="center" width="200" show-overflow-tooltip />
      <el-table-column prop="department" label="部门" align="center" width="140" />
      <el-table-column label="角色" align="center" width="160">
        <template #default="{ row }">
          <el-tag v-for="r in row.roles ?? []" :key="r" class="mr-1" type="info" size="small">
            {{ r }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
            {{ row.status === 'enabled' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="注册时间" align="center" width="180" />
      <el-table-column prop="lastLoginAt" label="最近登录" align="center" width="180" />
      <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip />
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
    <UserDialog
      v-model="dialogVisible"
      :is-add="isAdd"
      :data="dialogData"
      :all-roles="allRoles"
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
