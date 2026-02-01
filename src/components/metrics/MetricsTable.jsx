import { Table, Button, Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const MetricsTable = ({
  metrics,
  loading,
  pagination,
  onTableChange,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      title: "Mã Metric",
      dataIndex: "metricCode",
      key: "metricCode",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tên Metric",
      dataIndex: "metricName",
      key: "metricName",
    },
    {
      title: "Đơn Vị",
      dataIndex: "unit",
      key: "unit",
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-600"
            onClick={() => onEdit(record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => onDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={metrics}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
    />
  );
};

export default MetricsTable;
