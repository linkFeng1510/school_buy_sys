
// src/hooks/callbacks.ts
import { Modal, Button, Form, Input, message, List, InputNumber, Radio, Card, Row, Col } from 'antd';
import { ItemData } from './commonHooks'; // 假设与 commonHooks.tsx 共享接口
import SignName from '@/pages/workbench/components/SignName';
import { request } from '@umijs/max';
import { commonUpdateApplyRequest } from '../hooks/commonRequest';
import { productNumHandler } from '@/hooks/commonRequest';
import { useModel } from 'umi';
import ProductItem from '@/components/commonListItem';

export const useHandleApplyConfirm = () => {
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const handleApplyConfirm = (modal: any, currOrder: ItemData) => {
    const onFinish = (values: any) => {
      const params = {
        signatureUrl: currentUser?.signName,
        "userId": currentUser?.userId,
        "userName": currentUser?.name,
        "orderId": currOrder.orderId,
        "action": 1,
      }
      commonUpdateApplyRequest({ data: params })
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
      // Modal.confirm({
      //   title: '签名',
      //   content: (
      //     <SignName key={Math.random()} onConfirm={(imgUrl: any) => signNameUrl(imgUrl, values)} />
      //   ),
      //   footer: null,
      //   closable: true,
      // });
    };
    const onRejectFinish = (values: any) => {
      const params = {
        "userId": currentUser?.userId,
        "userName": currentUser?.name,
        "orderId": currOrder.orderId,
        "action": 2,
        // 驳回原因
        "rejectReason": values.rejectReason,
      }
      commonUpdateApplyRequest({ data: params }).then(() => {
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
      request('/api/signature/mgmClaimUpload', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      }).then(response => {
        let urlSrc = response.data
        return urlSrc
        // 处理上传成功的逻辑
      }).then((urlSrc) => {
        const currentUserId = currentUser?.userId || 0;
        const params = {
          signatureUrl: currentUser?.signName,
          "userId": currentUserId,
          "userName": currentUser?.name,
          "orderId": currOrder.orderId,
          "action": 1,
        }
        commonUpdateApplyRequest({ data: params })
          .then((response: any) => {
            if (response.success) {
              // 处理更新成功的逻辑
              form.resetFields();
              currOrder.updateList()
              message.success('审核成功');
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
            <Row justify={"space-between"} style={{ marginBottom: 16 }}>
              <Col>申领人：{currOrder.applyUser}</Col>
              <Col>申请时间：{currOrder.createTime}</Col>
            </Row>
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
                          <ProductItem detail={detail} hideTotal={true} />
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
  return { handleApplyConfirm };
};


