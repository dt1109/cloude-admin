import Main from '@/components/main'
import TeamManage from '@/view/team/router.js' // 团队管理
import Adminstrator from '@/view/adminstrator/router.js' // 考勤后台管理
/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  // {
  //   path: "/adminstrator",
  //   name: "adminstrator",
  //   meta: {
  //     access: [1],
  //     notCache: true,
  //     icon: "md-desktop",
  //     title: "设备管理"
  //   },
  //   component: Main,
  //   children: Adminstrator
  // },
  {
    path: '/team',
    name: 'team',
    meta: {
      access: [1],
      notCache: true,
      icon: 'md-contact',
      title: '团队管理'
    },
    component: Main,
    children: TeamManage
  },
  {
    path: '/adminstrator',
    name: 'adminstrator',
    meta: {
      access: [0],
      icon: 'md-cog',
      title: '考勤后台管理'
    },
    component: Main,
    children: Adminstrator
  },
  {
    path: '/checkWork',
    name: 'checkWork',
    meta: {
      access: [1],
      icon: 'md-pie',
      title: '考勤管理'
    },
    component: Main,
    children: [
      {
        path: '/statistics',
        name: 'statistics',
        meta: {
          title: '考勤统计',
          icon: 'md-podium'
        },
        component: () => import('@/view/checkWork/statistics')
      },
      {
        path: '/administrationStatistics',
        name: 'administrationStatistics',
        meta: {
          notCache: true,
          title: '考勤统计日报表',
          icon: 'md-recording'
        },
        component: () => import('@/view/checkWork/administrationStatistics')
      },
      {
        path: '/administrationGroup',
        name: 'administrationGroup',
        meta: {
          title: '考勤组管理',
          icon: 'md-reorder'
        },
        component: () => import('@/view/checkWork/administrationGroup')
      },
      {
        path: '/administrationClasses',
        name: 'administrationClasses',
        meta: {
          title: '班次管理',
          icon: 'md-shuffle'
        },
        component: () => import('@/view/checkWork/administrationClasses')
      },
      {
        path: '/administrationRepair',
        name: 'administrationRepair',
        meta: {
          title: '补卡管理',
          icon: 'md-speedometer'
        },
        component: () => import('@/view/checkWork/administrationRepair')
      },
      {
        path: '/administrationEquipment',
        name: 'administrationEquipment',
        meta: {
          title: '考勤设备管理',
          icon: 'md-home'
        },
        component: () => import('@/view/checkWork/administrationEquipment')
      }
    ]
  },
  {
    path: '/approvals',
    name: 'approvals',
    meta: {
      access: [1],
      icon: 'md-cog',
      title: '审批记录'
    },
    component: Main,
    children: [
      {
        path: '/approval',
        name: 'approval',
        meta: {
          // hideInMenu: true,
          title: '审批记录',
          notCache: true,
          icon: 'md-clipboard'
        },
        component: () => import('@/view/approval/approval.vue')
      }
    ]
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
  {
    path: '/message',
    name: 'message',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [
      {
        path: 'message_page',
        name: 'message_page',
        meta: {
          icon: 'md-notifications',
          title: '消息中心'
        },
        component: () => import('@/view/single-page/message/index.vue')
      }
    ]
  },
  {
    path: '/argu',
    name: 'argu',
    meta: {
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'params/:id',
        name: 'params',
        meta: {
          icon: 'md-flower',
          title: route => `{{ params }}-${route.params.id}`,
          notCache: true,
          beforeCloseName: 'before_close_normal'
        },
        component: () => import('@/view/argu-page/params.vue')
      },
      {
        path: 'query',
        name: 'query',
        meta: {
          icon: 'md-flower',
          title: route => `{{ query }}-${route.query.id}`,
          notCache: true
        },
        component: () => import('@/view/argu-page/query.vue')
      }
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]
