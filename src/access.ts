export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};

  // Flatten menu structure
  let allMenu: any[] = [];
  currentUser?.menus?.forEach(item => {
    allMenu.push(item, ...(item.childrenList || []));
  });
  console.log(allMenu,'allMenu');
  // Create a Set for O(1) lookup performance
  const nameSet = new Set(allMenu.map(item => item.menuName));
  // Permission mappings based on route names in routes.ts
  const permissionMappings = {
    // Workbench permissions
    'workbench:purchase-entry': '低值易耗数据录入',
    'workbench:fixedThings-entry': '资产数据录入',
    'workbench:claim-record': '采购录入记录',
    'workbench:stock-entry': '低值易耗品入库审批',
    'workbench:thingsStock-entry': '资产入库审批',
    'workbench:claim': '低值易耗品管理',
    'workbench:fixedThings-claim': '资产管理',
    'workbench:purchase-apply': '低值易耗品申领',
    'workbench:fixedThings-apply': '资产申领',
    'workbench:purchase-record': '申领记录',
    'workbench:apply-confirm': '低值易耗品申领审批',
    'workbench:fixedThings-confirm': '资产申领审批',

    // Base permissions
    'base:role': '角色管理',
    'base:user': '用户管理',
    'base:log': '操作日志',

    // Finance permissions
    'finance:data-overview': '低值易耗品盘存',
    'finance:claim-stat': '低值耗材入库数据统计',
    'finance:purchase-stat': '低值耗材出库数据统计',
    'finance:thingsStock-stat': '资产入库统计',
    'finance:thingsStock-out-stat': '资产出库统计',
  };

  // Generate permissions object efficiently
  const permissions: Record<string, boolean> = {};
  Object.entries(permissionMappings).forEach(([permission, menuName]) => {
    permissions[permission] =  nameSet.has(menuName);
  });
  //这里还需要加一层判断，workbench，base,finance三个权限，依赖它的子集，有子集他们就是true，不然就是false
  permissions['workbench'] = Object.keys(permissions).some(key => key.startsWith('workbench:') && permissions[key]);
  permissions['base'] = Object.keys(permissions).some(key => key.startsWith('base:') && permissions[key]);
  permissions['finance'] = Object.keys(permissions).some(key => key.startsWith('finance:') && permissions[key]);
  return permissions;
}
