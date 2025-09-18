// src/hooks/callbacks.ts
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message, List, InputNumber, Radio, Card, Select } from 'antd';
import { ItemData } from './commonHooks'; // 假设与 commonHooks.tsx 共享接口
import { request } from '@umijs/max';
import { productNumHandler } from '@/hooks/commonRequest';
import { title } from 'process';
const { Option } = Select;

interface User {
  userId: number;
  id: number;
  name: string;
}

export const useHandleDistribute = () => {
  const [form] = Form.useForm();
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await request('/api/user/list', {
        method: 'POST',
        data: {
          pageNum: 1,
          pageSize: 100,
          status: '1',
        },
      });
      return response.data.records || [];
    } catch (error) {
      message.error('获取用户列表失败');
      return [];
    } finally {
      setLoadingUsers(false);
    }
  };
  const handleDistribute = async (modal: any, currOrder: ItemData) => {
    let receiveApplyUserId: null | undefined = null;
    const setReceiveApplyUserId = (val: null | undefined) => {
      receiveApplyUserId = val
    }
    // Show modal immediately with loading state
    const modalInstance = modal.confirm({
      title: '分发物品', content: (<>
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ items: currOrder.items || [currOrder] || [] }}
          >
            <Form.List name="items">
              {(fields) => (
                <>
                  {fields.map((field) => {
                    const detail = currOrder.items?.[field.name] || currOrder;
                    return (
                      <Card key={field.key} style={{ marginBottom: 16 }}>

                      </Card>
                    )
                  })}
                </>
              )}
            </Form.List>
          </Form>
        </div>
        {productNumHandler(currOrder.items)}
      </>),
      footer: [
        <div style={{ textAlign: 'right' }}>
          <Button onClick={() => {
            Modal.destroyAll()
          }} style={{ marginRight: 8 }}>取消</Button>
          <Button type="primary" onClick={() => {
            form.validateFields().then((values) => {
              const items: any[] = [];
              values.items.forEach((ii: {
                distributeQuantity: number;
                productId: any;
              }) => {
                items.push({
                  // 商品ID
                  "itemId": ii.productId,
                  // 分发数量
                  "distributeQuantity": ii.distributeQuantity || 0
                });
              });
              console.log(receiveApplyUserId, 'receiveApplyUserIdreceiveApplyUserId');
              const params = {
                "orderId": currOrder.orderId,
                items: items,
                receiveApplyUserId: receiveApplyUserId
              }
              request('/api/claim/distribute', { method: 'POST', data: params }).then(() => {
                form.resetFields();
                Modal.destroyAll();
                message.success('分发成功');
                currOrder.updateList()
              });
            }).catch(error => {
              console.error('上传失败:', error);
            })
          }}>确定</Button>
        </div>
      ],
      closable: true,
    });
    // Fetch users and update modal content when data arrives
    const usersData = await fetchUsers();
    // Update modal content with fetched users
    modalInstance.update({
      content: (
        <>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{ items: currOrder.items || [currOrder] || [] }}
            >
              <Form.List name="items">
                {(fields) => (
                  <>
                    {fields.map((field) => {
                      const detail = currOrder.items?.[field.name] || currOrder;
                      return (
                        <Card key={field.key} style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src={`${detail.coverImageUrl}`} alt="物品" style={{ width: 48, height: 48 }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500 }}>{detail.productName}</div>
                              <div style={{ color: '#888', fontSize: 12 }}>规格：{detail.spec} 单价：{detail.price}元/{detail.unit}</div>
                              <div style={{ color: '#888', fontSize: 12 }}>已审领数量: {detail.claimQuantity}</div>
                            </div>
                          </div>
                          {detail.claimQuantity > 1 &&
                            <Form.Item
                              {...field}
                              name={[field.name, 'distributeQuantity']}
                              rules={[{ required: true, message: "请输入分发数量" }]}
                              label={`分发数量：最多可分发${detail.claimQuantity}件`}
                            >
                              <InputNumber parser={(value) => parseInt(value || '0', 10)} min={0} style={{ width: '100%' }} max={detail.claimQuantity} />
                            </Form.Item>}
                        </Card>
                      )
                    })}
                  </>
                )}
              </Form.List>
              <Form.Item
                label="接收人"
                name="applyUser"
                rules={[{ required: true, message: "请选择申购申请人" }]}
                required
              >
                <Select
                  placeholder="请选择申购申请人"
                  loading={loadingUsers}
                  value={receiveApplyUserId}
                  onChange={(val) => {
                    setReceiveApplyUserId(val)
                  }}
                  notFoundContent={usersData.length === 0 && !loadingUsers ? "暂无用户数据" : null}
                >
                  {usersData.map((user: User) => (
                    <Option key={user.userId} value={user.userId}>
                      {user.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </div>
          {productNumHandler(currOrder.items)}
        </>
      ),
    });

  };

  return { handleDistribute };
};
