<!-- videoCategoryDialog.vue -->
<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus'

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

const props = defineProps({
  isAdd: { type: Boolean, required: true },
  data: { type: Object, default: () => ({}) },
  allCategories: { type: Array as () => VideoCategoryModel[], default: () => [] },
})
const visible = defineModel({ type: Boolean, required: false })

const submitLoading = ref(false)
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const form = ref<VideoCategoryModel>({
  name: '',
  code: '',
  parentId: null,
  status: 'enabled',
  sort: 50,
  color: '',
  icon: '',
  description: '',
})

const rules: FormRules = {
  name: [{ required: true, trigger: 'blur', message: '请输入类别名称' }],
  code: [{ required: true, trigger: 'blur', message: '请输入类别编码' }],
  status: [{ required: true, trigger: 'change', message: '请选择状态' }],
  sort: [{ type: 'number', trigger: 'blur', message: '排序必须是数字' }],
}

function cancel(): void {
  visible.value = false
  reset()
}

function reset(): void {
  form.value = { name: '', code: '', parentId: null, status: 'enabled', sort: 50, color: '', icon: '', description: '' }
  resetForm(formRef.value)
  submitLoading.value = false
}

function submit(): void {
  formRef.value?.validate((valid) => {
    if (!valid)
      return
    if (submitLoading.value)
      return
    submitLoading.value = true
    // TODO: 提交接口；这里仅做演示
    setTimeout(() => {
      visible.value = false
      reset()
    }, 500)
  })
}

const parentCandidates = computed<VideoCategoryModel[]>(() => {
  const meId = (props.data as VideoCategoryModel)?.id
  return props.allCategories.filter(c => c.id !== meId)
})

watch(
  () => props.data,
  (newVal) => {
    if (!newVal)
      return
    const v = newVal as VideoCategoryModel
    form.value = {
      id: v.id,
      name: v.name ?? '',
      code: v.code ?? '',
      parentId: v.parentId ?? null,
      status: v.status ?? 'enabled',
      sort: v.sort ?? 50,
      color: v.color ?? '',
      icon: v.icon ?? '',
      description: v.description ?? '',
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      videoCount: v.videoCount,
    }
  },
  { immediate: true },
)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isAdd ? '新增视频类别' : '修改视频类别'"
    width="820"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <el-form ref="formRef" :inline="true" :model="form" :rules="rules" class="large-form" label-width="100">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="类别名称" prop="name" style="width: 100%">
            <el-input v-model="form.name" clearable placeholder="例如：冥想 / 培训 / 宣传" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类别编码" prop="code" style="width: 100%">
            <el-input v-model="form.code" clearable placeholder="英文或拼音，唯一，例如 meditation" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="状态" prop="status" style="width: 100%">
            <el-select v-model="form.status" placeholder="请选择" size="large" style="width: 100%">
              <el-option label="启用" value="enabled" />
              <el-option label="停用" value="disabled" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="排序" prop="sort" style="width: 100%">
            <el-input v-model.number="form.sort" type="number" placeholder="数值越小越靠前" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="主题色" prop="color" style="width: 100%">
            <el-color-picker v-model="form.color" show-alpha />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="图标" prop="icon" style="width: 100%">
            <el-input v-model="form.icon" clearable placeholder="例如：icon-mind / icon-train" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="说明" prop="description" style="width: 100%">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="类别用途、展示场景等" size="large" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">
          取 消
        </el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit">
          提 交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
</style>
