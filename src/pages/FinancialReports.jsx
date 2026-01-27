import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input, Card, Tag, Empty, Spin, message } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Menu } from "lucide-react";
import financialReportService from "../services/financialReportService";

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* --- HEADER / NAVBAR --- */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              U
            </div>
            UNICA FINANCE
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="/#features"
              className="hover:text-blue-600 transition-colors"
            >
              Tính năng
            </a>
            <a
              href="/#solutions"
              className="hover:text-blue-600 transition-colors"
            >
              Giải pháp
            </a>
            <a
              href="/#pricing"
              className="hover:text-blue-600 transition-colors"
            >
              Bảng giá
            </a>
            <Link
              to="/financial-reports"
              className="hover:text-blue-600 transition-colors font-semibold text-blue-600"
            >
              Xem các công ty
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              Đăng nhập
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-blue-600/20"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            <Menu />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4">
            <a href="/#features" className="block text-slate-600 font-medium">
              Tính năng
            </a>
            <a href="/#solutions" className="block text-slate-600 font-medium">
              Giải pháp
            </a>
            <a href="/#pricing" className="block text-slate-600 font-medium">
              Bảng giá
            </a>
            <Link
              to="/financial-reports"
              className="block text-blue-600 font-semibold"
            >
              Xem các công ty
            </Link>
            <Link to="/login" className="block text-blue-600 font-bold">
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </header>

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
                onClick={() => handleDownload(report.fileUrl)}
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
                        Năm: <strong>{report.reportYear}</strong> - Kỳ:{" "}
                        <strong>Q{report.reportPeriod}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileTextOutlined />
                      <span className="truncate">{report.fileName}</span>
                    </div>
                  </div>

                  {/* Upload Info */}
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div>
                      Tải lên bởi: <strong>{report.uploadedByUsername}</strong>
                    </div>
                    <div>
                      Ngày:{" "}
                      {new Date(report.uploadedAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
