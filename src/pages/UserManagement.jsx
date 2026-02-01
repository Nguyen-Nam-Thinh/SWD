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
import { Eye, Edit, Lock, Unlock } from "lucide-react";
import userService from "../services/userService";
import UserForm from "../components/User/UserForm";
import UserDetail from "../components/User/UserDetail";
import ResponsiveTable from "../components/ResponsiveTable";

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
      await userService.updateUserStatus(user.id, false);
      message.success(`Đã khóa tài khoản ${user.username}`);
      fetchData();
    } catch (error) {
      message.error("Không thể khóa tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (user) => {
    try {
      setLoading(true);
      await userService.updateUserStatus(user.id, true);
      message.success("Đã mở khóa!");
      fetchData();
    } catch (error) {
      message.error("Không thể mở khóa!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      label: "Username",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      label: "Họ và Tên",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      label: "Email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      label: "Vai trò",
      render: (value) => {
        const colors = {
          Admin: "bg-red-100 text-red-700",
          Staff: "bg-blue-100 text-blue-700",
          User: "bg-green-100 text-green-700",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || "bg-gray-100 text-gray-700"}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      label: "Trạng thái",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      label: "Thao tác",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
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
              onClick={(e) => {
                e.stopPropagation();
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
              onConfirm={() => handleUnlock(record)}
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
    <div className="p-6 bg-white rounded shadow">
      {/* Desktop Table - Ẩn trên mobile */}
      <div className="hidden md:block">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
        />
      </div>

      {/* Mobile/Tablet View - Chỉ hiện trên mobile */}
      <div className="md:hidden">
        <ResponsiveTable
          columns={columns}
          data={data}
          itemsPerPage={10}
          searchable={true}
          searchPlaceholder="Tìm kiếm user..."
          onRowClick={(row) => {
            setSelectedUser(row);
            setIsDetailOpen(true);
          }}
        />
      </div>

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
