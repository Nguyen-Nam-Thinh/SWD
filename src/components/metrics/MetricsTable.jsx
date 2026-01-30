// src/components/MetricTable.jsx
import { Table, Button, Tag, Space, Typography, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, AimOutlined } from "@ant-design/icons";

const { Text } = Typography;

const MetricTable = ({
  data, // Đổi tên prop từ metrics sang data cho khớp với SplitView
  loading,
  onValueChange, // (Tạm giữ logic cũ của bạn)
  onMetricFocus, // <--- PROP MỚI: Hàm callback khi click vào số liệu
}) => {

  // Hàm xử lý khi click vào giá trị AI
  const handleFocus = (record) => {
    if (record.boundingBox && onMetricFocus) {
      try {
        // Parse chuỗi "[ymin, xmin, ymax, xmax]" thành mảng
        const box = JSON.parse(record.boundingBox);
        onMetricFocus(box); // Gửi mảng [ymin, xmin, ymax, xmax] lên cha
      } catch (e) {
        console.error("Lỗi parse boundingBox:", e);
      }
    }
  };

  const columns = [
    {
      title: "Mã Metric",
      dataIndex: "metricCode",
      key: "metricCode",
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tên Metric",
      dataIndex: "metricName",
      key: "metricName",
      ellipsis: true,
    },
    {
      title: "AI Gợi ý",
      dataIndex: "aiValue",
      key: "aiValue",
      width: 150,
      render: (val, record) => {
        // Format số tiền
        const formatted = new Intl.NumberFormat("vi-VN").format(val);

        // Nếu có boundingBox thì hiển thị style click được
        const hasBox = !!record.boundingBox;

        return (
          <Tooltip title={hasBox ? "Click để xem vị trí trên PDF" : "Không có vị trí"}>
            <div
              className={`flex items-center gap-2 ${hasBox ? "cursor-pointer hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors" : ""}`}
              onClick={() => handleFocus(record)}
            >
              <Text strong>{formatted}</Text>
              {hasBox && <AimOutlined className="text-gray-400" />}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Giá trị chốt",
      dataIndex: "finalValue",
      key: "finalValue",
      width: 150,
      render: (text) => new Intl.NumberFormat("vi-VN").format(text),
    },
    // ... Giữ nguyên các cột khác nếu cần
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="metricCode"
      loading={loading}
      pagination={false}
      scroll={{ y: 'calc(100vh - 200px)' }} // Scroll nội bộ bảng
    />
  );
};

export default MetricTable;