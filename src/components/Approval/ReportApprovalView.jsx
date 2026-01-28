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

const ReportApprovalView = ({ reportId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);
  const [details, setDetails] = useState([]);

  // State Modal Từ chối
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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

  // Xử lý Duyệt
  const handleApprove = async () => {
    setProcessing(true);
    try {
      await reportService.approveReport(reportId);
      message.success("Đã duyệt báo cáo thành công!");
      onBack(); // Quay lại danh sách
    } catch (error) {
      message.error("Lỗi khi duyệt báo cáo");
    } finally {
      setProcessing(false);
    }
  };

  // Xử lý Từ chối
  const handleRejectSubmit = async () => {
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
      message.error("Lỗi khi từ chối báo cáo");
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
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại
          </Button>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          <div>
            <div className="font-bold text-lg text-gray-800">
              {reportInfo?.companyName}
            </div>
            <div className="text-xs text-gray-500">
              Năm {reportInfo?.year} • Quý {reportInfo?.period}
            </div>
          </div>
        </div>

        {/* Nút thao tác (Chỉ hiện nếu status là Pending) */}
        {reportInfo?.status === "Pending" && (
          <Space>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setIsRejectModalOpen(true)}
            >
              Từ chối
            </Button>
            <Popconfirm
              title="Duyệt báo cáo này?"
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
          </Space>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-1/2 h-full border-r border-gray-300 bg-gray-100 flex flex-col">
          <DocumentViewer reportId={reportId} />
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
