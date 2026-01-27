import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Upload,
  message,
  Typography,
  Row,
  Col,
} from "antd";
import {
  InboxOutlined,
  CloudUploadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Dragger } = Upload;
const { Title } = Typography;

const FinancialReportUpload = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    setLoading(true);
    console.log("Form values:", values);

    // Giả lập gọi API upload
    setTimeout(() => {
      setLoading(false);
      message.success("Tải lên báo cáo thành công!");
      navigate("/dashboard/financial-reports"); // Quay lại trang quản lý
    }, 1500);
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    action: "https://run.mocky.io/v3/435ba68c-f2a8-44c2-8e1e-27e1c784794b", // Mock API
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
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
        title={<Title level={4}>Tải lên Báo cáo tài chính mới</Title>}
        bordered={false}
        className="shadow-sm"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ year: null }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="companyId"
                label="Công ty"
                rules={[{ required: true, message: "Vui lòng chọn công ty" }]}
              >
                <Select placeholder="Chọn công ty...">
                  <Select.Option value="fpt">FPT Corporation</Select.Option>
                  <Select.Option value="vnm">Vinamilk</Select.Option>
                  <Select.Option value="vcb">Vietcombank</Select.Option>
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

          <Form.Item
            name="reportName"
            label="Tên báo cáo"
            rules={[{ required: true, message: "Vui lòng nhập tên báo cáo" }]}
          >
            <Input placeholder="VD: Báo cáo tài chính Quý 1/2026" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả / Ghi chú">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú thêm về báo cáo này..."
            />
          </Form.Item>

          <Form.Item label="File đính kèm (PDF/Excel)">
            <Form.Item
              name="file"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              noStyle
              rules={[{ required: true, message: "Vui lòng đính kèm file" }]}
            >
              <Dragger
                {...uploadProps}
                className="bg-gray-50 border-dashed border-2 border-gray-300"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: "#1890ff" }} />
                </p>
                <p className="ant-upload-text">
                  Nhấp hoặc kéo thả file vào khu vực này
                </p>
                <p className="ant-upload-hint">
                  Hỗ trợ định dạng .pdf, .xlsx. Dung lượng tối đa 10MB.
                </p>
              </Dragger>
            </Form.Item>
          </Form.Item>

          <Form.Item className="mt-6 text-right">
            <Button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<CloudUploadOutlined />}
              loading={loading}
              size="large"
            >
              Tải lên báo cáo
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FinancialReportUpload;
