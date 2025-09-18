import { request, useModel } from '@umijs/max';
import { ItemData } from './commonHooks';
import { message, Modal } from 'antd';


export const useHandleOffline = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const handleOffline = (modal: any, item: ItemData,isGoingOnline:boolean) => {
    const currTitler = isGoingOnline ? '上架' : '下架';
    const config = {
      title: currTitler,
      content: (
        `确定要${currTitler}吗？`
      ),
      onOk: async () => {

        const params = {
          userId: currentUser?.userId,
          userName: currentUser?.name,
          itemId: item.itemId,
          itemStatus: isGoingOnline ? 0 : 1,
          // onlineQuantity: item.onlineQuantity
        };
        const response = await request('/api/item/update', {
          method: 'POST',
          data: params
        })
        if (response.success) {
          item.updateList();
          message.success(`${currTitler}成功`);
        }
        return response.success;
      },
      onCancel: () => {

      },
      okText: '提交',
      cancelText: '取消',
    };
    modal.confirm(config);
  };

  return { handleOffline };
};
