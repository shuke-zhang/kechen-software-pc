<script setup lang="ts">
import type { ElForm } from 'element-plus'
import type { DeviceModel } from '@/model/device'
import { CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import { DelDevice, getDeviceList } from '@/api/device'
import { devices } from './device'
import DeviceDialog from './deviceDialog.vue'

const queryRef = ref<InstanceType<typeof ElForm> | null>(null)
const list = ref<DeviceModel[]>([])
const loading = ref(false)
const visible = ref(false)
const ids = ref<number[]>([])
const names = ref<string[]>([])
const isAdd = ref(true)
const queryParams = ref<DeviceModel>({
})
const currentData = ref({})
const _statusOptions = [
  {
    value: 0,
    label: '在线',
  },
  {
    value: 1,
    label: '离线',
  },
]

function handleDeviceAdd() {
  isAdd.value = true
  visible.value = true
}
function getList() {
  if (loading.value)
    return
  loading.value = true
  getDeviceList(queryParams.value).then((res) => {
    list.value = res.data
  }).finally(() => {
    loading.value = false
  }).catch(() => {
    list.value = devices
  })
}

function handlePut(item: DeviceModel) {
  isAdd.value = false
  currentData.value = item
  visible.value = true
}

function handleDel(item: number[] | DeviceModel) {
  const delIds = Array.isArray(item) ? item : [(item as any).id]
  const delNames = Array.isArray(item) ? item.map((it: any) => it.picoNumber) : [(item as any).picoNumber]
  confirmWarning(`是否确认删除设备名称为${delNames}的设备？`).then(() => {
    delMsgLoading(DelDevice(delIds), '正在删除...').then(() => {
      ids.value = []
      names.value = []
      getList()
      showMessageSuccess('删除成功')
    })
  })
}

function resetQuery() {
  queryParams.value = {
  }
  getList()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="flex flex-col ">
    <div>
      <div>
        <el-form ref="queryRef" :inline="true" :model="queryParams" @submit.prevent>
          <el-form-item>
            <el-input
              v-model="queryParams.picoNumber"
              placeholder="请输入设备名称"
              clearable
              style="width: 240px"
              @keyup.enter="getList"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" @click="getList">
              查询
            </el-button>
            <el-button type="primary" plain :icon="Refresh" @click="resetQuery">
              查询重置
            </el-button>
            <el-button type="success" :icon="CirclePlus" @click="handleDeviceAdd">
              新增
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-divider />
    <el-scrollbar v-loading="loading" class="flex-1" element-loading-text="加载中...">
      <template v-if="!loading">
        <div v-if="list && list.length > 0" class="grid gap-[10px] [grid-template-columns:repeat(auto-fill,180px)] min-h-[180px]">
          <div v-for="item in list" :key="item.id" class="card px-[10px] rounded-[22px] relative w-[180px] h-[180px] flex flex-col items-center  bg-[#d3c5ff]">
            <div class="flex-center w-[50px] h-[30px] rounded-[5px]" :class="[!item.status ? 'bg-[#d0eaa4]' : 'bg-[#f28772]']">
              {{ !item.status ? '在线' : '离线' }}
            </div>

            <div class="w-full mt-[20px] text-[18px] flex-center">
              {{ item.picoNumber }}
            </div>

            <div class="w-full h-[1px] my-[15px] bg-[#5175AF]" />

            <div class="flex">
              <icon-font name="edit" size="26" color="#5175AF" hover-style="#405E8C" class="cursor-pointer" @click="handlePut(item)" />

              <icon-font name="delete" :size="26" color="#F15A24" hover-style="#c93030" class="ml-[8px] cursor-pointer" @click="handleDel(item)" />
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无数据" class="h-full" />
      </template>
    </el-scrollbar>

    <DeviceDialog v-model="visible" :is-add="isAdd" :data="currentData" @success="getList" />
  </div>
</template>

<style scoped lang="scss">
// 只在这儿加，为了好看一下吧
:deep(.el-loading-mask) {
  background-color: unset !important;
}
</style>
