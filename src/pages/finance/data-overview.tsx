import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Select, Space, message, Modal } from 'antd';
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { request } from '@umijs/max';
const { Option } = Select;
// Add this utility function for CSV generation
const convertToCSV = (data: DataType[]): string => {
  // Define headers
  const headers = [
    '序号', '商品名称', '单位', '单价',
    '期初数-数量', '期初数-金额',
    '本期增加-数量', '本期增加-金额',
    '本期减少-数量', '本期减少-金额',
    '期末数-数量', '期末数-金额'
  ].join(',') + '\n';

  // Convert data rows
  const rows = data.map((item, index) => [
    index + 1,
    item.productName,
    item.unit,
    item.price,
    item.openingQuantity,
    item.openingAmount,
    item.increaseQuantity,
    item.increaseAmount,
    item.decreaseQuantity,
    item.decreaseAmount,
    item.closingQuantity,
    item.closingAmount
  ].join(',')).join('\n');

  return headers + rows;
};

// Add this utility function for file download
const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface DataType {
  id: string;
  productName: string;
  unit: string;
  price: number;
  openingQuantity: number;
  openingAmount: number;
  increaseQuantity: number;
  increaseAmount: number;
  decreaseQuantity: number;
  decreaseAmount: number;
  closingQuantity: number;
  closingAmount: number;
}

// User interface for approvers
interface User {
  userId: number | null | undefined;
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

  // Approval person selection states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inventoryTakers, setInventoryTakers] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [selectedInventoryTaker, setSelectedInventoryTaker] = useState<string | undefined>(undefined);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | undefined>(undefined);
  const [userLoading, setUserLoading] = useState(false);
  const [warehouseId, setWarehouseId] = useState<string | undefined>('1');
const [warehouseList, setWarehouseList] = useState<any[]>([]);

  // 获取仓库列表
  const fetchWarehouseList = async () => {
    try {
      const result = await request('/api/database/list', {
        method: 'POST',
        data: {
          pageNum: 1,
          pageSize: 100 // 获取所有仓库
        }
      });

      if (result.code === 200) {
        let list = result.data.records;
        setWarehouseList(list);
        setWarehouseId(list[0]?.id);
      } else {
        message.error('获取仓库列表失败: ' + result.msg);
      }
    } catch (error) {
      message.error('获取仓库列表失败');
    }
  };
  useEffect(() => {
      fetchWarehouseList();
    }, []);
  // Use real API data instead of mock data
  useEffect(() => {
    fetchData();
  }, [currYear, currMonth, page, pageSize, warehouseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Replace mock data with real API call
      const result = await request(`/api/stat/lowValueItem/statistics`, {
        method: 'POST',
        data: {
          year: currYear,
          month: currMonth,
          pageNum: page,
          pageSize: pageSize,
          libId: warehouseId
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
      const result = await request<UserQueryResponse>('/api/user/getLibManager', {
        method: 'GET',
        params: {
          libId: warehouseId
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
      const result = await request<UserQueryResponse>('/api/user/getOtherLibManager', {
        method: 'GET',
        params: {
          libId: warehouseId
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
      const response = await request('/api/stat/download/lowValueItem', {
        method: 'POST',
        data: {
          year: currYear,
          month: currMonth,
          stockTakerId: selectedInventoryTaker,
          auditorId: selectedSupervisor,
          libId: warehouseId
        },
        responseType: 'blob' // Important for handling file downloads
      });
      // Create download link and trigger download
      const blob = new Blob([response]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `低值易耗品盘存表_${currYear}年${currMonth}月.pdf`; // Assuming it's a PDF file

      link.href = url;
      link.download = fileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('数据导出成功');
      setIsModalVisible(false);
      setSelectedInventoryTaker(undefined);
      setSelectedSupervisor(undefined);
    } catch (error) {
      message.error('数据导出失败');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedInventoryTaker(undefined);
    setSelectedSupervisor(undefined);
  };
  const showWarehouseName = () => {
    const warehouse = warehouseList.find(wh => wh.id === warehouseId);
    return warehouse ? warehouse.databaseName : '未知仓库';
  }
  const columns: ProColumns<DataType>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 80,
    },
    {
      title: '商品名称',
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
          dataIndex: 'openingQuantity',
          valueType: 'digit',
          width: 100,
        },
        {
          title: '金额',
          dataIndex: 'openingAmount',
          valueType: 'money',
          width: 100,
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
        },
      ],
    },
    {
      title: '期末数',
      children: [
        {
          title: '数量',
          dataIndex: 'closingQuantity',
          valueType: 'digit',
          width: 100,
        },
        {
          title: '金额',
          dataIndex: 'closingAmount',
          valueType: 'money',
          width: 100,
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
        <Form.Item label="选择仓库" style={{ marginTop: 16 }}>
          {/* 仓库下拉框 */}
          <Select
            key="warehouse"
            style={{ width: 120 }}
            value={warehouseId}
            filterOption={(input, option) =>
              String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              String(optionA?.children ?? '').toLowerCase().localeCompare(String(optionB?.children ?? '').toLowerCase())
            }
            onChange={(value) => setWarehouseId(value)}
          >
            {warehouseList.map(warehouse => (
              <Option key={warehouse.id} value={warehouse.id} >
                {warehouse.databaseName}
              </Option>
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
        onChange={(pagination) => {
          setPage(pagination.current || 1);
          setPageSize(pagination.pageSize || 10);
        }}
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
            style={{ width: "100%" }}
            value={selectedInventoryTaker}
            onChange={setSelectedInventoryTaker}
          >
            {inventoryTakers.map((user) => (
              <Option key={user.userId} value={user.userId}>
                {user.name}
              </Option>
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
