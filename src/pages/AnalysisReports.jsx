import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Typography,
  message,
  Select,
  Form,
  Input,
  Row,
  Col,
  Spin,
  Modal,
  Divider,
  Popover,
  Badge,
  DatePicker,
} from "antd";
import {
  EyeOutlined,
  BarChartOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
import { Eye, TrendingUp } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Import CSS for markdown styling
import "./AnalysisReports.css";

// Import service
import reportService from "../services/reportService";
import companyService from "../services/companyService";
import metricService from "../services/metricService";
import analysisService from "../services/analysisService";
import ResponsiveTable from "../components/ResponsiveTable";
import ReportStatusTag from "../components/common/ReportStatusTag";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AnalysisReports = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [availableReports, setAvailableReports] = useState([]);
  const [reportMetrics, setReportMetrics] = useState([]); // Metrics from selected reports
  const [fetchingMetrics, setFetchingMetrics] = useState(false);

  // Form state
  const [form] = Form.useForm();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Analysis result modal
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showHistoryScreen, setShowHistoryScreen] = useState(false);

  // Analysis history state
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // History search/filter state
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateRange, setHistoryDateRange] = useState(null);
  const [tempHistoryDateRange, setTempHistoryDateRange] = useState(null);
  const [historyFilterOpen, setHistoryFilterOpen] = useState(false);

  const historyActiveFilterCount = useMemo(() => {
    let count = 0;
    if (historyDateRange?.[0] && historyDateRange?.[1]) count++;
    return count;
  }, [historyDateRange]);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Filter state
  const [selectedYear, setSelectedYear] = useState(null);

  // --- LOGIC TẢI DỮ LIỆU ---
  useEffect(() => {
    fetchCompanies();
    fetchAllApprovedReports();
    fetchReports(1, 10);
    fetchAnalysisHistory(1, 10);
  }, []);

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const response = await companyService.getCompanies({ PageSize: 1000 });
      setCompanies(response.items || response || []);
    } catch (error) {
      console.error("Lỗi fetch companies:", error);
      message.error("Lỗi tải danh sách công ty");
    }
  };

  // Fetch all approved reports (for direct selection)
  const fetchAllApprovedReports = async () => {
    try {
      const response = await reportService.getReports({
        Status: "Approved",
        PageSize: 1000,
      });
      setAvailableReports(response.items || []);
    } catch (error) {
      console.error("Lỗi fetch all reports:", error);
      message.error("Lỗi tải danh sách báo cáo");
    }
  };

  // Fetch analysis history - fetch ALL data for client-side filtering
  const fetchAnalysisHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await analysisService.getAnalysisHistory({
        PageNumber: 1,
        PageSize: 9999,
      });

      setAnalysisHistory(response.items || []);
    } catch (error) {
      console.error("Lỗi fetch analysis history:", error);
      message.error("Lỗi tải lịch sử phân tích");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Client-side filtered history data
  const filteredHistory = useMemo(() => {
    let result = analysisHistory;

    // Filter by search keyword
    if (historySearch.trim()) {
      const keyword = historySearch.trim().toLowerCase();
      result = result.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(keyword) ||
          (item.companyName || "").toLowerCase().includes(keyword) ||
          (item.content || "").toLowerCase().includes(keyword),
      );
    }

    // Filter by date range
    if (historyDateRange?.[0] && historyDateRange?.[1]) {
      const fromDate = historyDateRange[0].startOf("day");
      const toDate = historyDateRange[1].endOf("day");
      result = result.filter((item) => {
        const itemDate = dayjs(
          item.updatedAt || item.modifiedAt || item.createdAt,
        );
        return (
          itemDate.isValid() &&
          itemDate.isAfter(fromDate.subtract(1, "ms")) &&
          itemDate.isBefore(toDate.add(1, "ms"))
        );
      });
    }

    return result;
  }, [analysisHistory, historySearch, historyDateRange]);

  // History search/filter handlers
  const handleHistorySearch = () => {
    // Client-side - useMemo handles it, just reset pagination
    setHistoryPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleHistoryApplyFilter = () => {
    setHistoryDateRange(tempHistoryDateRange);
    setHistoryFilterOpen(false);
    setHistoryPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleHistoryResetFilter = () => {
    setTempHistoryDateRange(null);
  };

  // View analysis detail
  const handleViewAnalysisDetail = async (id) => {
    try {
      const detail = await analysisService.getAnalysisById(id);
      setAnalysisResult(detail);
      setAnalysisModalOpen(true);
    } catch (error) {
      console.error("Lỗi fetch analysis detail:", error);
      message.error("Lỗi tải chi tiết phân tích");
    }
  };

  // Fetch reports for a specific company
  const fetchReportsForCompany = async (companyId) => {
    try {
      const response = await reportService.getReports({
        Status: "Approved",
        CompanyId: companyId,
        PageSize: 100,
      });
      setAvailableReports(response.items || []);
    } catch (error) {
      console.error("Lỗi fetch reports:", error);
      message.error("Lỗi tải danh sách báo cáo");
    }
  };

  // Handle company change
  const handleCompanyChange = (companyId) => {
    setSelectedCompany(companyId);
    form.setFieldsValue({ reportIds: [], metricCodes: [] });
    setReportMetrics([]);
    if (companyId) {
      fetchReportsForCompany(companyId);
    } else {
      // Load all reports when clearing company
      fetchAllApprovedReports();
    }
  };

  // Fetch metrics from selected reports
  const handleReportsChange = async (reportIds) => {
    form.setFieldsValue({ metricCodes: [] });

    if (!reportIds || reportIds.length === 0) {
      setReportMetrics([]);
      return;
    }

    setFetchingMetrics(true);
    try {
      // Fetch details for each selected report
      const detailsPromises = reportIds.map((id) =>
        reportService.getReportById(id),
      );
      const reportsDetails = await Promise.all(detailsPromises);

      // Extract unique metrics from all reports with finalValue
      const metricsMap = new Map();
      reportsDetails.forEach((report) => {
        if (report.details && Array.isArray(report.details)) {
          report.details.forEach((detail) => {
            const key = detail.metricCode;
            if (!metricsMap.has(key)) {
              metricsMap.set(key, {
                metricCode: detail.metricCode,
                metricName: detail.metricName,
                finalValue: detail.finalValue,
              });
            }
          });
        }
      });

      const uniqueMetrics = Array.from(metricsMap.values());
      setReportMetrics(uniqueMetrics);

      if (uniqueMetrics.length === 0) {
        message.warning("Các báo cáo đã chọn chưa có chỉ số nào");
      }
    } catch (error) {
      console.error("Lỗi fetch report metrics:", error);
      message.error("Lỗi tải chỉ số từ báo cáo");
      setReportMetrics([]);
    } finally {
      setFetchingMetrics(false);
    }
  };

  // Custom validator: require either company or reports
  const validateCompanyOrReports = () => ({
    validator(_, value) {
      const companyId = form.getFieldValue("companyId");
      const reportIds = form.getFieldValue("reportIds");

      if (!companyId && (!reportIds || reportIds.length === 0)) {
        return Promise.reject(new Error("Vui lòng chọn Công ty hoặc Báo cáo"));
      }
      return Promise.resolve();
    },
  });

  // Handle form submit
  const handleAnalysisSubmit = async (values) => {
    setSubmitting(true);
    const hideLoading = message.loading(
      "Đang phân tích với AI, vui lòng đợi...",
      0,
    );
    try {
      const result = await analysisService.analyzeReports({
        companyId: values.companyId,
        reportIds: values.reportIds,
        metricCodes: values.metricCodes,
        userPrompt: values.userPrompt,
      });
      hideLoading();

      setAnalysisResult(result);
      setAnalysisModalOpen(true);
      message.success("Phân tích thành công!");
      form.resetFields();
      setSelectedCompany(null);
      setReportMetrics([]);
      fetchAllApprovedReports(); // Reload all reports
      fetchAnalysisHistory(1, 10); // Reload analysis history
    } catch (error) {
      hideLoading();
      console.error("Lỗi phân tích:", error);
      if (error.code === "ECONNABORTED") {
        message.error(
          "API phân tích mất quá nhiều thời gian. Vui lòng thử lại sau!",
        );
      } else {
        message.error("Lỗi khi phân tích báo cáo");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- LOGIC TẢI DỮ LIỆU ---
  const fetchReports = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
        Status: "Approved", // Chỉ lấy báo cáo đã duyệt
      };

      // Thêm filter nếu có
      if (selectedYear) {
        params.Year = selectedYear;
      }
      if (selectedCompany) {
        params.CompanyId = selectedCompany;
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
    } catch (error) {
      console.error("Lỗi fetch:", error);
      message.error("Lỗi tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1, 10);
  }, [selectedYear, selectedCompany]); // Fetch lại khi filter thay đổi

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize);
  };

  // Handle view analysis
  const handleViewAnalysis = (record) => {
    message.info(`Xem phân tích báo cáo ${record.companyName}`);
    // TODO: Navigate to analysis detail page
  };

  // Render mobile actions
  const renderMobileActions = (record) => (
    <div className="flex gap-2 flex-wrap">
      <Button
        size="small"
        icon={<Eye size={14} />}
        onClick={(e) => {
          e.stopPropagation();
          handleViewAnalysis(record);
        }}
        className="flex items-center gap-1"
      >
        Xem
      </Button>
      <Button
        size="small"
        type="primary"
        icon={<TrendingUp size={14} />}
        onClick={(e) => {
          e.stopPropagation();
          message.info("Phân tích chi tiết đang phát triển");
        }}
        className="flex items-center gap-1"
      >
        Phân tích
      </Button>
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
          <div className="text-xs text-gray-500">{r.ticker || "Không có"}</div>
        </div>
      ),
    },
    {
      title: "Năm / Kỳ",
      label: "Năm / Kỳ",
      key: "period",
      render: (_, r) => (
        <div>
          <div className="font-semibold">Năm {r.year || r.reportYear}</div>
          <div className="text-xs text-gray-500">
            {r.periodType === "Quarterly" ? `Quý ${r.period}` : `Năm ${r.year}`}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày duyệt",
      label: "Ngày duyệt",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Trạng thái",
      label: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <ReportStatusTag status={status} />,
    },
    {
      title: "Hành động",
      label: "Hành động",
      key: "action",
      width: 150,
      render: (_, r) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewAnalysis(r)}
            size="small"
          >
            Xem
          </Button>
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            onClick={() => message.info("Phân tích chi tiết đang phát triển")}
            size="small"
          >
            Phân tích
          </Button>
        </Space>
      ),
    },
  ];

  // Get unique years for filter
  const availableYears = [
    ...new Set(reports.map((r) => r.year || r.reportYear)),
  ]
    .filter(Boolean)
    .sort((a, b) => b - a);

  const getHistoryCompany = (item) => {
    // Ưu tiên field trực tiếp
    if (item.companyName) return item.companyName;
    if (item.company?.companyName) return item.company.companyName;
    if (item.ticker) return item.ticker;
    if (item.companyTicker) return item.companyTicker;

    // Trích xuất từ title: "HPG - phân tích cho tôi (17/03/2026 23:39)"
    if (item.title) {
      const match = item.title.match(/^([A-Z]{2,10})\s*-/);
      if (match) return match[1];
    }

    return "-";
  };

  const getHistoryReport = (item) => {
    if (Array.isArray(item.reportNames) && item.reportNames.length > 0) {
      return item.reportNames.join(", ");
    }

    return (
      item.reportName || item.reportTitle || item.fileName || item.title || "-"
    );
  };

  const getHistoryUpdatedAt = (item) => {
    return item.updatedAt || item.modifiedAt || item.createdAt;
  };

  // --- RENDER GIAO DIỆN ---
  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
      <Button
        icon={<ArrowLeftOutlined />}
        type="link"
        onClick={() => navigate("/dashboard/reports")}
        className="mb-2 pl-0"
      >
        Quay về Quản lý Báo cáo
      </Button>

      <div className="mb-3">
        {!showHistoryScreen ? (
          <Button onClick={() => setShowHistoryScreen(true)}>Lịch sử</Button>
        ) : (
          <Button onClick={() => setShowHistoryScreen(false)}>
            Quay lại Phân tích
          </Button>
        )}
      </div>

      {/* Form Phân tích */}
      {!showHistoryScreen && (
        <Card bordered={false} className="shadow-sm rounded-lg mb-6">
          <Title level={4} className="!text-base md:!text-xl mb-4">
            📊 Phân tích Báo cáo với AI
          </Title>
          <Paragraph className="text-gray-600 mb-4">
            Chọn công ty HOẶC báo cáo, rồi nhập câu hỏi phân tích
          </Paragraph>

          <Form form={form} layout="vertical" onFinish={handleAnalysisSubmit}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Công ty (Tùy chọn)"
                  name="companyId"
                  rules={[validateCompanyOrReports]}
                >
                  <Select
                    placeholder="Chọn công ty"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    onChange={handleCompanyChange}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {companies.map((company) => (
                      <Option key={company.id} value={company.id}>
                        {company.companyName} ({company.ticker})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Báo cáo (Tùy chọn)"
                  name="reportIds"
                  rules={[validateCompanyOrReports]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn báo cáo"
                    maxTagCount="responsive"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleReportsChange}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {availableReports.map((report) => (
                      <Option
                        key={report.reportId || report.id}
                        value={report.reportId || report.id}
                      >
                        {report.companyName || report.ticker} - Năm{" "}
                        {report.year || report.reportYear} -{" "}
                        {report.periodType === "Quarterly"
                          ? `Quý ${report.period || report.reportPeriod}`
                          : "Cả năm"}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label="Chỉ số phân tích (Tùy chọn)"
                  name="metricCodes"
                >
                  <Select
                    mode="multiple"
                    placeholder={
                      reportMetrics.length > 0
                        ? "Chọn chỉ số cần phân tích"
                        : "Vui lòng chọn báo cáo trước"
                    }
                    showSearch
                    optionFilterProp="children"
                    maxTagCount="responsive"
                    loading={fetchingMetrics}
                    disabled={reportMetrics.length === 0}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {reportMetrics.map((metric) => (
                      <Option key={metric.metricCode} value={metric.metricCode}>
                        {metric.metricCode} - {metric.metricName} (
                        {metric.finalValue
                          ? metric.finalValue.toLocaleString()
                          : "Không có"}
                        )
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label="Câu hỏi / Yêu cầu phân tích"
                  name="userPrompt"
                >
                  <TextArea
                    rows={4}
                    placeholder="Ví dụ: So sánh tỷ suất lợi nhuận giữa các quý, phân tích xu hướng tăng trưởng doanh thu..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={submitting}
                size="large"
                className="w-full md:w-auto"
              >
                {submitting ? "Đang phân tích..." : "Phân tích ngay"}
              </Button>
              <Text type="secondary" className="ml-3 text-xs">
                ⏱️ Quá trình phân tích có thể mất 1-3 phút
              </Text>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* Lịch sử Phân tích AI */}
      {showHistoryScreen && (
        <Card bordered={false} className="shadow-sm rounded-lg mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
            <Title
              level={3}
              className="!text-lg md:!text-2xl"
              style={{ margin: 0 }}
            >
              📊 Lịch sử Phân tích Báo Cáo
            </Title>
          </div>

          {/* Search + Filter */}
          <div className="mb-4 md:mb-6 flex flex-wrap items-center gap-3">
            <Input
              placeholder="Tìm kiếm theo tiêu đề, công ty..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              onPressEnter={handleHistorySearch}
              prefix={
                <SearchOutlined
                  className="text-gray-400 cursor-pointer hover:text-blue-500"
                  onClick={handleHistorySearch}
                />
              }
              allowClear
              style={{ maxWidth: 400 }}
              size="middle"
            />

            <Popover
              content={
                <div style={{ width: 340 }}>
                  <div style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#475569",
                        marginBottom: 6,
                      }}
                    >
                      Khoảng thời gian
                    </label>
                    <RangePicker
                      value={tempHistoryDateRange}
                      onChange={setTempHistoryDateRange}
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      placeholder={["Từ ngày", "Đến ngày"]}
                    />
                  </div>
                  <Divider style={{ margin: "12px 0" }} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleHistoryResetFilter}
                    >
                      Đặt lại
                    </Button>
                    <Button
                      type="primary"
                      icon={<FilterOutlined />}
                      onClick={handleHistoryApplyFilter}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              }
              title={
                <span style={{ fontWeight: 600, fontSize: 15 }}>
                  Bộ lọc nâng cao
                </span>
              }
              trigger="click"
              open={historyFilterOpen}
              onOpenChange={(open) => {
                if (open) {
                  setTempHistoryDateRange(historyDateRange);
                  setHistoryFilterOpen(true);
                } else {
                  setHistoryFilterOpen(false);
                }
              }}
              placement="bottomLeft"
            >
              <Badge
                count={historyActiveFilterCount}
                size="small"
                offset={[-2, 2]}
              >
                <Button icon={<FilterOutlined />} size="middle">
                  Bộ lọc
                </Button>
              </Badge>
            </Popover>

            {/* Filter tags */}
            {historyActiveFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {historyDateRange?.[0] && historyDateRange?.[1] && (
                  <Tag
                    closable
                    onClose={() => {
                      setHistoryDateRange(null);
                      setHistoryPagination((prev) => ({
                        ...prev,
                        current: 1,
                      }));
                    }}
                    color="blue"
                  >
                    {historyDateRange[0].format("DD/MM/YYYY")} →{" "}
                    {historyDateRange[1].format("DD/MM/YYYY")}
                  </Tag>
                )}
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table
              columns={[
                {
                  title: "STT",
                  key: "index",
                  width: 70,
                  align: "center",
                  render: (_, __, index) =>
                    (historyPagination.current - 1) *
                    historyPagination.pageSize +
                    index +
                    1,
                },
                {
                  title: "Công ty",
                  key: "company",
                  render: (_, item) => (
                    <div className="font-medium text-gray-700">
                      {getHistoryCompany(item)}
                    </div>
                  ),
                },
                {
                  title: "Báo cáo",
                  key: "report",
                  render: (_, item) => (
                    <div
                      className="text-sm text-gray-600"
                      title={getHistoryReport(item)}
                    >
                      {getHistoryReport(item)}
                    </div>
                  ),
                },
                {
                  title: "Cập nhật lúc",
                  key: "updatedAt",
                  width: 190,
                  render: (_, item) => (
                    <div className="text-sm">
                      {getHistoryUpdatedAt(item)
                        ? dayjs(getHistoryUpdatedAt(item)).format(
                          "DD/MM/YYYY HH:mm:ss",
                        )
                        : "-"}
                    </div>
                  ),
                },
                {
                  title: "Hành động",
                  key: "action",
                  width: 120,
                  render: (_, record) => (
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => handleViewAnalysisDetail(record.id)}
                    >
                      Xem
                    </Button>
                  ),
                },
              ]}
              dataSource={filteredHistory}
              rowKey="id"
              loading={loadingHistory}
              pagination={{
                pageSize: historyPagination.pageSize,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Tổng ${total} phân tích`,
                onShowSizeChange: (_, size) =>
                  setHistoryPagination((prev) => ({
                    ...prev,
                    pageSize: size,
                    current: 1,
                  })),
              }}
              className="mt-4"
            />
          </div>

          {/* Mobile List */}
          <div className="md:hidden mt-4">
            {loadingHistory ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item, index) => (
                  <Card
                    key={item.id}
                    size="small"
                    hoverable
                    className="cursor-pointer"
                    onClick={() => handleViewAnalysisDetail(item.id)}
                  >
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">
                        STT:{" "}
                        {(historyPagination.current - 1) *
                          historyPagination.pageSize +
                          index +
                          1}
                      </div>
                      <div className="font-medium text-gray-700">
                        Công ty: {getHistoryCompany(item)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Báo cáo: {getHistoryReport(item)}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>
                          {getHistoryUpdatedAt(item)
                            ? dayjs(getHistoryUpdatedAt(item)).format(
                              "DD/MM/YYYY HH:mm:ss",
                            )
                            : "-"}
                        </span>
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAnalysisDetail(item.id);
                          }}
                        >
                          Xem
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {analysisHistory.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    Chưa có phân tích nào
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal Kết quả Phân tích */}
      <Modal
        title="📈 Kết quả Phân tích AI"
        open={analysisModalOpen}
        onCancel={() => setAnalysisModalOpen(false)}
        centered
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setAnalysisModalOpen(false)}
          >
            Đóng
          </Button>,
        ]}
        width={1200}
        bodyStyle={{ maxHeight: "65vh", overflowY: "auto", padding: "24px" }}
      >
        {analysisResult && (
          <div className="space-y-4">
            {/* Title */}
            {analysisResult.title && (
              <div>
                <Title level={4} className="!mb-2">
                  {analysisResult.title}
                </Title>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-50 p-3 rounded">
              {analysisResult.createdAt && (
                <div className="mb-2">
                  <Text strong>Thời gian tạo: </Text>
                  <Text>
                    {dayjs(analysisResult.createdAt).format(
                      "DD/MM/YYYY HH:mm:ss",
                    )}
                  </Text>
                </div>
              )}
              {analysisResult.userPrompt && (
                <div>
                  <Text strong>Câu hỏi: </Text>
                  <Text italic>"{analysisResult.userPrompt}"</Text>
                </div>
              )}
            </div>

            <Divider className="!my-4" />

            {/* Content - Analysis Result */}
            {analysisResult.content && (
              <div className="analysis-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysisResult.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Debug info (optional - có thể bỏ) */}
            {!analysisResult.content && (
              <div className="bg-gray-50 p-4 rounded">
                <Text type="secondary">Dữ liệu phân tích:</Text>
                <pre className="text-xs mt-2">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnalysisReports;
