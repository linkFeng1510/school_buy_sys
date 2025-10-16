import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Select, Space, message } from 'antd';
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import * as XLSX from 'xlsx';

// Mock 数据模拟
const generateMockData = (count: number, year: number, month: number): any[] => {
  const products = [
    '笔记本电脑', '打印机', '办公桌', '椅子', '键盘', '鼠标', '显示器', '投影仪', '扫描仪', '电话机',
  ];
  const brands = ['联想', '惠普', '戴尔', '华为', '苹果', '小米', '华硕', '三星', '宏碁', '清华同方'];
  const models = ['ThinkPad X1', 'HP LaserJet', 'Dell OptiPlex', 'MateBook', 'MacBook Pro', 'Redmi Book', 'ASUS ZenBook', 'Samsung Galaxy', 'Acer Swift', 'Tongfang T600'];
  const units = ['台', '台', '张', '把', '个', '个', '台', '台', '台', '部'];
  const prices = [5000, 2000, 800, 300, 100, 50, 3000, 5000, 2000, 800];

  // 模拟多个入库批次
  const batches = Array.from({ length: 3 }, (_, i) => ({
    quantity: Math.floor(Math.random() * 50),
    price: prices[Math.floor(Math.random() * prices.length)],
  }));

  return Array.from({ length: count }, (_, i) => {
    const batch = batches[i % batches.length];
    const totalQuantity = batch.quantity;
    const totalPrice = batch.price * totalQuantity;

    return {
      id: `item-${i + 1}`,
      productName: products[i % products.length],
      brand: brands[i % brands.length],
      model: models[i % models.length],
      unit: units[i % units.length],
      quantity: totalQuantity,
      price: batch.price,
      totalAmount: totalPrice,
    };
  });
};

interface DataType {
  id: string;
  productName: string;
  brand: string;
  model: string;
  unit: string;
  quantity: number;
  price: number;
  totalAmount: number;
}

const ApplicationListPage: React.FC = () => {
  const [dataList, setListData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currMonth, setCurrMonth] = useState<number>(new Date().getMonth() + 1); // 当前月
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

      const mockData = generateMockData(16, currYear, currMonth); // 生成 16 条 mock 数据
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
    if (!dataList || dataList.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }

    // 构建导出数据
    const exportData = dataList.map((item, index) => ({
      '序号': index + 1,
      '物品名称': item.productName,
      '品牌': item.brand,
      '规格型号': item.model,
      '单位': item.unit,
      '数量': item.quantity,
      '单价': item.price,
      '总金额': item.totalAmount,
    }));

    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const worksheetName = '低值耗材出库统计';
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

    // 导出文件
    XLSX.writeFile(workbook, `${worksheetName}_${currYear}年${currMonth}月.xlsx`);
    message.success('导出成功！');
  };

  const columns: ProColumns<DataType>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 80,
    },
    {
      title: '物品名称',
      dataIndex: 'productName',
      valueType: 'text',
      width: 200,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      valueType: 'text',
      width: 120,
    },
    {
      title: '规格型号',
      dataIndex: 'model',
      valueType: 'text',
      width: 150,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      valueType: 'text',
      width: 100,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      valueType: 'digit',
      width: 100,
    },
    {
      title: '单价',
      dataIndex: 'price',
      valueType: 'digit',
      width: 100,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      valueType: 'money',
      width: 120,
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
            value={currMonth}
            onChange={(value) => setCurrMonth(value)}
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
