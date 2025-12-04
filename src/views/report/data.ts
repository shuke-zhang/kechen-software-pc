import type { ReportModel } from '@/model/report'

// 工具：随机时间戳（用于生成 ID）
function randomId() {
  return (
    Date.now().toString(36)
    + Math.random().toString(36).substring(2, 8)
  ).toUpperCase()
}

// 随机取数组元素
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateReports(count = 50): ReportModel[] {
  const patientNames = [
    '张伟',
    '王芳',
    '李强',
    '刘敏',
    '陈杰',
    '杨洋',
    '赵磊',
    '孙丽',
    '周欣',
    '吴宇',
    '韩雪',
    '谢磊',
    '唐静',
    '冯凯',
    '邓琳',
    '曹琴',
    '魏晨',
    '郭婷',
    '范雄',
    '穆雷',
  ]

  const doctors = ['李医生', '王医生', '赵医生', '刘医生', '陈医生']

  const plans = [
    { id: 'P001', name: '颈椎方案 A' },
    { id: 'P002', name: '放松方案 B' },
    { id: 'P003', name: '视觉方案 C' },
    { id: 'P004', name: '冥想方案 D' },
    { id: 'P005', name: '音乐方案 E' },
  ]

  const list: ReportModel[] = []

  for (let i = 1; i <= count; i++) {
    const plan = pick(plans)
    const patient = pick(patientNames)
    const doctor = pick(doctors)

    list.push({
      id: randomId(),
      link: `https://example.com/report/${randomId()}.pdf`,
      patientName: patient,
      exeDoctor: doctor,
      picoNumber: `PICO-${Math.floor(1000 + Math.random() * 9000)}`,
      planId: plan.id,
      planName: plan.name,
      treatId: randomId(),
    })
  }

  return list
}

// 默认导出 50 条
export const mockReportList = generateReports(50)
