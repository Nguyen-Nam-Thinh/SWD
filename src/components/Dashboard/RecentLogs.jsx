import { Card, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const RecentLogs = ({ data = [], loading = false }) => {
  // Cấu hình cột cho bảng
  const columns = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 200,
      render: (text) => (
        <span className="text-gray-500 text-xs md:text-sm">
          {dayjs(text).format("DD/MM/YYYY HH:mm")}
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
        let color = "default";
        let label = action;

        // Logic tô màu & dịch tiếng Việt
        if (action?.includes("Create")) {
          color = "success";
          label = "Tạo mới";
        } else if (action?.includes("Update")) {
          color = "processing";
          label = "Cập nhật";
        } else if (action?.includes("Delete")) {
          color = "error";
          label = "Xóa";
        }

        return (
          <Tag color={color} className="text-xs">
            {label}
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
  ];

  return (
    <Card
      title={
        <span className="text-base md:text-lg">Nhật ký hoạt động gần đây</span>
      }
      variant="borderless"
      className="shadow-sm"
      extra={
        <a
          href="/dashboard/audit-logs"
          className="text-blue-600 hover:underline text-xs md:text-sm font-medium"
        >
          Xem tất cả
        </a>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ x: 600 }}
      />
    </Card>
  );
};

export default RecentLogs;
