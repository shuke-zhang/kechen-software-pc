<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus'

const form = ref<{
  name?: string
  language?: string
  description?: string
  iconUrl?: string
  tags?: string[]
}>({})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const uploadFiles = ref([])
const rules: FormRules = {
  name: [
    { required: true, message: '请输入知识库名称', trigger: 'blur' },
    { min: 2, max: 40, message: '长度 2~40', trigger: 'blur' },
  ],
  description: [{ max: 200, message: '最多 200 字', trigger: 'blur' }],
}
const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: '英文', value: 'en-US' },
  { label: '日文', value: 'ja-JP' },
  { label: '韩文', value: 'ko-KR' },
]
</script>

<template>
  <div class="p-[32px]">
    <el-row :gutter="20">
      <el-col :span="6">
        <!-- 左 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
          class="max-w-[980px] p-5 bg-white rounded-xl border border-[var(--el-border-color)] overflow-hidden"
        >
          <!-- 基本信息 -->
          <el-divider content-position="left">
            基本信息
          </el-divider>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入知识库名称" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="默认语言">
                <el-select v-model="form.language" placeholder="选择语言" class="w-full">
                  <el-option v-for="opt in languageOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="标签">
                <el-select
                  v-model="form.tags"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="输入后回车创建标签"
                  class="w-full"
                >
                  <el-option v-for="t in ['产品', '研发', '规范', 'FAQ', '内部']" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="图标/封面">
                <UploadFile file-types="image/*" :limit="1" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="简介" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="3"
                  placeholder="简单介绍该知识库的用途（可选）"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-col>
      <!-- <el-divider direction="vertical" /> -->
      <el-col :span="18">
        <div class="flex flex-col ">
          <div class="h-[200px]">
            <DragUploadFile v-model:files="uploadFiles" class="h-full" />
          </div>
          <el-divider />
          <div>
            <el-table :data="uploadFiles" style="width: 100%">
              <el-table-column align="center" prop="name" label="文件名" show-overflow-tooltip />
              <el-table-column align="center" prop="type" label="文件类型" width="100" show-overflow-tooltip />
              <el-table-column align="center" prop="size" label="文件大小" width="100" show-overflow-tooltip />
              <el-table-column align="center" label="上传进度" width="100">
                <template #default="{ row }">
                  <el-progress v-if="row.progress === '100'" :percentage="row.progress" :status="row.status === 'error' ? 'exception' : undefined" />
                  <div v-else>
                    上传成功
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="createdAt" label="上传时间" show-overflow-tooltip width="180" />

              <el-table-column align="center" prop="url" label="链接" show-overflow-tooltip>
                <template #default="{ row }">
                  <a v-if="row.url" :href="row.url" target="_blank" class="text-blue-600 hover:text-blue-800 underline">{{ row.url }}</a>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">

</style>
