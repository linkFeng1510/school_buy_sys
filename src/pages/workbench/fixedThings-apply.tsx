import React, { useState, useEffect, ReactNode } from 'react';
import { Card, Button, Modal, List, message, Badge, Drawer, InputNumber, Typography, Popconfirm, Form, Input, Row, Col } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { request, useModel } from '@umijs/max';
import ProductItem from '@/components/commonListItem';

// Define the type for goods items
interface GoodsItem {
  supplierName: ReactNode;
  brandName: ReactNode;
  itemId: number | null | undefined;
  purchasePrice: ReactNode;
  coverImageUrl: string;
  productName: any;
  id: number;
  spec: string;
  price: number;
  unit: string;
  onlineQuantity: number;
}

const ApplyRecord: React.FC = () => {
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [goods, setGoods] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [addItem, setAddItem] = useState<any>(null);
  const [addNum, setAddNum] = useState<number>(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  // Fetch goods data from API
  useEffect(() => {
    fetchGoods();
  }, []);

  const fetchGoods = async () => {
    setLoading(true);
    try {
      const result = await request('/api/item/list', {
        method: 'POST',
        data: {
          isAdmin: true,
          pageNum: 1,
          pageSize: 1000,
          itemName: search || '',
        }
      });

      // Map API response to component expected structure
      const items = result.data?.records || [];
      // 过滤掉可申领数量小于等于0的物品
      const currGoods = items.filter((item: { onlineQuantity: number }) => item.onlineQuantity > 0);
      setGoods(currGoods);
    } catch (error) {
      message.error('获取物品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索过滤
  const filteredGoods = goods.filter(g => g.productName.includes(search));

  // 加入申领车
  const handleAdd = (item: any) => {
    setAddItem(item);
    setAddNum(1);
    setAddModal(true);
  };
  const handleAddConfirm = () => {
    if (!addNum || addNum < 1) {
      message.warning('请输入正确的数量');
      return;
    }
    if (addNum > addItem.onlineQuantity) {
      message.warning('超出可申领数量');
      return;
    }
    const exist = cart.find((c) => c.itemId === addItem.itemId);
    let newCart;
    if (exist) {
      newCart = cart.map(c => c.itemId === addItem.itemId ? { ...c, num: c.num + addNum } : c);
    } else {
      newCart = [...cart, { ...addItem, num: addNum }];
    }
    setCart(newCart);
    setAddModal(false);
    message.success('已加入申领车');
  };

  // 申领车操作
  const handleNumChange = (id: number, num: number) => {
    setCart(cart.map(c => c.itemId === id ? { ...c, num } : c));
  };
  const handleRemove = (id: number) => {
    setCart(cart.filter(c => c.itemId !== id));
  };
  const handleClear = () => {
    setCart([]);
  };

  // 提交申领
  const handleSubmit = async () => {
    if (cart.length === 0) {
      message.warning('请先添加物品');
      return;
    }
    const items = cart.map(curr => {
      return {
        "itemId": curr.itemId,
        "claimQuantity": curr.num
      }
    })
    const params = {
      "userId": currentUser?.userId,
      "username": currentUser?.name,
      "items": items
    }
    // Here you would typically send the cart data to the backend
    const result = await request('/api/claim/add', {
      method: 'POST',
      data: params
    })
    if (result.success) {
      message.success('提交成功');
      setCart([]);
      setDrawerOpen(false);
      fetchGoods();
    } else {
      message.error(result.msg || '提交失败');
    }
  };

  return (
    <PageContainer >
      {/* 搜索栏 */}
      <Form
        form={form}
        layout="inline"
        style={{ marginBottom: 16 }}
        onFinish={values => {
          setSearch(values.search || '');
          fetchGoods();
        }}
        initialValues={{ search }}
      >
        <Form.Item name="search" >
          <Input placeholder="搜索物品名称" allowClear style={{ width: 220 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">查询</Button>
          <Button
            onClick={() => {
              setSearch('');
              form.resetFields();
              fetchGoods();
            }}
            loading={loading}
            style={{ marginLeft: 8 }}
          >
            重置
          </Button>
        </Form.Item>
      </Form>

      {/* 物品列表 */}
      <List
        loading={loading}
        dataSource={filteredGoods}
        renderItem={item => (
          <Card
            style={{ marginBottom: 16 }}
            bodyStyle={{ display: 'flex', alignItems: 'center', padding: 16 }}
            key={item.itemId}
          >
            <ProductItem detail={item} />
            <Button type="primary" onClick={() => handleAdd(item)}>加入申领车</Button>
          </Card>
        )}
        style={{ background: 'none' }}
      />

      {/* 申领车按钮 */}
      <Row style={{ position: 'fixed', left: 0, bottom: 0, width: '100%', maxWidth: 480, background: '#fff', borderTop: '1px solid #eee', padding: 8, zIndex: 101, margin: 0 }} justify="center">
        <Col span={24}>
          <Button
            type="primary"
            icon={<Badge count={cart.length} size="small"><ShoppingCartOutlined twoToneColor="#e22020" /></Badge>}
            style={{ width: '100%' }}
            onClick={() => setDrawerOpen(true)}
          >去提交</Button>
        </Col>
      </Row>

      {/* 加入申领车弹窗 */}
      <Modal
        open={addModal}
        onCancel={() => setAddModal(false)}
        onOk={handleAddConfirm}
        okText="确认加入"
        cancelText="取消"
        centered
        destroyOnClose
      >
        {addItem && (
          <div style={{ display: 'flex', alignItems: 'center', padding: 16 }}>
            <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={`${addItem.coverImageUrl}`} alt="物品" style={{ width: 48, height: 48 }} />
            </div>
            <div style={{ flex: 1, fontSize: 12, color: '#999' }}>
              <div style={{ fontWeight: 500, color: '#111' }}>{addItem.productName}</div>
              <div>规格:{addItem.spec || '无'}</div>
              <div>单价:¥{addItem.price || 0}元/{addItem.unit || '件'}</div>
              <div>品牌：{(addItem.brandName) || '无'}</div>
              <div>供应商：{(addItem.supplierName) || '无'}</div>
              <div>可申领数量:{addItem.onlineQuantity || 0}</div>
              <div style={{ marginTop: 8 }}>
                <InputNumber
                  parser={(value) => parseInt(value || '0', 10)}
                  min={1}
                  max={addItem.onlineQuantity}
                  value={addNum}
                  onChange={v => setAddNum(Number(v))}
                  style={{ width: 160 }}
                  placeholder="请输入申领数量"
                />
              </div>
            </div>

          </div>
        )}
      </Modal>

      {/* 申领车抽屉 */}
      <Drawer
        title={<span>已添加物品 <Button size="small" danger icon={<DeleteOutlined />} onClick={handleClear}>清空</Button></span>}
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
        footer={
          <Button type="primary" block onClick={handleSubmit}>去提交</Button>
        }
      >
        {cart.length === 0 ? (
          <Typography.Text type="secondary">暂无已添加物品</Typography.Text>
        ) : (
          <List
            dataSource={cart}
            renderItem={item => (
              <List.Item
                actions={[
                  <InputNumber
                    parser={(value) => parseInt(value || '0', 10)}
                    min={1}
                    max={item.onlineQuantity}
                    value={item.num}
                    onChange={v => handleNumChange(item.itemId, Number(v))}
                    style={{ width: 60 }}
                  />,
                  <Popconfirm title="确定移除该物品？" onConfirm={() => handleRemove(item.itemId)}>
                    <Button size="small" icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`${addItem.coverImageUrl}`} alt="物品" style={{ width: 48, height: 48 }} />
                  </div>}
                  title={`${item.brandName}${item.productName}${item.spec}`}
                  description={
                    <div>
                      <div>单价:{item.unit}  单价：{item.price}元 </div>
                      <div>
                        库存数量:{item.onlineQuantity}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
            style={{ background: 'none' }}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ApplyRecord;
