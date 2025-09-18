import React from 'react';
import { Button, Card, Col, Form, Row, Select, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { Line } from '@ant-design/charts';

const DashboardPage: React.FC = () => {
  // 采购数据概览图表数据
  const data1 = [
    { year: '2019-01', value: 800 },
    { year: '2019-02', value: 950 },
    { year: '2019-03', value: 700 },
    { year: '2019-04', value: 1100 },
    { year: '2019-05', value: 850 },
    { year: '2019-06', value: 600 },
  ];

  // 申领数据概览图表数据
  const data2 = [
    { year: '2019-01', value: 700 },
    { year: '2019-02', value: 850 },
    { year: '2019-03', value: 1000 },
    { year: '2019-04', value: 900 },
    { year: '2019-05', value: 750 },
    { year: '2019-06', value: 650 },
  ];

  const config1 = {
    data: data1,
    xField: 'year',
    yField: 'value',
    color: ['#5B8FF9', '#87d068'],
    xAxis: { type: 'time' },
    yAxis: { label: { formatter: (v: number) => `${v}` } },
    legend: { position: 'top' },
    smooth: true,
  };

  const config2 = {
    data: data2,
    xField: 'year',
    yField: 'value',
    color: ['#5B8FF9', '#87d068'],
    xAxis: { type: 'time' },
    yAxis: { label: { formatter: (v: number) => `${v}` } },
    legend: { position: 'top' },
    smooth: true,
  };

  return (
    <PageContainer
      title={false} // 移除默认标题
    >
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="选择时间" style={{ marginTop: 16 }}>
          <Select key="year" style={{ width: 120 }}>
            <Select.Option value="2025">2025年</Select.Option>
            <Select.Option value="2024">2024年</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="选择月份" style={{ marginTop: 16 }}>
          <Select key="month" style={{ width: 120 }}>
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
          <Button key="search" style={{ padding: '0 16px' }}>
            搜索
          </Button>
        </Form.Item>
      </Form>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card >
            <h3>采购数据概览</h3>
            <p>采购物品总数：267件</p>
            <p>采购物品总价值：4678元</p>
            <Line {...config1} height={300} />
          </Card>
        </Col>
        <Col span={12}>
          <Card >
            <h3>申领数据概览</h3>
            <p>申领物品总数：267件</p>
            <p>申领物品总价值：4678元</p>
            <Line {...config2} height={300} />
          </Card>
        </Col>


      </Row>
    </PageContainer>
  );
};

export default DashboardPage;
