<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus'

const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const form = ref({
  name: 'admin',
  phone: '15888888888',
  email: 'admin@example.com',
  gender: '1',
})
const rules: FormRules = {
  name: [{ required: true, trigger: 'blur', message: '请输入用户名称' }],
  phone: [{ required: true, trigger: 'blur', message: '请输入手机号码' }],
  email: [{ required: true, trigger: 'blur', message: '请输入邮箱' }],
}
</script>

<template>
  <div class="h-[500px]">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="card p-0">
          <div class="h-[40px] flex items-center pl-[20px] border-b-[1px] border-[#e7eaec]">
            个人信息
          </div>
          <div class="p-[20px]  flex flex-col items-center text-[12px]">
            <UploadFile mode="avatar" class="mb-[10px]" />

            <ul class="list-group ">
              <li class="list-group-item flex justify-between ">
                <div>用户名称</div>
                <div>admin</div>
              </li>

              <li class="list-group-item flex justify-between ">
                <div>手机号码</div>
                <div>15888888888</div>
              </li>

              <li class="list-group-item flex justify-between ">
                <div>创建日期</div>
                <div>2022-01-01</div>
              </li>
            </ul>
          </div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="card p-0">
          <div
            class="h-[40px] flex items-center pl-[20px] border-b-[1px] border-[#e7eaec]"
          >
            基本资料
          </div>
          <div class="p-[20px]">
            <el-form ref="formRef" label-width="100" :model="form" :rules="rules">
              <el-form-item label="用户名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入用户名称" />
              </el-form-item>

              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号码" />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" />
              </el-form-item>

              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="form.gender">
                  <el-radio label="1">
                    男
                  </el-radio>
                  <el-radio label="2">
                    女
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item>
                <div class="w-full flex justify-end">
                  <el-button type="primary">
                    保存
                  </el-button>
                  <el-button type="danger">
                    关闭
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0;
  font-size: 13px;
}
.list-group-item + .list-group-item {
  border-top: none;
}
</style>
