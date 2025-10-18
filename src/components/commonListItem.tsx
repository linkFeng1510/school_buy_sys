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
    if (detail.imageUrls) {
      let urlArr = JSON.parse(detail.imageUrls || '[]')
      urlArr = urlArr.map((url: string, index: number) => ({ uid: index, url }))
      setFileList(urlArr)
    }
  }, [detail.imageUrls])
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
          // Limit to 4 files
          if (newFileList.length > 4) {
            setFileList(newFileList.slice(0, 4));
            return;
          }
          setFileList(newFileList);
          const formData = new FormData();
          formData.append(`id`, detail.itemId);// 固定资产
          let imgsArr: string[] = []
          newFileList.forEach((file) => {
            if (file.originFileObj) {
              formData.append('imageFiles', file.originFileObj);
            }
            if(file.url){
              imgsArr.push(file.url);
            }
          });
          formData.append('imageFileNames', JSON.stringify(imgsArr) || '');
          // formData.append(`userId`, currentUser?.userId || "");// 固定资产

          // formData.append(`isFixedAsset`, detail.isFixedAsset);// 固定资产
          // formData.append(`quantity`, detail.quantity);
          // formData.append(`price`, detail.price);
          // formData.append(`spec`, detail.spec);
          // formData.append(`brandName`, detail.brandName);
          // formData.append(`unit`, detail.unit);
          // formData.append(`supplierName`, detail.supplierName);
          // if (detail.isFixedAsset) {
          //   formData.append(`fixedAssetId`, detail.fixedAssetId || '');
          //   formData.append(`fixedAssetName`, detail.fixedAssetName || '');
          // } else {
          //   formData.append(`productName`, detail.productName);
          //   formData.append(`categoryLevel1Id`, detail.category ? detail.category[0] : '');
          //   formData.append(`categoryLevel2Id`, detail.category ? detail.category[1] : '');
          // }


          await request('/api/item/edit', {
            method: 'POST',
            data: formData,
            requestType: 'form',
          })
          message.success('图片修改成功');
          detail.updateList && detail.updateList()

          // Save file URLs to form
          // const urls = newFileList.map(f =>
          //   f.url || (f.originFileObj ? URL.createObjectURL(f.originFileObj) : '')
          // );
        }}
        listType="picture-card"
        multiple
        maxCount={4}
        onPreview={handlePreview}
      >
        {fileList.length < 4 && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传图片</div>
          </div>
        )}
      </Upload>}
      <div style={{ flex: 1, marginLeft: 16 }}>
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
