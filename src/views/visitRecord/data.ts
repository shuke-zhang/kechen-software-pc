import type { VisitRecordModel } from '@/model/visitRecord'

export const mockVisitRecordList: VisitRecordModel[] = [
  {
    id: 1,
    patientName: '李小明',
    devicePicoId: 123456,
    planName: '情绪舒缓方案 A',
    status: 0, // 草稿
    diagnosticDoctor: '张医生',
    executeDoctor: '王医生',
    treatDepart: '心理科',
    diagnostic: '轻度焦虑',
    comment: '首次治疗记录',
    createdUserName: '管理员',
    createdTime: '2025-01-10 09:30:00',
  },
  {
    id: 2,
    patientName: '王大力',
    devicePicoId: 987654,
    planName: '睡眠改善方案 B',
    status: 0, // 启用
    diagnosticDoctor: '李主任',
    executeDoctor: '赵医生',
    treatDepart: '睡眠门诊',
    diagnostic: '睡眠障碍',
    comment: '',
    createdUserName: '系统管理员',
    createdTime: '2025-01-12 14:20:00',
  },
  {
    id: 3,
    patientName: '陈慧',
    devicePicoId: 87,
    planName: '压力释放方案 C',
    status: 2, // 暂停
    diagnosticDoctor: '刘医生',
    executeDoctor: '孙医生',
    treatDepart: '身心科',
    diagnostic: '中度压力症状',
    comment: '需观察方案效果',
    createdUserName: 'Admin',
    createdTime: '2025-01-15 11:05:00',
  },
  {
    id: 4,
    patientName: '赵雨晴',
    devicePicoId: 87,
    planName: '慢性疼痛缓解方案',
    status: 3, // 已归档
    diagnosticDoctor: '韩医生',
    executeDoctor: '周医生',
    treatDepart: '疼痛科',
    diagnostic: '慢性腰痛',
    comment: '',
    createdUserName: 'Admin',
    createdTime: '2025-01-18 16:40:00',
  },
]
