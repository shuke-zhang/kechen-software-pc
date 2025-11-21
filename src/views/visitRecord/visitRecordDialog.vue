<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus'
import type { DeviceModel } from '@/model/device'
import type { DictDataCssModel } from '@/model/dict'
import type { PatientModel } from '@/model/patient'
import type { VideoPlanModel } from '@/model/videoPlan'
import type { VisitRecordModel } from '@/model/visitRecord'
import { getDeviceList } from '@/api/device'
import { getPatientList } from '@/api/patient'
import { getVideoPlanList } from '@/api/videoPlan'
import { addVideoTreat, PutVideoTreat } from '@/api/visitRecord'

const props = defineProps({
  isAdd: { type: Boolean, required: true },
  data: { type: Object, required: false },
  treatProjectType: {
    type: Array as PropType<DictDataCssModel[]>,
    default: () => ([]),
  },
  treatStatus: {
    type: Array as PropType<DictDataCssModel[]>,
    default: () => ([]),
  },
})

const emit = defineEmits(['success'])

const visible = defineModel({ type: Boolean, required: false })
const remotePatientList = ref<PatientModel[]>([])
const loading = ref(false)
const lastPatientName = ref<string | undefined>(undefined)
const submitLoading = ref(false)
const form = ref<VisitRecordModel>({})
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const picoLoading = ref(false)
const devicePicoList = ref<DeviceModel[]>([])

const videoPlanLoading = ref(false)
const lastVideoPlanName = ref<string | undefined>(undefined)
const videoPlanList = ref<VideoPlanModel[]>([])

const rules: FormRules = {
  patientId: [{ required: true, trigger: 'blur', message: '请选择患者' }],
  treatProjectId: [{ required: true, trigger: 'blur', message: '请选择诊疗项' }],
  videoPlanId: [{ required: true, trigger: 'blur', message: '请选择视频方案' }],
  status: [{ required: true, trigger: 'blur', message: '请选择状态' }],
  diagnostic: [{ required: true, trigger: 'blur', message: '请输入诊断内容' }],
  diagnosticDoctor: [{ required: true, trigger: 'blur', message: '请输入诊断医生' }],
  executeDoctor: [{ required: true, trigger: 'blur', message: '请输入执行医生' }],

}

/**
 * 远程搜索患者
 */
function remoteMethod(query: string) {
  if (loading.value)
    return
  if (query === lastPatientName.value)
    return
  loading.value = true
  lastPatientName.value = query
  getPatientList({ page: {
    current: 1,
    size: 10,
  }, name: query }).then((res) => {
    remotePatientList.value = res.data.records
  }).finally(() => {
    loading.value = false
  })
}
/**
 * 患者选择变化
 */
function onPatientChange() {
  form.value.patientName = remotePatientList.value.find(item => item.id === form.value.patientId)?.name || ''
}

/**
 * 获取pico设备列表
 */
function getPicoList() {
  if (picoLoading.value) {
    return
  }

  picoLoading.value = true
  getDeviceList({}).then((res) => {
    devicePicoList.value = res.data
  }).finally(() => {
    picoLoading.value = false
  })
}

/**
 * 远程搜索视频方案
 */
function remoteVideoPlanMethod(query: string) {
  if (videoPlanLoading.value)
    return
  if (query === lastVideoPlanName.value)
    return
  videoPlanLoading.value = true
  getVideoPlanList({ page: {
    current: 1,
    size: 10,
  }, name: query }).then((res) => {
    videoPlanList.value = res.data.records
  }).finally(() => {
    videoPlanLoading.value = false
  })
}

function onVideoPlanChange() {
  form.value.planName = videoPlanList.value.find(el => el.id === form.value.videoPlanId)?.name
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
    if (!valid)
      return
    if (submitLoading.value)
      return
    submitLoading.value = true
    const api = props.isAdd ? addVideoTreat : PutVideoTreat
    api(form.value).then(() => {
      showMessageSuccess('操作成功')
      visible.value = false
      reset()
      emit('success')
    }).finally(() => {
      submitLoading.value = false
    })
  })
}

watch(
  () => props.data,
  (newVal) => {
    if (!newVal)
      return
    form.value = { ...(newVal as VisitRecordModel) }
  },
  { immediate: true },
)

watch(() => visible.value, () => {
  // 重置
  if (visible.value) {
    getPicoList()
  }
})
</script>

<template>
  <el-dialog v-model="visible" :title="isAdd ? '新增治疗记录' : '修改治疗记录'" width="860" :close-on-click-modal="false" @close="cancel">
    <el-form ref="formRef" :inline="true" :rules="rules" :model="form" class="large-form" label-width="120">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="患者" prop="patientId" style="width: 100%">
            <el-select
              v-model="form.patientId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入患者名称查询搜索"
              remote-show-suffix
              size="large"
              style="width: 100%"
              :remote-method="remoteMethod"
              :loading="loading"
              @change="onPatientChange"
            >
              <el-option
                v-for="item in remotePatientList"
                :key="item.id"
                :label="item.name"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="设备" prop="patientId" style="width: 100%">
            <el-select
              v-model="form.devicePicoId"
              style="width: 100%"
              :props="{
                label: 'name',
                value: 'id',
              }"
            >
              <el-option
                v-for="item in devicePicoList"
                :key="item.id"
                :label="`设备编号-${item.picoNumber}`"
                :value="item.id!"
              />
              <template #empty>
                <div class="p-2 text-[#909399]">
                  {{ picoLoading ? '正在加载…' : '暂无数据' }}
                </div>
              </template>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="开单号" prop="orderTreatNumber" style="width: 100%">
            <el-input
              v-model="form.orderTreatNumber"
              style="width: 100%"
              placeholder="请输入开单号"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="治疗科室" prop="treatDepart" style="width: 100%">
            <el-input
              v-model="form.treatDepart"
              style="width: 100%"
              placeholder="请输入治疗科室"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="z" prop="treatProjectId" style="width: 100%">
            <el-input
              v-model="form.devicePicoId"
              style="width: 100%"
              @change="form.treatProjectName = treatProjectType.find(it => it.value === form.treatProjectId)?.label || ''"
            >
              <el-option v-for="it in treatProjectType" :key="it.value" :label="it.label" :value="it.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="视频方案" prop="videoPlanId" style="width: 100%">
            <el-select
              v-model="form.videoPlanId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入视频方案查询搜索"
              remote-show-suffix
              size="large"
              style="width: 100%"
              :remote-method="remoteVideoPlanMethod"
              :loading="videoPlanLoading"
              @change="onVideoPlanChange"
            >
              <el-option
                v-for="item in videoPlanList"
                :key="item.id"
                :label="item.name"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="状态" prop="status" style="width: 100%">
            <el-select
              v-model="form.status"
              placeholder="请选择状态"
              clearable
              size="large"
              style="width: 100%"
            >
              <el-option v-for="it in treatStatus" :key="it.value" :label="it.label" :value="it.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="诊断内容" prop="diagnostic" style="width: 100%">
            <el-input
              v-model="form.diagnostic"
              style="width: 100%"
              :rows="2"
              type="textarea"
              placeholder="请输入诊断内容"
            />
          </el-form-item>
        </el-col>

        <!-- <el-col :span="12">
          <el-form-item label="诊断医生" prop="diagnosticDoctor" style="width: 100%">
            <el-input
              v-model="form.diagnosticDoctor"
              style="width: 100%"
              size="large"
              placeholder="请输入诊断医生"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="执行医生" prop="executeDoctor" style="width: 100%">
            <el-input
              v-model="form.executeDoctor"
              size="large"
              style="width: 100%"
              placeholder="请输入执行医生"
            />
          </el-form-item>
        </el-col> -->
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
