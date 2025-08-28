<script setup lang="ts">
import type { ElForm } from 'element-plus'
import type { PatientModel } from '@/model/patient'

const props = defineProps({
  isAdd: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
  },
})
const visible = defineModel({ type: Boolean, required: false })
const submitLoading = ref(false)
const form = ref<PatientModel>({
  name: '',
  gender: 1,
})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const rules = {
  name: [{ required: true, trigger: 'blur', message: '请输入患者名称' }],
}

function cancel() {
  visible.value = false
  reset()
}

function reset() {
  form.value = {
    name: '',
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
      setTimeout(() => {
        visible.value = false
        reset()
      }, 1000)
    }
  })
}
watch(() => props.data, (newVal) => {
  if (newVal) {
    form.value = { ...newVal } as any
    console.log(form.value, 'form.value')
  }
})
</script>

<template>
  <el-dialog v-model="visible" :title="isAdd ? '新增患者' : '修改患者'" width="800" :close-on-click-modal="false" @close="cancel">
    <el-form ref="formRef" :inline="true" :rules="rules" :model="form" class="large-form" label-width="100">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="患者名称" prop="name" style="width: 100%">
            <el-input v-model="form.name" clearable placeholder="请输入患者名称" size="large" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender" style="width: 100%">
            <el-select v-model="form.gender" placeholder="请选择性别" size="large" style="width: 100%">
              <el-option label="男" :value="1" />
              <el-option label="女" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">
          取 消
        </el-button>
        <el-button type="primary" @click="submit">
          提 交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
</style>
