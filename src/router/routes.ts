export const routes = [
  {
    path: '/',
    name: 'layout',
    component: () => import('@/views/layout/index.vue'),
    redirect: '/device',
    children: [
      {
        path: 'device',
        name: 'device',
        component: () => import('@/views/device/index.vue'),
        meta: {
          title: '设备管理',
          hidden: true,
          icon: 'device',

        },
      },
      {
        path: 'patient',
        name: 'patient',
        component: () => import('@/views/patient/index.vue'),
        meta: {
          title: '患者',
          hidden: true,
          icon: 'patient',
        },
      },
      {
        path: 'visitRecord',
        name: 'visitRecord',
        component: () => import('@/views/visitRecord/index.vue'),
        meta: {
          title: '治疗记录',
          hidden: true,
          icon: 'visitRecord',

        },
      },
      {
        path: 'report',
        name: 'report',
        component: () => import('@/views/report/index.vue'),
        meta: {
          title: '报告',
          hidden: true,
          icon: 'report',
        },
      },
      {
        path: 'settings',
        name: 'settings',
        children: [
          {
            path: 'video',
            name: 'Video',
            component: () => import('@/views/settings/video/index.vue'),
            meta: {
              title: '视频',
              hidden: true,
            },
          },
          {
            path: 'videoCategory',
            name: 'VideoCategory',
            component: () => import('@/views/settings/videoCategory/index.vue'),
            meta: {
              title: '视频类别',
              hidden: true,
            },
          },
          {
            path: 'videoPlan',
            name: 'VideoPlan',
            component: () => import('@/views/settings/videoPlan/index.vue'),
            meta: {
              title: '视频方案',
              hidden: true,
            },
          },
          {
            path: 'profile',
            name: 'UserProfile',
            component: () => import('@/views/settings/user/profile.vue'),
            meta: {
              title: '用户管理',
              hidden: true,
            },
          },
          {
            path: 'userManagement',
            name: 'UserManagement',
            component: () => import('@/views/settings/user/index.vue'),
            meta: {
              title: '用户信息修改',
              hidden: true,
            },
          },
          {
            path: 'dict',
            name: 'Dict',
            component: () => import('@/views/settings/dict/index.vue'),
            meta: {
              title: '字典管理',
              hidden: true,
            },
          },
          {
            path: 'dict/data/:dictType',
            name: 'DictData',
            component: () => import('@/views/settings/dict/data.vue'),
            // props: true, // 自动注册为props
            meta: {
              title: '字典数据',
              hidden: true,
            },
          },
          {
            path: 's',
            name: 'DictData',
            component: () => import('@/views/settings/dict/data.vue'),
            // props: true, // 自动注册为props
            meta: {
              title: '字典数据2',
              hidden: true,
            },
          },
          {
            path: 's3',
            name: 'DictData',
            component: () => import('@/views/settings/dict/data.vue'),
            // props: true, // 自动注册为props
            meta: {
              title: '字典数据3',
              hidden: true,
            },
          },
        ],
        meta: {
          title: '设置',
          hidden: true,
          icon: 'settings',
        },
      },

    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue'),
    meta: {
      title: '登录',
      hidden: true,
    },
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('../views/test/index.vue'),
    meta: {
      title: '测试',
      hidden: true,
    },
  },

]
