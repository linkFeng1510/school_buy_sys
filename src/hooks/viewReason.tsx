// src/hooks/callbacks.ts
import React, { useState } from 'react';
import { Modal, Button, Form, Input, message, List } from 'antd';
import { ItemData } from './commonHooks'; // 假设与 commonHooks.tsx 共享接口
export const useHandleViewReason = () => {
  const [form] = Form.useForm();
  const [assetType, setAssetType] = useState('consumable'); // 默认易耗品
  const [shelfStatus, setShelfStatus] = useState('onShelf'); // 默认上架
  const handleViewReason = (modal: any, detail: ItemData) => {
    const config = {
      title: '原因',
      content: (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ marginBottom: 16 }}>{detail.auditRemark}</div>
        </div>
      ),
    };
    modal.info(config);
  };
  return { handleViewReason };
};
