import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Input, Button, DatePicker, message, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request, useModel } from 'umi';
import dayjs from 'dayjs';

// 类型定义
interface LogItem {
  id: number;
  userName: string;           // 操作人
  role: string;               // 操作角色
  account: string;            // 操作账号
  title: string;          // 操作项
  content: string;            // 操作内容
  operTime: string;               // 操作时间
  result: string;             // 操作结果
}

interface LogQueryParams {
  userName?: string;
  role?: string;
  startTime?: string;
  endTime?: string;
  pageNum: number;
  pageSize: number;
}

interface LogQueryResponse {
  data: {
    records: LogItem[];
    total: number;
  };
}

const Log: React.FC = () => {
  const [tableData, setTableData] = useState<LogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [userName, setOperator] = useState('');
  const [role, setRole] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [loading, setLoading] = useState(false);

  const { initialState } = useModel('@@initialState');

  // 获取操作日志数据
  const fetchLogs = async (params: LogQueryParams) => {
    setLoading(true);
    try {
      const result = await request<LogQueryResponse>('/api/log/list', {
        method: 'POST',
        data: params,
      });
      // operParam
      const record = result.data.records;
      record.forEach((curr: any) => {
        curr.operParam = JSON.parse(curr.operParam);
        curr.operParam.forEach((ii: { [x: string]: any; })=>{
          for (const element in ii) {
            curr[element] = ii[element];
          }
        })

      });
      console.log(record,'wwwww');
      setTableData(record);
      setTotal(result.data.total);
    } catch (error) {
      message.error('获取操作日志失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    setPageNum(1);
    fetchLogs({
      userName,
      role,
      startTime,
      endTime,
      pageNum: 1,
      pageSize,
    });
  };

  // 重置
  const handleReset = () => {
    setOperator('');
    setRole('');
    setStartTime('');
    setEndTime('');
    setPageNum(1);
    fetchLogs({ pageNum: 1, pageSize });
  };

  // 表格列配置
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      render: (text: number, record: LogItem, index: number) => ((pageNum - 1) * pageSize + index + 1),
    },
    {
      title: '操作人',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '操作角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '操作账号',
      dataIndex: 'account',
      key: 'account',
    },
    {
      title: '操作项',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '操作内容',
      dataIndex: 'content',
      key: 'content',
      render: (text: string) => (
        <div style={{ whiteSpace: 'pre-line' }}>{text}</div>
      ),
    },
    {
      title: '操作时间',
      dataIndex: 'operTime',
      key: 'operTime',
    },
    {
      title: '操作结果',
      dataIndex: 'result',
      key: 'result',
    },
  ];

  // 初始化加载数据
  useEffect(() => {
    fetchLogs({ pageNum: 1, pageSize });
  }, []);

  return (
    <PageContainer
      title="操作日志"
      extra={[]}
    >
      {/* 搜索区域 */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>操作人：</span>
        <Input
          placeholder="请输入操作人"
          value={userName}
          onChange={(e) => setOperator(e.target.value)}
          style={{ width: 150 }}
        />
        <span>选择时间：</span>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={startTime ? dayjs(startTime) : null}
          onChange={(date) => setStartTime(date?.format('YYYY-MM-DD HH:mm:ss'))}
          style={{ width: 180 }}
        />
        <span>—</span>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={endTime ? dayjs(endTime) : null}
          onChange={(date) => setEndTime(date?.format('YYYY-MM-DD HH:mm:ss'))}
          style={{ width: 180 }}
        />
        <span>操作角色：</span>
        <Input
          placeholder="请输入操作角色"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: 150 }}
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
        <Button onClick={handleReset}>重置</Button>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          onChange: (page) => {
            setPageNum(page);
            fetchLogs({
              userName,
              role,
              startTime,
              endTime,
              pageNum: page,
              pageSize,
            });
          },
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `共 ${total} 条`,
          pageSizeOptions: ["5", "10", "20", "50"],
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            handleSearch();
          },
        }}
      />
    </PageContainer>
  );
};

export default Log;
