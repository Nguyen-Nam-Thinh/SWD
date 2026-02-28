import React, { useEffect, useState } from "react";
import { Button, message, Spin, Tag } from "antd";
import { ArrowLeftOutlined, FilePdfOutlined } from "@ant-design/icons";

// Import các component cũ
import DocumentViewer from "../DraftReport/DocumentViewer";
import MetricTable from "../DraftReport/MetricTable";
import reportService from "../../services/reportService";

const ReportApprovalView = ({ reportId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);
  const [details, setDetails] = useState([]);

  // State cho highlight metric trong PDF
  const [activeMetadata, setActiveMetadata] = useState(null);

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
      await reportService.updateReportStatus(reportId, "APPROVED");
      message.success("Đã duyệt báo cáo thành công!");
      onBack(); // Quay lại danh sách
    } catch (error) {
      // Error đã được xử lý bởi errorHandlerMiddleware
      console.error("Approve error:", error);
    } finally {
      setProcessing(false);
    }
  };
  // Xử lý "Đã xem xét" - Cập nhật lại dữ liệu details
  const handleReview = async () => {
    if (details.length === 0) {
      message.warning("Không có dữ liệu để cập nhật");
      return;
    }

    setProcessing(true);
    try {
      await reportService.updateReportDetails(reportId, details);
      message.success("Đã cập nhật lại dữ liệu báo cáo!");
      // Reload lại dữ liệu để đồng bộ
      const data = await reportService.getReportById(reportId);
      const { details: detailsData, ...info } = data;
      setReportInfo(info);
      setDetails(detailsData || []);
    } catch (error) {
      console.error("Review error:", error);
      message.error("Lỗi khi cập nhật dữ liệu");
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
    <div className="flex flex-col h-[calc(100vh-85px)] bg-white -m-6 md:-mx-4">
      {/* HEADER */}
      <div className="sticky top-16 h-auto md:h-16 border-b border-gray-200 px-3 md:px-6 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between bg-white shadow-sm z-30 gap-3 md:gap-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="hover:bg-gray-100"
            size="small"
          >
            <span className="hidden md:inline">Quay lại</span>
          </Button>
          <div className="hidden md:block h-8 w-px bg-gray-300"></div>
          <h2 className="text-sm md:text-lg font-semibold">
            Duyệt báo cáo #{reportId}
          </h2>
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
              {reportInfo.status === "PendingApproval"
                ? "Chờ duyệt"
                : reportInfo.status === "Approved"
                  ? "Đã duyệt"
                  : reportInfo.status === "Rejected"
                    ? "Từ chối"
                    : reportInfo.status}
            </Tag>
          )}
        </div>

        {/* Nút thao tác (Chỉ hiện nếu status là PendingApproval) */}
        {reportInfo?.status === "PendingApproval" && (
          <Button
            type="primary"
            onClick={handleReview}
            loading={processing}
            size="small"
          >
            <span className="hidden sm:inline">Đã xem xét</span>
            <span className="sm:hidden">Xem xét</span>
          </Button>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* PDF Viewer - Trên mobile ở trên, desktop ở bên trái */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-full border-b md:border-b-0 md:border-r border-gray-300 bg-gray-100 flex flex-col overflow-hidden">
          <DocumentViewer reportId={reportId} activeMetadata={activeMetadata} />
        </div>

        {/* Metric Table (READ ONLY) - Trên mobile ở dưới, desktop ở bên phải */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-full overflow-y-auto bg-white flex flex-col">
          <div className="p-2 md:p-3 bg-yellow-50 text-yellow-800 text-xs md:text-sm border-b flex items-center gap-2">
            <FilePdfOutlined />{" "}
            <span className="hidden md:inline">
              Chế độ xem xét: Số liệu không thể chỉnh sửa.
            </span>
            <span className="md:hidden">Chỉ xem</span>
          </div>
          <div className="p-3 md:p-6">
            <MetricTable
              data={details}
              loading={loading}
              readOnly={true}
              onValueChange={() => {}}
              onMetricFocus={handleMetricFocus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportApprovalView;
