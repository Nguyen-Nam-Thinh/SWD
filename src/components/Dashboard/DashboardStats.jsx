import { Card, Col, Row, Statistic } from "antd";
import {
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const DashboardStats = ({ data }) => {
  const navigate = useNavigate();
  const user = authService.getUserData();
  const isStaff = user?.role === "Staff";

  const statItems = [
    {
      title: "Tổng người dùng",
      value: data?.totalUsers || 0,
      icon: <UserOutlined />,
      color: "#3f8600",
      path: "/dashboard/users",
    },
    {
      title: "Tổng công ty",
      value: data?.totalCompanies || 0,
      icon: <BankOutlined />,
      color: "#1890ff",
      path: "/dashboard/companies",
    },
    {
      title: "Báo cáo tài chính",
      value: data?.totalReports || 0,
      icon: <FileTextOutlined />,
      color: "#cf1322",
      path: "/dashboard/reports",
    },
  ];

  if (isStaff) {
    return null;
  }

  return (
    <Row gutter={[16, 16]}>
      {statItems.map((item, index) => (
        <Col span={8} key={index} xs={24} sm={12} md={8}>
          <Card
            variant="borderless"
            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(item.path)}
            style={{ transition: "all 0.2s ease" }}
            hoverable
          >
            <Statistic
              title={<span className="text-sm md:text-base">{item.title}</span>}
              value={item.value}
              prefix={item.icon}
              valueStyle={{ fontSize: "1.5rem", color: item.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardStats;
