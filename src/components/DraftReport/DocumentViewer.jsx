import { useEffect, useState } from "react";
import { Spin, Empty } from "antd";
import reportService from "../../services/reportService";

const DocumentViewer = ({ reportId }) => {
  // Bỏ prop activeBoundingBox
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (!reportId) return;

    const fetchPdf = async () => {
      setLoading(true);
      try {
        const blob = await reportService.getReportFile(reportId);
        // Tạo URL cho blob PDF
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("Lỗi tải PDF:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    // Cleanup khi component unmount
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [reportId]);

  if (loading)
    return (
      <div className="h-full flex justify-center items-center">
        <Spin tip="Đang tải tài liệu..." />
      </div>
    );
  if (!pdfUrl)
    return <Empty description="Chưa có tài liệu" className="mt-20" />;

  return (
    <div className="h-full w-full bg-gray-100 border-r border-gray-300">
      {/* Hiển thị PDF bằng trình duyệt mặc định - Ổn định nhất */}
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0`} // Ẩn toolbar mặc định cho gọn
        className="w-full h-full border-none"
        title="Document Viewer"
      />
    </div>
  );
};

export default DocumentViewer;
