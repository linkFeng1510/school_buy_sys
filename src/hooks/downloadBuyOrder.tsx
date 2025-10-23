// src/hooks/callbacks.ts
import { message } from 'antd';
import { ItemData } from './commonHooks'; // 假设与 commonHooks.tsx 共享接口
import { request } from '@umijs/max';

export const useDownloadBuyOrder = () => {
  const downloadBuyOrder = (modal: any, currOrder: ItemData) => {
    const handleTime = ()=>{
      const date = new Date(currOrder.createTime);
      const dateString = `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date
        .getHours()
        .toString()
        .padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0') }${date
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;
      return dateString;

    }
    const productNameHandler = (item: any) => {
      const isFixedAssetFlag = item.items.some((itemss: { isFixedAsset: number }) => {
        return itemss.isFixedAsset === 1
      })
      let str = '';
      if (isFixedAssetFlag) {
        str = '固定资产采购单'
      } else {
        str = '低值易耗品入库单'
      }
      // 低值易耗品入库单 + 年月日时分秒的数字组合
      return `${str}_${handleTime()}`;
    };
    const checkDownload = async () => {
      const response = await request(`/api/order/checkCanDownload/${currOrder.orderId}`, {
        method: 'GET',
      });
      if (response.data) {
        const downloadFile = await request(`/api/order/download/${currOrder.orderId}`, {
          method: 'GET',
          responseType: 'blob',
        });
        // 下载流文件 pdf文件
        const blob = new Blob([downloadFile], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productNameHandler(currOrder)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        message.success('下载成功');
      }else{
        message.error(response.msg || '暂无可以下载的文件');
      }
    };
    checkDownload();
  };
  return { downloadBuyOrder };
};
