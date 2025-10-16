import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Tag, List, Modal, Typography, Empty, Input, message, Space, Pagination, Row, Col, Form } from 'antd';
import {
  PageContainer,
} from '@ant-design/pro-components';
import { request } from 'umi';
import PurchaseItemCard from './components/ProductItem';
const statusTabs = [
  { key: '', label: '全部' },
  { key: '0', label: '已上架' },
  { key: '2', label: '无库存' },
  { key: '1', label: '未上架' },
];

const claim: React.FC = () => {
  const [tab, setTab] = useState('');
  const [searchTxt, setSearchTxt] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [listData, setListData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        pageNum: page,
        pageSize: pageSize,
        itemStatus: tab,
        isAdmin: false,
        isFixedAsset: 1
      };
      // Add filters if they exist
      if (searchTxt) {
        params.itemName = searchTxt;
      }
      const response = await request('/api/item/list', {
        method: 'POST',
        data: params
      });

      if (response.code === 200) {
        setListData(response.data.records || []);
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

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [searchTxt, page, pageSize, tab]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTxt, tab]);


  return (
    <PageContainer >
      {/* 搜索条件 */}
      <Form
        layout="inline"
        style={{ marginBottom: 8 }}
      >
        <Form.Item style={{ marginTop: 16 }} >
          <Input
          value={searchTxt}
          onChange={e => setSearchTxt(e.target.value)}
            placeholder="请输入品牌名、商品名"
            allowClear
            style={{ width: 180 }}
          />
        </Form.Item>
        <Form.Item style={{ marginTop: 16 }} >
          <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
            查询
          </Button>
          <Button
            onClick={() => {
              setSearchTxt('');
              //刷新页面

            }}
          >
            重置
          </Button>

        </Form.Item>
      </Form>
      <Tabs
        activeKey={tab}
        onChange={key => { setTab(key); setPage(1); }}
        items={statusTabs}
        style={{ margin: 0, padding: '0 8px' }}
      />
      <div style={{ padding: 8 }}>
        {total === 0 && !loading ? (
          <Card style={{ marginTop: 32, textAlign: 'center' }}>
            <Empty description={<span>暂无数据</span>} />
          </Card>
        ) : (
          <>
            <List
              loading={loading}
              dataSource={listData}
                renderItem={item => <PurchaseItemCard key={item.itemId} item={item} updateList={fetchData} isAdmin={false} isProduct={true} editFlag={true} />}
            />
            {/* 分页 */}
            <Row justify="end" style={{ marginTop: 16 }}>
              <Col>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger
                  pageSizeOptions={["5", "10", "20", "50"]}
                  showTotal={t => `共 ${t} 条`}
                  onChange={(p, ps) => {
                    setPage(p);
                    setPageSize(ps);
                  }}
                  disabled={loading}
                />
              </Col>
            </Row>
          </>
        )}
      </div>


    </PageContainer>
  );
};

export default claim;
