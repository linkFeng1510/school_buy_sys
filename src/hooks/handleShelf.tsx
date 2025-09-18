import { Key, useState } from 'react';
import { Modal, Button, message, Form, Radio, InputNumber, Card } from 'antd';
import { ItemData } from './commonHooks';
import { commonUpdateStatusRequest } from './commonRequest';
import { request, useModel } from '@umijs/max';
import ProductItem from '@/components/commonListItem';

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
                        <ProductItem detail={detail} />
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
