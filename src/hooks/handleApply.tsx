import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { ItemData } from './commonHooks';

const { TextArea } = Input;

export const useHandleApply = () => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const handleApply = (modal: any, item: ItemData) => {
    const config = {
      title: '提交申领申请',
      content: (
        <div style={{ padding: 24 }}>
          <Form form={form} onFinish={(values) => {
            console.log('申领提交:', values);
            message.success('申领申请提交成功');
            setVisible(false);
            form.resetFields();
          }} layout="vertical">
            <Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
              <Input type="number" placeholder="请输入申领数量" />
            </Form.Item>
            <Form.Item name="reason" label="申领理由" rules={[{ required: true, message: '请输入申领理由' }]}>
              <TextArea rows={4} placeholder="请输入申领理由" />
            </Form.Item>
          </Form>
        </div>
      ),
      onOk: () => {
        form.submit();
      },
      onCancel: () => {
        setVisible(false);
        form.resetFields();
      },
      okText: '提交',
      cancelText: '取消',
    };
    modal.confirm(config);
  };

  return { handleApply };
};
