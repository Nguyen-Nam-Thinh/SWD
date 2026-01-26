import { Table, Button, Input, Select, Tag, Space, Tooltip } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  LockOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const UserManagement = () => {
  const { Option } = Select;

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <b>{text}</b>,
    },
    { title: "Họ tên", dataIndex: "fullname", key: "fullname" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "Admin" ? "geekblue" : "green"}>{role}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "success" : "error"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Khóa">
            <Button icon={<LockOutlined />} danger size="small" />
          </Tooltip>
          <Tooltip title="Reset Password">
            <Button icon={<ReloadOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      username: "admin01",
      fullname: "Nguyễn Văn A",
      email: "a@unica.vn",
      role: "Admin",
      status: "Active",
    },
    {
      key: "2",
      username: "staff02",
      fullname: "Trần Thị B",
      email: "b@unica.vn",
      role: "User",
      status: "Locked",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between mb-4">
        <Space>
          <Input
            placeholder="Tìm theo tên..."
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
          <Select placeholder="Chọn Role" style={{ width: 120 }}>
            <Option value="admin">Admin</Option>
            <Option value="user">User</Option>
          </Select>
        </Space>
        <Button type="primary" icon={<PlusOutlined />}>
          Tạo mới
        </Button>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default UserManagement;
