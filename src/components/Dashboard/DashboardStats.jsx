import { Card, Col, Row, Statistic } from "antd";
import {
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import authService from "../../services/authService";

const DashboardStats = ({ data }) => {
  const user = authService.getUserData();
  const isStaff = user?.role === "Staff";
  // Cấu hình cho 3 thẻ thống kê
  const statItems = [
    {
      title: "Tổng người dùng",
      value: data?.totalUsers || 0,
      icon: <UserOutlined />,
      color: "#3f8600", // Xanh lá
    },
    {
      title: "Tổng công ty",
      value: data?.totalCompanies || 0,
      icon: <BankOutlined />,
      color: "#1890ff", // Xanh dương
    },
    {
      title: "Báo cáo tài chính",
      value: data?.totalReports || 0,
      icon: <FileTextOutlined />,
      color: "#cf1322", // Đỏ
    },
  ];

  // Nếu là Staff thì không hiển thị stats
  if (isStaff) {
    return null;
  }

  return (
    <Row gutter={16}>
      {statItems.map((item, index) => (
        <Col span={8} key={index} xs={24} sm={12} md={8}>
          <Card
            variant="borderless"
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Statistic
              title={item.title}
              value={item.value}
              prefix={item.icon}
              styles={{ content: { color: item.color } }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardStats;
