import { Modal, Button, message } from 'antd';
import { ItemData } from './commonHooks';

export const useHandleUrgeSign = () => {
  const handleUrgeSign = (modal: any, item: ItemData) => {
    const config = {
      title: '催签收',
      content: (
        <div style={{ marginBottom: 16 }}>申领人：{item.applyUser} : {item.applyPhonenumber}</div>
      ),
      onOk: () => {
        console.log('催签收', item);
        message.warning('已发送催签收请求');
      },
      onCancel: () => { },
      okText: '立即拨打',
      cancelText: '取消',
    };
    modal.confirm(config);
  };

  return { handleUrgeSign };
};
