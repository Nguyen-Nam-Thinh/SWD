// src/pages/AuditLogs.jsx
import React, { useState, useEffect } from "react";
import { Table, DatePicker, Input, Tag, message, Button, Space } from "antd";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Eye } from "lucide-react";
import dayjs from "dayjs";
import { getAuditLogs } from "../services/auditLogService";
import AuditDetailModal from "../components/AuditLog/AuditDetailModal";
import ResponsiveTable from "../components/ResponsiveTable";

const { RangePicker } = DatePicker;
const { Search } = Input;

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
    setFilters({ ...filters, searchTerm: e.target.value });
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

  const handleReset = () => {
    const resetState = {
      searchTerm: "",
      fromDate: null,
      toDate: null,
    };
    setFilters(resetState);
    fetchData(1, pagination.pageSize, resetState);
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
        let color = "default";
        if (text?.includes("Delete")) color = "red";
        else if (text?.includes("Create")) color = "green";
        else if (text?.includes("Update")) color = "blue";
        else if (text?.includes("Login")) color = "gold";
        return <Tag color={color}>{text}</Tag>;
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
      <div className="flex flex-col gap-3 mb-4 md:mb-6 bg-gray-50 p-3 md:p-4 rounded-md border border-gray-100">
        <RangePicker
          showTime
          value={[filters.fromDate, filters.toDate]}
          onChange={onDateRangeChange}
          format="DD/MM/YYYY HH:mm"
          className="w-full"
          size="small"
        />

        <Input
          placeholder="Tìm user, hành động..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          onPressEnter={handleApplyFilter}
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
          className="w-full"
          size="small"
        />

        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={handleApplyFilter}
            icon={<SearchOutlined />}
            size="small"
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Lọc dữ liệu</span>
            <span className="sm:hidden">Lọc</span>
          </Button>
          <Button
            onClick={handleReset}
            icon={<ReloadOutlined />}
            size="small"
            className="flex-1 sm:flex-none"
          >
            Reset
          </Button>
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
