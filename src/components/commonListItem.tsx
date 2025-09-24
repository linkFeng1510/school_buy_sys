const ProductItem = ({ detail, hideTotal = false, isProduct = false }: { detail: any, hideTotal?: Boolean, isProduct?: Boolean }) => {
  const quality = !isProduct ? (detail.quantity || detail.claimQuantity) : detail.stockQuantity
  // 是否是易耗品
  const isFixedAsset = detail.isFixedAsset || detail.isFixedAsset === '1'
  const productName = (detail.productName || detail.fixedAssetName)
  return (
    <div style={{ display: 'flex', alignItems: 'center',flex: 1,marginBottom: 16,borderBottom: '1px solid #eee',paddingBottom: 16 }}
    >
      <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {detail.coverImageUrl &&<img src={`${detail.coverImageUrl}`} alt="物品" style={{ width: 48, height: 48 }} />}
        {!detail.coverImageUrl && <span style={{ color: '#ccc' }}>无图片</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#888', fontSize: 12 }}>名称:{productName}</div>
        <div style={{ color: '#888', fontSize: 12 }}>品牌:{(detail.brandName) || '无'}</div>
        <div style={{ color: '#888', fontSize: 12 }}>规格型号:{detail.spec}</div>
        <div style={{ color: '#888', fontSize: 12 }}>{isProduct?'库存':'数量'}:{quality}</div>
        <div style={{ color: '#888', fontSize: 12 }}>单价:{detail.price}元/{detail.unit}</div>
        <div style={{ color: '#888', fontSize: 12 }}>资产分类:{!isFixedAsset && (<>{(detail.categoryLevel1Name) || '无'} - {detail.categoryLevel2Name}</>)} {isFixedAsset && detail.fixedAssetName}</div>
        {!hideTotal &&<div style={{ color: '#888', fontSize: 12 }}>小计:{quality * detail.price}元</div>}
      </div>
    </div>
  )
}
export default ProductItem
