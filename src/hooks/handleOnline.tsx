import { Modal, Button, message, Form, Radio, InputNumber, Card } from 'antd';
import { ItemData } from './commonHooks';
import { request, useModel } from '@umijs/max';
import { JSX } from 'react/jsx-runtime';
import ProductItem from '@/components/commonListItem';

export const useHandleOnline = () => {
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  let instance: {
    update(config: { title: string; content: JSX.Element; onOk: () => Promise<unknown>; onCancel: () => void; okText: string; cancelText: string; }): unknown; destroy: () => void;
}
  const handleOnline = (modal: any, item: ItemData) => {
    const onFinish = async (values: any) => {
      console.log(values.items[0], 'values.items[0]');
      if (item.stockQuantity < 1){
        message.error('上架数量不能小于1');
        return;
      }
      const params = {
        userId: currentUser?.userId,
        userName: currentUser?.name,
        itemId: item.itemId,
        itemStatus: values.items[0].itemStatus,
        onlineQuantity: item.stockQuantity
      };
      const response = await request('/api/item/update', {
        method: 'POST',
        data: params
      })

      if (response.success) {
        item.updateList();
        message.success('修改成功');
        form.resetFields();
      } else {
        form.resetFields();
      }
    };
    const config = {
      title: '确认上架',
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
                  {fields.map((field,index) => {
                    const detail = item?.[field.name] || item;
                    return (
                      <Card key={field.key} style={{ marginBottom: 16 }}>
                        <ProductItem detail={detail} />
                        <Form.Item
                          {...field}
                          key={field.key}
                          label="请选择是否上架"
                          name={[field.name, 'itemStatus']}
                          rules={[{ required: true, message: '请选择是否上架' }]}
                        >
                          <Radio.Group >
                            <Radio value={0}>上架</Radio>
                            <Radio value={1}>暂不上架</Radio>
                          </Radio.Group>
                        </Form.Item>
                        {/* <Form.Item noStyle shouldUpdate={(prevValues, curValues) =>{
                          return prevValues.items[index].itemStatus !== curValues.items[index].itemStatus
                        } }>
                          {({ getFieldValue }) => {
                            const itemStatus = getFieldValue(['items', index, 'itemStatus']);
                            if (itemStatus === 0) {
                              return (
                                <Form.Item
                                  key={`onlineQuantity-${index}`}
                                  label="上架数量"
                                  name={[field.name, 'onlineQuantity']}
                                  rules={[{ required: true, message: "请输入上架数量" }]}
                                  required
                                >
                                  <InputNumber parser={(value) => parseInt(value || '0', 10)} min={1}   max={detail.stockQuantity - detail.onlineQuantity} />
                                </Form.Item>
                              );
                            }
                            return null;
                          }}
                        </Form.Item> */}
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
        return new Promise( (resolve, reject) => {
          form
            .validateFields()
            .then(async() => {
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
    Modal.confirm(config);
  };

  return { handleOnline };
};
