<script setup lang="ts">
import type { ElForm } from 'element-plus'
import type { UploadRow } from '@/model/upload'
import type { VideoModel } from '@/model/video'
import type { VideoCategoryModel } from '@/model/videoCategory'

const props = defineProps({
  isAdd: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
  },
  videoTree: {
    type: Array as PropType<VideoCategoryModel[]>,
  },
})
const visible = defineModel({ type: Boolean, required: false })
const submitLoading = ref(false)
const form = ref<VideoModel>({
  description: '', // 视频简介`
  videoUrl: '', // 视频链接地址
})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const uploadFile = ref<UploadRow | null>(null)
watch(uploadFile, (newVal) => {
  console.log(newVal, 'uploadFile')
}, { deep: true })
const rules = {
  deviceName: [{ required: true, trigger: 'blur', message: '请输入视频名称' }],
  category: [{ required: true, trigger: 'blur', message: '请输入视频分类' }],
  videoUrl: [{ required: true, trigger: 'blur', message: '请输入视频链接地址' }],
  description: [{ required: true, trigger: 'blur', message: '请输入视频简介' }],
  cover: [{ required: true, trigger: 'blur', message: '请上传视频封面' }],
}
function handleUploadSuccess(file: UploadRow) {
  console.log(file, 'file-success')

  if (file.status !== 'success')
    return
  form.value.videoUrl = file.response?.data.accessPath
}

function copyVideoUrl() {
  const url = form.value.videoUrl
  if (!url) {
    ElMessage.warning('视频地址为空，无法复制')
    return
  }
  copyText(url)
}

function cancel() {
  visible.value = false
  reset()
}

function reset() {
  form.value = {}
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
            <el-input v-model="form.videoName" clearable placeholder="请输入视频名称" size="large" />
          </el-form-item>
        </el-col>

        <!-- 视频分类 -->
        <el-col :span="12">
          <el-form-item label="视频分类" prop="planType" style="width: 100%">
            <el-tree-select
              v-model="form.planType"
              :data="videoTree"
              :render-after-expand="false"
              :props="{
                label: 'name',
                value: 'id',
                children: 'children',
              }"
              style="width: 240px"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 视频链接地址 -->
        <el-col :span="24">
          <el-form-item label="视频地址" prop="videoUrl" style="width: 100%">
            <el-input v-model="form.videoUrl" clearable placeholder="请输入视频链接地址或上传视频自动获取地址" size="large" />
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
        <!-- 上传封面 -->
        <el-col :span="8">
          <el-form-item label="视频封面" prop="cover" style="width: 100%">
            <UploadFile
              v-model="form.cover"
              :limit="1"
              file-types="image"
              :show-file-list="false"
            />
          </el-form-item>
        </el-col>

        <!-- 上传视频· -->
        <el-col :span="16">
          <el-form-item label="视频文件" prop="video" style="width: 100%">
            <div class="flex  items-center w-full">
              <div class="size-[140px]">
                <DragUploadFile v-model:files="uploadFile" :limit="1" @success="handleUploadSuccess" />
              </div>
              <div class="ml-[10px] flex-1 ">
                <div class="flex items-center justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <!-- 前面省略，后面展示 -->
                    <div
                      v-trunc="{ lines: 1, titleWhenTruncated: true, observeMutations: true }"
                      class="w-[180px] overflow-hidden text-ellipsis whitespace-nowrap [direction:rtl] [text-align:left] "
                    >
                      {{ uploadFile?.name || '--' }}
                    </div>
                  </div>

                  <span class="shrink-0">
                    {{ uploadFile?.size || 0 }}
                  </span>
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="14"
                  :percentage="uploadFile?.progress"
                  status="success"
                />
                <div class="mt-2 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />
                    <span class="truncate text-xs">上传成功后自动填充视频地址
                    </span>
                  </div>
                  <el-button type="primary" size="small" class="ml-[5px]" plain @click="copyVideoUrl">
                    复制
                  </el-button>
                </div>
              </div>
            </div>
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
