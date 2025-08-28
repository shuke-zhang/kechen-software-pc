<script setup lang="ts">
import type { PatientModel } from '@/model/patient'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'

const total = ref(0)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const queryRef = useTemplateRef('queryEl')

const queryParams = ref<ListQueryParams<PatientModel>>({
  pageNum: 1,
  pageSize: 10,
  name: '',
})
const loading = ref(false)
const list = ref<PatientModel[]>([
  {
    id: 1,
    name: '张三',
    age: 30,
    gender: 1,
    phone: '12345678901',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区',
    medicalHistory: ['高血压'],
  },
  {
    id: 2,
    name: '李四',
    age: 25,
    gender: 2,
    phone: '19876543210',
    email: 'lisi@example.com',
    address: '上海市浦东新区',
    medicalHistory: ['糖尿病'],
  },
])

function getList() {
  if (loading.value)
    return
  loading.value = true
  console.log('获取列表')
}

function handlePut(row: PatientModel) {
  console.log('修改患者信息', row)
}

function handleDel(_item: number[]) {
  confirmWarning(`是否确认删除设备？`).then(() => {
    console.log('确定')
  })
}

function retQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    name: '',
  }
  resetForm(queryRef.value)
  getList()
}

function handleSelectionChange(selection: PatientModel[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
</script>

<template>
  <div class="container">
    <el-form ref="queryEl" :inline="true" :model="queryParams">
      <el-form-item>
        <el-input
          v-model="queryParams.name"
          placeholder="请输入患者名称"
          clearable
          size="large"
          style="width: 240px"
          @click.enter="getList"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="getList">
          查询
        </el-button>
        <el-button type="primary" plain :icon="Refresh" @click="retQuery">
          查询重置
        </el-button>
        <el-button type="success" :icon="CirclePlus">
          添加
        </el-button>
        <el-button type="danger" :disabled="ids.length <= 0" :icon="CircleClose" @click="handleDel(ids)">
          删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" prop="id" label="ID" show-overflow-tooltip />

      <el-table-column prop="name" label="患者姓名" align="center" show-overflow-tooltip />

      <el-table-column prop="gender" label="性别" align="center">
        <template #default="{ row }">
          <TableGender :gender="row.gender" />
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

    <Pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
