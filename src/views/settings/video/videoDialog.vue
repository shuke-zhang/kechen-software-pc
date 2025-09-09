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
  deviceName: '', // 视频名称
  category: '', // 视频分类
  description: '', // 视频简介
  videoUrl: '', // 视频链接地址
  cover: '', // 封面地址
})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const rules = {
  deviceName: [{ required: true, trigger: 'blur', message: '请输入视频名称' }],
  category: [{ required: true, trigger: 'blur', message: '请输入视频分类' }],
  videoUrl: [{ required: true, trigger: 'blur', message: '请输入视频链接地址' }],
  description: [{ required: true, trigger: 'blur', message: '请输入视频简介' }],
}

function cancel() {
  visible.value = false
  reset()
}

function reset() {
  form.value = {
    deviceName: '',
    category: '',
    description: '',
    videoUrl: '',
    cover: '',
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
  <el-dialog
    v-model="visible"
    :title="isAdd ? '新增视频' : '修改视频'"
    width="800"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <el-form
      ref="formRef"
      :inline="false"
      :rules="rules"
      :model="form"
      class="large-form"
      label-width="100"
    >
      <el-row :gutter="20">
        <!-- 视频名称 -->
        <el-col :span="12">
          <el-form-item label="视频名称" prop="deviceName" style="width: 100%">
            <el-input v-model="form.deviceName" clearable placeholder="请输入视频名称" size="large" />
          </el-form-item>
        </el-col>

        <!-- 视频分类 -->
        <el-col :span="12">
          <el-form-item label="视频分类" prop="category" style="width: 100%">
            <el-input v-model="form.category" clearable placeholder="请输入视频分类" size="large" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 视频链接地址 -->
        <el-col :span="24">
          <el-form-item label="视频地址" prop="videoUrl" style="width: 100%">
            <el-input v-model="form.videoUrl" clearable placeholder="请输入视频链接地址" size="large" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 视频简介 -->
        <el-col :span="24">
          <el-form-item label="视频简介" prop="description" style="width: 100%">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              clearable
              placeholder="请输入视频简介"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 上传封面 -->
        <el-col :span="24">
          <el-form-item label="视频封面" prop="cover" style="width: 100%">
            <UploadFile
              v-model="form.cover"
              :limit="1"
              file-types="image"
              :show-file-list="false"
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
        <el-button type="primary" :loading="submitLoading" @click="submit">
          提 交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.cover-uploader {
  width: 160px;
  height: 90px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>
