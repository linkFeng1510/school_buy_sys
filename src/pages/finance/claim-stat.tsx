import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Modal, Button, List, Row, Col, Typography, Card, Tag, Space } from 'antd';
import moment from 'moment';
import { DownloadOutlined } from '@ant-design/icons';

interface DataType {
  reason: string;
  applyStatus: number;
  shelfStatus: number;
  goods: any[];
  key: string;
  applicant: string;
  account: string;
  itemName: string;
  shelfStatusText: string;
  applyStatusText: string;
  statusColor: string;
  applyStatusColor: string;
  type: string;
  applyTime: string;
  applicant2: string;
  status: string;
  time2: string;
  unit: string;
  price: number;
  quantity: number;
}



const ApplicationListPage: React.FC = () => {
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState<DataType | null>(null);

  const showModal = (record: DataType) => {
    setDetail(record);
    setShowDetail(true);
  };
  const columns: ProColumns<DataType>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 48,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      fieldProps: {
        placeholder: '申请人用户名',
      },
    },
    {
      title: '账号',
      dataIndex: 'account',
    },
    {
      title: '申领物品',
      dataIndex: 'itemName',
      ellipsis: true,
      fieldProps: {
        placeholder: '申请人物品名',
      },
    },
    {
      title: '申领时间',
      dataIndex: 'applyTime',
      sorter: true,
      valueType: 'dateTimeRange',
      fieldProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm',
      },
    },
    {
      title: '审核人',
      dataIndex: 'applicant2',
    },
    {
      title: '审核状态',
      dataIndex: 'status',
    },
    {
      title: '审核时间',
      dataIndex: 'time2',
      sorter: true,
      valueType: 'dateTimeRange',
      fieldProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm',
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => showModal(record)}>
          详情
        </Button>
      ),
    },
  ];
  const handleCancel = () => {
    setShowDetail(false);
  };

  return (
    <PageContainer>
      <ProTable<DataType>
        columns={columns}
        request={async (params, sorter, filter) => {
          // mock数据
          const applicants = ['张老师', '李老师', '王老师', '赵老师'];
          // 上架状态：0-未上架,1-通过未上架,2-被驳回,3-已上架
          // 申领状态：0-未申领,1-已通过,2-被驳回,3-已申领
          const shelfStatusArr = [0, 1, 2, 3];
          const applyStatusArr = [null, 0, 1, 2, 3];
          const shelfStatusText = ['未上架', '通过未上架', '被驳回', '已上架'];
          const applyStatusText = ['未申领', '已通过', '被驳回', '已申领', ''];
          const statusColorMap: Record<number, string> = {
            0: 'default', // 未上架/未申领
            1: 'blue',    // 通过未上架/已通过
            2: 'red',     // 被驳回
            3: 'green',   // 已上架/已申领
          };
          const shelfStatus = 2;
          const applyStatus = 1;
          const data: DataType[] = [
            {
              key: '1',
              applicant: '张老师',
              account: '13655487411',
              itemName: '得力日记本A5-200页',
              applyTime: '2025-04-25 13:30:34',
              applicant2: '高五',
              type: '直采入库',
              status: '已完成',
              shelfStatus, // 上架状态
              shelfStatusText: shelfStatusText[shelfStatus],
              applyStatus,
              applyStatusText: typeof applyStatus === 'number' ? applyStatusText[applyStatus] : '',
              statusColor: statusColorMap[shelfStatus],
              applyStatusColor: statusColorMap[typeof applyStatus === 'number' ? applyStatus : 0],
              time2: '2025-04-25 13:30:34',
              unit: '本',
              price: 2,
              quantity: 100,
              goods: [
                { id: 1, name: '得力日记本A5-200页', unit: '本', price: 2, num: 100, img: '', spec: 'A5-200页' },
                { id: 2, name: '晨光圆珠笔0.5mm*20支/盒', unit: '盒', price: 10, num: 5, img: '', spec: '0.5mm*20支/盒' },
              ],
              reason: '采购商品数量不足'
            },
            {
              key: '2',
              applicant: '张老师',
              account: '13655487411',
              itemName: '晨光圆珠笔0.5mm*20支/盒',
              applyTime: '2025-04-25 13:30:34',
              applicant2: '高五',
              status: '已完成',
              time2: '2025-04-25 13:30:34',
              unit: '盒',
              price: 2,
              quantity: 5,
              goods: [
                { id: 1, name: '晨光圆珠笔0.5mm*20支/盒', unit: '盒', price: 2, num: 5, img: '', spec: '0.5mm*20支/盒' },
              ],
              reason: '商品不足',
              applyStatus: 0,
              type: '',
              shelfStatus: 0,
              shelfStatusText: '',
              applyStatusText: '',
              statusColor: '',
              applyStatusColor: ''
            },
          ];
          return {
            data,
            success: true,
            total: data.length,
          };
        }}
        rowKey="key"
        search={{
          labelWidth: 'auto',
          span: { xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 4 },
          optionRender: ({ searchText, resetText }, { form }) => [
            <Button key="search" type="primary" onClick={() => form?.submit()}>
              {searchText}
            </Button>,
            <Button key="reset" onClick={() => form?.resetFields()}>
              {resetText}
            </Button>,
          ],
        }}
        form={{
          initialValues: {
            applyStartTime: moment('2025-05-09 12:21'),
            applyEndTime: moment('2025-05-09 12:21'),
            midStartTime: moment('2025-05-09 12:21'),
            midEndTime: moment('2025-05-09 12:21'),
          },
        }}
        options={false}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        tableAlertRender={false}
      />
      {/* 详情弹窗 */}
      <Modal
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={null}
        width={380}
        centered
        destroyOnClose
      >
        {detail && (
          <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
              <Col>
                <Typography.Text strong>采购类型: {detail.type}</Typography.Text>
              </Col>
              <Col>
                <Tag color={detail.shelfStatus === 3 ? detail.applyStatusColor : detail.statusColor} style={{ margin: 0 }}>
                  {detail.shelfStatus === 3 ? detail.applyStatusText : detail.shelfStatusText}
                </Tag>
              </Col>
            </Row>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>申领人：</span>{detail.applicant}
              <span style={{ float: 'right', color: '#888', fontSize: 12 }}>申请时间：{detail.time2}</span>
            </div>

            <List<any>
              dataSource={detail.goods}
              renderItem={g => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<img src={g.img || 'https://via.placeholder.com/40'} alt="物品" style={{ width: 40, height: 40, borderRadius: 4 }} />}
                    title={
                      <>
                        <Typography.Text>{g.name}</Typography.Text>
                        <Typography.Text strong style={{ fontSize: 18, marginBottom: 8 }}>
                          ￥{g.price * g.num}元
                        </Typography.Text>
                      </>
                    }
                    description={<span>单位：{g.unit} 单价：{g.price}元 申领数量：{g.num}</span>}
                  />
                </List.Item>
              )}
            />
            <div style={{ margin: '8px 0', color: '#888', fontSize: 12 }}>共{detail.goods.length}个类别{detail.goods.reduce((a: number, b: any) => a + b.num, 0)}件物品</div>
            {/* 已驳回原因 */}
            {detail.applyStatus === 2 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Typography.Text type="danger">{detail.reason}</Typography.Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ApplicationListPage;
