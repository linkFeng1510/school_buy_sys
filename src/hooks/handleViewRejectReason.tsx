import { useState } from 'react';
import { Modal, Button } from 'antd';
import { ItemData } from './commonHooks';

export const useHandleViewRejectReason = () => {

  const handleViewRejectReason = (modal: any, item: ItemData) => {
    const config = {
      title: '驳回原因详情',
      content: (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <p>{item.rejectReason || '无'}</p>
        </div>
      ),
      onOk: () => {
      },
      onCancel: () => {
      },
    };
    modal.info(config);
  };

  return { handleViewRejectReason };
};
