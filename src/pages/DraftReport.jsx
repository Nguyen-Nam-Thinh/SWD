import { useState, useEffect } from "react";
import { Table, Button, Card, Tag, Space, message, Popconfirm } from "antd";
import {
  DeleteOutlined,
  AuditOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import reportService from "../services/reportService";

// Import đúng đường dẫn component con
import SplitComparisonView from "../components/DraftReport/SplitComparisonView";

const DraftReport = () => {
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
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
  }, [pagination.current, selectedReportId]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const [draftRes, rejectedRes] = await Promise.all([
        reportService.getReports({
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          status: "Draft",
        }),
        reportService.getReports({
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
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

      setData(uniqueData);
      setPagination((prev) => ({
        ...prev,
        total: (draftRes.totalCount || 0) + (rejectedRes.totalCount || 0),
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
            // Lưu ý: ID trong list là 'id', trong detail là 'reportId' (như hình JSON)
            // Nhưng thường id của row chính là id cần tìm
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
      />
    </Card>
  );
};

export default DraftReport;
