import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import { UserOutlined, BankOutlined, FileProtectOutlined, ArrowUpOutlined } from '@ant-design/icons';

const Dashboard = () => {
  // Dữ liệu giả lập cho bảng Audit Log
  const recentLogs = [
    { key: 1, user: 'admin', action: 'Approved Report', time: '10:30 AM', status: 'success' },
    { key: 2, user: 'manager_01', action: 'Upload File', time: '09:15 AM', status: 'processing' },
    { key: 3, user: 'staff_02', action: 'Login Failed', time: '08:45 AM', status: 'error' },
  ];

  const columns = [
    { title: 'Người dùng', dataIndex: 'user', key: 'user' },
    { title: 'Hành động', dataIndex: 'action', key: 'action' },
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: status => (
        <Tag color={status === 'error' ? 'red' : status === 'success' ? 'green' : 'blue'}>
          {status.toUpperCase()}
        </Tag>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Phần Thống kê (Statistic Cards) */}
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Tổng số User" 
              value={1128} 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Tổng số Công ty" 
              value={93} 
              prefix={<BankOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Báo cáo đã duyệt" 
              value={456} 
              prefix={<FileProtectOutlined />} 
              suffix={<span className="text-xs text-gray-400">/ 500</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* 2. Biểu đồ (Placeholder) */}
      <Card title="Lượng truy cập & Upload (7 ngày qua)" bordered={false} className="shadow-sm">
        <div className="h-64 bg-slate-50 flex items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400">
          [Khu vực hiển thị Biểu đồ Chart.js hoặc Recharts]
        </div>
      </Card>

      {/* 3. Audit Log mới nhất */}
      <Card title="Cảnh báo & Nhật ký mới nhất" bordered={false} className="shadow-sm">
        <Table columns={columns} dataSource={recentLogs} pagination={false} size="small" />
      </Card>
    </div>
  );
};

export default Dashboard;