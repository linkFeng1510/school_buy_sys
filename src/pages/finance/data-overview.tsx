import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Select, Space, message } from 'antd';
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';

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

// Mock 数据模拟
const generateMockData = (count: number): any[] => {
  const products = [
    '笔记本电脑', '打印机', '办公桌', '椅子', '键盘', '鼠标', '显示器', '投影仪', '扫描仪', '电话机',
  ];
  const units = ['台', '台', '张', '把', '个', '个', '台', '台', '台', '部'];
  const prices = [5000, 2000, 800, 300, 100, 50, 3000, 5000, 2000, 800];

  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    productName: products[i % products.length],
    unit: units[i % units.length],
    price: prices[i % prices.length],
    initialQuantity: Math.floor(Math.random() * 100),
    initialAmount: Math.floor(Math.random() * 10000),
    increaseQuantity: Math.floor(Math.random() * 50),
    increaseAmount: Math.floor(Math.random() * 5000),
    decreaseQuantity: Math.floor(Math.random() * 30),
    decreaseAmount: Math.floor(Math.random() * 3000),
    finalQuantity: Math.floor(Math.random() * 120),
    finalAmount: Math.floor(Math.random() * 15000),
  }));
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

const ApplicationListPage: React.FC = () => {
  const [dataList, setListData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currMonth, setCurrMonth] = useState<number>(new Date().getMonth()); // 当前月前一个月
  const [currYear, setCurrYear] = useState<number>(new Date().getFullYear()); // 当前年

  // 使用 mock 数据
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData = generateMockData(16); // 生成 10 条 mock 数据
      setListData(mockData);
      setTotal(mockData.length);
    } catch (error) {
      message.error('获取数据失败');
      setListData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (dataList.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    try {
      const csvContent = convertToCSV(dataList);
      const sheetName = '低值易耗品盘存表';
      const fileName = `${sheetName}_${currYear}年${currMonth + 1}月.csv`;
      downloadCSV(csvContent, fileName);
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
              <Select.Option key={new Date().getFullYear() - i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}年
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="选择月份" style={{ marginTop: 16 }}>
          <Select
            key="month"
            style={{ width: 120 }}
            value={currMonth + 1}
            onChange={(value) => setCurrMonth(value - 1)}
          >
            {[...Array(12)].map((_, i) => (
              <Select.Option key={i + 1} value={i + 1}>
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
    </PageContainer>
  );
};

export default ApplicationListPage;
