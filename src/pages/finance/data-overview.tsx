import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Select, Space, message } from 'antd';
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { request } from '@umijs/max';

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
    item.initialQuantity,
    item.initialAmount,
    item.increaseQuantity,
    item.increaseAmount,
    item.decreaseQuantity,
    item.decreaseAmount,
    item.finalQuantity,
    item.finalAmount
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
  initialQuantity: number;
  initialAmount: number;
  increaseQuantity: number;
  increaseAmount: number;
  decreaseQuantity: number;
  decreaseAmount: number;
  finalQuantity: number;
  finalAmount: number;
}

// Define API response interface
interface ApiResponse {
  code: number;
  data: DataType[];
  message: string;
}

const ApplicationListPage: React.FC = () => {
  const [dataList, setListData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // 当前月前一个月

  const [currMonth, setCurrMonth] = useState<number>(new Date().getMonth());
  // 当前年
  const [currYear, setCurrYear] = useState<number>(new Date().getFullYear()); // 当前年

  // Use real API data instead of mock data
  useEffect(() => {
    fetchData();
  }, [currYear, currMonth, page, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Replace mock data with real API call
      const result = await request(`/api/stat/lowValueItem/statistics`,{
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

  const handleExport = async () => {
    try {
      const response = await request('/api/stat/download/lowValueItem', {
        method: 'POST',
        data: {
          year: currYear,
          month: currMonth
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
    } catch (error) {
      message.error('数据导出失败');
    }
  };

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
          dataIndex: 'initialQuantity',
          valueType: 'digit',
          width: 100,
        },
        {
          title: '金额',
          dataIndex: 'initialAmount',
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
          dataIndex: 'finalQuantity',
          valueType: 'digit',
          width: 100,
        },
        {
          title: '金额',
          dataIndex: 'finalAmount',
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
    </PageContainer>
  );
};

export default ApplicationListPage;
