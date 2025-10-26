import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Select, Space, message, Modal } from 'antd';
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import * as XLSX from 'xlsx';
import { request } from '@umijs/max';

interface DataType {
  id: string;
  productName: string;
  unit: string;
  price: number;
  initialQuantity: number;
  initialAmount: number;
  increaseQuantity: number;
  increaseAmount: number;
  decreaseQuantity: number;
  decreaseAmount: number;
  finalQuantity: number;
  finalAmount: number;
}

// User interface for approvers
interface User {
  userId: string;
  name: string;
}

// Define API response interface
interface ApiResponse {
  code: number;
  data: DataType[];
  message: string;
}

// User query response interface
interface UserQueryResponse {
  code: number;
  data: User[];
  message: string;
}

const ApplicationListPage: React.FC = () => {
  const [dataList, setListData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // 当前月前一个月

  const [currMonth, setCurrMonth] = useState<number>(new Date().getMonth() + 1);
  // 当前年
  const [currYear, setCurrYear] = useState<number>(new Date().getFullYear()); // 当前年

  // Inventory taker and supervisor selection states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inventoryTakers, setInventoryTakers] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [selectedInventoryTaker, setSelectedInventoryTaker] = useState<string | undefined>(undefined);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | undefined>(undefined);
  const [userLoading, setUserLoading] = useState(false);

  // Use real API data instead of mock data
  useEffect(() => {
    fetchData();
  }, [currYear, currMonth, page, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Replace mock data with real API call
      const result = await request(`/api/stat/fixedAsset/statistics`, {
        method: 'POST',
        data: {
          year: currYear,
          month: currMonth,
          page: page,
          size: pageSize
        }
      });

      if (result.code === 200) {
        setListData(result.data.records || []);
        setTotal(result.data.total || 0);
      } else {
        message.error(result.message || '获取数据失败');
        setListData([]);
        setTotal(0);
      }
    } catch (error) {
      message.error('获取数据失败');
      setListData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory takers from API
  const fetchInventoryTakers = async () => {
    setUserLoading(true);
    try {
      const result = await request<UserQueryResponse>('/api/user/query', {
        method: 'POST',
        data: {
          isFixedAsset: 1
        }
      });
      if (result.code === 200) {
        setInventoryTakers(result.data || []);
      } else {
        message.error(result.message || '获取盘点人列表失败');
      }
    } catch (error) {
      message.error('获取盘点人列表失败');
    }
  };

  // Fetch supervisors from API
  const fetchSupervisors = async () => {
    try {
      const result = await request<UserQueryResponse>('/api/user/query', {
        method: 'POST',
        data: {
          isFixedAsset: 0
        }
      });
      if (result.code === 200) {
        setSupervisors(result.data || []);
      } else {
        message.error(result.message || '获取监盘人列表失败');
      }
    } catch (error) {
      message.error('获取监盘人列表失败');
    } finally {
      setUserLoading(false);
    }
  };

  const handleExport = async () => {
    // Fetch users and show modal
    await Promise.all([fetchInventoryTakers(), fetchSupervisors()]);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    if (!selectedInventoryTaker) {
      message.warning('请选择盘点人');
      return;
    }

    if (!selectedSupervisor) {
      message.warning('请选择监盘人');
      return;
    }

    try {
      const response = await request('/api/stat/download/fixedAsset', {
        method: 'POST',
        data: {
          year: currYear,
          month: currMonth,
          fixedAssetUserId: selectedInventoryTaker,
          lowValueUserId: selectedSupervisor
        },
        responseType: 'blob' // Important for handling file download
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `资产统计_${currYear}年${currMonth}月.pdf`;

      link.href = url;
      link.download = fileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('导出成功！');
      setIsModalVisible(false);
      setSelectedInventoryTaker(undefined);
      setSelectedSupervisor(undefined);
    } catch (error) {
      message.error('导出失败，请重试');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedInventoryTaker(undefined);
    setSelectedSupervisor(undefined);
  };

  const columns: ProColumns<DataType>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 80,
    },
    {
      title: '资产名称',
      dataIndex: 'productName',
      valueType: 'text',
      width: 200,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      valueType: 'text',
      width: 100,
    },
    {
      title: '单价',
      dataIndex: 'price',
      valueType: 'digit',
      width: 100,
    },
    {
      title: '期初数',
      children: [
        {
          title: '数量',
          dataIndex: 'initialQuantity',
          valueType: 'digit',
          width: 100,
        },
        {
          title: '金额',
          dataIndex: 'initialAmount',
          valueType: 'money',
          width: 100,
          render: (dom: React.ReactNode) => (
            <span style={{ backgroundColor: 'yellow', padding: '4px', borderRadius: '4px' }}>
              {dom}
            </span>
          ),
        },
      ],
    },
    {
      title: '本期增加',
      children: [
        {
          title: '数量',
          dataIndex: 'increaseQuantity',
          valueType: 'digit',
          width: 100,
        },
        {
          title: '金额',
          dataIndex: 'increaseAmount',
          valueType: 'money',
          width: 100,
          render: (dom: React.ReactNode) => (
            <span style={{ backgroundColor: 'yellow', padding: '4px', borderRadius: '4px' }}>
              {dom}
            </span>
          ),
        },
      ],
    },
    {
      title: '本期减少',
      children: [
        {
          title: '数量',
          dataIndex: 'decreaseQuantity',
          valueType: 'digit',
          width: 100,
        },
        {
          title: '金额',
          dataIndex: 'decreaseAmount',
          valueType: 'money',
          width: 100,
          render: (dom: React.ReactNode) => (
            <span style={{ backgroundColor: 'yellow', padding: '4px', borderRadius: '4px' }}>
              {dom}
            </span>
          ),
        },
      ],
    },
    {
      title: '期末数',
      children: [
        {
          title: '数量',
          dataIndex: 'finalQuantity',
          valueType: 'digit',
          width: 100,
        },
        {
          title: '金额',
          dataIndex: 'finalAmount',
          valueType: 'money',
          width: 100,
          render: (dom: React.ReactNode) => (
            <span style={{ backgroundColor: 'yellow', padding: '4px', borderRadius: '4px' }}>
              {dom}
            </span>
          ),
        },
      ],
    },
  ];

  return (
    <PageContainer>
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="选择时间" style={{ marginTop: 16 }}>
          <Select
            key="year"
            style={{ width: 120 }}
            value={currYear}
            onChange={(value) => setCurrYear(value)}
          >
            {[...Array(5)].map((_, i) => (
              <Select.Option key={new Date().getFullYear() - i} value={new Date().getFullYear() - i} disabled={currYear === new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}年
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="选择月份" style={{ marginTop: 16 }}>
          <Select
            key="month"
            style={{ width: 120 }}
            value={currMonth}
            onChange={(value) => setCurrMonth(value)}
          >
            {[...Array(12)].map((_, i) => (
              <Select.Option key={i + 1} value={i + 1} disabled={currYear === new Date().getFullYear() && i + 1 > new Date().getMonth() + 1}>
                {i + 1}月
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item style={{ marginTop: 16 }}>
          <Button type="primary" onClick={fetchData}>
            搜索
          </Button>
          <Button type="primary" onClick={handleExport} style={{ marginLeft: 8 }}>
            导出
          </Button>
        </Form.Item>
      </Form>

      <ProTable
        columns={columns}
        dataSource={dataList}
        pagination={{ total, current: page, pageSize }}
        toolBarRender={false}
        bordered
        search={false}
        loading={loading}
        rowKey="id"
      />

      {/* Inventory Taker and Supervisor Selection Modal */}
      <Modal
        title="选择盘点人和监盘人"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={userLoading}
        okText="确认导出"
        cancelText="取消"
      >
        <Form.Item
          label="盘点人"
          required
          style={{ marginBottom: 16 }}
        >
          <Select
            placeholder="请选择盘点人"
            value={selectedInventoryTaker}
            onChange={setSelectedInventoryTaker}
            loading={userLoading}
            showSearch
            optionFilterProp="children"
          >
            {inventoryTakers.map(user => (
              <Select.Option key={user.userId} value={user.userId}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="监盘人"
          required
          style={{ marginBottom: 0 }}
        >
          <Select
            placeholder="请选择监盘人"
            value={selectedSupervisor}
            onChange={setSelectedSupervisor}
            loading={userLoading}
            showSearch
            optionFilterProp="children"
          >
            {supervisors.map(user => (
              <Select.Option key={user.userId} value={user.userId}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Modal>
    </PageContainer>
  );
};

export default ApplicationListPage;
