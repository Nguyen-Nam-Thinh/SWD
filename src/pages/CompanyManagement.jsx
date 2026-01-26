import { Table, Button, Tag, Space, Modal, Form, Input, Select } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";

const CompanyManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      title: "Mã CK (Ticker)",
      dataIndex: "ticker",
      key: "ticker",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    { title: "Tên công ty", dataIndex: "name", key: "name" },
    {
      title: "Sàn",
      dataIndex: "exchange",
      key: "exchange",
      render: (ex) => (
        <Tag color={ex === "HOSE" ? "purple" : "orange"}>{ex}</Tag>
      ),
    },
    { title: "Ngành", dataIndex: "industry", key: "industry" },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-600"
          />
          <Button type="text" icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      ticker: "FPT",
      name: "Công ty Cổ phần FPT",
      exchange: "HOSE",
      industry: "Công nghệ",
    },
    {
      key: "2",
      ticker: "VNM",
      name: "Vinamilk",
      exchange: "HOSE",
      industry: "Thực phẩm",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold">Danh sách công ty</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Thêm công ty
        </Button>
      </div>

      <Table columns={columns} dataSource={data} />

      {/* Modal Form Thêm Mới */}
      <Modal
        title="Thêm Công Ty Mới"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Mã Chứng Khoán (Ticker)" required>
            <Input placeholder="VD: FPT" />
          </Form.Item>
          <Form.Item label="Tên Công Ty" required>
            <Input placeholder="Nhập tên đầy đủ" />
          </Form.Item>
          <Form.Item label="Sàn giao dịch">
            <Select defaultValue="HOSE">
              <Select.Option value="HOSE">HOSE</Select.Option>
              <Select.Option value="HNX">HNX</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyManagement;
