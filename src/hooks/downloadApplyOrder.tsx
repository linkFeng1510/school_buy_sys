// src/hooks/callbacks.ts
import { message } from 'antd';
import { ItemData } from './commonHooks'; // 假设与 commonHooks.tsx 共享接口
import { request } from '@umijs/max';

export const useDownloadApplyOrder = () => {
  const downloadApplyOrder = (modal: any, currOrder: ItemData) => {
    const productNameHandler = (item: any) => {
      if (item.items) {
        return item.items.map((child: any) => child.productName).join('、') || '暂无';
      }
      return '暂无';
    };
    const checkDownload = async () => {
      const response = await request(`/api/claim/checkDownload/${currOrder.orderId}`, {
        method: 'GET',
      });
      if (response.data) {
        const downloadFile = await request(`/api/claim/download/${currOrder.orderId}`, {
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
  return { downloadApplyOrder };
};
