import { Table, Button, Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const CompanyTable = ({ companies, loading, pagination, onTableChange, onEdit, onDelete }) => {
  const columns = [
    {
      title: <div className="text-center">Mã CK</div>,
      dataIndex: "ticker",
      key: "ticker",
      width: 100,
      render: (text) => <Tag color="blue" className="font-bold">{text}</Tag>,
    },
    {
      title: "Tên công ty",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: <div className="text-center">Sàn</div>,
      dataIndex: "stockExchange",
      key: "stockExchange",
      width: 100,
      align: 'center',
      render: (ex) => <Tag color={ex === "HOSE" ? "purple" : "orange"}>{ex}</Tag>,
    },
    {
      // SỬA Ở ĐÂY: Đọc trực tiếp trường industryName từ API trả về
      title: "Ngành",
      dataIndex: "industryName",
      key: "industryName",
      render: (text) => text ? <span className="font-medium text-gray-700">{text}</span> : "-",
    },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 truncate block max-w-[150px]">{url}</a> : "-",
    },
    {
      title: <div className="text-center">Hành động</div>,
      key: "action",
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} className="text-blue-600" onClick={() => onEdit(record)} />
          <Button type="text" icon={<DeleteOutlined />} danger onClick={() => onDelete(record)} />
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