<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus'
import type { DictDataModel } from '@/model/dict'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import { addDictData, getDictDataList, PutDictData } from '@/api/dict'

const total = ref(0)
const loading = ref(false)
const queryRef = useTemplateRef('queryEl')
const route = useRoute()
const visible = ref(false)
const isAdd = ref(false)
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const submitLoading = ref(false)
const queryParams = ref<DictDataModel>({

})
const form = ref<DictDataModel>({
  dictType: route.params.dictType as string,
  dictSort: 0,
  status: '0',
})
const currentDictType = computed(() => route.params.dictType as string)

const rules: FormRules = {
  dictType: [{ required: true, trigger: 'blur', message: '请输入字典类型' }],
  dictLabel: [{ required: true, trigger: 'change', message: '请输入数据标签' }],
  dictValue: [{ required: true, trigger: 'change', message: '请输入数据键值' }],
}
/** 静态日志数据（示例） */
const list = ref<DictDataModel[]>([])

function getList(): void {
  if (loading.value)
    return
  loading.value = true
  const data = {
    dictType: currentDictType.value,
  }

  getDictDataList(data).then((res) => {
    list.value = res.data.records
    total.value = res.data.total
  }).finally(() => {
    loading.value = false
  })
}

function handleAddDict() {
  visible.value = true
  isAdd.value = true
}

function _handlePut(row: DictDataModel) {
  isAdd.value = false
  form.value = { ...row }
  visible.value = true
}

function handleDelete(row: DictDataModel) {
  console.log('删除', row)
}

function retQuery(): void {
  queryParams.value = { }
  resetForm(queryRef.value)
  getList()
}

function cancel() {
  visible.value = false
}
function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (submitLoading.value)
        return
      submitLoading.value = true
      const api = isAdd.value ? addDictData : PutDictData
      const data = {
        dictType: form.value.dictType,
        dictLabel: form.value.dictLabel,
        dictValue: form.value.dictValue,
        dictSort: form.value.dictSort,
        status: form.value.status,
        remark: form.value.remark,
      }
      api(data).then(() => {
        visible.value = false
        reset()
        getList()
      }).finally(() => {
        submitLoading.value = false
      })
    }
  })
}

function reset() {
  form.value = {
  }
  resetForm(formRef.value)
  submitLoading.value = false
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="container">
    <!-- 查询 -->
    <el-form ref="queryEl" :inline="true" :model="queryParams" class="mb-3">
      <el-form-item>
        <el-input
          v-model="queryParams.dictName"
          placeholder="字典名称"
          clearable
          size="large"
          style="width: 200px"
          @keyup.enter="getList"
        />
      </el-form-item>

      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="状态" clearable size="large" style="width: 140px" @change="getList">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="getList">
          查询
        </el-button>
        <el-button type="primary" plain :icon="Refresh" @click="retQuery">
          重置
        </el-button>
        <el-button type="success" :icon="CirclePlus" @click="handleAddDict">
          新增
        </el-button>
        <el-button type="danger" :icon="CircleClose">
          删除
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="list"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />

      <el-table-column align="center" prop="dictCode" label="字典编码" width="200" />

      <el-table-column align="center" prop="dictLabel" label="字典类型" width="200" />

      <el-table-column align="center" prop="dictValue" label="字典键值" width="200" />

      <el-table-column align="center" prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="备注" align="center" prop="createTime" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.remark || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="{ row }">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="primary">
            修改
          </el-button>
          <el-button type="danger" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog
    v-model="visible"
    :title="isAdd ? '新增字典数据' : '修改字典数据'"
    width="500"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <el-form ref="formRef" :inline="true" :model="form" :rules="rules" class="large-form" label-width="100">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="字典类型" prop="dictType" style="width: 100%">
            <el-input v-model="form.dictType" disabled placeholder="请输入字典类型" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="数据标签" prop="dictLabel" style="width: 100%">
            <el-input v-model="form.dictLabel" placeholder="请输入数据标签" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="数据键值" prop="dictValue" style="width: 100%">
            <el-input v-model="form.dictValue" placeholder="请输入数据键值" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="显示排序" prop="dictSort" style="width: 100%">
            <el-input-number v-model="form.dictSort" controls-position="right" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="状态" prop="status" style="width: 100%">
            <el-radio-group v-model="form.status">
              <el-radio value="0" size="large">
                正常
              </el-radio>
              <el-radio value="1" size="large">
                停用
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="备注" prop="remark" style="width: 100%">
            <el-input
              v-model="form.remark"
              style="width: 240px"
              type="textarea"
              placeholder="请输入内容"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">
          取 消
        </el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          提 交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
