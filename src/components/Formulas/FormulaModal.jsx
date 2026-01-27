// src/components/FormulaModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Select,
  Mentions,
  Typography,
} from "antd";
import metricService from "../../services/metricService";

const { Option } = Select;
const { Text } = Typography;

const FormulaModal = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
  loading,
}) => {
  const [form] = Form.useForm();
  const isEditMode = !!initialValues;
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchMetricData = async () => {
      const data = await metricService.getMetrics();
      setMetrics(data || []);
    };
    fetchMetricData();
  }, []);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true, tolerance: 0 });
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  const mentionOptions = metrics.map((m) => ({
    value: m.metricCode,
    label: `${m.metricCode} - ${m.metricName}`,
    key: m.id,
  }));

  // --- HÀM MỚI: Xử lý khi người dùng chọn một mục trong danh sách gợi ý ---
  const onMentionsSelect = (option) => {
    // option.value chính là mã code vừa chọn (ví dụ: PROFIT_NET)
    const { value } = option;

    // Dùng setTimeout để chờ Ant Design điền xong giá trị mặc định (@PROFIT_NET) vào form
    setTimeout(() => {
      // Lấy giá trị hiện tại của ô input
      const currentVal = form.getFieldValue("expression");

      if (currentVal) {
        // Thay thế tất cả các chuỗi "@CODE" thành "CODE"
        // Antd thường tự thêm dấu cách sau khi select, nên ta replace cả cụm cho sạch
        const newVal = currentVal.replaceAll(`@${value}`, value);

        // Cập nhật lại giá trị đã xóa @ vào Form
        form.setFieldsValue({
          expression: newVal,
        });
      }
    }, 0);
  };
  // ------------------------------------------------------------------------

  return (
    <Modal
      title={isEditMode ? "Cập nhật quy tắc" : "Thêm quy tắc mới"}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
        >
          {isEditMode ? "Cập nhật" : "Tạo mới"}
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical">
        {/* ... (Phần Target Metric giữ nguyên) ... */}
        <Form.Item
          name="targetMetricCode"
          label="Mã chỉ số đích (Target Metric)"
          rules={[{ required: true, message: "Vui lòng chọn mã chỉ số!" }]}
          extra="Chọn chỉ số bạn muốn kiểm tra."
        >
          <Select
            showSearch
            placeholder="Chọn hoặc tìm kiếm chỉ số (VD: PROFIT_NET)"
            optionFilterProp="children"
            disabled={isEditMode}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          >
            {metrics.map((m) => (
              <Option
                key={m.id}
                value={m.metricCode}
                label={`${m.metricCode} ${m.metricName}`}
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{m.metricCode}</span>
                  <span
                    className="text-gray-500 truncate ml-2"
                    style={{ maxWidth: 200 }}
                  >
                    {m.metricName}
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="formulaName"
          label="Tên quy tắc"
          rules={[{ required: true, message: "Vui lòng nhập tên quy tắc!" }]}
        >
          <Input placeholder="Ví dụ: Check Cân đối kế toán" />
        </Form.Item>

        {/* --- UPDATE: THÊM onSelect VÀO MENTIONS --- */}
        <Form.Item
          name="expression"
          label="Biểu thức kiểm tra"
          rules={[{ required: true, message: "Vui lòng nhập biểu thức!" }]}
          extra={
            <span className="text-xs text-gray-400">
              Gõ ký tự <Text code>@</Text> để gợi ý các chỉ số. Hỗ trợ các toán
              tử: +, -, *, /
            </span>
          }
        >
          <Mentions
            rows={4}
            placeholder="Ví dụ: ASSETS = LIABILITIES + EQUITY" // Đã bỏ @ trong placeholder cho đỡ nhầm
            options={mentionOptions}
            prefix={["@"]}
            className="font-mono text-base"
            autoSize={{ minRows: 3, maxRows: 6 }}
            // Thêm sự kiện này
            onSelect={onMentionsSelect}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
        {/* ------------------------------------------ */}

        <div className="flex gap-4">
          <Form.Item
            name="tolerance"
            label="Sai số (Tolerance)"
            className="flex-1"
          >
            <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default FormulaModal;
