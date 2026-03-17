import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tooltip,
  Popconfirm,
  message,
  Modal,
  Input,
  Card,
  Typography,
  Select,
  DatePicker,
  Form,
  Upload,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  SearchOutlined,
  ReloadOutlined,
  InboxOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import reportService from "../services/reportService";
import companyService from "../services/companyService";
import ResponsiveTable from "../components/ResponsiveTable";
import ReportApprovalView from "../components/Approval/ReportApprovalView";
import ReportStatusTag from "../components/common/ReportStatusTag";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Dragger } = Upload;
const { Option } = Select;

const ReportManager = () => {
  const navigate = useNavigate();
  const [uploadForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [companyKeyword, setCompanyKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [dateRange, setDateRange] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [companies, setCompanies] = useState([]);

  const currentFilters = useMemo(
    () => ({ companyKeyword, statusFilter, dateRange }),
    [companyKeyword, statusFilter, dateRange],
  );

  const fetchReports = async (
    page = 1,
    pageSize = 10,
    filters = currentFilters,
  ) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
      };

      if (filters.companyKeyword?.trim()) {
        params.CompanyName = filters.companyKeyword.trim();
      }

      if (filters.statusFilter) {
        params.Status = filters.statusFilter;
      }

      if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
        params.FromDate = filters.dateRange[0]
          .startOf("day")
          .format("YYYY-MM-DDTHH:mm:ss");
        params.ToDate = filters.dateRange[1]
          .endOf("day")
          .format("YYYY-MM-DDTHH:mm:ss");
      }

      const response = await reportService.getReports(params);
      const list = response.items || [];

      setReports(list);
      setPagination({
        current: response.pageNumber || page,
        pageSize: response.pageSize || pageSize,
        total: response.totalCount || 0,
      });
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);
      message.error("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await companyService.getCompanies({
        PageNumber: 1,
        PageSize: 200,
      });
      setCompanies(res.items || []);
    } catch {
      setCompanies([]);
    }
  };

  useEffect(() => {
    fetchReports(1, 10, currentFilters);
  }, []);

  const handleApplyFilters = () => {
    fetchReports(1, pagination.pageSize, currentFilters);
  };

  const handleResetFilters = () => {
    setCompanyKeyword("");
    setStatusFilter(undefined);
    setDateRange(null);
    const resetFilters = {
      companyKeyword: "",
      statusFilter: undefined,
      dateRange: null,
    };
    fetchReports(1, pagination.pageSize, resetFilters);
  };

  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize, currentFilters);
  };

  const handleDelete = async (id, companyName) => {
    try {
      await reportService.deleteReport(id);
      message.success(`Đã xóa báo cáo ${companyName}`);
      fetchReports(pagination.current, pagination.pageSize, currentFilters);
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Lỗi khi xóa báo cáo");
    }
  };

  const openUploadModal = async () => {
    await loadCompanies();
    uploadForm.resetFields();
    setUploadOpen(true);
  };

  const handleUploadSubmit = async () => {
    try {
      const values = await uploadForm.validateFields();
      setUploading(true);

      const formData = new FormData();
      formData.append("CompanyId", values.companyId);
      formData.append("Year", values.year.year());
      formData.append("Period", values.period);
      formData.append("PeriodType", values.periodType);

      const fileToUpload = values.file?.[0]?.originFileObj || values.file?.[0];
      if (fileToUpload) {
        formData.append("File", fileToUpload);
      }

      await reportService.uploadReport(formData);
      message.success("Tải lên báo cáo thành công");
      setUploadOpen(false);
      fetchReports(1, pagination.pageSize, currentFilters);
    } catch (error) {
      if (!error?.errorFields) {
        message.error(
          error.response?.data?.message || "Lỗi khi tải lên báo cáo",
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const renderMobileActions = (record) => (
    <div className="flex gap-2 flex-wrap">
      <Button
        size="small"
        icon={<EyeOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedReportId(record.id);
        }}
      >
        Xem
      </Button>
      <div onClick={(e) => e.stopPropagation()}>
        <Popconfirm
          title="Xác nhận xóa báo cáo"
          description={`Bạn có chắc chắn muốn xóa báo cáo của ${record.companyName}?`}
          onConfirm={() => handleDelete(record.id, record.companyName)}
          okText="Đồng ý"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Công ty",
      dataIndex: "companyName",
      key: "companyName",
      render: (text, record) => (
        <div>
          <div className="font-bold text-gray-700">{text}</div>
          <div className="text-xs text-gray-500">
            Năm {record.reportYear} - Quý {record.reportPeriod}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <ReportStatusTag status={status} />,
    },
    {
      title: "Hành động",
      key: "action",
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => setSelectedReportId(record.id)}
            />
          </Tooltip>
          <Tooltip title="Xóa báo cáo">
            <Popconfirm
              title="Xác nhận xóa báo cáo"
              description={`Bạn có chắc chắn muốn xóa báo cáo của ${record.companyName}?`}
              onConfirm={() => handleDelete(record.id, record.companyName)}
              okText="Đồng ý"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (selectedReportId) {
    return (
      <ReportApprovalView
        reportId={selectedReportId}
        onBack={() => {
          setSelectedReportId(null);
          fetchReports(pagination.current, pagination.pageSize, currentFilters);
        }}
      />
    );
  }

  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
      <Card bordered={false} className="shadow-sm rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
          <Title
            level={3}
            className="!text-lg md:!text-2xl"
            style={{ margin: 0 }}
          >
            Quản lý Báo cáo
          </Title>

          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openUploadModal}
            >
              Tải lên tệp
            </Button>
            <Button
              icon={<FileSearchOutlined />}
              onClick={() => navigate("/dashboard/draft-report")}
            >
              Báo cáo nháp
            </Button>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => navigate("/dashboard/analysis-reports")}
            >
              Phân tích
            </Button>
          </Space>
        </div>

        <div className="mb-4 p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_320px_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Tìm kiếm theo công ty
              </label>
              <Input
                placeholder="Nhập tên công ty..."
                value={companyKeyword}
                onChange={(e) => setCompanyKeyword(e.target.value)}
                onPressEnter={handleApplyFilters}
                prefix={<SearchOutlined className="text-gray-400" />}
                allowClear
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Trạng thái
              </label>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full"
                allowClear
                placeholder="Chọn trạng thái"
                options={[
                  { value: "PendingApproval", label: "Chờ duyệt" },
                  { value: "Approved", label: "Đã duyệt" },
                  { value: "Rejected", label: "Từ chối" },
                  { value: "Draft", label: "Nháp" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Ngày tạo
              </label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                className="w-full"
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </div>

            <Space>
              <Button onClick={handleResetFilters} icon={<ReloadOutlined />}>
                Đặt lại
              </Button>
              <Button
                type="primary"
                onClick={handleApplyFilters}
                icon={<SearchOutlined />}
              >
                Áp dụng
              </Button>
            </Space>
          </div>
        </div>

        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={reports}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} báo cáo`,
            }}
            onChange={handleTableChange}
          />
        </div>

        <div className="md:hidden mt-4">
          <ResponsiveTable
            data={reports}
            columns={columns}
            loading={loading}
            onRowClick={(record) => setSelectedReportId(record.id)}
            renderActions={renderMobileActions}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showTotal: (total) => `Tổng ${total} báo cáo`,
            }}
            onPaginationChange={(page, pageSize) => {
              fetchReports(page, pageSize, currentFilters);
            }}
          />
        </div>
      </Card>

      <Modal
        title={
          <span className="flex items-center gap-2">
            <FileAddOutlined /> Tải lên tệp báo cáo
          </span>
        }
        open={uploadOpen}
        onOk={handleUploadSubmit}
        onCancel={() => setUploadOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={uploading}
        width={760}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          initialValues={{ periodType: "Quarterly" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyId"
                label="Công ty"
                rules={[{ required: true, message: "Vui lòng chọn công ty" }]}
              >
                <Select
                  placeholder="Chọn công ty"
                  showSearch
                  optionFilterProp="children"
                >
                  {companies.map((company) => (
                    <Option key={company.id} value={company.id}>
                      {company.companyName} ({company.ticker})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="year"
                label="Năm tài chính"
                rules={[{ required: true, message: "Vui lòng chọn năm" }]}
              >
                <DatePicker
                  picker="year"
                  className="w-full"
                  placeholder="Chọn năm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="periodType"
                label="Loại kỳ báo cáo"
                rules={[{ required: true, message: "Vui lòng chọn loại kỳ" }]}
              >
                <Select>
                  <Option value="Quarterly">Theo quý</Option>
                  <Option value="Yearly">Theo năm</Option>
                  <Option value="HalfYear">Bán niên</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="period"
                label="Kỳ số"
                rules={[{ required: true, message: "Vui lòng nhập kỳ số" }]}
              >
                <InputNumber
                  min={1}
                  max={4}
                  className="w-full"
                  placeholder="VD: Quý 1 nhập 1"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="file"
            label="Tệp báo cáo"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: "Vui lòng đính kèm tệp" }]}
          >
            <Dragger
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.xlsx,.xls"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Kéo thả tệp hoặc bấm để chọn tệp
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportManager;
