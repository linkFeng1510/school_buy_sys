import { useStatusActions } from "@/hooks/commonHooks";
import { Card, Col, Flex, Row, Typography, Modal, List, Tag } from "antd";
import { productNameHandler, productNumHandler } from '@/hooks/commonRequest';
import { useState } from "react";
import ProductItem from "@/components/commonListItem";

// Define a separate component for each list currOrder
const PurchaseItemCard: React.FC<{ item: any, updateList: () => void, isAdmin: boolean, isProduct: boolean, editFlag?: boolean }> = ({ item, updateList, isAdmin = false, isProduct = false, editFlag = false }) => {
  item.updateList = updateList;
  const currOrder = item;
  const { renderStatusTag, renderActionButtons } = useStatusActions(currOrder as any, isAdmin, isProduct);
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const isApply = currOrder.auditStatus !== undefined;

  const productMoneyHandler = (currOrder: any) => {
    if (isProduct) {
      return currOrder.price || 0;
    } else {
      if (currOrder.items) {
        // 价格相加
        if (isApply) {
          return currOrder.items.reduce((acc: any, curr: any) => acc + (curr.price * curr.quantity || 0), 0);
        } else {
          return currOrder.items.reduce((acc: any, curr: any) => acc + (curr.price * curr.claimQuantity || 0), 0);
        }

      }
      return '暂无';
    }
  };

  const handleCardClick = () => {
    console.log(currOrder,'currOrdercurrOrdercurrOrder');
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
              {currOrder.auditStatus !== undefined && <Typography.Text strong>采购类型: {currOrder.purchaseType === 1 ? '直采' : '定向采购'}</Typography.Text>}
              <Typography.Text style={{ color: '#888', fontSize: 13, marginBottom: 8, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', WebkitLineClamp: 2 }}>
                {!isProduct && `${orderType}物品：`}{productNameHandler(currOrder)}
              </Typography.Text>
              {!isProduct && <Typography.Text style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
                {productNumHandler(currOrder.items, false)}
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
            {isProduct && <><ProductItem detail={currOrder} hideTotal={true} isProduct={true} editFlag={editFlag} />
            </>
            }
            <Col style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '-webkit-fill-available', maxHeight: 200 }}>
              <div >{renderStatusTag()}</div>
              {/* <div ><Tag color="blue" style={{ margin: 0 }}>{currOrder.isFixedAsset === 1 ? '资产' : '低值易耗品'}</Tag></div> */}
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
        {selectedItem && (<>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <List
              dataSource={selectedItem.items}
              renderItem={(child: any) => {
                const qualityNum = child.quantity || child.claimQuantity
                return (
                  <ProductItem detail={child} hideTotal={true} currrentOrder={selectedItem}
                  />)
              }
              }
            />
          </div>
          <div style={{ fontWeight: 'bold', marginTop: 16, textAlign: 'right' }}>总计: ￥{productMoneyHandler(selectedItem)}元</div>
        </>)}
      </Modal>
    </>
  );
};

export default PurchaseItemCard;
