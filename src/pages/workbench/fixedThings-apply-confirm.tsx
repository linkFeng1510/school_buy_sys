

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Tag, List, Modal, Typography, Empty, Input, message, Space, Pagination, Row, Col, Form } from 'antd';
import {
  PageContainer,
} from '@ant-design/pro-components';
import { request } from 'umi';
import PurchaseItemCard from './components/ProductItem';
const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'wait', label: '待审核' },
  { key: 'sign', label: '待签收' },
  { key: 'reject', label: '已驳回' },
  { key: 'complete', label: '已完成' },
];

const ApplyConfirm: React.FC = () => {
  const [tab, setTab] = useState('all');
  const [username, setApplyUser] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [listData, setListData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Map tab keys to shelfStatus values for API
  const getShelfStatusByTab = () => {
    switch (tab) {
      case 'wait': return 0;  // 未申领
      case 'complete': return 3;  // 已申领
      case 'done': return 1;  // 已通过
      case 'reject': return 2; // 被驳回
      case 'sign': return 4; // 待签收
      default: return undefined; // 不过滤
    }
  };

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        pageNum: page,
        pageSize: pageSize,
        isAdmin: true,
        isFixedAsset: 1
      };

      // Add filters if they exist
      if (username) {
        params.username = username;
      }

      if (tab !== 'all') {
        params.claimStatus = getShelfStatusByTab();
      }

      const response = await request('/api/claim/list', {
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

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [tab, username, page, pageSize]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [tab, username]);


  return (
    <PageContainer >
      {/* 搜索条件 */}
      {/* <Form
        layout="inline"
        onFinish={() => {
          setPage(1)
          fetchData();
        }}
        initialValues={{ user: username }}
        style={{ marginBottom: 8 }}
      >
        <Form.Item style={{ marginTop: 16 }} name="user">
          <Input
            placeholder="请输入用户"
            allowClear
            style={{ width: 160 }}
            onChange={e => { setApplyUser(e.target.value); setPage(1); }}
            value={username}
          />
        </Form.Item>
        <Form.Item style={{ marginTop: 16 }} >
          <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
            查询
          </Button>
          <Button
            onClick={() => {
              setApplyUser('');
              setPage(1);
            }}
          >
            重置
          </Button>
        </Form.Item>
      </Form> */}
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
              renderItem={item => <PurchaseItemCard key={item.id} item={item} updateList={fetchData} isAdmin={true} isProduct={false} />}
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

export default ApplyConfirm;
