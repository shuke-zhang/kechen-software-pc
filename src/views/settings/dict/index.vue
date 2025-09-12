<!-- LogPage.vue -->
<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus'
import type { DictModel } from '@/model/dict'
import { CircleClose, CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import { addDict, getDictList, PutDict } from '@/api/dict'

const total = ref(0)
const loading = ref(false)
const queryRef = useTemplateRef('queryEl')
const router = useRouter()
const visible = ref(false)
const isAdd = ref(false)
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const submitLoading = ref(false)
const queryParams = ref<ListPageParamsWrapper<DictModel>>({
  page: {
    current: 1,
    size: 10,
  },
})
const form = ref<DictModel>({
  status: '1',
})
const rules: FormRules = {
  dictName: [{ required: true, trigger: 'change', message: '请输入字典名称' }],
  dictType: [{ required: true, trigger: 'blur', message: '请输入字典类型' }],
}
/** 静态日志数据（示例） */
const list = ref<DictModel[]>([])
/** 自定义跳转详情 */
function linkTo(row: DictModel) {
  router.push({
    path: '/system/dict/data',
    query: {
      dictId: row.dictId,
    },
  })
}

function getList(): void {
  if (loading.value)
    return
  loading.value = true
  getDictList(queryParams.value).then((res) => {
    console.log('字典列表', res)
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

function handlePut(row: DictModel) {
  isAdd.value = false
  form.value = { ...row }
  visible.value = true
}

function handleDelete(row: DictModel) {
  console.log('删除', row)
}

function retQuery(): void {
  queryParams.value = { page: {
    current: 1,
    size: 10,
  } }
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
      const api = isAdd.value ? addDict : PutDict
      const data = {
        dictId: form.value.dictId,
        dictName: form.value.dictName,
        dictType: form.value.dictType,
        remark: form.value.remark,
        status: form.value.status,
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
    status: '1',
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
        <el-select v-model="queryParams.status" placeholder="状态码" clearable size="large" style="width: 140px">
          <el-option label="200 成功" :value="200" />
          <el-option label="403 禁止" :value="403" />
          <el-option label="500 服务器错误" :value="500" />
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
      <el-table-column prop="dictId" label="字典编号" align="center" width="90" />

      <el-table-column prop="dictName" label="字典名称" align="center" width="240" />

      <el-table-column align="center" prop="dictType" label="字典类型" min-width="180">
        <template #default="scope">
          <el-button link type="primary" @click="linkTo(scope.row)">
            {{ scope.row.dictType }}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" min-width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="remark" label="备注" align="center" width="180" show-overflow-tooltip />

      <el-table-column label="创建时间" align="center" prop="createdTime" width="220">
        <template #default="{ row }">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" fixed="right" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button type="primary" @click="handlePut(row)">
            修改
          </el-button>
          <el-button type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      v-model:page="queryParams.page.current"
      v-model:limit="queryParams.page.size"
      :total="total"
      @pagination="getList"
    />
  </div>

  <el-dialog
    v-model="visible"
    :title="isAdd ? '新增字典' : '修改字典'"
    width="500"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <el-form ref="formRef" :inline="true" :model="form" :rules="rules" class="large-form" label-width="100">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="字典名称" prop="dictName" style="width: 100%">
            <el-input v-model="form.dictName" placeholder="请输入字典名称" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="字典类型" prop="dictType" style="width: 100%">
            <el-input v-model="form.dictType" placeholder="请输入字典类型" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="状态" prop="status" style="width: 100%">
            <el-radio-group v-model="form.status">
              <el-radio value="1" size="large">
                正常
              </el-radio>
              <el-radio value="2" size="large">
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
