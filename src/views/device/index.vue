<script setup lang="ts">
import type { ElForm } from 'element-plus'
import type { DeviceModel } from '@/model/device'
import { CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import { DelDevice, getDeviceList } from '@/api/device'
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
const statusOptions = [
  {
    value: 0,
    label: '在线',
  },
  {
    value: 1,
    label: '离线',
  },
]

function deviceItemStyle(status: number) {
  console.log(status, 'status')

  return {
    backgroundImage: `url(${new URL(`../../assets/device-bg-${status === 0 ? 1 : 2}.png`, import.meta.url).href})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}
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
  <div>
    <div class="flex flex-1 ">
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

          <!-- <el-form-item>
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            style="width: 240px"
            @change="getList"
          >
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item> -->

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
    <div v-loading="loading" class="min-h-[180px]" element-loading-text="加载中...">
      <template v-if="!loading">
        <div v-if="list && list.length > 0" class="grid gap-[10px] [grid-template-columns:repeat(auto-fill,180px)] min-h-[180px]">
          <div v-for="item in list" :key="item.id" class="card relative w-[180px] h-[100px] flex flex-col justify-center items-center" :style="deviceItemStyle(item.status!)">
            <div class="absolute! top-[12px] right-[12px] left-[12px]  flex flex-1 justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="h-3 w-3 rounded-full"
                  :class="!item.status ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"
                />

                <span
                  class="text-sm font-medium"
                  :class="!item.status ? 'text-green-600' : 'text-gray-500'"
                >
                  {{ !item.status ? '在线' : '离线' }}
                </span>
              </div>
              <div class="flex">
                <icon-font name="edit" size="20" color="#BCBCBC" hover-style="#6e6e6e" class="cursor-pointer" @click="handlePut(item)" />
                <icon-font name="delete" :size="20" color="#f56c6c" hover-style="#c93030" class="ml-[8px] cursor-pointer" @click="handleDel(item)" />
              </div>
            </div>
            <div>{{ item.picoNumber }}</div>
          </div>
        </div>
        <el-empty v-else description="暂无数据" />
      </template>
    </div>

    <DeviceDialog v-model="visible" :is-add="isAdd" :data="currentData" @success="getList" />
  </div>
</template>

<style scoped lang="scss">

</style>
