// src/hooks/callbacks.ts
import React, { useState } from 'react';
import { Modal, Button, message, Card, Descriptions, Row, Col, Form, Input } from 'antd';
import { ItemData } from './commonHooks';
import SignName from '@/pages/workbench/components/SignName';
import { request, useModel } from '@umijs/max';
import { commonUpdateStatusRequest } from '../hooks/commonRequest';
import { productNumHandler } from '@/hooks/commonRequest';
import ProductItem from '@/components/commonListItem';
export const useHandleSign = () => {
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};
    const [signForm] = Form.useForm();
  const handleSign = (modal: any, currOrder: ItemData) => {
    const onFinish = async (values: any) => {
      // Modal.confirm({
      //   title: '确认签收',
      //   content: (
      //     <SignName key={Math.random()} onConfirm={(imgUrl: any) => signNameUrl(imgUrl)} />
      //   ),
      //   footer: null,
      //   closable: true,
      // });

      const params = {
        userId: currentUser?.userId,
        userName: currentUser?.name,
        signatureImageUrl: currentUser?.signName,
        orderId: currOrder.orderId,
        storagePath: values.location,
      };
      const response = await request('/api/claim/receive', {
        method: 'POST',
        data: params
      })
      if (response.success) {
        message.success('签收成功');
        signForm.resetFields();
        Modal.destroyAll();
        currOrder.updateList()
      }
    };

    const rejectHandler = () => {
      Modal.destroyAll();
    }

    const signNameUrl = (imgUrl: any) => {
      const formData = new FormData();
      formData.append('signature', imgUrl);
      request('/api/signature/mgmApplyUpload', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      }).then(response => {
        console.log(response, 'response');
        let urlSrc = response.data
        return urlSrc
      }).then(async (urlSrc) => {

          const params = {
            userId: currentUser?.userId,
            userName: currentUser?.name,
            signatureImageUrl: urlSrc,
            orderId: currOrder.orderId,
          };
        const response = await request('/api/claim/receive', {
            method: 'POST',
            data: params
          })
          if (response.success) {
            Modal.destroyAll();
            currOrder.updateList()
            message.success('签收成功');
          }
      }).catch(error => {
        console.error('上传失败:', error);
      })
    }
    const config = {
      title: '签收确认',
      content: (
        <>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <Form
              form={signForm}
              onFinish={onFinish}
              layout="vertical"
              initialValues={{ items: currOrder.items || [currOrder] || [] }}
            >
              <Form.List name="items">
                {(fields) => (
                  <>
                    {fields.map((field, index) => {
                      const detail = currOrder.items?.[field.name] || currOrder;
                      return (
                        <Card key={field.key} style={{ marginBottom: 16 }}>
                          <ProductItem detail={detail} />
                        </Card>
                      )
                    })}
                  </>
                )}
              </Form.List>
              <Form.Item label="存放地点" rules={[{ required: true, message: '请输入存放地点' }]} required name="location">
                <Input
                  style={{ width: 160 }}
                  placeholder="请输入存放地点"
                />
              </Form.Item>
              {productNumHandler(currOrder.items)}
              <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                <Button onClick={rejectHandler} style={{ marginRight: 8 }}>取消</Button>
                <Button type="primary"  htmlType="submit">确定签收</Button>
              </Form.Item>
            </Form>
          </div>

        </>

      ),
      footer: null,
      closable: true,
      onCancel: () => { },
      okText: '确定签收',
      cancelText: '取消',
      cancelButtonProps: {
        danger: true
      }
    };

    modal.confirm(config);
  };

  return { handleSign };
};
