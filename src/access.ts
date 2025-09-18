export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};

  // Flatten menu structure
  let allMenu: any[] = [];
  currentUser?.menus?.forEach(item => {
    allMenu.push(item, ...(item.childrenList || []));
  });

  // Create a Set for O(1) lookup performance
  const nameSet = new Set(allMenu.map(item => item.menuName));
  // Permission mappings based on route names in routes.ts
  const permissionMappings = {
    // Workbench permissions
    'workbench:purchase-entry': '低值易耗数据录入',
    'workbench:fixedThings-entry': '资产数据录入',
    'workbench:claim-record': '数据录入记录',
    'workbench:stock-entry': '入库审批',
    'workbench:stock-batch': '入库审批记录',
    'workbench:claim': '物品管理',
    'workbench:apply-record': '低值易耗品申领',
    'workbench:purchase-record': '物品申领记录',
    'workbench:apply-confirm': '申领审批',
    'workbench:fixedThings-apply': '资产申领',

    // Base permissions
    'base:role': '角色管理',
    'base:user': '用户管理',
    'base:log': '操作日志',

    // Finance permissions
    'finance:data-overview': '数据总览',
    'finance:claim-stat': '申领数据统计',
    'finance:purchase-stat': '采购数据统计',
  };

  // Generate permissions object efficiently
  const permissions: Record<string, boolean> = {};
  Object.entries(permissionMappings).forEach(([permission, menuName]) => {
    permissions[permission] = true|| nameSet.has(menuName);
  });
  //这里还需要加一层判断，workbench，base,finance三个权限，依赖它的子集，有子集他们就是true，不然就是false
  permissions['workbench'] = Object.keys(permissions).some(key => key.startsWith('workbench:') && permissions[key]);
  permissions['base'] = Object.keys(permissions).some(key => key.startsWith('base:') && permissions[key]);
  permissions['finance'] = Object.keys(permissions).some(key => key.startsWith('finance:') && permissions[key]);
  return permissions;
}
