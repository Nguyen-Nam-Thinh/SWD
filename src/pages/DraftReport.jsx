import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  message,
  Popconfirm,
  Modal,
  Input,
  Select,
  Popover,
  Badge,
  Tag,
  Divider,
} from "antd";
import {
  DeleteOutlined,
  AuditOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Eye, Trash2, Info } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import reportService from "../services/reportService";
import ResponsiveTable from "../components/ResponsiveTable";
import ReportStatusTag from "../components/common/ReportStatusTag";

// Import đúng đường dẫn component con
import SplitComparisonView from "../components/DraftReport/SplitComparisonView";

const DraftReport = () => {
  const navigate = useNavigate();
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Search state
  const [searchValue, setSearchValue] = useState("");

  // Filter states (applied)
  const [statusFilter, setStatusFilter] = useState(undefined);

  // Temp filter states (in popup)
  const [tempStatusFilter, setTempStatusFilter] = useState(undefined);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter) count++;
    return count;
  }, [statusFilter]);

  // Client-side filtered data
  const filteredData = useMemo(() => {
    let result = data;

    // Filter by search
    if (searchValue.trim()) {
      const keyword = searchValue.trim().toLowerCase();
      result = result.filter(
        (item) =>
          (item.fileName || "").toLowerCase().includes(keyword) ||
          (item.companyName || "").toLowerCase().includes(keyword),
      );
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter((item) => item.status === statusFilter);
    }

    return result;
  }, [data, searchValue, statusFilter]);

  // 1. Fetch danh sách khi vào trang (hoặc khi không chọn báo cáo nào)
  useEffect(() => {
    if (!selectedReportId) {
      fetchDrafts();
    }
  }, [selectedReportId]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const [draftRes, rejectedRes] = await Promise.all([
        reportService.getReports({
          PageNumber: 1,
          PageSize: 1000,
          Status: "Draft",
        }),
        reportService.getReports({
          PageNumber: 1,
          PageSize: 1000,
          Status: "Rejected",
        }),
      ]);

      const combinedData = [
        ...(draftRes.items || []),
        ...(rejectedRes.items || []),
      ];

      const uniqueData = Array.from(
        new Map(combinedData.map((item) => [item.id, item])).values(),
      );

      const sortedData = uniqueData.sort((a, b) => {
        const dateA = new Date(a.uploadedAt);
        const dateB = new Date(b.uploadedAt);
        return dateB - dateA;
      });

      setData(sortedData);
      setPagination((prev) => ({
        ...prev,
        total: sortedData.length,
      }));
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = () => {
    // Client-side search, no need to refetch
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Filter popup handlers
  const handleOpenFilterPopover = () => {
    setTempStatusFilter(statusFilter);
    setFilterPopoverOpen(true);
  };

  const handleApplyPopoverFilters = () => {
    setStatusFilter(tempStatusFilter);
    setFilterPopoverOpen(false);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleResetPopoverFilters = () => {
    setTempStatusFilter(undefined);
  };

  const handleDelete = async (id) => {
    try {
      await reportService.deleteReport(id);
      message.success("Đã xóa báo cáo");
      fetchDrafts();
    } catch (e) {
      console.error("Delete error:", e);
      if (e.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng thử lại.");
        setTimeout(async () => {
          try {
            await reportService.deleteReport(id);
            message.success("Đã xóa báo cáo");
            fetchDrafts();
          } catch (retryError) {
            message.error("Không thể xóa báo cáo. Vui lòng đăng nhập lại.");
          }
        }, 500);
      } else {
        message.error(e.response?.data?.message || "Lỗi xóa báo cáo");
      }
    }
  };

  const handleOpenOrDownloadFile = async (record) => {
    try {
      message.loading({ content: "Đang mở tệp...", key: "open-file" });
      const blob = await reportService.getReportFile(record.id);
      const fileUrl = URL.createObjectURL(blob);

      const opened = window.open(fileUrl, "_blank", "noopener,noreferrer");

      if (!opened) {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = record.fileName || `bao-cao-${record.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setTimeout(() => URL.revokeObjectURL(fileUrl), 30000);
      message.success({ content: "Đã xử lý tệp", key: "open-file" });
    } catch (error) {
      console.error("Open file error:", error);
      message.error({ content: "Không thể mở tệp báo cáo", key: "open-file" });
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
          Trạng thái
        </label>
        <Select
          value={tempStatusFilter}
          onChange={setTempStatusFilter}
          className="w-full"
          allowClear
          placeholder="Chọn trạng thái"
          options={[
            { value: "Draft", label: "Nháp" },
            { value: "Rejected", label: "Từ chối" },
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

  // --- LOGIC CHUYỂN MÀN HÌNH ---
  if (selectedReportId) {
    return (
      <SplitComparisonView
        reportId={selectedReportId}
        onBack={() => {
          setSelectedReportId(null);
          fetchDrafts();
        }}
      />
    );
  }

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
      title: "Tên báo cáo",
      dataIndex: "fileName",
      key: "fileName",
      label: "Tên báo cáo",
      render: (text, record) => (
        <Button
          type="link"
          className="!px-0 font-medium block truncate max-w-xs"
          title={text}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenOrDownloadFile(record);
          }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Công ty",
      dataIndex: "company",
      key: "company",
      label: "Công ty",
      render: (_, r) => (
        <div>
          <div className="font-bold text-gray-700">
            {r.companyName || "Không có"}
          </div>
          <div className="text-xs text-gray-500">
            Năm {r.reportYear}
            {r.reportPeriod ? ` - Quý ${r.reportPeriod}` : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      label: "Ngày tạo",
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      label: "Trạng thái",
      render: (status) => <ReportStatusTag status={status} />,
    },
    {
      title: "Hành động",
      key: "action",
      label: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<AuditOutlined />}
            onClick={(e) => {
              e?.stopPropagation();
              setSelectedReportId(record.id);
            }}
            className="bg-blue-600 hover:bg-blue-500"
          >
            Đối chiếu
          </Button>

          <Popconfirm
            title="Xóa?"
            onConfirm={() => handleDelete(record.id)}
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>

          {record.status === "Rejected" && record.rejectionReason && (
            <Button
              icon={<InfoCircleOutlined />}
              danger
              onClick={(e) => {
                e?.stopPropagation();
                const isExpanded = expandedRowKeys.includes(record.id);
                setExpandedRowKeys(isExpanded ? [] : [record.id]);
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  // Mobile columns với actions icons từ lucide-react
  const mobileActionsColumn = {
    key: "actions",
    label: "Thao tác",
    render: (_, record) => (
      <div className="flex gap-2 justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReportId(record.id);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Đối chiếu"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            Modal.confirm({
              title: "Xác nhận xóa",
              content: "Bạn có chắc muốn xóa báo cáo này?",
              okText: "Xóa",
              okType: "danger",
              cancelText: "Hủy",
              centered: true,
              onOk: () => handleDelete(record.id),
            });
          }}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Xóa"
        >
          <Trash2 size={16} />
        </button>
        {record.status === "Rejected" && record.rejectionReason && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              message.info({
                content: (
                  <div>
                    <p className="font-semibold mb-2">Lý do từ chối:</p>
                    <p>{record.rejectionReason}</p>
                  </div>
                ),
                duration: 5,
              });
            }}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
            title="Xem lý do từ chối"
          >
            <Info size={16} />
          </button>
        )}
      </div>
    ),
  };

  const mobileColumns = [...columns.slice(0, -1), mobileActionsColumn];

  return (
    <>
      <Button
        icon={<ArrowLeftOutlined />}
        type="link"
        onClick={() => navigate("/dashboard/reports")}
        className="mb-2 pl-0"
      >
        Quay về Quản lý Báo cáo
      </Button>

      <Card
        title={
          <span className="text-sm md:text-base">Danh sách Báo cáo Nháp</span>
        }
        variant="borderless"
        className="shadow-sm h-full"
      >
        {/* Search bar + Filter button */}
        <div className="mb-4 md:mb-6 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Tìm kiếm theo tên báo cáo, công ty..."
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

          {/* Active filter tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {statusFilter && (
                <Tag
                  closable
                  onClose={() => {
                    setStatusFilter(undefined);
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  color="blue"
                >
                  {statusFilter === "Draft" ? "Nháp" : "Từ chối"}
                </Tag>
              )}
            </div>
          )}
        </div>

        <style>
          {`
          .rejected-row {
            background-color: #fef2f2 !important;
          }
          .rejected-row:hover > td {
            background-color: #fee2e2 !important;
          }
        `}
        </style>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            pagination={{
              ...pagination,
              total: filteredData.length,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Tổng ${total} báo cáo`,
              onChange: (page, pageSize) =>
                setPagination((prev) => ({
                  ...prev,
                  current: page,
                  pageSize,
                })),
            }}
            rowClassName={(record) =>
              record.status === "Rejected" ? "rejected-row" : ""
            }
            expandable={{
              expandedRowKeys: expandedRowKeys,
              onExpand: (expanded, record) => {
                setExpandedRowKeys(expanded ? [record.id] : []);
              },
              expandedRowRender: (record) => (
                <div className="bg-red-50 p-4 border-l-4 border-red-500">
                  <p className="font-semibold text-red-800 mb-2">
                    Lý do từ chối:
                  </p>
                  <p className="text-gray-700">{record.rejectionReason}</p>
                </div>
              ),
              rowExpandable: (record) =>
                record.status === "Rejected" && !!record.rejectionReason,
              expandIcon: () => null,
            }}
          />
        </div>

        {/* Mobile/Tablet View */}
        <div className="md:hidden">
          <ResponsiveTable
            columns={mobileColumns}
            data={filteredData}
            itemsPerPage={pagination.pageSize}
            searchable={false}
            searchPlaceholder="Tìm kiếm báo cáo..."
          />
        </div>
      </Card>
    </>
  );
};

export default DraftReport;
