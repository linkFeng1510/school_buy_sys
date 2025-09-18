/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/workbench',
    name: '工作台',
    access: 'workbench',
    icon: 'dashboard',
    routes: [

      {
        path: '/workbench/purchase-entry',
        name: '低值易耗数据录入',
        access: 'workbench:purchase-entry',
        component: './workbench/purchase-entry',
      },
      {
        path: '/workbench/fixedThings-entry',
        name: '资产数据录入',
        access: 'workbench:fixedThings-entry',
        component: './workbench/fixedThings-entry',
      },
      {
        path: '/workbench/claim-record',
        name: '数据录入记录',
        component: './workbench/claim-record',
        access: 'workbench:claim-record'
      },
      {
        path: '/workbench/stock-entry',
        name: '入库审批',
        component: './workbench/stock-entry',
        access: 'workbench:stock-entry'
      },
      {
        path: '/workbench/stock-batch',
        name: '入库审批记录',
        component: './workbench/stock-batch',
        access: 'workbench:stock-batch'
      },
      {
        path: '/workbench/claim',
        name: '物品管理',
        component: './workbench/claim',
        access: 'workbench:claim'
      },
      {
        path: '/workbench/apply-record',
        name: '低值易耗品申领',
        component: './workbench/apply-record',
        access: 'workbench:apply-record'
      },
      {
        path: '/workbench/fixedThings-apply',
        name: '资产申领',
        component: './workbench/fixedThings-apply',
        access: 'workbench:fixedThings-apply'
      },
      {
        path: '/workbench/apply-confirm',
        name: '申领审批',
        component: './workbench/apply-confirm',
        access: 'workbench:apply-confirm'
      },
      {
        path: '/workbench/purchase-record',
        name: '物品申领记录',
        component: './workbench/purchase-record',
        access: 'workbench:purchase-record'
      },

    ],
  },
  {
    path: '/base',
    name: '基础管理',
    access: 'base',
    icon: 'setting',
    routes: [
      {
        path: '/base/role',
        name: '角色管理',
        component: './base/role',
        access: 'base:role'
      },
      {
        path: '/base/user',
        name: '用户管理',
        component: './base/user',
        access: 'base:user'
      },
      {
        path: '/base/log',
        name: '操作日志',
        component: './base/log',
        access: 'base:log'
      },
    ],
  },
  {
    path: '/finance',
    name: '财务管理',
    access: 'finance',
    icon: 'moneyCollect',
    // 重定向
    routes: [
      {
        path: '/finance/data-overview',
        name: '数据总览',
        component: './finance/data-overview',
        access: 'finance:data-overview'
      },
      {
        path: '/finance/claim-stat',
        name: '申领数据统计',
        component: './finance/claim-stat',
        access: 'finance:claim-stat'
      },
      {
        path: '/finance/purchase-stat',
        name: '采购数据统计',
        component: './finance/purchase-stat',
        access: 'finance:purchase-stat'
      },
    ],
  },
  {
    path: '/welcome',
    name: '首页',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
