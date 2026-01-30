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
} from "@ant-design/icons";
import dayjs from "dayjs";

// Import service và component con
import reportService from "../services/reportService";
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
  const fetchReports = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await reportService.getReports({
        PageNumber: page,
        PageSize: pageSize,
      });

      // API trả về object với items và pagination metadata
      const list = response.items || [];
      
      // Cập nhật pagination từ API response
      setPagination({
        current: response.pageNumber || 1,
        pageSize: response.pageSize || 10,
        total: response.totalCount || 0,
      });

      setReports(list);
      // Gọi lại filter để áp dụng cho dữ liệu mới tải
      filterData(list, currentTab);
    } catch (error) {
      console.error("Lỗi fetch:", error);
      message.error("Lỗi tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []); // Chạy 1 lần khi mount

  // --- LOGIC LỌC (FILTER) ---
  const filterData = (dataSource, tabKey) => {
    if (tabKey === "ALL") {
      setFilteredReports(dataSource);
    } else {
      // So sánh chính xác với status của API
      setFilteredReports(dataSource.filter((r) => r.status === tabKey));
    }
  };

  const onTabChange = (key) => {
    setCurrentTab(key);
    filterData(reports, key);
  };

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize);
  };

  // --- CÁC HÀM HÀNH ĐỘNG ---
  const handleQuickApprove = async (id) => {
    try {
      await reportService.approveReport(id);
      message.success("Đã duyệt báo cáo!");
      fetchReports(); // Tải lại bảng
    } catch (e) {
      message.error("Lỗi khi duyệt báo cáo");
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
      fetchReports(); // Tải lại bảng
    } catch (e) {
      message.error("Lỗi khi từ chối");
    } finally {
      setProcessing(false);
    }
  };

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      title: "Công ty",
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
      dataIndex: "uploadedAt", // Đã sửa thành uploadedAt
      key: "uploadedAt",
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Trạng thái",
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
      key: "action",
      width: 150,
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
          fetchReports(); // Refresh lại dữ liệu khi quay về
        }}
      />
    );
  }

  // 2. Mặc định -> Hiển thị Bảng quản lý
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card bordered={false} className="shadow-sm rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Phê duyệt
          </Title>
          <Button icon={<SyncOutlined />} onClick={fetchReports}>
            Làm mới
          </Button>
        </div>

        <Tabs
          activeKey={currentTab}
          onChange={onTabChange}
          type="card"
          items={[
            { key: "ALL", label: `Tất cả` },
            {
              key: "PendingApproval",
              label: `Chờ duyệt`,
              icon: <ClockCircleOutlined />,
            },
            {
              key: "Approved",
              label: `Đã duyệt`,
              icon: <CheckCircleOutlined />,
            },
            {
              key: "Rejected",
              label: `Đã từ chối`,
              icon: <CloseCircleOutlined />,
            },
          ]}
        />

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
