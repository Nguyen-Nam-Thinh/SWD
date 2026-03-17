// src/pages/Dashboard/UserManagement.jsx (Phần liên quan)
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Tooltip,
  Input,
  Select,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { Eye, Edit, Lock, Unlock } from "lucide-react";
import userService from "../services/userService";
import UserForm from "../components/User/UserForm";
import UserDetail from "../components/User/UserDetail";
import ResponsiveTable from "../components/ResponsiveTable";
import ReportStatusTag from "../components/common/ReportStatusTag";

const UserManagement = () => {
  // ... (giữ nguyên các state cũ) ...
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchField, setSearchField] = useState("username");
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const buildQueryParams = (page, pageSize) => {
    const params = {
      PageNumber: page,
      PageSize: pageSize,
    };

    const keyword = searchValue.trim();
    if (keyword) {
      if (searchField === "username") params.Username = keyword;
      if (searchField === "fullName") params.FullName = keyword;
      if (searchField === "email") params.Email = keyword;
    }

    if (roleFilter) {
      params.Role = roleFilter;
    }

    if (statusFilter) {
      params.IsActive = statusFilter === "active";
    }

    return params;
  };

  const fetchData = async (page = 1, pageSize = 10) => {
    // ... (logic fetch data cũ) ...
    setLoading(true);
    try {
      const res = await userService.getUsers(buildQueryParams(page, pageSize));
      const list = res.items || res || [];
      setData(list);
      setPagination({
        current: res.pageNumber || page,
        pageSize: res.pageSize || pageSize,
        total: res.totalCount || list.length,
      });
    } catch (e) {
      message.error("Lỗi tải trang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize);
  }, []);

  const handleApplyFilters = () => {
    fetchData(1, pagination.pageSize);
  };

  const handleResetFilters = () => {
    setSearchField("username");
    setSearchValue("");
    setRoleFilter(undefined);
    setStatusFilter(undefined);
    setShowAdvancedFilters(false);
    fetchData(1, pagination.pageSize);
  };

  // --- HÀM XỬ LÝ XÓA MỀM (SOFT DELETE / LOCK) ---
  const handleSoftDelete = async (user) => {
    try {
      setLoading(true);
      await userService.updateUserStatus(user.id, false);
      message.success(`Đã khóa tài khoản ${user.username}`);
      fetchData(pagination.current, pagination.pageSize);
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
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Không thể mở khóa!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      label: "STT",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      label: "Tên đăng nhập",
    },
    {
      title: "Họ và tên",
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
      title: "Vai trò",
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
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      label: "Trạng thái",
      render: (isActive) => (
        <ReportStatusTag
          status={isActive ? "Active" : "Inactive"}
          type="user"
        />
      ),
    },
    {
      title: "Hành động",
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
      <h2 className="text-base md:text-lg font-bold mb-4">
        Quản lý người dùng
      </h2>

      <div className="mb-4 p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Tìm kiếm theo
            </label>
            <Select
              value={searchField}
              onChange={setSearchField}
              className="w-full"
              options={[
                { value: "username", label: "Tên đăng nhập" },
                { value: "fullName", label: "Họ và tên" },
                { value: "email", label: "Email" },
              ]}
            />
          </div>

          <div className="md:min-w-[320px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Từ khóa
            </label>
            <Input
              placeholder="Nhập từ khóa tìm kiếm..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleApplyFilters}
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
            />
          </div>

          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            className="w-full md:w-auto"
          >
            {showAdvancedFilters ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
          </Button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Lọc theo vai trò
              </label>
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                className="w-full"
                allowClear
                placeholder="Chọn vai trò"
                options={[
                  { value: "Admin", label: "Admin" },
                  { value: "Staff", label: "Staff" },
                  { value: "User", label: "User" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Lọc theo trạng thái
              </label>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full"
                allowClear
                placeholder="Chọn trạng thái"
                options={[
                  { value: "active", label: "Đang hoạt động" },
                  { value: "inactive", label: "Đã khóa" },
                ]}
              />
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-gray-600">
            Tổng số username: <strong>{pagination.total}</strong>
          </span>

          <div className="flex gap-2">
            <Button onClick={handleResetFilters}>Đặt lại</Button>
            <Button type="primary" onClick={handleApplyFilters}>
              Áp dụng
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Table - Ẩn trên mobile */}
      <div className="hidden md:block">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`,
            onChange: (page, pageSize) => fetchData(page, pageSize),
          }}
        />
      </div>

      {/* Mobile/Tablet View - Chỉ hiện trên mobile */}
      <div className="md:hidden">
        <ResponsiveTable
          columns={columns}
          data={data}
          itemsPerPage={pagination.pageSize}
          searchable={true}
          searchPlaceholder="Tìm kiếm người dùng..."
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
