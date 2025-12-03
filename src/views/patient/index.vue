<script setup lang="ts">
import type { DictDataCssModel } from '@/model/dict'
import type { PatientModel } from '@/model/patient'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import { DelPatient, getPatientList } from '@/api/patient'
import PatientDialog from './patientDialog.vue'
import { patients } from './patients'

const props = defineProps({
  componentHeight: {
    type: String,
    required: true,
  },
})
const { sys_user_sex, sys_education } = useDict('sys_user_sex', 'sys_education')
const total = ref(0)
const dialogVisible = ref(false)
const isAdd = ref(false)
const dialogData = ref<PatientModel>({})
const ids = ref<number[]>([])
const names = ref<string[]>([])
const single = ref(true)
const multiple = ref(true)
const queryRef = useTemplateRef('queryRef')

const tableHeight = computed<string>(() => {
  const el = queryRef.value?.$el as HTMLElement | undefined
  const elHeight = el?.getBoundingClientRect().height ?? 0
  const height = Number(props.componentHeight) - elHeight - 96 - 32
  return `${height}px`
})

const queryParams = ref<ListPageParamsWrapper<PatientModel>>({
  page: {
    current: 1,
    size: 10,
  },
  name: '',
})
const loading = ref(false)
const list = ref<PatientModel[]>([])

const sysUserSexCss = computed<DictDataCssModel[]>(() => {
  return sys_user_sex.value.map(item => ({
    ...item,
    cssType: item.value === '1' ? 'primary' : item.value === '2' ? 'danger' : 'info',
  }))
})

function getList() {
  if (loading.value)
    return
  loading.value = true
  getPatientList(queryParams.value)
    .then((res) => {
      list.value = res.data.records
      total.value = res.data.total
    })
    .finally(() => {
      loading.value = false
    })
    .catch(() => {
      list.value = patients
      total.value = patients.length
    })
}

function handleAdd() {
  isAdd.value = true
  dialogVisible.value = true
}

function handlePut(row: PatientModel) {
  console.log('修改患者信息', row)
  isAdd.value = false
  dialogVisible.value = true
  dialogData.value = { ...row }
}

function handleDel(_ids: number[] | PatientModel) {
  const delIds = Array.isArray(_ids) ? _ids : [_ids.id!]
  const delNames = list.value.filter(i => delIds.includes(i.id!)).map(i => i.name!)
  confirmWarning(`是否确认删除患者：${delNames.join(', ')}？`).then(() => {
    delMsgLoading(DelPatient(delIds), '正在删除 …').then(() => {
      showMessageSuccess('删除成功')
      ids.value = []
      names.value = []
      getList()
    }).finally(() => {
      loading.value = false
    })
  })
}

function retQuery() {
  queryParams.value = {
    page: { current: 1, size: 10 },
    name: '',
  }
  resetForm(queryRef.value)
  getList()
}

function handleSelectionChange(selection: PatientModel[]) {
  ids.value = selection.map(item => item.id!)
  names.value = selection.map(item => item.name!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
onMounted(() => {
  getList()
})
</script>

<template>
  <div>
    <el-form ref="queryRef" :inline="true" :model="queryParams" @submit.prevent>
      <el-form-item>
        <el-input
          v-model="queryParams.name"
          placeholder="请输入患者名称"
          clearable
          style="width: 240px"
          @keyup.enter="getList"
        />
      </el-form-item>

      <el-form-item>
        <el-input
          v-model="queryParams.idCard"
          placeholder="请输入身份证号"
          clearable
          maxlength="18"
          style="width: 240px"
          @keyup.enter="getList"
        />
      </el-form-item>

      <el-form-item>
        <el-select v-model="queryParams.education" placeholder="请选择学历" clearable style="width: 160px" @change="getList">
          <el-option v-for="it in sys_education" :key="it.value" :label="it.label" :value="it.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-input
          v-model="queryParams.address"
          placeholder="请输入家庭地址"
          clearable
          maxlength="18"
          style="width: 240px"
          @keyup.enter="getList"
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

    <el-table v-loading="loading" :data="list" :max-height="tableHeight" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" prop="id" label="患者编号" show-overflow-tooltip width="80" />

      <el-table-column prop="name" label="患者姓名" align="center" show-overflow-tooltip />

      <el-table-column prop="gender" label="性别" align="center" width="80">
        <template #default="{ row }">
          <dict-tag :options="sysUserSexCss" :value="row.sex" />
        </template>
      </el-table-column>

      <el-table-column prop="phone" label="手机号" align="center" show-overflow-tooltip width="120" />

      <el-table-column prop="idCard" label="身份证号" align="center" show-overflow-tooltip width="180" />

      <el-table-column prop="patientNumber" label="病历号" align="center" show-overflow-tooltip width="180" :formatter="$formatterTableEmpty" />

      <el-table-column prop="birthday" label="生日" align="center" show-overflow-tooltip width="120" />

      <el-table-column prop="education" label="学历" align="center" width="80">
        <template #default="{ row }">
          <dict-tag :options="sys_education" :value="row.education" />
        </template>
      </el-table-column>

      <el-table-column prop="address" label="家庭住址" align="left" show-overflow-tooltip min-width="180" />

      <el-table-column label="创建人" align="center" prop="createdUserName" width="120" />

      <el-table-column label="创建时间" align="center" prop="createdTime" width="180" />

      <el-table-column align="center" label="操作" width="160" fixed="right">
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
      v-model:page="queryParams.page.current"
      v-model:limit="queryParams.page.size"
      :total="total"
      @pagination="getList"
    />

    <PatientDialog
      v-model="dialogVisible"
      :is-add="isAdd"
      :data="dialogData"
      :sys-user-sex="sys_user_sex"
      :sys-education="sys_education"
      @success="getList"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
