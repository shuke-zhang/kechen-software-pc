<script setup lang="ts">
import type { ElForm } from 'element-plus'

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
const form = ref({
  deviceName: '',
})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const rules = {
  deviceName: [{ required: true, trigger: 'blur', message: '请输入设备名称' }],
}

function cancel() {
  visible.value = false
  reset()
}

function reset() {
  form.value = {
    deviceName: '',
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
  <el-dialog v-model="visible" :title="isAdd ? '新增视频' : '修改视频'" width="800" :close-on-click-modal="false" @close="cancel">
    <el-form ref="formRef" :inline="true" :rules="rules" :model="form" class="large-form" label-width="100">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="视频名称" prop="deviceName" style="width: 100%">
            <el-input v-model="form.deviceName" clearable placeholder="请输入视频名称" size="large" style="width: 100%" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="视频分类" prop="deviceName" style="width: 100%">
            <el-input v-model="form.deviceName" clearable placeholder="请输入视频名称" size="large" style="width: 100%" />
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
