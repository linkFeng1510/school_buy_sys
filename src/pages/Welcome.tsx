import React, { useState, useEffect, use } from 'react';
import { Card, Tabs, Button, Tag, List, Modal, Typography, Empty, Input, message, Space, Pagination, Row, Col, Form, Table, Avatar } from 'antd';
import {
  HomeOutlined, AppstoreOutlined, DatabaseOutlined, ShoppingOutlined,
  FileSearchOutlined, SettingOutlined, BarChartOutlined, UserOutlined
} from '@ant-design/icons';
import {
  PageContainer,
} from '@ant-design/pro-components';
import { request, useModel } from 'umi';
import ActionButton from '@/pages/workbench/components/ActionButton';
import StatusTxt from '@/pages/workbench/components/StatusTxt';
import routes from '../../config/routes';

// 假设当前用户角色（实际应从登录信息获取）

// 导航菜单配置,获取config下routes.ts文件
const menuItems = routes[1].routes || []
// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  '首页': <HomeOutlined />,
  '数据录入记录': <DatabaseOutlined />,
  '物品申领记录': <DatabaseOutlined />,
  '入库审批记录': <DatabaseOutlined />,
  '申领审批': <DatabaseOutlined />,
  '低值易耗数据录入': <ShoppingOutlined />,
  '入库审批': <FileSearchOutlined />,
  '物品管理': <BarChartOutlined />,
  '物品申领': <AppstoreOutlined />,
  '物品申领审核': <FileSearchOutlined />,
};

// 菜单项组件
interface MenuItem {
  name: string;
  path: string;
}

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const handleClick = () => {
    window.location.href = item.path;
  };

  // 获取图标，如果没有匹配则使用默认图标
  const getIcon = () => {
    const icon = iconMap[item.name];
    console.log(item.name,'item.name');
    return icon ? icon : <AppstoreOutlined />;
  };

  return (
    <Button
      type="primary"
      block
      onClick={handleClick}
      style={{
        height: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12
      }}
    >
      <Space direction="vertical" size="small" align="center">
        <Avatar
          size={40}
          style={{
            backgroundColor: '#007BFF',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {getIcon()}
        </Avatar>
        <span>{item.name}</span>
      </Space>
    </Button>
  );
};

const ApplyConfirm: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [listData, setListData] = useState<any[]>([]);
  const [isProduct, setIsProduct] = useState(false);
  let allMenu: any[] = []
  const currMenu = currentUser?.menus?.forEach(item => {
    allMenu.push(item, ...item.childrenList)
  })
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(true);
  const productNameHandler = (item: any) => {
    if (isProduct) {
      return item.productName;
    } else {
      if (item.items) {
        return item.items.map((child: any) => child.productName).join('、') || '暂无';
      }
      return '暂无';
    }
  };
  const eventName = (item: any) => {
    let strName = '';
    if (isProduct) {
      if (item.itemStatus === 1) {
        strName = '物品上架';
      }
      if (item.itemStatus === 0) {
        strName = '物品下架';
      }
    }
    // 如果isAdmin为真，
    if (isAdmin) {
      // 如果item中存在orderNo值，那么有三种状态，0待审核，1通过，2驳回
      if (item.auditStatus !== undefined) {
        if (item.auditStatus == '0') {
          strName = '入库审批';
        } else if (item.auditStatus == '1') {
          strName = '物品审核通过';
          // }
        } else if (item.auditStatus == '2') {
          strName = '物品审核被驳回';
        }
      }
      // 如果item中存在applyNum值，那么有三种状态，0待审核，1通过，2驳回,3完成
      if (item.claimStatus !== undefined) {
        const applyStatusNum = parseInt(item.claimStatus, 10);
        switch (applyStatusNum) {
          case 0: // 未申领
            strName = '物品申领';
            break;
          case 1: // 已通过
            strName = '物品申领';
            break;
          case 2: // 被驳回
            strName = '物品申领';
            break;
          case 3: // 已申领
            strName = '物品申领';
            break;
          case 4: // 已申领
            strName = '物品申领';
            break;
        }
      }
    } else {
      // 如果item中存在orderNo值，那么有三种状态，0待审核，1通过，2驳回
      if (item.auditStatus !== undefined) {
        if (item.auditStatus == '0') {
          strName = '低值易耗数据录入';
        } else if (item.auditStatus == '1') {
          strName = '采购入库已通过';
        } else if (item.auditStatus == '2') {
          strName = '采购入库被驳回';
        }
      }
      // 如果item中存在applyNum值，那么有三种状态，0待审核，1通过，2驳回,3完成
      if (item.claimStatus !== undefined) {
        const applyStatusNum = parseInt(item.claimStatus, 10);
        switch (applyStatusNum) {
          case 0: // 未申领
            strName = '物品申领';
            break;
          case 1: // 已通过
            strName = '物品申领';
            break;
          case 4: // 已通过
            strName = '物品申领';
            break;
          case 2: // 被驳回
            strName = '物品申领';
            break;
          case 3: // 已申领
            // 只有当前登录人等于申领人才有这个按钮
            strName = '物品申领';
            break;
        }
      }
    }
    return strName || '暂无';
};
const columns = [
  {
    title: '事件类型',
    dataIndex: 'itemName',
    key: 'itemName',
    ellipsis: true,
    render: (status: number, row: any) => {
      return <>{eventName(row)}</>;
    }
  },
  {
    title: '事件描述',
    dataIndex: 'applicant',
    key: 'applicant',
    minWidth: 100,
    ellipsis: true,
    render: (status: number, row: any) => {
      return <>{productNameHandler(row)}</>;
    }
  },
  {
    title: '事件状态',
    dataIndex: 'shelfStatus',
    key: 'shelfStatus',
    render: (status: number, row: any) => {
      return <StatusTxt item={row} isAdmin={isAdmin} isProduct={isProduct} />;
    }
  },
  {
    title: '操作',
    key: 'action',
    render: (_: any, record: any) => {
      return <ActionButton item={record} isAdmin={isAdmin} isProduct={isProduct} />;
    },
  },
];

// 获取 API 数据
const fetchData = async () => {
  try {
    const params: any = {
      pageNum: page,
      pageSize: pageSize,
      isAdmin: isAdmin
    };
    Promise.all([request('/api/order/list', {
      method: 'POST',
      data: params,
    }), request('/api/claim/list', {
      method: 'POST',
      data: params,
    })]).then(([response, response1]) => {
      if (response.code === 200 && response1.code === 200) {
        let combinedData = [...(response.data.records || []), ...(response1.data.records || [])];
        // 需要过滤数据
        combinedData = combinedData.filter(item => {
          return item.auditStatus ===0 || item.claimStatus === 0 || item.claimStatus === 1  || item.claimStatus === 4
        });
        // 根据某个字段排序，例如按id降序
        setListData(combinedData || []);
        console.log(combinedData, 'combinedData');
      }
    })
  } catch (error) {
    message.error('获取数据失败');
    setListData([]);
  } finally {
  }
};
useEffect(() => {
  fetchData();
}, []);
useEffect(() => {
  setChildrenList(allMenu || []);
}, [currMenu]);


// 渲染导航菜单（按角色过滤）
const visibleMenuItems = menuItems.filter(item => {
  return childrenList.find(child => child.menuName === item.name);
});
useEffect(() => {
  let hasVisibleItems = visibleMenuItems.some(item => {
    return ['入库审批', '申领审批'].includes(item.name);
  });
  setIsAdmin(hasVisibleItems);
  if (!hasVisibleItems){

  }
}, [visibleMenuItems]);

// 从listData生成进行中的事件数据
  const ongoingEvents = isAdmin?  listData: listData.filter(item =>{
    return item.approvalUsername === currentUser?.name || item.applyUser === currentUser?.name;
  });

return (
  <PageContainer>
    {/* 顶部展示栏 */}
    <Card style={{ marginBottom: 16 }}>
      <Typography.Title level={4} style={{ textAlign: 'center', margin: 0 }}>
        学校资产管理系统
      </Typography.Title>
    </Card>

    {/* 导航菜单栏 */}
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {visibleMenuItems.map(item => (
          <Col xs={12} sm={6} md={6} lg={6} xl={6} key={item.path}>
            <MenuItemCard item={item} />
          </Col>
        ))}
      </Row>
    </Card>

    {/* 进行中事件 */}
    <Card title="进行中事件" style={{ marginBottom: 16 }}>
      {ongoingEvents.length > 0 ? (
        <Table
          dataSource={ongoingEvents}
          columns={columns}
          rowKey="id" // 假设每项数据有唯一id字段
          pagination={false} // 关闭表格自带分页
        />
      ) : (
        <Empty description="暂无进行中的事件" />
      )}
    </Card>
  </PageContainer>
);
};

export default ApplyConfirm;
