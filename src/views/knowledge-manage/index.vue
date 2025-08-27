<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue'

const queryParams = ref<ListQueryParams<{
  knowledgeName: string
}>>({
  pageNum: 1,
  pageSize: 10,
  knowledgeName: '',
})
const single = ref(true)
const multiple = ref(true)
const queryRef = useTemplateRef('queryEl')
const knowledgeList = ref([])
const loading = ref(false)
function getList() {
  loading.value = true
  if (!loading.value) {
    return
  }
  console.log('Fetching list with params:', queryParams.value)
}
const ids = ref<Array<string>>([])

/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.classId!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function retQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    knowledgeName: '',
  }
  resetForm(queryRef.value)
  getList()
}
</script>

<template>
  <div class="flex flex-col w-full p-4">
    <n-breadcrumb separator=">">
      <n-breadcrumb-item href="/">
        首页
      </n-breadcrumb-item>
      <n-breadcrumb-item :clickable="false">
        知识库管理
      </n-breadcrumb-item>
    </n-breadcrumb>

    <div class="mt-[16px]">
      <el-form ref="queryEl" :inline="true" :model="queryParams">
        <el-form-item>
          <el-input
            v-model="queryParams.knowledgeName"
            placeholder="请输入查询知识库名称"
            clearable
            size="large"
            style="width: 300px"
            @keyup.enter="getList"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="getList">
            查询
          </el-button>

          <el-button type="primary" :icon="Refresh" @click="retQuery">
            查询重置
          </el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="knowledgeList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column align="center" prop="classId" label="ID" show-overflow-tooltip />

        <el-table-column prop="knowledgeName" label="知识库名称" align="center" show-overflow-tooltip />

        <el-table-column align="center" label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="danger">
              删除-{{ row.id }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="500" />
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
