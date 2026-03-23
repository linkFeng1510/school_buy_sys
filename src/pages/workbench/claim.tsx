import React, { useState, useEffect, use } from 'react';
import { Card, Tabs, Button, Tag, List, Modal, Typography, Empty, Input, message, Space, Pagination, Row, Col, Form, Select } from 'antd';
import {
  PageContainer,
} from '@ant-design/pro-components';
import {useModel } from '@umijs/max';
import { request } from 'umi';
const { Option } = Select;
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
  const [warehouseSearchTxt, setWarehouseSearchTxt] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [listData, setListData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin,setIsSuperAdmin] = useState<boolean>(false);//假设不是超级管理员

  const [warehouseList, setWarehouseList] = useState<any[]>([]);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
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
      } else {
        message.error('获取仓库列表失败: ' + result.msg);
      }
    } catch (error) {
      message.error('获取仓库列表失败');
    }
  };
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        pageNum: page,
        pageSize: pageSize,
        itemStatus: tab,
        isAdmin: false,
        isFixedAsset: 0
      };
      // Add filters if they exist
      if (searchTxt) {
        params.itemName = searchTxt;
      }
      if (warehouseSearchTxt) {
        params.libId = warehouseSearchTxt;
      }
      if(!isSuperAdmin){
        if ((currentUser as any)?.libId) {
          params.libId = (currentUser as any).libId;
        }
      }
      setListData([]);
      setTotal(0);
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
  useEffect(() => {
    setIsSuperAdmin(currentUser?.name === 'admin');

  }, []);
  useEffect(() => {
    fetchWarehouseList();
  }, [isSuperAdmin]);
  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [searchTxt, warehouseSearchTxt, page, pageSize, tab]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTxt, warehouseSearchTxt, tab]);


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
        {isSuperAdmin&&<Form.Item style={{ marginTop: 16 }} label="所属库">
          <Select
            placeholder="请选择所属库"
            filterOption={(input, option) =>
              String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{width:'200px'}}
            onChange={val => setWarehouseSearchTxt(val)}
            filterSort={(optionA, optionB) =>
              String(optionA?.children ?? '').toLowerCase().localeCompare(String(optionB?.children ?? '').toLowerCase())
            }
            allowClear
          >
            {warehouseList.map(warehouse => (
              <Option key={warehouse.id} value={warehouse.id}>
                {warehouse.databaseName}
              </Option>
            ))}
          </Select>
        </Form.Item>}
        <Form.Item style={{ marginTop: 16 }} >
          <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
            查询
          </Button>
          <Button
            onClick={() => {
              setSearchTxt('');
              setWarehouseSearchTxt('');
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
