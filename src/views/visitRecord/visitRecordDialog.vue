<!-- visitRecordDialog.vue -->
<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus'

const props = defineProps({
  isAdd: { type: Boolean, required: true },
  data: { type: Object },
})
const visible = defineModel({ type: Boolean, required: false })

interface VisitRecordModel {
  id?: number
  patientId?: number
  patientName?: string
  visitDate?: string
  department?: string
  diagnosis?: string
  treatment?: string
  doctor?: string
  cost?: number
  notes?: string
}

const submitLoading = ref(false)
const form = ref<VisitRecordModel>({
  patientId: undefined,
  patientName: '',
  visitDate: '',
  department: '',
  diagnosis: '',
  treatment: '',
  doctor: '',
  cost: undefined,
  notes: '',
})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const rules: FormRules = {
  patientName: [{ required: true, trigger: 'blur', message: '请输入患者姓名' }],
  visitDate: [{ required: true, trigger: 'change', message: '请选择就诊时间' }],
  department: [{ required: true, trigger: 'blur', message: '请输入科室' }],
  diagnosis: [{ required: true, trigger: 'blur', message: '请输入诊断信息' }],
  doctor: [{ required: true, trigger: 'blur', message: '请输入医生姓名' }],
  cost: [
    { required: true, trigger: 'blur', message: '请输入费用' },
    { type: 'number', trigger: 'blur', message: '费用必须是数字' },
  ],
}

function cancel() {
  visible.value = false
  reset()
}

function reset() {
  form.value = {
    patientId: undefined,
    patientName: '',
    visitDate: '',
    department: '',
    diagnosis: '',
    treatment: '',
    doctor: '',
    cost: undefined,
    notes: '',
  }
  resetForm(formRef.value)
  submitLoading.value = false
}

function submit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (submitLoading.value)
        return
      submitLoading.value = true
      // TODO: 提交接口
      setTimeout(() => {
        visible.value = false
        reset()
      }, 600)
    }
  })
}

watch(
  () => props.data,
  (newVal) => {
    if (newVal) {
      form.value = { ...(newVal as VisitRecordModel) }
      console.log('visit form.value', form.value)
    }
  },
  { immediate: true },
)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isAdd ? '新增诊疗记录' : '修改诊疗记录'"
    width="900"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <el-form ref="formRef" :inline="true" :rules="rules" :model="form" class="large-form" label-width="100">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="患者姓名" prop="patientName" style="width: 100%">
            <el-input v-model="form.patientName" clearable placeholder="请输入患者姓名" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="就诊时间" prop="visitDate" style="width: 100%">
            <el-date-picker
              v-model="form.visitDate"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              size="large"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="科室" prop="department" style="width: 100%">
            <el-input v-model="form.department" clearable placeholder="请输入科室" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="医生" prop="doctor" style="width: 100%">
            <el-input v-model="form.doctor" clearable placeholder="请输入医生姓名" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="诊断" prop="diagnosis" style="width: 100%">
            <el-input v-model="form.diagnosis" type="textarea" :rows="2" placeholder="请输入诊断信息" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="治疗方案" prop="treatment" style="width: 100%">
            <el-input v-model="form.treatment" type="textarea" :rows="2" placeholder="请输入治疗方案" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="费用(¥)" prop="cost" style="width: 100%">
            <el-input v-model.number="form.cost" type="number" placeholder="请输入费用" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="备注" prop="notes" style="width: 100%">
            <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="可填写复诊建议/用药说明等" size="large" />
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
