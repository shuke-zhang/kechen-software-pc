import type { DeviceModel } from '@/model/device'

export const devices: DeviceModel[] = [
  {
    id: 1,
    picoNumber: 'PICO00001',
    status: 0,
    delFlag: 0,
    createdUserId: 1001,
    createdUserName: '系统管理员',
    createdTime: '2025-01-01T08:00:00.000Z',
    updatedTime: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 2,
    picoNumber: 'PICO00002',
    status: 1,
    delFlag: 0,
    createdUserId: 1002,
    createdUserName: '系统管理员',
    createdTime: '2025-01-02T08:00:00.000Z',
    updatedTime: '2025-01-02T10:00:00.000Z',
  },
  {
    id: 3,
    picoNumber: 'PICO00003',
    status: 0,
    delFlag: 0,
    createdUserId: 1003,
    createdUserName: '系统管理员',
    createdTime: '2025-01-03T08:00:00.000Z',
    updatedTime: '2025-01-03T10:00:00.000Z',
  },
  {
    id: 4,
    picoNumber: 'PICO00004',
    status: 1,
    delFlag: 0,
    createdUserId: 1004,
    createdUserName: '系统管理员',
    createdTime: '2025-01-04T08:00:00.000Z',
    updatedTime: '2025-01-04T10:00:00.000Z',
  },
  {
    id: 5,
    picoNumber: 'PICO00005',
    status: 0,
    delFlag: 0,
    createdUserId: 1005,
    createdUserName: '系统管理员',
    createdTime: '2025-01-05T08:00:00.000Z',
    updatedTime: '2025-01-05T10:00:00.000Z',
  },
  {
    id: 6,
    picoNumber: 'PICO00006',
    status: 1,
    delFlag: 0,
    createdUserId: 1006,
    createdUserName: '系统管理员',
    createdTime: '2025-01-06T08:00:00.000Z',
    updatedTime: '2025-01-06T10:00:00.000Z',
  },
  {
    id: 7,
    picoNumber: 'PICO00007',
    status: 0,
    delFlag: 0,
    createdUserId: 1007,
    createdUserName: '系统管理员',
    createdTime: '2025-01-07T08:00:00.000Z',
    updatedTime: '2025-01-07T10:00:00.000Z',
  },
  {
    id: 8,
    picoNumber: 'PICO00008',
    status: 1,
    delFlag: 0,
    createdUserName: '系统管理员',
    createdTime: '2025-01-08T08:00:00.000Z',
    updatedTime: '2025-01-08T10:00:00.000Z',
  },
  {
    id: 9,
    picoNumber: 'PICO00009',
    status: 0,
    delFlag: 0,
    createdUserId: 1009,
    createdUserName: '系统管理员',
    createdTime: '2025-01-09T08:00:00.000Z',
    updatedTime: '2025-01-09T10:00:00.000Z',
  },
  {
    id: 10,
    picoNumber: 'PICO00010',
    status: 1,
    delFlag: 0,
    createdUserId: 1010,
    createdUserName: '系统管理员',
    createdTime: '2025-01-10T08:00:00.000Z',
    updatedTime: '2025-01-10T10:00:00.000Z',
  },

  // ----------- 批量生成 11 ~ 50 -----------
  ...Array.from({ length: 40 }).map((_, index) => {
    const id = index + 11
    const num = String(id).padStart(5, '0')
    const day = (id % 28) + 1
    const status = id % 2

    return {
      id,
      picoNumber: `7f41283c69eaefc3`,
      status,
      delFlag: 0 as const,
      createdUserId: 1000 + id,
      createdUserName: '系统管理员',
      createdTime: `2025-02-${String(day).padStart(2, '0')}T08:00:00.000Z`,
      updatedTime: `2025-02-${String(day).padStart(2, '0')}T10:00:00.000Z`,
    }
  }),
]
