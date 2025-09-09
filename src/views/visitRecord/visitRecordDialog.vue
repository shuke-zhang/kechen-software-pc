<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus'

const props = defineProps({
  isAdd: { type: Boolean, required: true },
  data: { type: Object, required: false },
})

const emit = defineEmits(['ok'])

const visible = defineModel({ type: Boolean, required: false })

interface VisitRecordModel {
  id?: number
  patientName?: string
  videoPlanName?: string
  itemName?: string
  deviceSn?: string
  department?: string
  status?: 'draft' | 'active' | 'paused' | 'archived'
  createdAt?: string
}

const submitLoading = ref(false)
const form = ref<VisitRecordModel>({
  patientName: '',
  videoPlanName: '',
  itemName: '',
  deviceSn: '',
  department: '',
  status: 'draft',
  createdAt: '',
})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '启用', value: 'active' },
  { label: '暂停', value: 'paused' },
  { label: '已归档', value: 'archived' },
]

const rules: FormRules = {
  patientName: [{ required: true, trigger: 'blur', message: '请输入患者姓名' }],
  videoPlanName: [{ required: true, trigger: 'blur', message: '请输入视频方案名称' }],
  itemName: [{ required: true, trigger: 'blur', message: '请输入诊疗项名称' }],
  deviceSn: [{ required: true, trigger: 'blur', message: '请输入设备编号' }],
  department: [{ required: true, trigger: 'blur', message: '请输入治疗科室' }],
  status: [{ required: true, trigger: 'change', message: '请选择状态' }],
  createdAt: [{ required: true, trigger: 'change', message: '请选择创建时间' }],
}

function cancel() {
  visible.value = false
  reset()
}

function reset() {
  form.value = {
    patientName: '',
    videoPlanName: '',
    itemName: '',
    deviceSn: '',
    department: '',
    status: 'draft',
    createdAt: '',
  }
  resetForm(formRef.value)
  submitLoading.value = false
}

function submit() {
  formRef.value?.validate((valid) => {
    if (!valid)
      return
    if (submitLoading.value)
      return
    submitLoading.value = true
    setTimeout(() => {
      visible.value = false
      emit('ok')
      reset()
    }, 600)
  })
}

watch(
  () => props.data,
  (newVal) => {
    if (!newVal)
      return
    form.value = { ...(newVal as VisitRecordModel) }
  },
  { immediate: true },
)
</script>

<template>
  <el-dialog v-model="visible" :title="isAdd ? '新增诊疗记录' : '修改诊疗记录'" width="860" :close-on-click-modal="false" @close="cancel">
    <el-form ref="formRef" :inline="true" :rules="rules" :model="form" class="large-form" label-width="120">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="患者姓名" prop="patientName" style="width: 100%">
            <el-input v-model="form.patientName" clearable placeholder="请输入患者姓名" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="视频方案名称" prop="videoPlanName" style="width: 100%">
            <el-input v-model="form.videoPlanName" clearable placeholder="请输入视频方案名称" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="诊疗项名称" prop="itemName" style="width: 100%">
            <el-input v-model="form.itemName" clearable placeholder="请输入诊疗项名称" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备编号" prop="deviceSn" style="width: 100%">
            <el-input v-model="form.deviceSn" clearable placeholder="例如 AX9-001" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="治疗科室" prop="department" style="width: 100%">
            <el-input v-model="form.department" clearable placeholder="请输入治疗科室" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status" style="width: 100%">
            <el-select v-model="form.status" placeholder="请选择" size="large" style="width: 100%">
              <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="创建时间" prop="createdAt" style="width: 100%">
            <el-date-picker v-model="form.createdAt" type="datetime" placeholder="选择创建时间" value-format="YYYY-MM-DD HH:mm:ss" size="large" style="width: 100%" />
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
