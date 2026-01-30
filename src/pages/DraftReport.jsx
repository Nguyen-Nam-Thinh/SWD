import { useState, useEffect } from "react";
import { Table, Button, Card, Tag, Space, message, Popconfirm } from "antd";
import {
  DeleteOutlined,
  AuditOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import reportService from "../services/reportService";

// Import đúng đường dẫn component con
import SplitComparisonView from "../components/DraftReport/SplitComparisonView";

const DraftReport = () => {
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 1. Fetch danh sách khi vào trang (hoặc khi không chọn báo cáo nào)
  useEffect(() => {
    if (!selectedReportId) {
      fetchDrafts();
    }
  }, [selectedReportId]); // Bỏ pagination.current khỏi dependency vì sẽ pagination ở client-side

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      // Lấy TẤT CẢ draft và rejected (pageSize lớn để lấy hết)
      const [draftRes, rejectedRes] = await Promise.all([
        reportService.getReports({
          pageNumber: 1,
          pageSize: 1000, // Lấy hết tất cả
          status: "Draft",
        }),
        reportService.getReports({
          pageNumber: 1,
          pageSize: 1000, // Lấy hết tất cả
          status: "Rejected",
        }),
      ]);

      // Merge 2 kết quả
      const combinedData = [
        ...(draftRes.items || []),
        ...(rejectedRes.items || []),
      ];

      // Loại bỏ duplicate (nếu có)
      const uniqueData = Array.from(
        new Map(combinedData.map((item) => [item.id, item])).values(),
      );

      // Sắp xếp theo ngày tạo mới nhất đến cũ nhất
      const sortedData = uniqueData.sort((a, b) => {
        const dateA = new Date(a.uploadedAt);
        const dateB = new Date(b.uploadedAt);
        return dateB - dateA; // Giảm dần (mới nhất trước)
      });

      setData(sortedData);
      // Set total đúng bằng số lượng data thực tế sau khi merge
      setPagination((prev) => ({
        ...prev,
        total: sortedData.length,
      }));
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await reportService.deleteReport(id);
      message.success("Đã xóa báo cáo");
      fetchDrafts();
    } catch (e) {
      message.error("Lỗi xóa");
    }
  };

  // --- LOGIC CHUYỂN MÀN HÌNH ---

  // Nếu có ID -> Hiển thị màn hình 2 cột (Split View)
  if (selectedReportId) {
    return (
      <SplitComparisonView
        reportId={selectedReportId}
        onBack={() => {
          setSelectedReportId(null); // Quay về list
          fetchDrafts(); // Refresh lại dữ liệu mới nhất
        }}
      />
    );
  }

  const columns = [
    {
      title: "Tên báo cáo",
      dataIndex: "fileName", // <--- SỬA: API trả về fileName
      render: (text) => (
        <span className="font-medium text-blue-900">{text}</span>
      ),
    },
    {
      title: "Công Ty",
      dataIndex: "companyName", // <--- SỬA: API trả về companyName (chuỗi), không phải object
      render: (text) => <Tag color="blue">{text || "N/A"}</Tag>,
    },
    {
      title: "Kỳ",
      // SỬA: API List dùng reportYear và reportPeriod
      render: (_, r) => (
        <span>
          {r.reportYear} {r.reportPeriod ? `- Quý ${r.reportPeriod}` : ""}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "uploadedAt", // <--- SỬA: API trả về uploadedAt
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<AuditOutlined />}
            onClick={() => setSelectedReportId(record.id)}
            className="bg-blue-600 hover:bg-blue-500"
          >
            Đối chiếu
          </Button>
          
          <Popconfirm
            title="Xóa?"
            onConfirm={() => handleDelete(record.id)}
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
          
          {/* Nút xem lý do từ chối - chỉ hiện khi status là Rejected */}
          {record.status === "Rejected" && record.rejectionReason && (
            <Button 
              icon={<InfoCircleOutlined />} 
              danger
              onClick={() => {
                const isExpanded = expandedRowKeys.includes(record.id);
                setExpandedRowKeys(isExpanded ? [] : [record.id]);
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Danh sách Báo cáo Nháp"
      variant="borderless"
      className="shadow-sm h-full"
      extra={
        <Button onClick={fetchDrafts} icon={<FileTextOutlined />}>
          Làm mới
        </Button>
      }
    >
      <style>
        {`
          .rejected-row {
            background-color: #fef2f2 !important;
          }
          .rejected-row:hover > td {
            background-color: #fee2e2 !important;
          }
        `}
      </style>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page) =>
            setPagination((prev) => ({ ...prev, current: page })),
        }}
        rowClassName={(record) =>
          record.status === "Rejected" ? "rejected-row" : ""
        }
        expandable={{
          expandedRowKeys: expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys(expanded ? [record.id] : []);
          },
          expandedRowRender: (record) => (
            <div className="bg-red-50 p-4 border-l-4 border-red-500">
              <p className="font-semibold text-red-800 mb-2">Lý do từ chối:</p>
              <p className="text-gray-700">{record.rejectionReason}</p>
            </div>
          ),
          rowExpandable: (record) => 
            record.status === "Rejected" && !!record.rejectionReason,
          expandIcon: () => null, // Ẩn icon expand mặc định
        }}
      />
    </Card>
  );
};

export default DraftReport;