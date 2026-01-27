// src/pages/AuditLogs.jsx
import React, { useState, useEffect } from "react";
import { Table, DatePicker, Input, Tag, message, Button, Space } from "antd";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getAuditLogs } from "../services/auditLogService";
import AuditDetailModal from "../components/AuditLog/AuditDetailModal";

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

  const fetchData = async (page = 1, pageSize = 10, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
        FromDate: currentFilters.fromDate ? currentFilters.fromDate.format('YYYY-MM-DDTHH:mm:ss') : null,
        ToDate: currentFilters.toDate ? currentFilters.toDate.format('YYYY-MM-DDTHH:mm:ss') : null,
        SortBy: "timestamp",
        IsDescending: true,
      };

      if (currentFilters.searchTerm && currentFilters.searchTerm.trim() !== "") {
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

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 100,
      align: 'center',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 200,
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm:ss")
    },
    {
      title: "Người thực hiện",
      dataIndex: "username",
      key: "username",
      width: 200,
    },
    {
      title: "Hành động",
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
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Chi tiết",
      key: "action",
      width: 200,
      align: 'center',
      render: (_, record) => (
        (record.newValue || record.oldValue) ? (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
        ) : <span className="text-gray-400">-</span>
      )
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-gray-50 p-4 rounded-md border border-gray-100">
        <RangePicker
          showTime
          value={[filters.fromDate, filters.toDate]}
          onChange={onDateRangeChange}
          format="DD/MM/YYYY HH:mm"
          className="w-full md:w-auto"
        />

        <Input
          placeholder="Tìm user, hành động..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          onPressEnter={handleApplyFilter}
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
          className="w-full md:w-64"
        />

        <Space>
          <Button type="primary" onClick={handleApplyFilter} icon={<SearchOutlined />}>
            Lọc dữ liệu
          </Button>
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            Reset
          </Button>
        </Space>
      </div>

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
          onChange: (page, pageSize) => fetchData(page, pageSize, filters)
        }}
        scroll={{ x: 800 }}
      />

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