import { useStatusActions } from "@/hooks/commonHooks";
import { Card, Col, Flex, Row, Typography, Modal, List } from "antd";
import { productNumHandler } from '@/hooks/commonRequest';
import { useState } from "react";

// Define a separate component for each list currOrder
const PurchaseItemCard: React.FC<{ item: any, updateList: () => void, isAdmin: boolean, isProduct: boolean }> = ({ item, updateList, isAdmin = false, isProduct = false }) => {
  item.updateList = updateList;
  const currOrder = item;
  const { renderStatusTag, renderActionButtons } = useStatusActions(currOrder as any, isAdmin, isProduct);
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const isApply = currOrder.auditStatus !== undefined;
  const productNameHandler = (currOrder: any) => {
    if (isProduct) {
      return currOrder.productName;
    } else {
      if (currOrder.items) {
        return currOrder.items.map((child: any) => child.productName).join('、') || '暂无';
      }
      return '暂无';
    }
  };

  const productMoneyHandler = (currOrder: any) => {
    if (isProduct) {
      return currOrder.price || 0;
    } else {
      if (currOrder.items) {
        // 价格相加
        if (isApply){
          return currOrder.items.reduce((acc: any, curr: any) => acc + (curr.price * curr.quantity || 0), 0);
        }else{
          return currOrder.items.reduce((acc: any, curr: any) => acc + (curr.price * curr.claimQuantity || 0), 0);
        }

      }
      return '暂无';
    }
  };

  const handleCardClick = () => {
    if (currOrder.items && currOrder.items.length > 0) {
      setSelectedItem(currOrder);
      setVisible(true);
    }
  };
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const handleCloseModal = () => {
    setVisible(false);
    setSelectedItem(null);
  };

  let orderType = isApply ? "采购" : "申领";

  return (
    <>
      <Card
        style={{ marginBottom: 16, cursor: currOrder.items && currOrder.items.length > 0 ? 'pointer' : 'default' }}
        bodyStyle={{ padding: 12 }}
        key={currOrder.id}
        onClick={handleCardClick}
      >
        <Row gutter={16} align="top" style={{ flexWrap: 'nowrap', position: 'relative', alignItems: 'center', padding: '0 8px' }}>
          <>
            {!isProduct && <Col flex="auto">
              {currOrder.auditStatus!==undefined && <Typography.Text strong>采购类型: {currOrder.purchaseType === 1 ? '直采' : '定向采购'}</Typography.Text>}
              <Typography.Text style={{ color: '#888', fontSize: 13, marginBottom: 8, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', WebkitLineClamp: 2 }}>
                {!isProduct && `${orderType}物品：`}{productNameHandler(currOrder)}
              </Typography.Text>
              {!isProduct && <Typography.Text style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
                {productNumHandler(currOrder.items,false)}
              </Typography.Text>}
              <Typography.Text style={{ color: '#888', fontSize: 12, marginBottom: 2, marginRight: 8 }}>
                {orderType}申请人：{currOrder.purchaseTypeName || currOrder.applyUser || '暂无'}
              </Typography.Text>
              <Typography.Text style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>
                {orderType}时间：{currOrder.createTime}
              </Typography.Text>

              <Typography.Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
                ￥{productMoneyHandler(currOrder)}元
              </Typography.Text>
            </Col>}
            {isProduct && <> <Col flex="none" style={{ maxWidth: 100 }}>
              {currOrder.coverImageUrl ? (
                <img src={currOrder.coverImageUrl} alt={currOrder.productName} style={{ width: 48, height: 48 }} />
              ) : (
                <div style={{ width: 48, height: 48, background: '#ddd' }} />
              )}
            </Col>
              <Col flex="auto">
                <Typography.Text style={{ fontSize: 20, marginBottom: 8, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', WebkitLineClamp: 2 }}>
                  {productNameHandler(currOrder)}
                </Typography.Text>
                <Typography.Text style={{ color: '#888', marginBottom: 8, marginRight: 8, display: 'block' }}>
                  单位:{currOrder.unit}
                </Typography.Text>
                <Typography.Text style={{ color: '#888', marginBottom: 8, marginRight: 8, display: 'block' }}>
                  品牌:{currOrder.unit}
                </Typography.Text>
                <Typography.Text style={{ color: '#888', marginBottom: 8, marginRight: 8, display: 'block' }}>
                  供应商:{currOrder.unit}
                </Typography.Text>
                <Typography.Text style={{ color: '#888', marginBottom: 8, marginRight: 8, display: 'block' }}>
                  分类：{(currOrder.categoryLevel1Name) || '无'} - {currOrder.categoryLevel2Name || '无'}
                </Typography.Text>
                <Typography.Text style={{ color: '#888', marginBottom: 8 ,display: 'block'}}>
                  单价:{productMoneyHandler(currOrder)}元
                </Typography.Text>
                <Typography.Text style={{ color: '#888', display: 'block', marginBottom: 8 }}>
                  上架数量:{currOrder.stockQuantity || 0}
                </Typography.Text>
                <Typography.Text style={{ color: '#888', display: 'block', marginBottom: 8 }}>
                  库存数量:{currOrder.stockQuantity || 0}
                </Typography.Text>
              </Col>
            </>
            }
            <Col style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '-webkit-fill-available', maxHeight: 200 }}>
              <div >{renderStatusTag()}</div>
              <div onClick={handleActionClick}>{renderActionButtons()}</div>
            </Col>
          </>
        </Row>
      </Card>

      <Modal
        title="物品详情"
        open={visible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        {selectedItem && (
          <>
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              <List
                dataSource={selectedItem.items}
                renderItem={(child: any) =>{
                  const qualityNum = child.quantity || child.claimQuantity
                  return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {child.coverImageUrl ? (
                            <img src={child.coverImageUrl} alt={child.productName} style={{ width: 48, height: 48 }} />
                          ) : (
                            <div style={{ width: 48, height: 48, background: '#ddd' }} />
                          )}
                        </div>
                      }
                      title={child.productName}
                      description={
                        <div>
                          <div>规格:{child.spec || '无'}</div>
                          <div>单价:¥{child.price || 0}元/{child.unit || '件'}</div>
                          <div>数量:{qualityNum}{child.unit || '件'}</div>
                          <div>品牌：{(child.brandName) || '无'}</div>
                          <div>供应商：{(child.supplierName) || '无'}</div>
                          <div>分类：{(child.categoryLevel1Name) || '无'} - {child.categoryLevel2Name || '无'}</div>
                          <div>小计:¥{(child.price * qualityNum) || 0}元</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              }
              />
            </div>
            {productNumHandler(currOrder.items)}
          </>

        )}
      </Modal>
    </>
  );
};

export default PurchaseItemCard;
