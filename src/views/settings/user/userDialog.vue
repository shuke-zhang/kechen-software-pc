<!-- userDialog.vue -->
<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus'

type UserStatus = 'enabled' | 'disabled'

interface RoleOption {
  id: number
  name: string
}

interface UserModel {
  id?: number
  username?: string
  nickname?: string
  phone?: string
  email?: string
  department?: string
  roleIds?: number[]
  roles?: string[]
  status?: UserStatus
  createdAt?: string
  lastLoginAt?: string
  remark?: string
  password?: string
  confirmPassword?: string
}

const props = defineProps({
  isAdd: { type: Boolean, required: true },
  data: { type: Object, default: () => ({}) },
  allRoles: { type: Array as () => RoleOption[], default: () => [] },
})
const visible = defineModel({ type: Boolean, required: false })

const submitLoading = ref(false)
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const form = ref<UserModel>({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  department: '',
  roleIds: [],
  status: 'enabled',
  remark: '',
  password: '',
  confirmPassword: '',
})

const rules: FormRules = {
  username: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
  nickname: [{ required: true, trigger: 'blur', message: '请输入昵称' }],
  phone: [
    { required: true, trigger: 'blur', message: '请输入手机号' },
    { pattern: /^1\d{10}$/, trigger: 'blur', message: '手机号格式不正确' },
  ],
  email: [
    { required: true, trigger: 'blur', message: '请输入邮箱' },
    { type: 'email', trigger: 'blur', message: '邮箱格式不正确' },
  ],
  roleIds: [{ type: 'array', required: true, trigger: 'change', message: '请选择角色' }],
  status: [{ required: true, trigger: 'change', message: '请选择状态' }],
  password: [
    { required: true, trigger: 'blur', message: '请输入密码' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: '请再次输入密码' },
    {
      validator: (_r, v, cb) => {
        if (v !== form.value.password)
          cb(new Error('两次密码不一致'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}

function cancel(): void {
  visible.value = false
  reset()
}

function reset(): void {
  form.value = {
    username: '',
    nickname: '',
    phone: '',
    email: '',
    department: '',
    roleIds: [],
    status: 'enabled',
    remark: '',
    password: '',
    confirmPassword: '',
  }
  resetForm(formRef.value)
  submitLoading.value = false
}

function submit(): void {
  formRef.value?.validate((valid) => {
    if (!valid)
      return
    if (submitLoading.value)
      return
    submitLoading.value = true
    // TODO: 调用保存接口
    setTimeout(() => {
      visible.value = false
      reset()
    }, 500)
  })
}

watch(
  () => props.data,
  (newVal) => {
    if (!newVal)
      return
    const v = newVal as UserModel
    form.value = {
      id: v.id,
      username: v.username ?? '',
      nickname: v.nickname ?? '',
      phone: v.phone ?? '',
      email: v.email ?? '',
      department: v.department ?? '',
      roleIds: v.roleIds ? [...v.roleIds] : [],
      status: v.status ?? 'enabled',
      remark: v.remark ?? '',
      password: '',
      confirmPassword: '',
      createdAt: v.createdAt,
      lastLoginAt: v.lastLoginAt,
      roles: v.roles ? [...v.roles] : [],
    }
    // 编辑场景：可选把密码校验去掉，或在 UI 隐藏密码项
  },
  { immediate: true },
)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isAdd ? '新增用户' : '修改用户'"
    width="820"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <el-form ref="formRef" :inline="true" :model="form" :rules="rules" class="large-form" label-width="100">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username" style="width: 100%">
            <el-input v-model="form.username" clearable placeholder="英文/数字组合" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="昵称" prop="nickname" style="width: 100%">
            <el-input v-model="form.nickname" clearable placeholder="展示名称" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="手机号" prop="phone" style="width: 100%">
            <el-input v-model="form.phone" clearable placeholder="11 位手机号" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email" style="width: 100%">
            <el-input v-model="form.email" clearable placeholder="name@example.com" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="部门" prop="department" style="width: 100%">
            <el-input v-model="form.department" clearable placeholder="如：技术部 / 运营部" size="large" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status" style="width: 100%">
            <el-select v-model="form.status" placeholder="请选择" size="large" style="width: 100%">
              <el-option label="启用" value="enabled" />
              <el-option label="停用" value="disabled" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="角色" prop="roleIds" style="width: 100%">
            <el-select v-model="form.roleIds" multiple filterable placeholder="请选择角色" size="large" style="width: 100%">
              <el-option v-for="r in allRoles" :key="r.id" :label="r.name" :value="r.id" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col v-if="isAdd" :span="12">
          <el-form-item label="密码" prop="password" style="width: 100%">
            <el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" size="large" />
          </el-form-item>
        </el-col>
        <el-col v-if="isAdd" :span="12">
          <el-form-item label="确认密码" prop="confirmPassword" style="width: 100%">
            <el-input v-model="form.confirmPassword" type="password" show-password placeholder="再次输入密码" size="large" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="备注" prop="remark" style="width: 100%">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="备注说明" size="large" />
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
</style>
