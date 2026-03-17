// src/pages/AuditLogs.jsx
import React, { useState, useEffect } from "react";
import { Table, DatePicker, Input, Tag, message, Button, Space } from "antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Eye } from "lucide-react";
import dayjs from "dayjs";
import { getAuditLogs } from "../services/auditLogService";
import AuditDetailModal from "../components/AuditLog/AuditDetailModal";
import ResponsiveTable from "../components/ResponsiveTable";

const { RangePicker } = DatePicker;

const ACTION_LABEL_MAP = {
  DELETE: "Xóa",
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  LOGIN: "Đăng nhập",
  DELETE_REPORT: "Xóa báo cáo",
  DELETE_USER: "Xóa người dùng",
  DELETE_COMPANY: "Xóa công ty",
  DELETE_METRIC: "Xóa chỉ số",
};

const toVietnameseAction = (actionType = "") => {
  if (!actionType) return "-";
  const normalized = actionType.trim().toUpperCase();
  return ACTION_LABEL_MAP[normalized] || actionType;
};

const resolveActionColor = (actionType = "") => {
  const normalized = actionType.trim().toUpperCase();
  if (normalized.includes("DELETE")) return "red";
  if (normalized.includes("CREATE")) return "green";
  if (normalized.includes("UPDATE")) return "blue";
  if (normalized.includes("LOGIN")) return "gold";
  return "default";
};

const AuditLogs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // State phân trang
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State bộ lọc
  const [filters, setFilters] = useState({
    searchTerm: "",
    fromDate: null,
    toDate: null,
  });

  // State cho Modal chi tiết
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const fetchData = async (
    page = 1,
    pageSize = 10,
    currentFilters = filters,
  ) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
        FromDate: currentFilters.fromDate
          ? currentFilters.fromDate.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        ToDate: currentFilters.toDate
          ? currentFilters.toDate.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        SortBy: "timestamp",
        IsDescending: true,
      };

      if (
        currentFilters.searchTerm &&
        currentFilters.searchTerm.trim() !== ""
      ) {
        params.SearchTerm = currentFilters.searchTerm.trim();
      }

      const response = await getAuditLogs(params);
      setData(response.items || []);
      setPagination({
        current: response.pageNumber,
        pageSize: response.pageSize,
        total: response.totalCount,
      });
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, 10, filters);
  }, []);

  const handleSearchChange = (e) => {
    const newFilters = { ...filters, searchTerm: e.target.value };
    setFilters(newFilters);
  };

  const onDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      fromDate: dates ? dates[0] : null,
      toDate: dates ? dates[1] : null,
    });
  };

  const handleApplyFilter = () => {
    fetchData(1, pagination.pageSize, filters);
  };

  const handleResetFilter = () => {
    const resetFilters = {
      searchTerm: "",
      fromDate: null,
      toDate: null,
    };
    setFilters(resetFilters);
    setShowDateFilter(false);
    fetchData(1, pagination.pageSize, resetFilters);
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  // Render mobile actions
  const renderMobileActions = (record) => (
    <div className="flex gap-2 flex-wrap">
      {record.newValue || record.oldValue ? (
        <Button
          size="small"
          icon={<Eye size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(record);
          }}
          className="flex items-center gap-1 text-blue-600"
        >
          Xem chi tiết
        </Button>
      ) : (
        <span className="text-gray-400 text-sm">Không có dữ liệu</span>
      )}
    </div>
  );

  const columns = [
    {
      title: "STT",
      label: "STT",
      key: "index",
      width: 100,
      align: "center",
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Thời gian",
      label: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 200,
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Người thực hiện",
      label: "Người thực hiện",
      dataIndex: "username",
      key: "username",
      width: 200,
    },
    {
      title: "Hành động",
      label: "Hành động",
      dataIndex: "actionType",
      key: "actionType",
      width: 200,
      render: (text) => {
        return (
          <Tag color={resolveActionColor(text)}>{toVietnameseAction(text)}</Tag>
        );
      },
    },
    {
      title: "Mô tả",
      label: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div className="break-words whitespace-normal">{text}</div>
      ),
    },
    {
      title: "Chi tiết",
      label: "Chi tiết",
      key: "action",
      width: 200,
      align: "center",
      render: (_, record) =>
        record.newValue || record.oldValue ? (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  return (
    <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm h-full">
      <h2 className="text-base md:text-lg font-bold mb-4">Nhật ký hoạt động</h2>

      <div className="mb-4 md:mb-6 bg-gray-50 p-3 md:p-4 rounded-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="md:max-w-sm">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Người thực hiện
            </label>
            <Input
              placeholder="Nhập username..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              onPressEnter={handleApplyFilter}
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              className="w-full"
              size="middle"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => setShowDateFilter((prev) => !prev)}>
                {showDateFilter ? "Ẩn chọn ngày" : "Chọn ngày"}
              </Button>
              <Button onClick={handleResetFilter}>Đặt lại</Button>
              <Button
                type="primary"
                onClick={handleApplyFilter}
                icon={<SearchOutlined />}
              >
                Áp dụng
              </Button>
            </div>
          </div>

          <div>
            {showDateFilter && (
              <>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Ngày bắt đầu - Ngày kết thúc
                </label>
                <RangePicker
                  showTime
                  value={[filters.fromDate, filters.toDate]}
                  onChange={onDateRangeChange}
                  format="DD/MM/YYYY HH:mm"
                  placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                  className="w-full"
                  size="middle"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
            onChange: (page, pageSize) => fetchData(page, pageSize, filters),
          }}
          scroll={{ x: 800 }}
        />
      </div>

      {/* Mobile Responsive Table */}
      <div className="md:hidden">
        <ResponsiveTable
          data={data}
          columns={columns.filter((col) => col.key !== "action")}
          loading={loading}
          renderActions={renderMobileActions}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total) => `Tổng ${total} bản ghi`,
          }}
          onPaginationChange={(page, pageSize) => {
            fetchData(page, pageSize, filters);
          }}
          searchable={false}
        />
      </div>

      {/* Gọi Component ở đây */}
      <AuditDetailModal
        visible={modalVisible}
        record={selectedRecord}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default AuditLogs;
