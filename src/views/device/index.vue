<script setup lang="ts">
import type { ElForm } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import DeviceDialog from './deviceDialog.vue'

const queryRef = ref<InstanceType<typeof ElForm> | null>(null)
const visible = ref(false)
const isAdd = ref(true)
const queryParams = ref({
  deviceName: '',
  status: 1,
})
const currentData = ref({})
const statusOptions = [
  { label: '在线', value: 1 },
  { label: '离线', value: 0 },
]
function deviceItemStyle(i: number) {
  return {
    backgroundImage: `url(${new URL(`../../assets/device-bg-${i % 2 === 0 ? 2 : 1}.png`, import.meta.url).href})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}
function handleDeviceAdd() {
  isAdd.value = true
  visible.value = true
}

function handlePut(item: any) {
  isAdd.value = false
  currentData.value = {
    deviceName: `PICO-${item}`,
  }
  visible.value = true
}

function handleDel(item: Device.DeviceModel) {
  confirmWarning(`是否确认删除设备名称为${item.deviceName}的设备？`).then(() => {
    console.log('确定')
  })
}
</script>

<template>
  <div class="flex flex-1 ">
    <div>
      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item>
          <el-input
            v-model="queryParams.deviceName"
            placeholder="请输入设备名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            style="width: 240px"
          >
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search">
            查询
          </el-button>
          <el-button type="primary" plain :icon="Refresh">
            查询重置
          </el-button>
          <el-button type="success" :icon="Plus" @click="handleDeviceAdd">
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
  <el-divider />
  <div class="grid gap-[10px] [grid-template-columns:repeat(auto-fill,200px)] ">
    <div v-for="item in 9" :key="item" class="card relative w-[200px] h-[100px]  flex flex-col justify-center items-center" :style="deviceItemStyle(item)">
      <div class="absolute! top-[6px] right-[6px] flex">
        <icon-font name="edit" size="20" color="#BCBCBC" hover-style="#6e6e6e" class="cursor-pointer" @click="handlePut(item)" />
        <icon-font
          name="delete"
          :size="20"
          color="#f56c6c"
          hover-style="#c93030"
          class="ml-[4px] cursor-pointer"
          @click="handleDel(item)"
        />
      </div>
      <div>
        <div>
          PICO-{{ item }}
        </div>
      </div>
      <div>
        <el-tag type="success">
          在线
        </el-tag>
      </div>
    </div>
  </div>

  <DeviceDialog v-model="visible" :is-add="isAdd" :data="currentData" />
</template>

<style scoped lang="scss">

</style>
