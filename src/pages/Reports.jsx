import { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Tooltip,
  Popconfirm,
  Card,
  message,
  DatePicker,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Option } = Select;

// Dữ liệu giả lập
const mockData = [
  {
    id: "1",
    reportName: "BCTC Quý 4 - 2025",
    company: "FPT Corp",
    uploadedBy: "staff_thinh",
    uploadedAt: "2026-01-20T10:00:00",
    status: "Pending", // Pending, Approved, Rejected
    year: 2025,
  },
  {
    id: "2",
    reportName: "Báo cáo kiểm toán năm 2024",
    company: "Vinamilk",
    uploadedBy: "admin",
    uploadedAt: "2026-01-15T08:30:00",
    status: "Approved",
    year: 2024,
  },
  {
    id: "3",
    reportName: "BCTC Quý 1 - 2026 (Nháp)",
    company: "Vietcombank",
    uploadedBy: "staff_hung",
    uploadedAt: "2026-01-27T14:20:00",
    status: "Rejected",
    year: 2026,
  },
];

const FinancialReportManagement = () => {
  const [data, setData] = useState(mockData);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Xử lý Duyệt
  const handleApprove = (id) => {
    message.loading({ content: "Đang xử lý...", key: "updatable" });
    setTimeout(() => {
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "Approved" } : item,
        ),
      );
      message.success({ content: "Đã duyệt báo cáo!", key: "updatable" });
    }, 800);
  };

  // Xử lý Từ chối
  const handleReject = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Rejected" } : item,
      ),
    );
    message.warning("Đã từ chối báo cáo.");
  };

  const columns = [
    {
      title: "Tên báo cáo",
      dataIndex: "reportName",
      key: "reportName",
      render: (text) => (
        <span className="font-medium text-blue-600 cursor-pointer">{text}</span>
      ),
    },
    {
      title: "Công ty",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
      width: 80,
    },
    {
      title: "Người tải lên",
      dataIndex: "uploadedBy",
      key: "uploadedBy",
    },
    {
      title: "Ngày tạo",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Approved"
            ? "success"
            : status === "Rejected"
              ? "error"
              : "warning";
        let text =
          status === "Approved"
            ? "Đã duyệt"
            : status === "Rejected"
              ? "Từ chối"
              : "Chờ duyệt";
        return <Tag color={color}>{text.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>

          {/* Nút Duyệt chỉ hiện khi trạng thái là Pending */}
          {record.status === "Pending" && (
            <>
              <Tooltip title="Duyệt">
                <Popconfirm
                  title="Duyệt báo cáo này?"
                  onConfirm={() => handleApprove(record.id)}
                >
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    size="small"
                    className="bg-green-600 hover:bg-green-500"
                  />
                </Popconfirm>
              </Tooltip>

              <Tooltip title="Từ chối">
                <Popconfirm
                  title="Từ chối báo cáo này?"
                  onConfirm={() => handleReject(record.id)}
                  okText="Từ chối"
                  okType="danger"
                >
                  <Button
                    type="primary"
                    danger
                    icon={<CloseCircleOutlined />}
                    size="small"
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Space wrap>
          <Input
            placeholder="Tìm tên báo cáo..."
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
          <Select placeholder="Trạng thái" style={{ width: 150 }} allowClear>
            <Option value="Pending">Chờ duyệt</Option>
            <Option value="Approved">Đã duyệt</Option>
            <Option value="Rejected">Đã từ chối</Option>
          </Select>
          <Select placeholder="Công ty" style={{ width: 150 }} allowClear>
            <Option value="fpt">FPT Corp</Option>
            <Option value="vnm">Vinamilk</Option>
          </Select>
          <Button icon={<FilterOutlined />}>Lọc</Button>
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/dashboard/upload-report")} // Giả sử route upload là đây
        >
          Tải báo cáo mới
        </Button>
      </div>

      {/* TABLE */}
      <Card
        variant="borderless"
        className="shadow-sm"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default FinancialReportManagement;
