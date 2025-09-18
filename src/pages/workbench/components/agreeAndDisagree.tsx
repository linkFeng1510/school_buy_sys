import type { FC } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Popover,
  Space,
  Statistic,
  Steps,
  Table,
  Upload,
} from 'antd';
import {
  GridContent,
  PageContainer,
  RouteContext,
  ModalForm,
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components';
import React, { useState } from 'react';
const agreeAndDisagree: FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  return (
    <>
      <Space>
        <Button type='primary' onClick={() => {
          handleModalVisible(true);
        }}>同意</Button>
        <Button danger onClick={() => {
          handleModalVisible(true);
        }}>驳回</Button>
      </Space>
      <ModalForm
        title="新建规则"
        width="400px"
        open={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          // const success = await handleAdd(value as TableListItem);
          // if (success) {
          //   handleModalVisible(false);
          //   if (actionRef.current) {
          //     actionRef.current.reload();
          //   }
          // }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '规则名称为必填项',
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
        <Upload >
          <Button>
            <UploadOutlined />
            上传文件
          </Button>
        </Upload>
      </ModalForm>
    </>

  );
}

export default agreeAndDisagree
