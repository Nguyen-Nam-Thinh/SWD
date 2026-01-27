// src/pages/Dashboard/UserManagement.jsx (Phần liên quan)
import { useState, useEffect } from "react";
import { Table, Button, Space, message, Tag, Popconfirm, Tooltip } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import userService from "../services/userService";
import UserForm from "../components/User/UserForm";
import UserDetail from "../components/User/UserDetail";

const UserManagement = () => {
  // ... (giữ nguyên các state cũ) ...
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchData = async () => {
    // ... (logic fetch data cũ) ...
    setLoading(true);
    try {
      const res = await userService.getUsers();
      setData(res.items);
    } catch (e) {
      message.error("Lỗi tải trang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HÀM XỬ LÝ XÓA MỀM (SOFT DELETE / LOCK) ---
  const handleSoftDelete = async (user) => {
    try {
      setLoading(true);
      // Gọi API PATCH để đổi status
      // Logic: Nếu đang Active thì khóa (false), đang khóa thì mở (true)
      // Nhưng theo yêu cầu của bạn là "nút xóa mềm" -> luôn set về false
      await userService.updateUserStatus(user.id, false); // false = inactive

      message.success(`Đã khóa tài khoản ${user.username}`);
      fetchData(); // Load lại bảng để thấy status thay đổi
    } catch (error) {
      message.error("Không thể khóa tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Full Name", dataIndex: "fullName", key: "fullName" },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedUser(record);
                setIsDetailOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Sửa thông tin">
            <Button
              icon={<EditOutlined />}
              type="primary"
              ghost
              size="small"
              onClick={() => {
                setSelectedUser(record);
                setIsFormOpen(true);
              }}
            />
          </Tooltip>

          {/* Nút Xóa Mềm (Chỉ hiện khi user đang Active) */}
          {record.isActive && (
            <Popconfirm
              title="Khóa tài khoản này?"
              description="Người dùng sẽ không thể đăng nhập được nữa."
              onConfirm={() => handleSoftDelete(record)}
              okText="Khóa ngay"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa mềm (Khóa)">
                <Button icon={<LockOutlined />} danger size="small" />
              </Tooltip>
            </Popconfirm>
          )}

          {/* (Tùy chọn) Nút Mở khóa nếu user đang Inactive */}
          {!record.isActive && (
            <Popconfirm
              title="Mở khóa tài khoản?"
              onConfirm={() => {
                // Logic mở khóa nhanh
                userService.updateUserStatus(record.id, true).then(() => {
                  message.success("Đã mở khóa!");
                  fetchData();
                });
              }}
            >
              <Tooltip title="Mở khóa">
                <Button
                  icon={<UnlockOutlined />}
                  className="text-green-600 border-green-600"
                  size="small"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    // ... (Phần render Table và gọi Component con giữ nguyên như cũ)
    <div className="p-6 bg-white rounded shadow">
      {/* ... Toolbar ... */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
      />
      <UserForm
        open={isFormOpen}
        initialData={selectedUser}
        onCancel={() => setIsFormOpen(false)}
        onSuccess={fetchData}
      />
      <UserDetail
        open={isDetailOpen}
        userId={selectedUser?.id}
        onCancel={() => setIsDetailOpen(false)}
      />
    </div>
  );
};

export default UserManagement;
