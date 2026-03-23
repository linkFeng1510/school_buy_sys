import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Input, Button, Modal, Form, Input as AntInput, message, Select, Radio,Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request, useModel } from 'umi';
import { get } from 'lodash';
import { sign } from 'crypto';

const { Search } = Input;
const { Option } = Select;

interface warehouse {
  databaseName: string;
  id: number | string;
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
  databaseName: string;
  userId: number| string;
  username: string;
}

interface UserEditParams {
  userId: number | string;
  username: string;
  databaseName: string;
  id: number | string;
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
// 新增仓库, 编辑仓库, 仓库列表查询, 接口增加所属校区：1: 小学部、2: 初中部、3: 其他（除小学和初中以外的全部仓库）
const UserManagement: React.FC = () => {
  const [data, setData] = useState<warehouse[]>([]);
  const [roles, setRoles] = useState<Role[]>([]); // 新增仓库数据状态
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<warehouse | null>(null);
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


  // 获取仓库列表
  const fetchWarehouse = async (params: UserQueryParams) => {
    setLoading(true);
    try {
      const result = await request<UserQueryResponse>('/api/database/list', {
        method: 'POST',
        data: params,
      });

      setData(result.data.records);
      setTotal(result.data.total);
    } catch (error) {
      message.error('获取仓库列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchWarehouse({ pageNum: 1, pageSize });
  }, []);

  // 搜索功能
  const handleSearch = () => {
    setPageNum(1);
    fetchWarehouse({
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
    fetchWarehouse({ pageNum: 1, pageSize });
  };

  // 新增仓库
  const addWarehouse = async (params: UserAddParams) => {
    try {
      await request('/api/database/add', {
        method: 'POST',
        data: params,
      });
      message.success('新增仓库成功');
      return true;
    } catch (error) {
      message.error('新增仓库失败');
      return false;
    }
  };

  // 编辑仓库
  const editUser = async (params: UserEditParams) => {
    try {
      await request('/api/database/update', {
        method: 'POST',
        data: {
          ...params
        },
      });

      message.success('编辑仓库成功');
      return true;
    } catch (error) {
      message.error('编辑仓库失败');
      return false;
    }
  };

  // 新增仓库
  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();

      const params: UserAddParams = {
        databaseName: values.databaseName,
        userId: initialState?.currentUser?.userId || '',
        username: initialState?.currentUser?.userName,
      };

      const success = await addWarehouse(params);
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

  // 编辑仓库
  const handleEdit = (record: warehouse) => {
    setEditingUser(record);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      databaseName: record.databaseName,
    });

  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      if (!editingUser) return;
      const params: UserEditParams = {
        userId: initialState?.currentUser?.userId || '',
        username: initialState?.currentUser?.userName,
        databaseName: values.databaseName,
        id: editingUser.id,
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

  // 删除仓库
  const deleteUser = async (currId: number | string) => {
    try {
      await request('/api/database/delete', {
        method: 'POST',
        data: {
          username: initialState?.currentUser?.userName,
          userId: initialState?.currentUser?.userId,
          id: currId,
        },
      });
      message.success('删除成功');
      return true;
    } catch (error) {
      message.error('删除仓库失败');
      return false;
    }
  };

  // 删除
  const handleDelete = (key: string|number) => {
    // 如果userId为1时，不可以删除，确保有一个仓库可以登录
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此仓库吗？',
      onOk: async () => {
        const success = await deleteUser(key);
        if (success) {
          // 重新获取数据
          fetchWarehouse({
            pageNum: pageNum,
            pageSize,
          });
        }
      },
    });
  };

  const columns = [
    { title: '序号', type: 'index', width: 60, render: (_: any, __: any, index: number) => (pageNum - 1) * pageSize + index + 1 },
    { title: '库名称', dataIndex: 'databaseName', key: 'databaseName' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: warehouse) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
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
      title="仓库管理"
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
          新增仓库
        </Button>,
      ]}
    >
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
            fetchWarehouse({
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
      {/* 新增仓库模态框 */}
      <Modal
        title="新增仓库"
        visible={isAddModalVisible}
        onOk={handleAdd}
        onCancel={handleAddModalCancel}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="databaseName"
            label="库名称"
            rules={[{ required: true, message: '请输入库名称', max: 20 }]}
          >
            <AntInput placeholder="请输入库名称（20位以内）" maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑仓库模态框 */}
      <Modal
        title="编辑仓库"
        visible={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={handleEditModalCancel}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="databaseName"
            label="库名称"
            rules={[{ required: true, message: '请输入库名称', max: 20 }]}
          >
            <AntInput placeholder="请输入库名称（20位以内）" maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UserManagement;
