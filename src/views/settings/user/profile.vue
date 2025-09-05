<script setup lang="ts">

</script>

<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <div class="card p-0">
        <div class="h-[40px] flex items-center pl-[20px]">
          个人信息
        </div>
        <div class="px-[20px] ">
          <UploadFile file-types="image" :limit="1" />
        </div>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content ep-bg-purple" />其他
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
</style>
