import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Modal,
  Tag,
  Empty,
} from "antd";
import {
  FileTextOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import analysisService from "../services/analysisService";
import PublicHeader from "../components/PublicHeader";
import "./AnalysisReports.css";

const { Title, Text, Paragraph } = Typography;

const FinancialAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  // Fetch analyses list
  const fetchAnalyses = async (page = 1, pageSize = 12) => {
    setLoading(true);
    try {
      const response = await analysisService.getAnalysisHistory({
        PageNumber: page,
        PageSize: pageSize,
      });

      setAnalyses(response.items || []);
      setPagination({
        current: response.pageNumber || 1,
        pageSize: response.pageSize || 12,
        total: response.totalCount || 0,
      });
    } catch (error) {
      console.error("Error fetching analyses:", error);
      message.error("Không thể tải danh sách phân tích. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  // Handle card click - use data from list, no API call
  const handleCardClick = (analysis) => {
    setSelectedAnalysis(analysis);
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAnalysis(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Parse JSON arrays
  const parseJsonArray = (jsonString) => {
    try {
      return JSON.parse(jsonString || "[]");
    } catch {
      return [];
    }
  };

  // Load more handler
  const handleLoadMore = () => {
    fetchAnalyses(pagination.current + 1, pagination.pageSize);
  };

  const hasMore = pagination.current * pagination.pageSize < pagination.total;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <PublicHeader />
      <div style={{ padding: "24px", paddingTop: "100px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <Title level={2} style={{ marginBottom: "8px" }}>
            <FileTextOutlined
              style={{ marginRight: "12px", color: "#1890ff" }}
            />
            Báo Cáo Phân Tích Tài Chính AI
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Khám phá các phân tích tài chính chi tiết do AI tạo ra
          </Text>
        </div>

        {/* Loading spinner */}
        {loading && analyses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : analyses.length === 0 ? (
          <Empty
            description="Chưa có báo cáo phân tích nào"
            style={{ marginTop: "100px" }}
          />
        ) : (
          <>
            {/* Analysis Cards Grid */}
            <Row gutter={[24, 24]}>
              {analyses.map((analysis) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={analysis.id}>
                  <Card
                    hoverable
                    onClick={() => handleCardClick(analysis)}
                    style={{
                      height: "100%",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "all 0.3s",
                      cursor: "pointer",
                    }}
                    bodyStyle={{ padding: "20px" }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      <FileTextOutlined
                        style={{
                          fontSize: "32px",
                          color: "#1890ff",
                          marginBottom: "12px",
                        }}
                      />
                      <Title
                        level={5}
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: "8px" }}
                      >
                        {analysis.title}
                      </Title>
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <Text type="secondary" style={{ fontSize: "13px" }}>
                        <CalendarOutlined style={{ marginRight: "6px" }} />
                        {formatDate(analysis.createdAt)}
                      </Text>
                    </div>

                    {analysis.userPrompt && (
                      <div style={{ marginBottom: "12px" }}>
                        <Tag icon={<QuestionCircleOutlined />} color="blue">
                          {analysis.userPrompt.length > 30
                            ? `${analysis.userPrompt.substring(0, 30)}...`
                            : analysis.userPrompt}
                        </Tag>
                      </div>
                    )}

                    <Paragraph
                      ellipsis={{ rows: 3 }}
                      type="secondary"
                      style={{ fontSize: "13px", marginBottom: "12px" }}
                    >
                      {analysis.content}
                    </Paragraph>

                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {parseJsonArray(analysis.reportIdsJson).length > 0 && (
                        <Tag color="green">
                          {parseJsonArray(analysis.reportIdsJson).length} Báo
                          cáo
                        </Tag>
                      )}
                      {parseJsonArray(analysis.metricCodesJson).length > 0 && (
                        <Tag color="orange">
                          {parseJsonArray(analysis.metricCodesJson).length} Chỉ
                          số
                        </Tag>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Load More Button */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  style={{
                    padding: "10px 32px",
                    fontSize: "16px",
                    background: "#1890ff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Đang tải..." : "Xem thêm"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        <Modal
          title={
            <div>
              <FileTextOutlined
                style={{ marginRight: "8px", color: "#1890ff" }}
              />
              Chi tiết Phân tích
            </div>
          }
          open={modalOpen}
          onCancel={handleCloseModal}
          footer={null}
          width={1200}
          styles={{
            body: {
              maxHeight: "75vh",
              overflowY: "auto",
              padding: "24px",
            },
          }}
        >
          {selectedAnalysis && (
            <div>
              {/* Metadata */}
              <div
                style={{
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Title level={4} style={{ marginBottom: "12px" }}>
                  {selectedAnalysis.title}
                </Title>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                  }}
                >
                  <Text type="secondary">
                    <CalendarOutlined style={{ marginRight: "6px" }} />
                    {formatDate(selectedAnalysis.createdAt)}
                  </Text>
                  {selectedAnalysis.userPrompt && (
                    <Text strong>
                      <QuestionCircleOutlined style={{ marginRight: "6px" }} />
                      Câu hỏi: {selectedAnalysis.userPrompt}
                    </Text>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {parseJsonArray(selectedAnalysis.reportIdsJson).length >
                    0 && (
                    <Tag color="green">
                      Số báo cáo:{" "}
                      {parseJsonArray(selectedAnalysis.reportIdsJson).length}
                    </Tag>
                  )}
                  {parseJsonArray(selectedAnalysis.metricCodesJson).length >
                    0 && (
                    <Tag color="orange">
                      Số chỉ số:{" "}
                      {parseJsonArray(selectedAnalysis.metricCodesJson).length}
                    </Tag>
                  )}
                </div>
              </div>

              {/* Content with Markdown */}
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedAnalysis.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default FinancialAnalysis;
