// src/hooks/callbacks.ts
import React, { useState } from 'react';
import { Modal, Button, Form, Input, message, List, InputNumber, Radio, Card } from 'antd';
import { ItemData } from './commonHooks'; // 假设与 commonHooks.tsx 共享接口
import SignName from '@/pages/workbench/components/SignName';
import { request } from '@umijs/max';
import { commonUpdateStatusRequest } from '../hooks/commonRequest';
import { productNumHandler } from '@/hooks/commonRequest';
import { useModel } from 'umi';
import ProductItem from '@/components/commonListItem';

export const useHandleReview = () => {
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const handleReview = (modal: any, currOrder: ItemData) => {
    const onFinish = (values: any) => {
      Modal.confirm({
        title: '签名',
        content: (
          <SignName key={Math.random()} onConfirm={(imgUrl: any) => signNameUrl(imgUrl, values)} />
        ),
        footer: null,
        closable: true,
      });

      // const currentUserId = currentUser?.userId || 0;
      // let itemConfigs: {
      //   // 商品ID
      //   itemId: any;
      //   // 是否固定资产. 0:否, 1:是
      //   isFixedAsset: number;
      //   // 是否上架不能为空. 0:未上架, 1:上架
      //   isOnline: number;
      //   // 上架数量
      //   onlineQuantity: any;
      // }[] = [];
      // values.items.forEach((ii: {
      //   itemId: any; id: any; isFixedAsset: any; isOnline: any; onlineQuantity: any;
      // }) => {
      //   itemConfigs.push({
      //     // 商品ID
      //     "itemId": ii.itemId,
      //     // 是否固定资产. 0:否, 1:是
      //     "isFixedAsset": ii.isFixedAsset ? 1 : 0,
      //     // 是否上架不能为空. 0:未上架, 1:上架
      //     "isOnline": ii.isOnline ? 1 : 0,
      //     // 上架数量
      //     "onlineQuantity": ii.onlineQuantity || 0
      //   });
      // });
      // const params = {
      //   signatureImageUrl: '',
      //   "userId": currentUserId,
      //   "userName": currentUser?.name,
      //   "orderId": currOrder.orderId,
      //   "auditAction": 1,
      //   itemConfigs: itemConfigs
      // }
      // commonUpdateStatusRequest({ data: params })
      //   .then((response: any) => {
      //     if (response.success) {
      //       // 处理更新成功的逻辑
      //       form.resetFields();
      //       currOrder.updateList()
      //       message.success('审核成功');
      //       Modal.destroyAll();
      //     }
      //   }).catch((error: any) => {
      //     console.error('更新失败:', error);
      //   });
    };
    const onRejectFinish = (values: any) => {
      const params = {
        "userId": currentUser?.userId,
        "userName": currentUser?.name,
        "orderId": currOrder.orderId,
        "auditAction": 2,
        // 驳回原因
        "rejectReason": values.rejectReason,
      }
      commonUpdateStatusRequest({ data: params }).then(() => {
        // 处理更新成功的逻辑
        message.success('驳回成功');
        form.resetFields();
        Modal.destroyAll();
        currOrder.updateList()
      });
    };
    const rejectHandler = () => {
      Modal.confirm({
        title: '确认驳回',
        content: (
          <Form form={rejectForm} onFinish={onRejectFinish}>
            <Form.Item
              label="驳回原因"
              name="rejectReason"
              rules={[{ required: true, message: '请输入驳回原因' }]}
            >
              <Input placeholder="请输入驳回原因" />
            </Form.Item>
          </Form>
        ),
        okText: '确认驳回',
        cancelText: '取消驳回',
        onOk: () => {
          return new Promise((innerResolve, innerReject) => {
            rejectForm.validateFields().then(() => {
              rejectForm.submit();
              innerResolve(true);
            }).catch(err => {
              innerReject(err);
            });
          });
        },
        onCancel: () => {
        },
      });
    }
    const handleReviewSign = () => {
      form.validateFields().then(() => {
        form.submit();
      }).catch(err => {
      });
    }
    const signNameUrl = (imgUrl: any, values: any) => {
      // 例如使用request发送POST请求
      const formData = new FormData();
      formData.append('signature', imgUrl);
      Modal.destroyAll();
      request('/api/signature/mgmOnlineUpload', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      }).then(response => {
        let urlSrc = response.data
        return urlSrc
        // 处理上传成功的逻辑
      }).then((urlSrc) => {
        const currentUserId = currentUser?.userId || 0;
        let itemConfigs: {
          // 商品ID
          itemId: any;
          // 是否固定资产. 0:否, 1:是
          // isFixedAsset: number;
          // 是否上架不能为空. 0:未上架, 1:上架
          isOnline: number;
          // 上架数量
          // onlineQuantity: any;
        }[] = [];
        values.items.forEach((ii: {
          itemId: any; id: any; isFixedAsset: any; isOnline: any; onlineQuantity: any;
        }) => {
          itemConfigs.push({
            // 商品ID
            "itemId": ii.itemId,
            // 是否固定资产. 0:否, 1:是
            // "isFixedAsset": ii.isFixedAsset ? 1 : 0,
            // 是否上架不能为空. 0:未上架, 1:上架
            "isOnline": ii.isOnline ? 1 : 0,
            // 上架数量
            // "onlineQuantity": ii.onlineQuantity || 0
          });
        });
        const params = {
          signatureImageUrl: urlSrc,
          "userId": currentUserId,
          "userName": currentUser?.name,
          "orderId": currOrder.orderId,
          "auditAction": 1,
          itemConfigs: itemConfigs
        }
        commonUpdateStatusRequest({ data: params })
          .then((response: any) => {
            if (response.success) {
              // 处理更新成功的逻辑
              form.resetFields();
              currOrder.updateList()
              message.success('审核成功');
              Modal.destroyAll();
            }
          }).catch((error: any) => {
            console.error('更新失败:', error);
          });
      }).catch(error => {
        console.error('上传失败:', error);
      })
    }

    const config = {
      title: '审核',
      content: (
        <>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <Form
              form={form}
              onFinish={onFinish}
              layout="vertical"
              initialValues={{ items: currOrder.items || [currOrder] || [] }}
            >
              <Form.List name="items">
                {(fields) => (
                  <>
                    {fields.map((field,index) => {
                      const detail = currOrder.items?.[field.name] || currOrder;
                      return (
                        <Card key={field.key} style={{ marginBottom: 16 }}>
                          <ProductItem detail={detail} />
                          {/* <Form.Item
                            {...field}
                            name={[field.name, 'isFixedAsset']}
                            label="请选择资产类型"
                            rules={[{ required: true, message: '请选择资产类型' }]}
                          >
                            <Radio.Group>
                              <Radio value={0}>易耗品</Radio>
                              <Radio value={1}>固定资产</Radio>
                            </Radio.Group>
                          </Form.Item> */}
                          {currOrder.purchaseType === 1 && <Form.Item
                            {...field}
                            label="请选择是否上架"
                            name={[field.name, 'isOnline']}
                            rules={[{ required: true, message: '请选择是否上架' }]}
                          >
                            <Radio.Group >
                              <Radio value={1}>上架</Radio>
                              <Radio value={0}>暂不上架</Radio>
                            </Radio.Group>
                          </Form.Item>}
                          {/* <Form.Item noStyle shouldUpdate={(prevValues, curValues) => {
                            return prevValues.items[index].isOnline !== curValues.items[index].isOnline
                          }}>

                            {({ getFieldValue }) => {
                              const isOnline = getFieldValue(['items', index, 'isOnline']);
                              if (isOnline === 1 && currOrder.purchaseType != 2) {
                                return (
                                  <Form.Item
                                    label="上架数量"
                                    name={[field.name, 'onlineQuantity']}
                                    rules={[{ required: true, message: "请输入上架数量" }]}
                                    required
                                  >
                                    <InputNumber parser={(value) => parseInt(value || '0', 10)} min={1}  max={detail.stackQuantity - detail.onlineQuantity} />
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

          {productNumHandler(currOrder.items)}
        </>


      ),
      footer: [
        <div style={{ textAlign: 'right' }}>
          <Button onClick={rejectHandler} danger style={{ marginRight: 8 }}>驳回</Button>
          <Button type="primary" onClick={handleReviewSign}>通过</Button>
        </div>

      ],
      closable: true,
      onCancel: () => {
        form.resetFields();
      },
      okText: '通过',
      cancelText: '驳回',
      cancelButtonProps: {
        danger: true
      }
    };

    modal.confirm(config);
  };
  return { handleReview };
};
