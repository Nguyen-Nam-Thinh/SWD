import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Tag,
  Space,
  message,
  Popconfirm,
  Modal,
} from "antd";
import {
  DeleteOutlined,
  AuditOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Eye, Trash2, Info } from "lucide-react";
import dayjs from "dayjs";
import reportService from "../services/reportService";
import ResponsiveTable from "../components/ResponsiveTable";

// Import đúng đường dẫn component con
import SplitComparisonView from "../components/DraftReport/SplitComparisonView";

const DraftReport = () => {
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 1. Fetch danh sách khi vào trang (hoặc khi không chọn báo cáo nào)
  useEffect(() => {
    if (!selectedReportId) {
      fetchDrafts();
    }
  }, [selectedReportId]); // Bỏ pagination.current khỏi dependency vì sẽ pagination ở client-side

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      // Lấy TẤT CẢ draft và rejected (pageSize lớn để lấy hết)
      const [draftRes, rejectedRes] = await Promise.all([
        reportService.getReports({
          pageNumber: 1,
          pageSize: 1000, // Lấy hết tất cả
          status: "Draft",
        }),
        reportService.getReports({
          pageNumber: 1,
          pageSize: 1000, // Lấy hết tất cả
          status: "Rejected",
        }),
      ]);

      // Merge 2 kết quả
      const combinedData = [
        ...(draftRes.items || []),
        ...(rejectedRes.items || []),
      ];

      // Loại bỏ duplicate (nếu có)
      const uniqueData = Array.from(
        new Map(combinedData.map((item) => [item.id, item])).values(),
      );

      // Sắp xếp theo ngày tạo mới nhất đến cũ nhất
      const sortedData = uniqueData.sort((a, b) => {
        const dateA = new Date(a.uploadedAt);
        const dateB = new Date(b.uploadedAt);
        return dateB - dateA; // Giảm dần (mới nhất trước)
      });

      setData(sortedData);
      // Set total đúng bằng số lượng data thực tế sau khi merge
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

  const handleDelete = async (id) => {
    try {
      await reportService.deleteReport(id);
      message.success("Đã xóa báo cáo");
      fetchDrafts();
    } catch (e) {
      console.error("Delete error:", e);
      if (e.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng thử lại.");
        // Retry sau khi token đã được refresh
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

  // --- LOGIC CHUYỂN MÀN HÌNH ---

  // Nếu có ID -> Hiển thị màn hình 2 cột (Split View)
  if (selectedReportId) {
    return (
      <SplitComparisonView
        reportId={selectedReportId}
        onBack={() => {
          setSelectedReportId(null); // Quay về list
          fetchDrafts(); // Refresh lại dữ liệu mới nhất
        }}
      />
    );
  }

  const columns = [
    {
      title: "Tên báo cáo",
      dataIndex: "fileName",
      key: "fileName",
      label: "Tên báo cáo",
      render: (text) => (
        <span
          className="font-medium text-blue-900 block truncate max-w-xs"
          title={text}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Công Ty",
      dataIndex: "companyName",
      key: "companyName",
      label: "Công ty",
      render: (text) => <Tag color="blue">{text || "N/A"}</Tag>,
    },
    {
      title: "Kỳ",
      key: "period",
      label: "Kỳ",
      render: (_, r) => (
        <span>
          {r.reportYear} {r.reportPeriod ? `- Quý ${r.reportPeriod}` : ""}
        </span>
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
      render: (status) => (
        <Tag color={status === "Rejected" ? "red" : "orange"}>
          {status === "Rejected" ? "Từ chối" : "Nháp"}
        </Tag>
      ),
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
    <Card
      title={
        <span className="text-sm md:text-base">Danh sách Báo cáo Nháp</span>
      }
      variant="borderless"
      className="shadow-sm h-full"
      extra={
        <Button
          onClick={fetchDrafts}
          icon={<FileTextOutlined />}
          size="small"
          className="md:size-default"
        >
          <span className="hidden md:inline">Làm mới</span>
        </Button>
      }
    >
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

      {/* Desktop Table - Ẩn trên mobile */}
      <div className="hidden md:block">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page) =>
              setPagination((prev) => ({ ...prev, current: page })),
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

      {/* Mobile/Tablet View - Chỉ hiện trên mobile */}
      <div className="md:hidden">
        <ResponsiveTable
          columns={mobileColumns}
          data={data}
          itemsPerPage={pagination.pageSize}
          searchable={true}
          searchPlaceholder="Tìm kiếm báo cáo..."
        />
      </div>
    </Card>
  );
};

export default DraftReport;
