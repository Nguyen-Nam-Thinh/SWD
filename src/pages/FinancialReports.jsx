import { useState, useEffect } from "react";
import { Input, Card, Tag, Empty, Spin, message, Tabs, Button } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FileSearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import financialReportService from "../services/financialReportService";
import FinancialChart from "../components/FinancialChart";
import PublicHeader from "../components/PublicHeader";

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("reports");

  // Load approved reports
  useEffect(() => {
    loadApprovedReports();
  }, []);

  // Filter reports khi search
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = reports.filter(
        (report) =>
          report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (report.ticker &&
            report.ticker.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  }, [searchTerm, reports]);

  const loadApprovedReports = async () => {
    setLoading(true);
    try {
      const data = await financialReportService.getApprovedReports({
        PageNumber: 1,
        PageSize: 100,
      });
      setReports(data.items || []);
      setFilteredReports(data.items || []);
    } catch (error) {
      message.error("Không thể tải danh sách báo cáo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl) => {
    // Tạo URL để download file
    const downloadUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${fileUrl}`;
    window.open(downloadUrl, "_blank");
  };

  const handleCardClick = () => {
    // Chuyển sang tab biểu đồ khi click vào card
    setActiveTab("chart");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      <PublicHeader />

      {/* Header Section - với padding-top để tránh bị che bởi fixed header */}
      <div className="bg-white shadow-sm border-b border-slate-200 pt-16">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Báo Cáo Tài Chính Công Ty
          </h1>
          <p className="text-slate-600">
            Danh sách các báo cáo tài chính đã được phê duyệt
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Tabs for switching between Reports and Chart */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: "reports",
              label: (
                <span className="flex items-center gap-2">
                  <FileSearchOutlined />
                  Danh sách báo cáo
                </span>
              ),
              children: (
                <>
                  {/* Search Bar */}
                  <div className="mb-6">
                    <Input
                      size="large"
                      placeholder="Tìm kiếm theo tên công ty hoặc mã cổ phiếu..."
                      prefix={<SearchOutlined className="text-slate-400" />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-2xl"
                    />
                  </div>

                  {/* Reports Grid */}
                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <Spin size="large" tip="Đang tải báo cáo..." />
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <Empty
                      description={
                        searchTerm
                          ? "Không tìm thấy báo cáo phù hợp"
                          : "Chưa có báo cáo nào được phê duyệt"
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredReports.map((report) => (
                        <Card
                          key={report.id}
                          hoverable
                          className="shadow-md hover:shadow-xl transition-all"
                          onClick={() => handleCardClick()}
                        >
                          <div className="space-y-4">
                            {/* Company Info */}
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-bold text-slate-900 flex-1">
                                  {report.companyName}
                                </h3>
                                {report.ticker && (
                                  <Tag color="blue" className="ml-2">
                                    {report.ticker}
                                  </Tag>
                                )}
                              </div>
                              <Tag color="success" icon={<FileTextOutlined />}>
                                {report.status}
                              </Tag>
                            </div>

                            {/* Report Details */}
                            <div className="space-y-2 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <CalendarOutlined />
                                <span>
                                  Năm: <strong>{report.reportYear}</strong> -
                                  Kỳ: <strong>Q{report.reportPeriod}</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileTextOutlined />
                                <span className="truncate">
                                  {report.fileName}
                                </span>
                              </div>
                            </div>

                            {/* Upload Info */}
                            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                              <div>
                                Tải lên bởi:{" "}
                                <strong>{report.uploadedByUsername}</strong>
                              </div>
                              <div>
                                Ngày:{" "}
                                {new Date(report.uploadedAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </div>
                            </div>

                            {/* Download Button */}
                            <div className="pt-3 border-t border-slate-100">
                              <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(report.filePath);
                                }}
                                block
                              >
                                Tải xuống báo cáo
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ),
            },
            {
              key: "chart",
              label: (
                <span className="flex items-center gap-2">
                  <BarChartOutlined />
                  Biểu đồ phân tích
                </span>
              ),
              children: <FinancialChart />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FinancialReports;
