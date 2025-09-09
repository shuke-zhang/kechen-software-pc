<script setup lang="ts">
import type { ElForm } from 'element-plus'

const props = defineProps({
  isAdd: { type: Boolean, required: true },
  data: { type: Object, required: false },
})

const emit = defineEmits(['ok'])

const visible = defineModel({ type: Boolean, required: false })

interface ReportRow {
  id?: number
  patientName?: string
  recordNo?: string
  picoSn?: string
  itemName?: string
  createdAt?: string
  reportUrl?: string
}

const submitLoading = ref(false)
const form = ref<ReportRow>({
  patientName: '',
  recordNo: '',
  picoSn: '',
  itemName: '',
  createdAt: '',
  reportUrl: '',
})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const rules = {
  patientName: [{ required: true, trigger: 'blur', message: '请输入患者名称' }],
  recordNo: [{ required: true, trigger: 'blur', message: '请输入诊疗编号' }],
  picoSn: [{ required: true, trigger: 'blur', message: '请输入 Pico 编号' }],
  itemName: [{ required: true, trigger: 'blur', message: '请输入诊疗项名称' }],
  createdAt: [{ required: true, trigger: 'change', message: '请选择创建时间' }],
  reportUrl: [{ required: true, trigger: 'blur', message: '请输入报告链接或内部路由' }],
}

function cancel(): void {
  visible.value = false
  reset()
}

function reset(): void {
  form.value = {
    patientName: '',
    recordNo: '',
    picoSn: '',
    itemName: '',
    createdAt: '',
    reportUrl: '',
  }
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
    form.value = { ...(newVal as ReportRow) }
  },
  { immediate: true },
)
</script>

<template>
  <el-dialog v-model="visible" :title="isAdd ? '新增报告' : '修改报告'" width="820" :close-on-click-modal="false" @close="cancel">
    <el-form ref="formRef" :inline="true" :rules="rules" :model="form" class="large-form" label-width="120">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="患者名称" prop="patientName" style="width: 100%">
            <el-input v-model="form.patientName" clearable placeholder="请输入患者名称" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="诊疗编号" prop="recordNo" style="width: 100%">
            <el-input v-model="form.recordNo" clearable placeholder="例如 VR-2025-0001" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Pico 编号" prop="picoSn" style="width: 100%">
            <el-input v-model="form.picoSn" clearable placeholder="例如 PICO-AX9-001" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="诊疗项名称" prop="itemName" style="width: 100%">
            <el-input v-model="form.itemName" clearable placeholder="请输入诊疗项名称" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="创建时间" prop="createdAt" style="width: 100%">
            <el-date-picker v-model="form.createdAt" type="datetime" placeholder="选择创建时间" value-format="YYYY-MM-DD HH:mm:ss" size="large" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="报告链接" prop="reportUrl" style="width: 100%">
            <el-input v-model="form.reportUrl" clearable placeholder="外链 http(s):// 或内部路由 /report/:id" size="large" />
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
