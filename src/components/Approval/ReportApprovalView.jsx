import React, { useEffect, useState } from "react";
import {
  Button,
  message,
  Space,
  Popconfirm,
  Spin,
  Modal,
  Input,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";

// Import các component cũ
import DocumentViewer from "../DraftReport/DocumentViewer";
import MetricTable from "../DraftReport/MetricTable";
import reportService from "../../services/reportService";
import { usePermission, useCurrentUser } from "../../hooks/useAuth";
import { authMiddleware } from "../../middleware";

const ReportApprovalView = ({ reportId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);
  const [details, setDetails] = useState([]);

  // State Modal Từ chối
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // State cho highlight metric trong PDF
  const [activeMetadata, setActiveMetadata] = useState(null);

  // Check permissions - chỉ Manager và Admin có quyền approve/reject
  const canApprove = usePermission("approve_report", false);
  const canReject = usePermission("reject_report", false);
  const currentUser = useCurrentUser();

  // Load dữ liệu
  useEffect(() => {
    if (!reportId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await reportService.getReportById(reportId);
        const { details: detailsData, ...info } = data;
        setReportInfo(info);
        setDetails(detailsData || []);
      } catch (error) {
        console.error(error);
        message.error("Không thể tải chi tiết báo cáo");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [reportId]);

  // Xử lý focus vào metric trong PDF
  const handleMetricFocus = (boundingBox, pageNumber) => {
    setActiveMetadata({ boundingBox, pageNumber });
  };

  // Xử lý Duyệt
  const handleApprove = async () => {
    // Double check permission
    if (!canApprove) {
      message.error("Bạn không có quyền duyệt báo cáo");
      return;
    }

    setProcessing(true);
    try {
      await reportService.approveReport(reportId);
      message.success("Đã duyệt báo cáo thành công!");
      onBack(); // Quay lại danh sách
    } catch (error) {
      // Error đã được xử lý bởi errorHandlerMiddleware
      console.error("Approve error:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Xử lý Từ chối
  const handleRejectSubmit = async () => {
    // Double check permission
    if (!canReject) {
      message.error("Bạn không có quyền từ chối báo cáo");
      return;
    }

    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối");
      return;
    }

    setProcessing(true);
    try {
      await reportService.rejectReport(reportId, rejectReason);
      message.success("Đã từ chối báo cáo!");
      setIsRejectModalOpen(false);
      onBack();
    } catch (error) {
      // Error đã được xử lý bởi errorHandlerMiddleware
      console.error("Reject error:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="h-full flex justify-center items-center">
        <Spin />
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] bg-white -m-6">
      {/* HEADER */}
      <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="hover:bg-gray-100"
          >
            Quay lại
          </Button>
          <div className="h-8 w-px bg-gray-300"></div>
          <h2 className="text-lg font-semibold">Duyệt báo cáo #{reportId}</h2>
          {reportInfo?.status && (
            <Tag
              color={
                reportInfo.status === "Approved"
                  ? "green"
                  : reportInfo.status === "Rejected"
                    ? "red"
                    : "orange"
              }
            >
              {reportInfo.status}
            </Tag>
          )}
        </div>

        {/* Nút thao tác (Chỉ hiện nếu status là Pending và có quyền) */}
        {reportInfo?.status === "Pending" && (canApprove || canReject) && (
          <Space>
            {canReject && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setIsRejectModalOpen(true)}
              >
                Từ chối
              </Button>
            )}
            {canApprove && (
              <Popconfirm
                title="Duyệt báo cáo này?"
                description={`Bạn (${currentUser?.fullName}) sẽ phê duyệt báo cáo này.`}
                onConfirm={handleApprove}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={processing}
                  className="bg-green-600"
                >
                  Phê duyệt
                </Button>
              </Popconfirm>
            )}
          </Space>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-1/2 h-full border-r border-gray-300 bg-gray-100 flex flex-col">
          <DocumentViewer reportId={reportId} activeMetadata={activeMetadata} />
        </div>

        {/* Metric Table (READ ONLY) */}
        <div className="w-1/2 h-full overflow-y-auto bg-white flex flex-col">
          <div className="p-3 bg-yellow-50 text-yellow-800 text-sm border-b flex items-center gap-2">
            <FilePdfOutlined /> Chế độ xem xét: Số liệu không thể chỉnh sửa.
          </div>
          <div className="p-6">
            <MetricTable
              data={details}
              loading={loading}
              readOnly={true} // Bật cờ này để disable input
              onValueChange={() => {}}
              onMetricFocus={handleMetricFocus}
            />
          </div>
        </div>
      </div>

      {/* Modal Từ chối */}
      <Modal
        title="Từ chối báo cáo"
        open={isRejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => setIsRejectModalOpen(false)}
        okText="Xác nhận"
        okButtonProps={{ danger: true, loading: processing }}
      >
        <p>Lý do từ chối:</p>
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ReportApprovalView;
