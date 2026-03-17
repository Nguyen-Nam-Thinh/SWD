// src/pages/AuditLogs.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  DatePicker,
  Input,
  Tag,
  message,
  Button,
  Popover,
  Badge,
  Select,
  Divider,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
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

  // Danh sách action types lấy từ dữ liệu thực tế
  const [availableActionTypes, setAvailableActionTypes] = useState(new Set());

  // State phân trang
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State bộ lọc chính (đã áp dụng)
  const [filters, setFilters] = useState({
    searchTerm: "",
    fromDate: null,
    toDate: null,
    actionTypes: [],
  });

  // State bộ lọc tạm trong popup (chưa áp dụng)
  const [tempFilters, setTempFilters] = useState({
    fromDate: null,
    toDate: null,
    actionTypes: [],
  });

  // State cho Modal chi tiết
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // State cho Filter Popover
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // Page size riêng cho client-side filtering
  const [clientPageSize, setClientPageSize] = useState(10);

  // Tạo options cho dropdown từ action types thực tế
  const actionTypeOptions = useMemo(() => {
    return Array.from(availableActionTypes)
      .sort()
      .map((type) => ({
        value: type,
        label: ACTION_LABEL_MAP[type.trim().toUpperCase()] || type,
      }));
  }, [availableActionTypes]);

  // Đếm số filter đang active (ngoài search)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fromDate || filters.toDate) count++;
    if (filters.actionTypes.length > 0) count++;
    return count;
  }, [filters]);

  // Có đang dùng FE filter (actionTypes) không?
  const isClientFiltering = filters.actionTypes.length > 0;

  // Lọc data trên FE theo actionTypes
  const filteredData = useMemo(() => {
    if (!filters.actionTypes || filters.actionTypes.length === 0) {
      return data;
    }
    return data.filter((item) =>
      filters.actionTypes.includes(item.actionType),
    );
  }, [data, filters.actionTypes]);

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
      const items = response.items || [];
      setData(items);
      setPagination({
        current: response.pageNumber,
        pageSize: response.pageSize,
        total: response.totalCount,
      });

      // Tích lũy action types từ dữ liệu
      if (items.length > 0) {
        setAvailableActionTypes((prev) => {
          const newSet = new Set(prev);
          items.forEach((item) => {
            if (item.actionType) newSet.add(item.actionType);
          });
          return newSet;
        });
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, 10, filters);

    // Fetch thêm 1 batch lớn để lấy đầy đủ action types
    const fetchActionTypes = async () => {
      try {
        const response = await getAuditLogs({
          PageNumber: 1,
          PageSize: 200,
          SortBy: "timestamp",
          IsDescending: true,
        });
        const items = response.items || [];
        const types = new Set();
        items.forEach((item) => {
          if (item.actionType) types.add(item.actionType);
        });
        setAvailableActionTypes((prev) => {
          const merged = new Set(prev);
          types.forEach((t) => merged.add(t));
          return merged;
        });
      } catch (error) {
        console.error("Error fetching action types:", error);
      }
    };
    fetchActionTypes();
  }, []);

  // Search bar handlers
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleSearchEnter = () => {
    if (filters.actionTypes.length > 0) {
      // Khi đang filter actionTypes trên FE, cần fetch all
      fetchData(1, 9999, filters);
    } else {
      fetchData(1, pagination.pageSize, filters);
    }
  };

  // Filter popup handlers
  const handleOpenFilterPopover = () => {
    // Sync temp filters với filters hiện tại khi mở popup
    setTempFilters({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      actionTypes: [...filters.actionTypes],
    });
    setFilterPopoverOpen(true);
  };

  const handleTempDateRangeChange = (dates) => {
    setTempFilters((prev) => ({
      ...prev,
      fromDate: dates ? dates[0] : null,
      toDate: dates ? dates[1] : null,
    }));
  };

  const handleTempActionTypeChange = (values) => {
    setTempFilters((prev) => ({
      ...prev,
      actionTypes: values,
    }));
  };

  const handleApplyFilter = () => {
    const newFilters = {
      ...filters,
      fromDate: tempFilters.fromDate,
      toDate: tempFilters.toDate,
      actionTypes: tempFilters.actionTypes,
    };
    setFilters(newFilters);
    setFilterPopoverOpen(false);
    if (newFilters.actionTypes.length > 0) {
      // Fetch all data để lọc trên FE
      fetchData(1, 9999, newFilters);
    } else {
      fetchData(1, pagination.pageSize, newFilters);
    }
  };

  const handleResetFilter = () => {
    const resetTemp = {
      fromDate: null,
      toDate: null,
      actionTypes: [],
    };
    setTempFilters(resetTemp);
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

  // Nội dung popup filter
  const filterPopoverContent = (
    <div style={{ width: 340 }}>
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
          Khoảng thời gian
        </label>
        <RangePicker
          showTime
          value={[tempFilters.fromDate, tempFilters.toDate]}
          onChange={handleTempDateRangeChange}
          format="DD/MM/YYYY HH:mm"
          placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
          style={{ width: "100%" }}
          size="middle"
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
          Loại hành động
        </label>
        <Select
          mode="multiple"
          allowClear
          placeholder="Chọn loại hành động"
          value={tempFilters.actionTypes}
          onChange={handleTempActionTypeChange}
          options={actionTypeOptions}
          style={{ width: "100%" }}
          size="middle"
          maxTagCount="responsive"
        />
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button icon={<ReloadOutlined />} onClick={handleResetFilter}>
          Đặt lại
        </Button>
        <Button
          type="primary"
          icon={<FilterOutlined />}
          onClick={handleApplyFilter}
        >
          Áp dụng
        </Button>
      </div>
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
      <h2 className="text-base md:text-lg font-bold mb-4">
        Nhật ký hoạt động
      </h2>

      {/* Search bar + Filter button */}
      <div className="mb-4 md:mb-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm kiếm theo người thực hiện, mô tả..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          onPressEnter={handleSearchEnter}
          prefix={<SearchOutlined className="text-gray-400 cursor-pointer hover:text-blue-500" onClick={handleSearchEnter} />}
          allowClear
          style={{ maxWidth: 400 }}
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

        {/* Hiển thị tag các filter đang active */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(filters.fromDate || filters.toDate) && (
              <Tag
                closable
                onClose={() => {
                  const newFilters = {
                    ...filters,
                    fromDate: null,
                    toDate: null,
                  };
                  setFilters(newFilters);
                  if (newFilters.actionTypes.length > 0) {
                    fetchData(1, 9999, newFilters);
                  } else {
                    fetchData(1, pagination.pageSize, newFilters);
                  }
                }}
                color="blue"
              >
                {filters.fromDate?.format("DD/MM/YYYY") || "..."} →{" "}
                {filters.toDate?.format("DD/MM/YYYY") || "..."}
              </Tag>
            )}
            {filters.actionTypes.length > 0 && (
              <Tag
                closable
                onClose={() => {
                  const newFilters = { ...filters, actionTypes: [] };
                  setFilters(newFilters);
                  // Quay về server-side pagination
                  fetchData(1, 10, newFilters);
                }}
                color="purple"
              >
                {filters.actionTypes
                  .map((t) => ACTION_LABEL_MAP[t] || t)
                  .join(", ")}
              </Tag>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={
            isClientFiltering
              ? {
                pageSize: clientPageSize,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Tổng ${total} bản ghi`,
                onShowSizeChange: (_, size) => setClientPageSize(size),
              }
              : {
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Tổng ${total} bản ghi`,
                onChange: (page, pageSize) =>
                  fetchData(page, pageSize, filters),
              }
          }
          scroll={{ x: 800 }}
        />
      </div>

      {/* Mobile Responsive Table */}
      <div className="md:hidden">
        <ResponsiveTable
          data={filteredData}
          columns={columns.filter((col) => col.key !== "action")}
          loading={loading}
          renderActions={renderMobileActions}
          pagination={
            isClientFiltering
              ? {
                pageSize: clientPageSize,
                showTotal: (total) => `Tổng ${total} bản ghi`,
              }
              : {
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showTotal: (total) => `Tổng ${total} bản ghi`,
              }
          }
          onPaginationChange={(page, pageSize) => {
            if (!isClientFiltering) {
              fetchData(page, pageSize, filters);
            }
          }}
          searchable={false}
        />
      </div>

      {/* Modal chi tiết */}
      <AuditDetailModal
        visible={modalVisible}
        record={selectedRecord}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default AuditLogs;
