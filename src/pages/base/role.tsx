import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Input, Button, Modal, Form, Input as AntInput, message, Checkbox, Divider, CheckboxChangeEvent, Tree, Radio } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request, useModel } from 'umi';
import TextArea from 'antd/es/input/TextArea';


interface Role {
  menusChildrenList?: any[];
  key: string;
  number: string;
  roleName: string;
  roleDescription: string;
  permissions: string[];
  status: string;
}

// API接口定义
interface RoleQueryParams {
  roleName?: string;
  pageNum: number;
  pageSize: number;
}

interface RoleAddParams {
  permissions: any;
  roleName: string;
  remark: string;
  menuIds: string[];
  status: string;
}

interface RoleItemResponse {
  roleId: number;
  roleName: string;
  remark: string;
  menuIds: string[];
  status: string;
}

interface RoleQueryResponse {
  data: any;
  records: RoleItemResponse[];
  total: number;
  pageNum: number;
  pageSize: number;
}
// Add this interface near the top with other interfaces
interface MenuNode {
  data: any;
  records: RoleItemResponse[];
}
const RoleManagement: React.FC = () => {
  const [data, setData] = useState<Role[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);

   const { initialState } = useModel('@@initialState');
  const [pageSize, setPageSize] = useState(10);
  const [permissionTreeData, setPermissionTreeData] = useState<DataNode[]>([]);

  // 权限树数据
  // const permissionTreeData: DataNode[] = [
  //   {
  //     title: '基础管理',
  //     key: 'basic_management',
  //     children: [
  //       { title: '角色管理', key: 'role_management' },
  //       { title: '新增角色', key: 'add_role' },
  //       { title: '修改角色', key: 'edit_role' },
  //       { title: '用户管理', key: 'user_management' },
  //       { title: '新增用户', key: 'add_user' },
  //       { title: '修改用户', key: 'edit_user' },
  //     ],
  //   },
  //   {
  //     title: '工作台',
  //     key: 'workbench',
  //     children: [
  //       { title: '采购录入', key: 'procurement_entry' },
  //       { title: '采购录入记录', key: 'procurement_log' },
  //       { title: '入库审批', key: 'stock_approval' },
  //       { title: '申领审批', key: 'request_approval' },
  //       { title: '物品管理', key: 'item_management' },
  //       { title: '物品申领', key: 'item_request' },
  //       { title: '物品申领记录', key: 'request_log' },
  //     ],
  //   },
  //   {
  //     title: '财务管理',
  //     key: 'financial_management',
  //     children: [
  //       { title: '数据概览', key: 'data_overview' },
  //       { title: '采购数据统计', key: 'procurement_stats' },
  //       { title: '物品申领数据统计', key: 'request_stats' },
  //     ],
  //   },
  // ];
  useEffect(() => {
    const fetchPermissionTree = async () => {
      try {
        const { data } = await request<MenuNode>('/api/menu/treeSelect');
        setPermissionTreeData(data);
      } catch (error) {
        message.error('获取权限菜单失败');
      }
    };
    fetchPermissionTree();
  }, []);
  const parseId = (arr: any[]) => {
    let currList: any[] = []
    arr.forEach(item => {
      currList.push(item.menuId)
      });
    return currList;
  }
  // 修改角色列表获取函数，正确处理权限和状态
  const fetchRoles = async (params: RoleQueryParams) => {
    setLoading(true);
    try {
      const result = await request<RoleQueryResponse>('/api/role/query', {
        method: 'POST',
        data: params,
      });
      const transformedData: Role[] = result.data.list.map((item: {
        menusChildrenList: any;
        permissions: any; roleId: { toString: () => any; }; roleName: any; remark: any; menuIds: any[]; status: any;
      }, index: number) => ({
        key: item.roleId.toString(),
        number: ((params.pageNum - 1) * params.pageSize + index + 1).toString(),
        roleName: item.roleName,
        menusChildrenList: item.menusChildrenList,
        roleDescription: item.remark,
        permissions: parseId(item.menusChildrenList) || [], // 转换menuIds为字符串数组
        status: item.status, // 确保状态被正确设置
      }));
      console.log(transformedData, 'transformedData');
      setData(transformedData);
      setTotal(result.data.total);
    } catch (error) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    handleSearch();
  }, []);

  // 搜索功能
  const handleSearch = () => {
    setPageNum(1);
    fetchRoles({ roleName: searchText || undefined, pageNum: 1, pageSize });
  };

  // 重置功能
  const handleReset = () => {
    setSearchText('');
    setPageNum(1);
    fetchRoles({ roleName: undefined, pageNum: 1, pageSize });
  };

  // 修改新增角色函数，添加状态参数
  const addRole = async (params: RoleAddParams) => {
    try {
      await request('/api/role/add', {
        method: 'POST',
        data: {
          ...params,
        },
      });
      message.success('新增成功');
      return true;
    } catch (error) {
      message.error('新增角色失败');
      return false;
    }
  };
  const updateRole = async (roleId: number, params: RoleAddParams) => {
    try {
      // Get current user ID from the initial state
      const { currentUser } = initialState || {};
      const currentUserId = currentUser?.userId || 0;

      await request('/api/role/update', {
        method: 'POST',
        data: {
          roleId,
          roleName: params.roleName,
          status: params.status,
          remark: params.remark,
          menuIds: params.menuIds, // Ensure menuIds are numbers
          currentUserId
        },
      });
      message.success('修改成功');
      setEditingRole(null);
      // 获取新的数据
      fetchRoles({ roleName: searchText || undefined, pageNum, pageSize });
      return true;
    } catch (error) {
      message.error('修改角色失败');
      return false;
    }
  };

  // 删除角色
  const deleteRole = async (roleId: number) => {

    try {
      const { currentUser } = initialState || {};
      await request(`/api/role/delete`, {
        method: 'POST',
        data: {
          deleteRoleId:roleId,
          currentUserId: currentUser?.userId, // 假设currentUser包含userId
        },
      });
      message.success('删除成功');
      return true;
    } catch (error) {
      message.error('删除角色失败');
      return false;
    }
  };

  // 更新保存处理函数，传递状态参数
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const params: RoleAddParams = {
        roleName: values.roleName,
        remark: values.roleDescription,
        menuIds: values.permissions,
        status: values.status,
        permissions: undefined
      };

      let success = false;
      if (editingRole) {
        success = await updateRole(parseInt(editingRole.key, 10), params);
      } else {
        success = await addRole(params);
      }

      if (success) {
        setIsModalVisible(false);
        form.resetFields();
        setEditingRole(null);
        // 重新获取数据
        fetchRoles({ roleName: searchText || undefined, pageNum, pageSize });
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 删除
  const handleDelete = (key: string) => {
    if (key === "1") {
      message.error('不能删除超级管理员角色');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此角色吗？',
      onOk: async () => {
        const success = await deleteRole(parseInt(key, 10));
        if (success) {
          // 重新获取数据
          handleSearch();
        }
      },
    });
  };

  // 编辑
  const handleEdit = (record: Role) => {
    form.setFieldsValue({
      roleName: record.roleName,
      roleDescription: record.roleDescription,
      permissions: record.permissions,
      status: record.status,
    });
    setEditingRole(record);
    setIsModalVisible(true);
  };
  const getAllKeys = (nodes: DataNode[]): string[] => {
    let keys: string[] = [];
    nodes.forEach(node => {
      keys.push(node.key as string);
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: '角色名',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '角色描述',
      dataIndex: 'roleDescription',
      key: 'roleDescription',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: any[],record:Role) => {
        if (!record || !record.menusChildrenList) {
          return '暂无权限数据';
        }
        // Extract Chinese names from menusChildrenList that match permissions
        const permissionNames: string[] = [];
        record.menusChildrenList.forEach(menu => {
              if (permissions.includes(menu.menuId)) {
                permissionNames.push(menu.menuName);
              }
        });
        return permissionNames.length > 0
          ? permissionNames.join(', ')
          : '暂无权限数据';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (status === '1' ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Role) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            danger
          />
        </>
      ),
    },
  ];

  return (
    <PageContainer
      title="角色管理"
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRole(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          新增角色
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <Input
          placeholder="请输入角色名称"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200, marginRight: 8 }}
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={handleReset}>
          重置
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          onChange: (page) => {
            setPageNum(page);
            fetchRoles({ roleName: searchText || undefined, pageNum: page, pageSize });
          },
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `共 ${total} 条`,
          pageSizeOptions: ["5", "10", "20", "50"],
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            handleSearch();
          }
        }}
      />
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingRole(null)
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ status: '1', permissions: [] }}>
          <Form.Item
            name="roleName"
            label="角色名"
            rules={[{ required: true, message: '请输入角色名', max: 20 }]}
          >
            <AntInput placeholder="请输入角色名" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="roleDescription"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述', max: 100 }]}
          >
            <TextArea placeholder="请输入角色描述" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="角色权限"
            rules={[{ required: true, message: '请选择至少一个权限' }]}
          >
            {isModalVisible&&<Tree
              checkable
              key={Math.random()}
              fieldNames={{ title: 'menuName', key: 'menuId' }}
              defaultExpandAll
              defaultCheckedKeys={editingRole?.permissions || []}
              treeData={permissionTreeData}
              onCheck={(checkedKeys) => {
                console.log(checkedKeys, 'checkedKeys');
                form.setFieldsValue({ permissions: checkedKeys });
                editingRole && setEditingRole({
                  ...editingRole,
                  permissions: checkedKeys as string[],
                });
              }}
            />}
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Radio.Group>
              <Radio value="1">启用</Radio>
              <Radio value="0">禁用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default RoleManagement;
