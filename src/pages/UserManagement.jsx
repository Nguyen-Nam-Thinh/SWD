// src/pages/Dashboard/UserManagement.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Tooltip,
  Input,
  Select,
  Popover,
  Badge,
  Tag,
  Divider,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Eye, Edit, Lock, Unlock } from "lucide-react";
import userService from "../services/userService";
import UserForm from "../components/User/UserForm";
import UserDetail from "../components/User/UserDetail";
import ResponsiveTable from "../components/ResponsiveTable";
import ReportStatusTag from "../components/common/ReportStatusTag";

const UserManagement = () => {
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

  // Search state
  const [searchValue, setSearchValue] = useState("");

  // Filter states (applied)
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);

  // Temp filter states (in popup, not yet applied)
  const [tempRoleFilter, setTempRoleFilter] = useState(undefined);
  const [tempStatusFilter, setTempStatusFilter] = useState(undefined);

  // Popover state
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (roleFilter) count++;
    if (statusFilter) count++;
    return count;
  }, [roleFilter, statusFilter]);

  const fetchData = async (
    page = 1,
    pageSize = 10,
    overrideRole = "__USE_STATE__",
    overrideStatus = "__USE_STATE__",
  ) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
      };

      const keyword = searchValue.trim();
      if (keyword) {
        params.SearchTerm = keyword;
      }

      const role = overrideRole !== "__USE_STATE__" ? overrideRole : roleFilter;
      const status =
        overrideStatus !== "__USE_STATE__" ? overrideStatus : statusFilter;

      if (role) {
        params.Role = role;
      }

      if (status) {
        params.IsActive = status === "active";
      }

      const res = await userService.getUsers(params);
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

  // Search handlers
  const handleSearch = () => {
    fetchData(1, pagination.pageSize);
  };

  // Filter popup handlers
  const handleOpenFilterPopover = () => {
    setTempRoleFilter(roleFilter);
    setTempStatusFilter(statusFilter);
    setFilterPopoverOpen(true);
  };

  const handleApplyPopoverFilters = () => {
    setRoleFilter(tempRoleFilter);
    setStatusFilter(tempStatusFilter);
    setFilterPopoverOpen(false);
    fetchData(1, pagination.pageSize, tempRoleFilter, tempStatusFilter);
  };

  const handleResetPopoverFilters = () => {
    setTempRoleFilter(undefined);
    setTempStatusFilter(undefined);
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

  // Filter popover content
  const filterPopoverContent = (
    <div style={{ width: 300 }}>
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#475569",
            marginBottom: 6,
          }}
        >
          Vai trò
        </label>
        <Select
          value={tempRoleFilter}
          onChange={setTempRoleFilter}
          className="w-full"
          allowClear
          placeholder="Chọn vai trò"
          options={[
            { value: "Admin", label: "Admin" },
            { value: "Staff", label: "Staff" },
          ]}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#475569",
            marginBottom: 6,
          }}
        >
          Trạng thái
        </label>
        <Select
          value={tempStatusFilter}
          onChange={setTempStatusFilter}
          className="w-full"
          allowClear
          placeholder="Chọn trạng thái"
          options={[
            { value: "active", label: "Đang hoạt động" },
            { value: "inactive", label: "Đã khóa" },
          ]}
        />
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button icon={<ReloadOutlined />} onClick={handleResetPopoverFilters}>
          Đặt lại
        </Button>
        <Button
          type="primary"
          icon={<FilterOutlined />}
          onClick={handleApplyPopoverFilters}
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );

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

      {/* Search bar + Filter button */}
      <div className="mb-4 md:mb-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm kiếm theo tên đăng nhập, họ tên, email..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onPressEnter={handleSearch}
          prefix={
            <SearchOutlined
              className="text-gray-400 cursor-pointer hover:text-blue-500"
              onClick={handleSearch}
            />
          }
          allowClear
          style={{ maxWidth: 450 }}
          size="middle"
        />

        <Popover
          content={filterPopoverContent}
          title={
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              Bộ lọc nâng cao
            </span>
          }
          trigger="click"
          open={filterPopoverOpen}
          onOpenChange={(open) => {
            if (open) {
              handleOpenFilterPopover();
            } else {
              setFilterPopoverOpen(false);
            }
          }}
          placement="bottomLeft"
        >
          <Badge count={activeFilterCount} size="small" offset={[-2, 2]}>
            <Button icon={<FilterOutlined />} size="middle">
              Bộ lọc
            </Button>
          </Badge>
        </Popover>

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {roleFilter && (
              <Tag
                closable
                onClose={() => {
                  setRoleFilter(undefined);
                  fetchData(1, pagination.pageSize, null, statusFilter);
                }}
                color="blue"
              >
                Vai trò: {roleFilter}
              </Tag>
            )}
            {statusFilter && (
              <Tag
                closable
                onClose={() => {
                  setStatusFilter(undefined);
                  fetchData(1, pagination.pageSize, roleFilter, null);
                }}
                color="purple"
              >
                {statusFilter === "active" ? "Đang hoạt động" : "Đã khóa"}
              </Tag>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng ${total} người dùng`,
            onChange: (page, pageSize) => fetchData(page, pageSize),
          }}
        />
      </div>

      {/* Mobile/Tablet View */}
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
