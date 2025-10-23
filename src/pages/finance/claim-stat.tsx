import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Select, Space, message } from 'antd';
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import * as XLSX from 'xlsx';

// Add axios for API requests
import { request } from '@umijs/max';

interface DataType {
  id: string;
  productName: string;
  brandName: string;
  spec: string;
  unit: string;
  totalQuantity: number;
  price: number;
  totalAmount: number;
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

  // Fetch data from API instead of using mock data
  useEffect(() => {
    fetchData();
  }, [page, pageSize, currYear, currMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Replace mock data with API call
      const response = await request('api/stat/lowValueItem', {
        method: 'POST',
        data: {
          year: currYear,
          month: currMonth,
          pageNum: page,
          pageSize: pageSize,
        }
      });

      // Assuming the API returns data in response.data
      const apiData = response.data;
      setListData(apiData.records || []);
      setTotal(apiData.total || 0);
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
      const response = await request('/api/stat/lowValueItem/download', {
        method: 'POST',
        data: {
          year: currYear,
          month: currMonth
        },
        responseType: 'blob' // Important for handling file download
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `低值耗材入库统计_${currYear}年${currMonth}月.pdf`;

      link.href = url;
      link.download = fileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('导出成功！');
    } catch (error) {
      message.error('导出失败，请重试');
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
      title: '物品名称',
      dataIndex: 'productName',
      valueType: 'text',
      width: 200,
    },
    {
      title: '品牌',
      dataIndex: 'brandName',
      valueType: 'text',
      width: 120,
    },
    {
      title: '规格型号',
      dataIndex: 'spec',
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
      dataIndex: 'totalQuantity',
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
  // 只能选择当前时间以前的年和月份
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
