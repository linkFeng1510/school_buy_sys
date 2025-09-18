// 在这里暴露出一个公共方法
import { request } from '@umijs/max';
import { Col, Row, Typography } from 'antd';

/* 采购单审批 */
export const commonUpdateStatusRequest = (options: any) => {
  return request('/api/order/audit', {...{
    method: 'POST',
  },...options})
};
/*
申领单审批
*/
export const commonUpdateApplyRequest = (options: any) => {
  return request('/api/claim/approve', {...{
    method: 'POST',
  },...options})
};

export const productNumHandler = (item: any[],showPrice=true) => {
  if (!item) return '暂无';
  const productCount = item.reduce((acc, curr) => acc + (curr.quantity || curr.claimQuantity), 0);
  const price = item.reduce((acc, curr) => acc + (curr.price || 0) * (curr.quantity || curr.claimQuantity), 0);
  return <Row justify={'space-between'} style={{marginBottom: 8}}>
    <Col>共{item.length}个类别{productCount}件物品</Col>
    {showPrice&&<Col ><Typography.Text strong> 共计￥{price}元</Typography.Text></Col>}
  </Row>
};
