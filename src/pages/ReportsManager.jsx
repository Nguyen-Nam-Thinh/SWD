import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Tabs,
  Space,
  Tooltip,
  Popconfirm,
  message,
  Modal,
  Input,
  Card,
  Typography,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Eye, CheckCircle, XCircle, Trash2 } from "lucide-react";
import dayjs from "dayjs";

// Import service và component con
import reportService from "../services/reportService";
import ResponsiveTable from "../components/ResponsiveTable";
// Đảm bảo đường dẫn import component con đúng với cấu trúc thư mục của bạn
import ReportApprovalView from "../components/Approval/ReportApprovalView";

const { Title } = Typography;

const ReportManager = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [currentTab, setCurrentTab] = useState("ALL");

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State xem chi tiết
  const [selectedReportId, setSelectedReportId] = useState(null);

  // State từ chối
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // --- LOGIC TẢI DỮ LIỆU ---
  const fetchReports = async (page = 1, pageSize = 10, status = null) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
      };

      // Thêm filter status nếu không phải "ALL"
      if (status && status !== "ALL") {
        params.Status = status;
      }

      const response = await reportService.getReports(params);

      // API trả về object với items và pagination metadata
      const list = response.items || [];

      // Cập nhật pagination từ API response
      setPagination({
        current: response.pageNumber || 1,
        pageSize: response.pageSize || 10,
        total: response.totalCount || 0,
      });

      setReports(list);
      // Không cần filter ở client nữa vì API đã filter rồi
      setFilteredReports(list);
    } catch (error) {
      console.error("Lỗi fetch:", error);
      message.error("Lỗi tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1, 10, currentTab);
  }, []); // Chạy 1 lần khi mount

  // --- LOGIC CHUYỂN TAB ---
  const onTabChange = (key) => {
    setCurrentTab(key);
    // Reset về trang 1 và fetch lại dữ liệu với status mới
    fetchReports(1, pagination.pageSize, key);
  };

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize, currentTab);
  };

  // --- CÁC HÀM HÀNH ĐỘNG ---
  const handleQuickApprove = async (id) => {
    try {
      await reportService.approveReport(id);
      message.success("Đã duyệt báo cáo!");
      fetchReports(pagination.current, pagination.pageSize, currentTab);
    } catch (e) {
      console.error("Approve error:", e);
      // Nếu là lỗi 400 nhưng có thể đã cập nhật DB, vẫn reload để kiểm tra
      if (e.response?.status === 400) {
        message.warning("Báo cáo có thể đã được duyệt, đang kiểm tra...");
        fetchReports(pagination.current, pagination.pageSize, currentTab);
      } else {
        message.error("Lỗi khi duyệt báo cáo");
      }
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do");
      return;
    }
    setProcessing(true);
    try {
      await reportService.rejectReport(rejectItem.id, rejectReason);
      message.success("Đã từ chối báo cáo!");
      setRejectModalOpen(false);
      fetchReports(pagination.current, pagination.pageSize, currentTab);
    } catch (e) {
      console.error("Reject error:", e);
      // Nếu là lỗi 400 nhưng có thể đã cập nhật DB, vẫn reload và đóng modal
      if (e.response?.status === 400) {
        message.warning("Báo cáo có thể đã bị từ chối, đang kiểm tra...");
        setRejectModalOpen(false);
        fetchReports(pagination.current, pagination.pageSize, currentTab);
      } else {
        message.error("Lỗi khi từ chối báo cáo");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id, companyName) => {
    try {
      await reportService.deleteReport(id);
      message.success(`Đã xóa báo cáo ${companyName}`);
      fetchReports(pagination.current, pagination.pageSize, currentTab); // Giữ nguyên trang hiện tại
    } catch (e) {
      message.error("Lỗi khi xóa báo cáo");
      console.error("Delete error:", e);
    }
  };

  // Render mobile actions
  const renderMobileActions = (record) => (
    <div className="flex gap-2 flex-wrap">
      <Button
        size="small"
        icon={<Eye size={14} />}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedReportId(record.id);
        }}
        className="flex items-center gap-1"
      >
        Xem
      </Button>

      {record.status === "PendingApproval" && (
        <>
          <div onClick={(e) => e.stopPropagation()}>
            <Popconfirm
              title="Duyệt báo cáo này?"
              onConfirm={() => handleQuickApprove(record.id)}
              okText="Duyệt"
              cancelText="Hủy"
            >
              <Button
                size="small"
                type="primary"
                ghost
                icon={<CheckCircle size={14} />}
                className="flex items-center gap-1 text-green-600 border-green-600"
              >
                Duyệt
              </Button>
            </Popconfirm>
          </div>
          <Button
            size="small"
            danger
            icon={<XCircle size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              setRejectItem(record);
              setRejectReason("");
              setRejectModalOpen(true);
            }}
            className="flex items-center gap-1"
          >
            Từ chối
          </Button>
        </>
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <Popconfirm
          title="Xác nhận xóa báo cáo"
          description={`Bạn có chắc chắn muốn xóa báo cáo của ${record.companyName}?`}
          onConfirm={() => handleDelete(record.id, record.companyName)}
          okText="Đồng ý"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button
            size="small"
            danger
            icon={<Trash2 size={14} />}
            className="flex items-center gap-1"
          >
            Xóa
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      title: "Công ty",
      label: "Công ty",
      dataIndex: "companyName",
      key: "companyName",
      render: (t, r) => (
        <div>
          <div className="font-bold text-gray-700">{t}</div>
          <div className="text-xs text-gray-500">
            Năm {r.reportYear} - Quý {r.reportPeriod}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      label: "Ngày tạo",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Trạng thái",
      label: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let label = status;

        // Mapping status từ API sang giao diện
        if (status === "PendingApproval") {
          color = "orange";
          label = "Chờ duyệt";
        } else if (status === "Approved") {
          color = "green";
          label = "Đã duyệt";
        } else if (status === "Rejected") {
          color = "red";
          label = "Từ chối";
        } else if (status === "Draft") {
          color = "blue";
          label = "Nháp";
        }

        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Hành động",
      label: "Hành động",
      key: "action",
      width: 200,
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => setSelectedReportId(r.id)}
            />
          </Tooltip>

          {/* Chỉ hiện nút duyệt/từ chối khi status là PendingApproval */}
          {r.status === "PendingApproval" && (
            <>
              <Tooltip title="Duyệt nhanh">
                <Popconfirm
                  title="Duyệt báo cáo này?"
                  onConfirm={() => handleQuickApprove(r.id)}
                  okText="Duyệt"
                  cancelText="Hủy"
                >
                  <Button
                    type="primary"
                    ghost
                    icon={<CheckCircleOutlined />}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setRejectItem(r);
                    setRejectReason("");
                    setRejectModalOpen(true);
                  }}
                />
              </Tooltip>
            </>
          )}

          {/* Nút xóa - Hiện với tất cả trạng thái */}
          <Tooltip title="Xóa báo cáo">
            <Popconfirm
              title="Xác nhận xóa báo cáo"
              description={`Bạn có chắc chắn muốn xóa báo cáo của ${r.companyName}?`}
              onConfirm={() => handleDelete(r.id, r.companyName)}
              okText="Đồng ý"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // --- RENDER GIAO DIỆN ---

  // 1. Nếu đang chọn xem chi tiết -> Hiển thị Component con
  if (selectedReportId) {
    return (
      <ReportApprovalView
        reportId={selectedReportId}
        onBack={() => {
          setSelectedReportId(null);
          fetchReports(pagination.current, pagination.pageSize, currentTab); // Refresh lại dữ liệu khi quay về
        }}
      />
    );
  }

  // 2. Mặc định -> Hiển thị Bảng quản lý
  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
      <Card bordered={false} className="shadow-sm rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
          <Title
            level={3}
            className="!text-lg md:!text-2xl"
            style={{ margin: 0 }}
          >
            Quản lý Phê duyệt
          </Title>
          <Button
            icon={<SyncOutlined />}
            onClick={() =>
              fetchReports(pagination.current, pagination.pageSize, currentTab)
            }
            size="small"
            className="md:!h-8"
          >
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        </div>

        <Tabs
          activeKey={currentTab}
          onChange={onTabChange}
          type="card"
          size="small"
          className="responsive-tabs"
          items={[
            {
              key: "ALL",
              label: <span className="text-xs md:text-sm">Tất cả</span>,
            },
            {
              key: "PendingApproval",
              label: <span className="text-xs md:text-sm">Chờ duyệt</span>,
              icon: <ClockCircleOutlined className="text-xs md:text-sm" />,
            },
            {
              key: "Approved",
              label: <span className="text-xs md:text-sm">Đã duyệt</span>,
              icon: <CheckCircleOutlined className="text-xs md:text-sm" />,
            },
            {
              key: "Rejected",
              label: <span className="text-xs md:text-sm">Đã từ chối</span>,
              icon: <CloseCircleOutlined className="text-xs md:text-sm" />,
            },
          ]}
        />

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={filteredReports}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showTotal: (total) => `Tổng ${total} báo cáo`,
            }}
            onChange={handleTableChange}
            className="mt-4"
          />
        </div>

        {/* Mobile Responsive Table */}
        <div className="md:hidden mt-4">
          <ResponsiveTable
            data={filteredReports}
            columns={columns}
            loading={loading}
            onRowClick={(record) => setSelectedReportId(record.id)}
            renderActions={renderMobileActions}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showTotal: (total) => `Tổng ${total} báo cáo`,
            }}
            onPaginationChange={(page, pageSize) => {
              fetchReports(page, pageSize, currentTab);
            }}
          />
        </div>
      </Card>

      {/* Modal Từ chối */}
      <Modal
        title={`Từ chối báo cáo: ${rejectItem?.companyName}`}
        open={rejectModalOpen}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true, loading: processing }}
        cancelText="Hủy"
      >
        <p className="mb-2 font-medium">Lý do từ chối (Bắt buộc):</p>
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do sai lệch hoặc yêu cầu chỉnh sửa..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ReportManager;
