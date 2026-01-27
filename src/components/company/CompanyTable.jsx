import { Table, Button, Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const CompanyTable = ({
  companies,
  loading,
  pagination,
  onTableChange,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      title: "Mã CK (Ticker)",
      dataIndex: "ticker",
      key: "ticker",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tên công ty",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Sàn",
      dataIndex: "stockExchange",
      key: "stockExchange",
      render: (ex) => (
        <Tag color={ex === "HOSE" ? "purple" : "orange"}>{ex}</Tag>
      ),
    },
    {
      title: "Mã ngành",
      dataIndex: "industryCode",
      key: "industryCode",
    },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        ) : (
          "-"
        ),
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
      dataSource={companies}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
    />
  );
};

export default CompanyTable;
