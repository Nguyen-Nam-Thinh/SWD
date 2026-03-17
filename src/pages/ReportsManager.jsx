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
  Select,
  DatePicker,
  Form,
  Upload,
  InputNumber,
  Row,
  Col,
  Popover,
  Badge,
  Tag,
  Divider,
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
  FilterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import reportService from "../services/reportService";
import companyService from "../services/companyService";
import ResponsiveTable from "../components/ResponsiveTable";
import ReportApprovalView from "../components/Approval/ReportApprovalView";
import ReportStatusTag from "../components/common/ReportStatusTag";

const { RangePicker } = DatePicker;
const { Dragger } = Upload;
const { Option } = Select;

const STATUS_LABEL_MAP = {
  PendingApproval: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Từ chối",
  Draft: "Nháp",
};

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

  // Search state
  const [companyKeyword, setCompanyKeyword] = useState("");

  // Filter states (applied)
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [dateRange, setDateRange] = useState(null);

  // Temp filter states (in popup)
  const [tempStatusFilter, setTempStatusFilter] = useState(undefined);
  const [tempDateRange, setTempDateRange] = useState(null);

  // Popover state
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [companies, setCompanies] = useState([]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter) count++;
    if (dateRange?.[0] && dateRange?.[1]) count++;
    return count;
  }, [statusFilter, dateRange]);

  const fetchReports = async (
    page = 1,
    pageSize = 10,
    overrideStatus = "__USE_STATE__",
    overrideDateRange = "__USE_STATE__",
  ) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
      };

      if (companyKeyword?.trim()) {
        params.CompanyName = companyKeyword.trim();
      }

      const status =
        overrideStatus !== "__USE_STATE__" ? overrideStatus : statusFilter;
      const dates =
        overrideDateRange !== "__USE_STATE__" ? overrideDateRange : dateRange;

      if (status) {
        params.Status = status;
      }

      if (dates?.[0] && dates?.[1]) {
        params.FromDate = dates[0]
          .startOf("day")
          .format("YYYY-MM-DDTHH:mm:ss");
        params.ToDate = dates[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss");
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
    fetchReports(1, 10);
  }, []);

  // Search handler
  const handleSearch = () => {
    fetchReports(1, pagination.pageSize);
  };

  // Filter popup handlers
  const handleOpenFilterPopover = () => {
    setTempStatusFilter(statusFilter);
    setTempDateRange(dateRange);
    setFilterPopoverOpen(true);
  };

  const handleApplyPopoverFilters = () => {
    setStatusFilter(tempStatusFilter);
    setDateRange(tempDateRange);
    setFilterPopoverOpen(false);
    fetchReports(1, pagination.pageSize, tempStatusFilter, tempDateRange);
  };

  const handleResetPopoverFilters = () => {
    setTempStatusFilter(undefined);
    setTempDateRange(null);
  };

  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (id, companyName) => {
    try {
      await reportService.deleteReport(id);
      message.success(`Đã xóa báo cáo ${companyName}`);
      fetchReports(pagination.current, pagination.pageSize);
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
      fetchReports(1, pagination.pageSize);
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

  // Filter popover content
  const filterPopoverContent = (
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
          Trạng thái
        </label>
        <Select
          value={tempStatusFilter}
          onChange={setTempStatusFilter}
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
          Ngày tạo
        </label>
        <RangePicker
          value={tempDateRange}
          onChange={setTempDateRange}
          format="DD/MM/YYYY"
          style={{ width: "100%" }}
          placeholder={["Từ ngày", "Đến ngày"]}
        />
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button icon={<ReloadOutlined />} onClick={handleResetPopoverFilters}>
          Đặt lại
        </Button>
        <Button
          type="primary"
          icon={<FilterOutlined />}
          onClick={handleApplyPopoverFilters}
        >
          Áp dụng
        </Button>
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
          fetchReports(pagination.current, pagination.pageSize);
        }}
      />
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
          <h2 className="text-base md:text-lg font-bold" style={{ margin: 0 }}>
            Quản lý Báo cáo
          </h2>

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

        {/* Search bar + Filter button */}
        <div className="mb-4 md:mb-6 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Tìm kiếm theo tên công ty..."
            value={companyKeyword}
            onChange={(e) => setCompanyKeyword(e.target.value)}
            onPressEnter={handleSearch}
            prefix={
              <SearchOutlined
                className="text-gray-400 cursor-pointer hover:text-blue-500"
                onClick={handleSearch}
              />
            }
            allowClear
            style={{ maxWidth: 400 }}
            size="middle"
          />

          <Popover
            content={filterPopoverContent}
            title={
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                Bộ lọc nâng cao
              </span>
            }
            trigger="click"
            open={filterPopoverOpen}
            onOpenChange={(open) => {
              if (open) {
                handleOpenFilterPopover();
              } else {
                setFilterPopoverOpen(false);
              }
            }}
            placement="bottomLeft"
          >
            <Badge count={activeFilterCount} size="small" offset={[-2, 2]}>
              <Button icon={<FilterOutlined />} size="middle">
                Bộ lọc
              </Button>
            </Badge>
          </Popover>

          {/* Active filter tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {statusFilter && (
                <Tag
                  closable
                  onClose={() => {
                    setStatusFilter(undefined);
                    fetchReports(
                      1,
                      pagination.pageSize,
                      null,
                      dateRange,
                    );
                  }}
                  color="blue"
                >
                  {STATUS_LABEL_MAP[statusFilter] || statusFilter}
                </Tag>
              )}
              {dateRange?.[0] && dateRange?.[1] && (
                <Tag
                  closable
                  onClose={() => {
                    setDateRange(null);
                    fetchReports(
                      1,
                      pagination.pageSize,
                      statusFilter,
                      null,
                    );
                  }}
                  color="purple"
                >
                  {dateRange[0].format("DD/MM/YYYY")} →{" "}
                  {dateRange[1].format("DD/MM/YYYY")}
                </Tag>
              )}
            </div>
          )}
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
              pageSizeOptions: ["10", "20", "50"],
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
              fetchReports(page, pageSize);
            }}
          />
        </div>


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
