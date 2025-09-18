import { Key, useState } from 'react';
import { Modal, Button, message, Form, Radio, InputNumber, Card } from 'antd';
import { ItemData } from './commonHooks';
import { commonUpdateStatusRequest } from './commonRequest';
import { request, useModel } from '@umijs/max';

export const useHandleShelf = () => {
  const [form] = Form.useForm();
  const [maxQuantity] = useState(30); // 最多可上架数量
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const handleShelf = (modal: any, item: ItemData) => {
    const onFinish = async (values: any) => {
      const params = {
        userId: currentUser?.userId,
        userName: currentUser?.name,
        itemId: item.itemId,
        itemStatus: item.itemStatus,
        onlineQuantity: values.items[0].onlineQuantity
      };
      const response = await request('/api/item/update', {
        method: 'POST',
        data: params
      })
      if (response.success) {
        item.updateList();
        form.resetFields();
        message.success('修改成功');
      } else {
        form.resetFields();
      }
    };

    const config = {
      title: '修改上架数量',
      content: (
        // form太长了，超出部分滚动条显示
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ items: [item] }}
          >
            <Form.List name="items">
              {(fields) => (
                <>
                  {fields.map((field) => {
                    const detail = item?.[field.name] || item;
                    return (
                      <Card key={field.key} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
                        >
                          <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={`${detail.coverImageUrl}`} alt="物品" style={{ width: 48, height: 48 }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>物品名:{detail.productName}</div>
                            <div style={{ color: '#888', fontSize: 12 }}>规格：{detail.spec}</div>
                            <div style={{ color: '#888', fontSize: 12 }}>库存数量:{detail.stockQuantity}</div>
                            <div style={{ color: '#888', fontSize: 12 }}>品牌：{(detail.brandName) || '无'}</div>
                            <div style={{ color: '#888', fontSize: 12 }}>供应商：{(detail.supplierName) || '无'}</div>
                            <div style={{ color: '#888', fontSize: 12 }}>分类：{(detail.categoryLevel1Name) || '无'} - {detail.categoryLevel2Name || '无'}</div>
                            <div style={{ color: '#888', fontSize: 12 }}>已上架数量:{detail.onlineQuantity}</div>
                          </div>
                        </div>
                        <Form.Item
                          {...field}
                          name={[field.name, 'onlineQuantity']}
                          label="请输入数量"
                          rules={[{ required: true, message: '请输入数量' }]}
                        >
                          <InputNumber parser={(value) => parseInt(value || '0', 10)} min={1} style={{ width: '100%' }} max={detail.stockQuantity - detail.onlineQuantity} placeholder={`最多可上架数量：${detail.stockQuantity - detail.onlineQuantity}`} />
                        </Form.Item>
                      </Card>
                    )
                  })}
                </>
              )}
            </Form.List>
          </Form>
        </div>
      ),
      onOk: () => {
        return new Promise((resolve, reject) => {
          form
            .validateFields()
            .then(() => {
              form.submit();
              resolve(true);
            })
            .catch((err) => {
              reject(err);
            });
        });
      },
      onCancel: () => { },
      okText: '确认',
      cancelText: '取消'
    };

    modal.confirm(config);
  };

  return { handleShelf };
};
