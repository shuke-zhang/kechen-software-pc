<script setup lang="ts">
import type { ElForm } from 'element-plus'
import type { ReportModel } from '@/model/report'

const props = defineProps({
  isAdd: { type: Boolean, required: true },
  data: { type: Object },
})
const visible = defineModel({ type: Boolean, required: false })

const submitLoading = ref(false)
const form = ref<ReportModel>({
  patientId: undefined,
  patientName: '',
  reportType: '',
  reportDate: '',
  doctor: '',
  status: '草稿',
  findings: '',
  impression: '',
  attachments: [],
})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const rules = {
  patientName: [{ required: true, trigger: 'blur', message: '请输入患者姓名' }],
  reportType: [{ required: true, trigger: 'change', message: '请选择报告类型' }],
  reportDate: [{ required: true, trigger: 'change', message: '请选择报告时间' }],
  doctor: [{ required: true, trigger: 'blur', message: '请输入医生姓名' }],
}

function cancel() {
  visible.value = false
  reset()
}

function reset() {
  form.value = {
    patientId: undefined,
    patientName: '',
    reportType: '',
    reportDate: '',
    doctor: '',
    status: '草稿',
    findings: '',
    impression: '',
    attachments: [],
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
      form.value = { ...(newVal as ReportModel) }
      console.log('report form.value', form.value)
    }
  },
  { immediate: true },
)
</script>

<template>
  <el-dialog v-model="visible" :title="isAdd ? '新增报告' : '修改报告'" width="900" :close-on-click-modal="false" @close="cancel">
    <el-form ref="formRef" :inline="true" :rules="rules" :model="form" class="large-form" label-width="100">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="患者姓名" prop="patientName" style="width: 100%">
            <el-input v-model="form.patientName" clearable placeholder="请输入患者姓名" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报告类型" prop="reportType" style="width: 100%">
            <el-select v-model="form.reportType" placeholder="请选择报告类型" size="large" style="width: 100%">
              <el-option label="检验报告" value="检验报告" />
              <el-option label="影像报告" value="影像报告" />
              <el-option label="病理报告" value="病理报告" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="报告时间" prop="reportDate" style="width: 100%">
            <el-date-picker v-model="form.reportDate" type="datetime" placeholder="选择日期时间" value-format="YYYY-MM-DD HH:mm:ss" size="large" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="医生" prop="doctor" style="width: 100%">
            <el-input v-model="form.doctor" clearable placeholder="请输入医生姓名" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="所见" prop="findings" style="width: 100%">
            <el-input v-model="form.findings" type="textarea" :rows="3" placeholder="请输入检查所见" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="印象/结论" prop="impression" style="width: 100%">
            <el-input v-model="form.impression" type="textarea" :rows="3" placeholder="请输入印象/结论" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="状态" prop="status" style="width: 100%">
            <el-select v-model="form.status" size="large" style="width: 100%">
              <el-option label="草稿" value="草稿" />
              <el-option label="已出具" value="已出具" />
              <el-option label="作废" value="作废" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="附件URL" prop="attachments" style="width: 100%">
            <el-input v-model="(form.attachments as any)" type="textarea" :rows="2" placeholder="可粘贴多个URL，以逗号分隔（实际项目可替换为上传组件）" size="large" />
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
