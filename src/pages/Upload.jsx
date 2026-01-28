import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Upload,
  message,
  Typography,
  Row,
  Col,
  Divider,
  InputNumber,
  Space,
} from "antd";
import {
  InboxOutlined,
  CloudUploadOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import companyService from "../services/companyService";
import reportService from "../services/reportService";
import CompanyModal from "../components/company/CompanyModal"; // Import modal bạn đã có

const { Dragger } = Upload;
const { Title } = Typography;
const { Option } = Select;

const FinancialReportUpload = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // State
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyForm] = Form.useForm(); // Form cho modal thêm công ty

  // Load danh sách công ty khi vào trang
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // Lấy danh sách lớn để hiển thị trong select (PageSize lớn hoặc logic search)
      const res = await companyService.getCompanies({ pageSize: 100 });
      setCompanies(res.items || []); // Giả sử API trả về { items: [...] }
    } catch (error) {
      message.error("Không thể tải danh sách công ty");
    }
  };

  // Xử lý khi Submit Upload
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Map các trường theo yêu cầu Swagger
      formData.append("CompanyId", values.companyId);
      formData.append("Year", values.year.year()); // Lấy số năm từ dayjs
      formData.append("Period", values.period);
      formData.append("PeriodType", values.periodType);

      // File object từ Antd Upload
      if (values.file && values.file.length > 0) {
        formData.append("File", values.file[0].originFileObj);
      }

      await reportService.uploadReport(formData);
      message.success("Tải lên báo cáo thành công!");
      // navigate("/dashboard/draft-reports");
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Lỗi khi tải lên báo cáo");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC THÊM CÔNG TY MỚI ---
  const handleCreateCompany = async () => {
    try {
      const values = await companyForm.validateFields();
      setCompanyLoading(true);

      // Gọi API tạo công ty
      const newCompany = await companyService.createCompany(values);

      message.success("Thêm công ty mới thành công!");

      // 1. Refresh danh sách
      await fetchCompanies();

      // 2. Tự động chọn công ty vừa tạo vào ô Select
      // Giả sử API create trả về object công ty có id. Nếu không, phải gọi lại API get
      if (newCompany && newCompany.id) {
        form.setFieldsValue({ companyId: newCompany.id });
      }

      // 3. Đóng modal & reset form modal
      setIsCompanyModalOpen(false);
      companyForm.resetFields();
    } catch (error) {
      if (!error.errorFields) {
        // Nếu không phải lỗi validate form
        message.error("Không thể tạo công ty");
      }
    } finally {
      setCompanyLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        icon={<ArrowLeftOutlined />}
        type="link"
        onClick={() => navigate(-1)}
        className="mb-4 pl-0 text-gray-500"
      >
        Quay lại danh sách
      </Button>

      <Card
        title={<Title level={4}>Tải lên Báo cáo tài chính</Title>}
        className="shadow-sm"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ periodType: "Quarterly" }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="companyId"
                label="Công ty"
                rules={[{ required: true, message: "Vui lòng chọn công ty" }]}
              >
                <Select
                  placeholder="Chọn công ty..."
                  showSearch
                  optionFilterProp="children"
                  // --- KEY POINT: Custom Dropdown ---
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 4px" }}>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => setIsCompanyModalOpen(true)}
                          className="text-blue-600 font-medium"
                        >
                          Thêm công ty mới ngay
                        </Button>
                      </Space>
                    </>
                  )}
                >
                  {companies.map((comp) => (
                    <Option key={comp.id} value={comp.id}>
                      {comp.companyName} ({comp.ticker})
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

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="periodType"
                label="Loại kỳ báo cáo"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Quarterly">Theo Quý (Quarterly)</Option>
                  <Option value="Yearly">Theo Năm (Yearly)</Option>
                  <Option value="HalfYear">Bán niên (HalfYear)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="period"
                label="Kỳ số (VD: Quý 1 nhập 1)"
                rules={[{ required: true, message: "Nhập kỳ số" }]}
              >
                <InputNumber min={1} max={4} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="file"
            label="File báo cáo"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: "Vui lòng đính kèm file" }]}
          >
            <Dragger
              beforeUpload={() => false} // Chặn auto upload, để submit thủ công
              maxCount={1}
              accept=".pdf,.xlsx,.xls"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Kéo thả file hoặc nhấp để chọn</p>
            </Dragger>
          </Form.Item>

          <Form.Item className="text-right mt-6">
            <Button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<CloudUploadOutlined />}
            >
              Tải lên
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* --- MODAL THÊM CÔNG TY --- */}
      <CompanyModal
        open={isCompanyModalOpen}
        form={companyForm}
        loading={companyLoading}
        onSubmit={handleCreateCompany}
        onCancel={() => {
          setIsCompanyModalOpen(false);
          companyForm.resetFields();
        }}
        editingCompany={null} // null vì đang tạo mới
      />
    </div>
  );
};

export default FinancialReportUpload;
