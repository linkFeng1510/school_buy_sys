import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react"
import { request, useModel } from "@umijs/max";
import {
  Upload,
  message,
} from "antd";
const ProductItem = ({ detail, hideTotal = false, isProduct = false, editFlag = false, currrentOrder = {} }: { detail: any, hideTotal?: Boolean, isProduct?: Boolean, editFlag?: Boolean, currrentOrder?: any }) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const quality = !isProduct ? (detail.quantity || detail.claimQuantity) : detail.stockQuantity
  // 是否是易耗品
  const isFixedAsset = detail.isFixedAsset || detail.isFixedAsset === '1'
  const productName = (detail.productName || detail.fixedAssetName)
  // 图片上传模拟
  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = URL.createObjectURL(file.originFileObj);
    }
  };
  useEffect(() => {
    if (detail.coverImageUrl) {
      setFileList([{ url: detail.coverImageUrl }])
    }
  }, [detail.coverImageUrl])
  return (
    <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 16 }}
    >
      {!editFlag && <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {detail.coverImageUrl && <img src={`${detail.coverImageUrl}`} alt="物品" style={{ width: 48, height: 48 }} />}
        {!detail.coverImageUrl && <span style={{ color: '#ccc' }}>无图片</span>}
      </div>}
      {editFlag && <Upload
        beforeUpload={(file) => {
          // Prevent automatic upload
          return false;
        }}
        fileList={fileList}
        onChange={async ({ fileList: newFileList }) => {
          // Limit to 1 file
          if (newFileList.length > 1) {
            setFileList(newFileList.slice(0, 1));
            return;
          }
          setFileList(newFileList);
          const userId = currrentOrder.userId || ''
          const userName = currrentOrder.name || ''
          const signatureImageUrl = currrentOrder.signatureImageUrl || ''
          const formData = new FormData();
          const purchaseTypeName = currrentOrder.applyUser || '';
          formData.append('orderId', currrentOrder.orderId || '');
          formData.append('applyUser', purchaseTypeName || userName);
          formData.append('signatureImageUrl', signatureImageUrl);
          formData.append('purchaseType', currrentOrder.purchaseType || '');
          formData.append('applyUserId', currrentOrder.applyUserId || userId || '');
          console.log(currrentOrder,'currrentOrdercurrrentOrdercurrrentOrder');
          currrentOrder.items.map((item: {
            productName: string | Blob;
            brandName: string | Blob;
            coverImageUrl: string;
            isFixedAsset: string | Blob;
            category: any;
            fixedAssetName: string; name: string | Blob; spec: string | Blob; brand: string | Blob; fixedAssetId: any; unit: string | Blob; quantity: string | Blob; price: string | Blob; supplierName: string | Blob; image: { fileList: any[]; };
}, index: any) => {
            console.log(item === detail, 'itemitemitem', item === detail ? newFileList[0]?.originFileObj || '' : item.coverImageUrl || '');
            formData.append(`items[${index}].isFixedAsset`, item.isFixedAsset);// 固定资产
            formData.append(`items[${index}].quantity`, item.quantity);
            formData.append(`items[${index}].price`, item.price);
            formData.append(`items[${index}].imageFiles`, item === detail ? newFileList[0]?.originFileObj || '' : item.coverImageUrl || '');
            formData.append(`items[${index}].spec`, item.spec);
            formData.append(`items[${index}].brandName`, item.brandName);
            formData.append(`items[${index}].unit`, item.unit);
            formData.append(`items[${index}].supplierName`, item.supplierName);
            if (item.isFixedAsset){
              formData.append(`items[${index}].fixedAssetId`, item.fixedAssetId || '');
              formData.append(`items[${index}].fixedAssetName`, item.fixedAssetName || '');
            }else{
              formData.append(`items[${index}].productName`, item.productName);
              formData.append(`items[${index}].categoryLevel1Id`, item.category ? item.category[0] : '');
              formData.append(`items[${index}].categoryLevel2Id`, item.category ? item.category[1] : '');
            }
          });
          await request('/api/order/update', {
            method: 'POST',
            data: formData,
            requestType: 'form',
          })
          message.success('图片修改成功');

          // Save file URLs to form
          // const urls = newFileList.map(f =>
          //   f.url || (f.originFileObj ? URL.createObjectURL(f.originFileObj) : '')
          // );
        }}
        listType="picture-card"
        multiple
        maxCount={4}
        style={{ marginRight: 16 }}
        onPreview={handlePreview}
      >
        {fileList.length < 1 && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传图片</div>
          </div>
        )}
      </Upload>}
      <div style={{ flex: 1 }}>
        <div style={{ color: '#888', fontSize: 12 }}>名称:{productName}</div>
        <div style={{ color: '#888', fontSize: 12 }}>品牌:{(detail.brandName) || '无'}</div>
        <div style={{ color: '#888', fontSize: 12 }}>规格型号:{detail.spec}</div>
        <div style={{ color: '#888', fontSize: 12 }}>{isProduct ? '库存' : '数量'}:{quality}</div>
        <div style={{ color: '#888', fontSize: 12 }}>单价:{detail.price}元/{detail.unit}</div>
        <div style={{ color: '#888', fontSize: 12 }}>{isFixedAsset ? "资产" : "商品"}分类:{!isFixedAsset && (<>{(detail.categoryLevel1Name) || '无'} - {detail.categoryLevel2Name}</>)} {isFixedAsset && detail.fixedAssetName}</div>
        {isFixedAsset && detail.storagePath && <div style={{ color: '#888', fontSize: 12 }}>存放地址:{detail.storagePath}</div>}
        {!hideTotal && <div style={{ color: '#888', fontSize: 12 }}>小计:{quality * detail.price}元</div>}
      </div>
    </div>
  )
}
export default ProductItem
