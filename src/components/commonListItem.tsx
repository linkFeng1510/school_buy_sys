const ProductItem = ({ detail }: { detail: any }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center',flex: 1 }}
    >
      <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={`${detail.coverImageUrl}`} alt="物品" style={{ width: 48, height: 48 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#888', fontSize: 12 }}>资产名称:{detail.productName}</div>
        <div style={{ color: '#888', fontSize: 12 }}>品牌:{(detail.brandName) || '无'}</div>
        <div style={{ color: '#888', fontSize: 12 }}>规格型号:{detail.spec} 单价：{detail.price}元/{detail.unit}</div>
        <div style={{ color: '#888', fontSize: 12 }}>数量:{detail.quantity}</div>
        <div style={{ color: '#888', fontSize: 12 }}>单价:{(detail.supplierName) || '无'}</div>
        <div style={{ color: '#888', fontSize: 12 }}>资产分类:{(detail.categoryLevel1Name) || '无'} - {detail.categoryLevel2Name}</div>
        <div style={{ color: '#888', fontSize: 12 }}>小计:{(detail.categoryLevel1Name) || '无'} - {detail.categoryLevel2Name}</div>
      </div>
    </div>
  )
}
export default ProductItem
