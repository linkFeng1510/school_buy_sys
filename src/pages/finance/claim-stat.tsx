
import React, { useEffect } from 'react';
import { Button, Card, Col, Form, Row, Select, Space, message } from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';

const ApplicationListPage: React.FC = () => {

  const [dataList, setListData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [currMonth, setCurrMonth] = React.useState(9);
  const [currYear, setCurrYear] = React.useState(2025);

  useEffect(() => {
    // Fetch data when component mounts
    fetchData();
  }, []);
  const fetchData = async () => {
    // Replace with your actual API endpoint
    setLoading(true);
    try {
      const params: any = {
        pageNum: page,
        pageSize: pageSize,
        isAdmin: true,
        year: currYear,
        month: currMonth
      };


      // const response = await request('/api/stat/lowValueItem', {
      //   method: 'POST',
      //   data: params
      // });
      // const response = await request('/api/stat/fixedAsset', {
      //   method: 'POST',
      //   data: params
      // });
      // const response = await request('/api/stat/lowValueOut', {
      //   method: 'POST',
      //   data: params
      // });
      const response = await request('/api/stat/fixedAssetOut', {
        method: 'POST',
        data: params
      });

      if (response.code === 200) {
        let responseData = response.data.records
        setListData(responseData);
        setTotal(response.data.total || 0);
      } else {
        message.error(response.msg || '获取数据失败');
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
  return (
    <PageContainer
    >
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="选择时间" style={{ marginTop: 16 }}>
          <Select key="year" style={{ width: 120 }} value={currYear} defaultValue={currYear} onChange={(value) => { setCurrYear(value); }}>
            <Select.Option value="2025">2025年</Select.Option>
            <Select.Option value="2024">2024年</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="选择月份" style={{ marginTop: 16 }}>
          <Select key="month" style={{ width: 120 }} value={currMonth} defaultValue={currMonth} onChange={(value) => { setCurrMonth(value); }}>
            <Select.Option value="1">1月</Select.Option>
            <Select.Option value="2">2月</Select.Option>
            <Select.Option value="3">3月</Select.Option>
            <Select.Option value="4">4月</Select.Option>
            <Select.Option value="5">5月</Select.Option>
            <Select.Option value="6">6月</Select.Option>
            <Select.Option value="7">7月</Select.Option>
            <Select.Option value="8">8月</Select.Option>
            <Select.Option value="9">9月</Select.Option>
            <Select.Option value="10">10月</Select.Option>
            <Select.Option value="11">11月</Select.Option>
            <Select.Option value="12">12月</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item style={{ marginTop: 16 }}>
          <Button key="search" style={{ padding: '0 16px' }} onClick={fetchData}>
            搜索
          </Button>
        </Form.Item>
      </Form>
      <ProTable columns={[
        {
          title: '资产名称',
          dataIndex: 'productName',
          valueType: 'text',
          width: 200,
        },
        {
          title: '品牌',
          dataIndex: 'brandName',
          valueType: 'text',
          width: 200,
        },
        {
          title: '规格型号',
          dataIndex: 'spec',
          valueType: 'text',
        },
        {
          title: '单位',
          dataIndex: 'unit',
          valueType: 'text',
        },
        {
          title: '数量',
          dataIndex: 'totalQuantity',
          valueType: 'text',
        },
        {
          title: '单价',
          dataIndex: 'price',
          valueType: 'text',
        },
        {
          title: '总金额',
          dataIndex: 'totalAmount',
          valueType: 'text',
        },
      ]} dataSource={dataList} pagination={{ total, current: page, pageSize }} search={false} />
    </PageContainer>
  );
};

export default ApplicationListPage;
