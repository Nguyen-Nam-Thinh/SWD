import { useState } from "react";
import { Card, Table, Tag, Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import AuditDetailModal from "../AuditLog/AuditDetailModal";

const { Text } = Typography;

const ACTION_LABEL_MAP = {
  DELETE: "Xóa",
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  LOGIN: "Đăng nhập",
  DELETE_REPORT: "Xóa báo cáo",
  DELETE_USER: "Xóa người dùng",
  DELETE_COMPANY: "Xóa công ty",
  DELETE_METRIC: "Xóa chỉ số",
};

const toVietnameseAction = (actionType = "") => {
  if (!actionType) return "-";
  const normalized = actionType.trim().toUpperCase();
  return ACTION_LABEL_MAP[normalized] || actionType;
};

const resolveActionColor = (actionType = "") => {
  const normalized = actionType.trim().toUpperCase();
  if (normalized.includes("DELETE")) return "red";
  if (normalized.includes("CREATE")) return "green";
  if (normalized.includes("UPDATE")) return "blue";
  if (normalized.includes("LOGIN")) return "gold";
  return "default";
};

const RecentLogs = ({ data = [], loading = false }) => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const recentTop5 = data.slice(0, 5);

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 200,
      render: (text) => (
        <span className="text-gray-500 text-xs md:text-sm">
          {dayjs(text).format("DD/MM/YYYY HH:mm:ss")}
        </span>
      ),
    },
    {
      title: "Người thực hiện",
      dataIndex: "username",
      key: "username",
      width: 300,
      render: (text) => (
        <Text strong className="text-sm">
          {text}
        </Text>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "actionType",
      key: "actionType",
      width: 250,
      render: (action) => {
        return (
          <Tag color={resolveActionColor(action)} className="text-xs">
            {toVietnameseAction(action)}
          </Tag>
        );
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span className="text-gray-600 text-xs md:text-sm break-words">
          {text}
        </span>
      ),
    },
    {
      title: "Chi tiết",
      key: "detail",
      width: 140,
      align: "center",
      render: (_, record) =>
        record.newValue || record.oldValue ? (
          <Button type="link" onClick={() => handleViewDetail(record)}>
            Xem
          </Button>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  return (
    <Card
      title={
        <span className="text-base md:text-lg">Nhật ký hoạt động gần đây</span>
      }
      variant="borderless"
      className="shadow-sm"
      extra={
        <button
          onClick={() => navigate("/dashboard/audit")}
          className="text-blue-600 hover:underline text-xs md:text-sm font-medium"
        >
          Xem tất cả
        </button>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={recentTop5}
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ x: 600 }}
      />

      <AuditDetailModal
        visible={modalVisible}
        record={selectedRecord}
        onClose={() => setModalVisible(false)}
      />
    </Card>
  );
};

export default RecentLogs;
