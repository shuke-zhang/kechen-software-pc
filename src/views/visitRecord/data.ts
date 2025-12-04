import type { VisitRecordModel } from '@/model/visitRecord'

// 工具：生成随机时间（最近 30 天）
function randomDate() {
  const now = Date.now()
  const random = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
  return new Date(now - random).toISOString()
}

// 工具：随机取数组元素
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 工具：随机编号
function randomOrderNo() {
  return `OD${Math.floor(20250000 + Math.random() * 89999)}`
}

// 生成假数据函数
export function generateVisitRecords(count = 50): VisitRecordModel[] {
  const patientNames = ['张伟', '王芳', '李强', '刘敏', '陈杰', '杨洋', '赵磊', '孙丽', '周欣', '吴宇', '韩雪', '谢磊', '唐静', '冯凯', '邓琳']
  const doctors = ['李医生', '王医生', '赵医生', '刘医生', '陈医生']
  const executeDoctors = ['周医生', '林医生', '许医生', '戴医生', '黄医生']
  const departs = [
    { id: 10, name: '康复科' },
    { id: 11, name: '神经科' },
    { id: 12, name: '眼科' },
    { id: 13, name: '心理科' },
  ]
  const projects = [
    { id: 'TP001', name: '颈椎理疗' },
    { id: 'TP002', name: '视觉放松' },
    { id: 'TP003', name: '放松音乐治疗' },
    { id: 'TP004', name: '全身放松' },
    { id: 'TP005', name: '冥想训练' },
  ]
  const plans = [
    { id: 201, name: '颈椎方案A' },
    { id: 202, name: '视觉方案B' },
    { id: 203, name: '音乐方案C' },
    { id: 204, name: '放松方案D' },
    { id: 205, name: '冥想方案E' },
  ]

  const records: VisitRecordModel[] = []

  for (let i = 1; i <= count; i++) {
    const patientName = pick(patientNames)
    const patientId = 100 + patientNames.indexOf(patientName)
    const doctor = pick(doctors)
    const execDoctor = pick(executeDoctors)
    const depart = pick(departs)
    const project = pick(projects)
    const plan = pick(plans)

    const created = randomDate()
    const updated = randomDate()

    records.push({
      id: i,
      patientId,
      patientName,
      devicePicoId: Math.ceil(Math.random() * 5),
      treatDepartId: depart.id,
      treatDepart: depart.name,
      treatProjectId: project.id,
      treatProjectName: project.name,
      videoPlanId: plan.id,
      planName: plan.name,
      orderTreatNumber: randomOrderNo(),
      status: Math.floor(Math.random() * 3), // 0,1,2
      diagnostic: `${patientName} 的诊断内容`,
      diagnosticDoctor: doctor,
      executeDoctor: execDoctor,
      comment: Math.random() > 0.5 ? '无特殊情况' : '治疗进展稳定',
      delFlag: 0,
      createdUserId: Math.ceil(Math.random() * 5),
      createdUserName: '系统管理员',
      createdTime: created,
      updatedTime: updated,
    })
  }

  return records
}

// 直接生成 50 条
export const visitRecords = generateVisitRecords(50)
