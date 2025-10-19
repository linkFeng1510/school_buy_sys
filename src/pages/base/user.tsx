import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Input, Button, Modal, Form, Input as AntInput, message, Select, Radio,Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request, useModel } from 'umi';
import { get } from 'lodash';
import { sign } from 'crypto';

const { Search } = Input;
const { Option } = Select;

interface User {
  key: string;
  id: string;
  username: string;
  initialPassword: string;
  name: string;
  signatureImageUrl: string;
  phoneNumber: string;
  schoolSection: number;
  email: string;
  position: string;
  role: string;
  status: boolean;
}

interface Role {
  roleId: number;
  signatureImageUrl: string;
  roleName: string;
  roleKey: string;
  status: string;
}

// API接口定义
interface UserAddParams {
  userName: string;
  name: string;
  email: string;
  phonenumber: string;
  schoolSection: number;
  position: string;
  password: string;
  roleIds: number[];
  remark?: string;
  status?: string;
  signatureImageUrl?: string;
}

interface UserEditParams {
  userId: number;
  userName: string;
  name: string;
  email: string;
  phonenumber: string;
  schoolSection: number;
  signatureImageUrl: string;
  position: string;
  roleIds: number[];
  status: string;
  remark?: string;
  password: string;
}

interface UserQueryParams {
  userName?: string;
  phoneNumber?: string;
  position?: string;
  pageNum: number;
  pageSize: number;
}

interface UserItemResponse {
  userId: number;
  userName: string;
  name: string;
  email: string;
  phonenumber: string;
  position: string;
  roles: { roleId: number; roleName: string }[];
  status: string;
}

interface UserQueryResponse {
  data: any;
  rows: UserItemResponse[];
  total: number;
  pageNum: number;
  pageSize: number;
}

interface RoleQueryResponse {
  code: number;
  msg: string;
  data: {
    list: any[];
    records: Role[];
    total: number;
  };
}
// 新增用户, 编辑用户, 用户列表查询, 接口增加所属校区：1: 小学部、2: 初中部、3: 其他（除小学和初中以外的全部角色）
const UserManagement: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]); // 新增角色数据状态
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchPosition, setSearchPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const { initialState } = useModel('@@initialState');
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setpageSize] = useState(10);

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const result = await request<RoleQueryResponse>('/api/role/query', {
        method: 'POST',
        params: {
          status: '1', // Only fetch enabled roles
          pageNum: 1,
          pageSize: 100 // 获取所有角色
        }
      });

      if (result.code === 200) {
        let list = result.data.list.filter(item => item.status === '1');
        setRoles(list);
      } else {
        message.error('获取角色列表失败: ' + result.msg);
      }
    } catch (error) {
      message.error('获取角色列表失败');
    }
  };

  // 获取用户列表
  const fetchUsers = async (params: UserQueryParams) => {
    setLoading(true);
    try {
      const result = await request<UserQueryResponse>('/api/user/list', {
        method: 'POST',
        data: params,
      });

      const transformedData: User[] = result.data.records.map((item: any) => ({
        key: item.userId.toString(),
        id: item.userId.toString(),
        username: item.userName,
        initialPassword: '******', // 密码不返回，显示为******
        name: item.name,
        phoneNumber: item.phoneNumber,
        schoolSection: item.schoolSection,
        email: item.email,
        signatureImageUrl: item.signatureImageUrl,
        position: item.position,
        role: item.roles.map((r: any) => r.roleName).join(', '),
        status: item.status, // 假设'0'表示启用
      }));
      setData(transformedData);
      setTotal(result.data.total);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchUsers({ pageNum: 1, pageSize });
    fetchRoles(); // 获取角色数据
  }, []);

  // 搜索功能
  const handleSearch = () => {
    setPageNum(1);
    fetchUsers({
      userName: searchName || undefined,
      phoneNumber: searchPhone || undefined,
      position: searchPosition || undefined,
      pageNum: 1,
      pageSize,
    });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchName('');
    setSearchPhone('');
    setSearchPosition('');
    setPageNum(1);
    fetchUsers({ pageNum: 1, pageSize });
  };

  // 新增用户
  const addUser = async (params: UserAddParams) => {
    try {
      await request('/api/user/add', {
        method: 'POST',
        data: params,
      });
      message.success('新增用户成功');
      return true;
    } catch (error) {
      message.error('新增用户失败');
      return false;
    }
  };

  // 编辑用户
  const editUser = async (params: UserEditParams) => {
    try {
      await request('/api/user/update', {
        method: 'POST',
        data: {
          ...params,
          currentUserId: initialState?.currentUser?.userId
        },
      });

      message.success('编辑用户成功');
      return true;
    } catch (error) {
      message.error('编辑用户失败');
      return false;
    }
  };

  // 新增用户
  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();

      const params: UserAddParams = {
        userName: values.username,
        name: values.name,
        email: values.email,
        phonenumber: values.phoneNumber,
        schoolSection: values.schoolSection,
        position: values.position,
        password: values.initialPassword,
        roleIds: Array.isArray(values.role) ? values.role : [values.role], // 处理多选情况
        remark: '新员工',
        status: '1',
      };

      const success = await addUser(params);
      if (success) {
        setIsAddModalVisible(false);
        addForm.resetFields(); // Reset form fields after successful submission
        // 重新获取数据
        handleSearch();
      }
    } catch (error) {
      message.error('新增失败');
    }
  };

  // 编辑用户
  const handleEdit = (record: User) => {
    setEditingUser(record);
    setIsEditModalVisible(true);

    // 解析用户的角色ID列表
    const userRoleIds = record.role.split(', ').map(roleName => {
      const role = roles.find(r => r.roleName === roleName);
      return role ? role.roleId : null;
    }).filter(id => id !== null) as number[];
    // Set form values for editing
    editForm.setFieldsValue({
      userId: record.id,
      username: record.username,
      name: record.name,
      signatureImageUrl: record.signatureImageUrl,
      phoneNumber: record.phoneNumber,
      schoolSection: record.schoolSection,
      email: record.email,
      position: record.position,
      role: userRoleIds, // 使用角色ID
      status: record.status
    });
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();

      if (!editingUser) return;

      const params: UserEditParams = {
        userId: parseInt(editingUser.id, 10),
        userName: values.username,
        name: values.name,
        email: values.email,
        phonenumber: values.phoneNumber,
        schoolSection: values.schoolSection,
        position: values.position,
        signatureImageUrl: values.signatureImageUrl || '',
        roleIds: Array.isArray(values.role) ? values.role : [values.role], // 处理多选情况
        status: values.status,
        remark: '编辑用户',
        password: values.password
      };

      const success = await editUser(params);
      if (success) {
        setIsEditModalVisible(false);
        editForm.resetFields();
        setEditingUser(null);
        // 重新获取数据
        handleSearch();
      }
    } catch (error) {
      message.error('编辑失败');
    }
  };

  // 删除用户
  const deleteUser = async (userId: number) => {
    try {
      await request('/api/user/delete', {
        method: 'POST',
        data: {
          deleteUserId: userId,
          currentUserId: initialState?.currentUser?.userId
        },
      });
      message.success('删除成功');
      return true;
    } catch (error) {
      message.error('删除用户失败');
      return false;
    }
  };

  // 删除
  const handleDelete = (key: string) => {
    // 如果userId为1时，不可以删除，确保有一个用户可以登录
    if (key === '1') {
      message.error('系统用户不允许删除');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此用户吗？',
      onOk: async () => {
        const success = await deleteUser(parseInt(key, 10));
        if (success) {
          // 重新获取数据
          fetchUsers({
            userName: searchName || undefined,
            phoneNumber: searchPhone || undefined,
            pageNum: pageNum,
            pageSize,
          });
        }
      },
    });
  };

  const columns = [
    { title: '用户ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '职务', dataIndex: 'position', key: 'position' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (status === '1' ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
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

  // Cleanup form when modal is closed
  const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
    addForm.resetFields();
  };

  // Cleanup form when edit modal is closed
  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setEditingUser(null);
  };

  return (
    <PageContainer
      title="用户管理"
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            addForm.resetFields();
            setIsAddModalVisible(true);

          }}
        >
          新增用户
        </Button>,
      ]}
    >
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item style={{ marginBottom: 8 }}>
          <Input
            placeholder="请输入用户名或姓名"
            style={{ width: 180 }}
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            allowClear
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Input
            placeholder="请输入手机号"
            style={{ width: 150 }}
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
            allowClear
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Input
            placeholder="请输入职务"
            style={{ width: 150 }}
            value={searchPosition}
            onChange={e => setSearchPosition(e.target.value)}
            allowClear
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            style={{ marginRight: 8 }}
            onClick={handleSearch}
          >
            查询
          </Button>
          <Button
            onClick={handleReset}
          >
            重置
          </Button>
        </Form.Item>
      </Form>
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
            fetchUsers({
              userName: searchName || undefined,
              phoneNumber: searchPhone || undefined,
              position: searchPosition || undefined,
              pageNum: page,
              pageSize,
            });
          },
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `共 ${total} 条`,
          pageSizeOptions: ["5", "10", "20", "50"],
          onShowSizeChange: (current, size) => {
            setpageSize(size);
            handleSearch();
          },
          // itemRender: (current, type, originalElement) => {
          //   if (type === 'prev') return <a>上一页</a>;
          //   if (type === 'next') return <a>下一页</a>;
          //   return originalElement;
          // },
        }}
      />
      {/* 新增用户模态框 */}
      <Modal
        title="新增用户"
        visible={isAddModalVisible}
        onOk={handleAdd}
        onCancel={handleAddModalCancel}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名', max: 20 }]}
          >
            <AntInput placeholder="请输入用户名（20位以内）" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="initialPassword"
            label="初始密码"
            rules={[
              { required: true, message: '请输入初始密码' },
              { min: 5, message: '密码长度至少5位' },
              { max: 20, message: '密码长度最多20位' },
            ]}
          >
            <AntInput.Password placeholder="请输入初始密码（5-20位）" />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名', max: 20 }]}
          >
            <AntInput placeholder="请输入姓名（20字以内）" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <AntInput placeholder="请输入11位手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <AntInput placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="position"
            label="职务"
            rules={[{ required: true, message: '请输入职务', max: 20 }]}
          >
            <AntInput placeholder="请输入职务（20字以内，例如三年二班班主任）" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色请选择"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              placeholder="请选择角色"
              mode="multiple" // 支持多选角色
            >
              {roles.map(role => (
                <Option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="schoolSection"
            label="校区"
            rules={[{ required: true, message: '请选择校区' }]}
          >
            <Select
              placeholder="请选择校区"
            >
              <Option value={1}>小学部</Option>
              <Option value={2}>初中部</Option>
              <Option value={3}>其他</Option>
            </Select>
          </Form.Item>
          {/* <Form.Item
            name="signatureImageUrl"
            label="签名"
            rules={[{ required: true, message: '请输入签名', max: 20 }]}
          >
            {({ getFieldValue })=> {
              const signatureImageUrl = getFieldValue('signatureImageUrl');
              return <img src={signatureImageUrl} alt="签名" />;
            }}
          </Form.Item> */}
        </Form>
      </Modal>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        visible={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={handleEditModalCancel}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="userId" label="用户ID" hidden>
            <AntInput />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名', max: 20 }]}
          >
            <AntInput placeholder="请输入用户名（20位以内）" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { min: 5, message: '密码长度至少5位' },
              { max: 20, message: '密码长度最多20位' },
            ]}        >
            <AntInput.Password placeholder="留空则不修改密码（5-20位）" />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名', max: 20 }]}
          >
            <AntInput placeholder="请输入姓名（20字以内）" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <AntInput placeholder="请输入11位手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <AntInput placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="position"
            label="职务"
            rules={[{ required: true, message: '请输入职务', max: 20 }]}
          >
            <AntInput placeholder="请输入职务（20字以内，例如三年二班班主任）" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              placeholder="请选择角色"
              mode="multiple" // 支持多选角色
            >
              {roles.map(role => (
                <Option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="schoolSection"
            label="校区"
            rules={[{ required: true, message: '请选择校区' }]}
          >
            <Select
              placeholder="请选择校区"
            >
              <Option value={1}>小学部</Option>
              <Option value={2}>初中部</Option>
              <Option value={3}>其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
             shouldUpdate
            label="签名"
          >
            {({ getFieldValue }) => {
              const signatureImageUrl = getFieldValue('signatureImageUrl');
              console.log(signatureImageUrl,'signatureImageUrl');
              // 这个图片可以删除，实现这个功能
              return <div className="signature-preview" style={{ position: 'relative', display: 'flex', alignItems: 'center' ,flexDirection: 'row'}}>
                <Image src={signatureImageUrl} />
                {/* 删除图标 */}
                <div className="delete-icon" style={{ position: 'absolute', top: 0, right: 0, cursor: 'pointer' }} onClick={() => {
                  // 删除图片
                  editForm.setFieldsValue({
                    signatureImageUrl: null
                  });
                }}>
                  <DeleteOutlined />
                </div>
              </div>
            }}
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

export default UserManagement;
