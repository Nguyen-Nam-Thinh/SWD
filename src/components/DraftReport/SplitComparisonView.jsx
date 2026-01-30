import { useEffect, useState } from "react";
import { Button, message, Space, Popconfirm, Spin } from "antd";
import { ArrowLeftOutlined, SaveOutlined, SendOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import DocumentViewer from "../DraftReport/DocumentViewer";
import MetricTable from "../DraftReport/MetricTable";
import reportService from "../../services/reportService";

const SplitComparisonView = ({ reportId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeMetadata, setActiveMetadata] = useState(null);
  const [reportInfo, setReportInfo] = useState(null);
  const [details, setDetails] = useState([]);

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
        console.error("Lỗi tải chi tiết:", error);
        message.error("Không thể tải chi tiết báo cáo");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [reportId]);

  const handleValueChange = (value, metricCode) => {
    setDetails((prev) => {
      const newDetails = [...prev];
      const idx = newDetails.findIndex((item) => item.metricCode === metricCode);
      if (idx > -1) newDetails[idx].finalValue = value;
      return newDetails;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changedItems = details.filter((item) => item.aiValue !== item.finalValue);
      if (changedItems.length === 0) {
        message.info("Chưa có thay đổi để lưu.");
        setSaving(false); return;
      }
      await reportService.saveDraftDetails(reportId, changedItems);
      message.success("Đã lưu nháp!");
    } catch (error) {
      message.error("Lỗi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      message.loading({ content: "Đang xử lý...", key: "submit" });
      await reportService.saveDraftDetails(reportId, details);
      await reportService.submitForApproval(reportId);
      message.success({ content: "Gửi duyệt thành công!", key: "submit" });
      onBack();
    } catch (error) {
      message.error({ content: "Gửi duyệt thất bại", key: "submit" });
    }
  };

  const handleMetricFocus = (boundingBox, pageNumber) => {
    setActiveMetadata({ boundingBox, pageNumber });
  };

  if (loading) {
    return <div className="h-[calc(100vh-100px)] flex flex-col justify-center items-center bg-gray-50"><Spin size="large" /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] bg-white -m-6">
      {/* HEADER */}
      <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Quay lại</Button>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          <div className="flex flex-col">
            <div className="font-bold text-lg text-gray-800 leading-tight">{reportInfo?.companyName || "---"}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 px-1.5 rounded font-medium">{reportInfo?.year}</span>
              <span>• Quý {reportInfo?.period}</span>
            </div>
          </div>
        </div>
        <Space>
          <Button icon={<SaveOutlined />} loading={saving} onClick={handleSave}>Lưu nháp</Button>
          <Popconfirm title="Xác nhận gửi duyệt?" onConfirm={handleSubmit} okText="Gửi đi" cancelText="Hủy" icon={<ExclamationCircleOutlined style={{ color: "#1890ff" }} />}>
            <Button type="primary" icon={<SendOutlined />} className="bg-blue-600">Gửi duyệt</Button>
          </Popconfirm>
        </Space>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-1/2 h-full border-r border-gray-300 bg-gray-100 flex flex-col overflow-hidden">
          <DocumentViewer reportId={reportId} activeMetadata={activeMetadata} />
        </div>
        <div className="w-1/2 h-full overflow-y-auto bg-white flex flex-col">
          <div className="p-6">
            <MetricTable data={details} loading={loading} onValueChange={handleValueChange} onMetricFocus={handleMetricFocus} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitComparisonView;