import { Modal, Button, message, Radio } from 'antd';
import { ItemData } from './commonHooks';
import { useState } from 'react';
export const useHandleUrgeShelf = () => {
  const [selectedManager, setSelectedManager] = useState(1);
  const handleUrgeShelf = (modal: any, item: ItemData) => {
    const config = {
      title: '催上架',
      content: (
        <div>
          <Radio.Group
            onChange={(e) => setSelectedManager(e.target.value)}
            defaultValue={1}
            options={[
              { value: 1, label: '库管：张xx 137xxxxxxxx' },
              { value: 2, label: '库管：李xx 138xxxxxxxx' },
            ]}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          />
        </div>
      ),
      onOk: () => {
        message.success('已拨打 ');
      },
      onCancel: () => { },
      okText: '立即拨打',
      cancelText: '取消',
    };
    modal.confirm(config);
  };

  return { handleUrgeShelf };
};
