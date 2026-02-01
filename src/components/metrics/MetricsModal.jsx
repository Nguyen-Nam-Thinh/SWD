import { Modal, Form, Input } from "antd";
import { useEffect } from "react";

const { TextArea } = Input;

const MetricsModal = ({
  open,
  editingMetric,
  formRef,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [form, formRef]);

  useEffect(() => {
    if (open && editingMetric) {
      form.setFieldsValue(editingMetric);
    } else if (!open) {
      form.resetFields();
    }
  }, [open, editingMetric, form]);

  return (
    <Modal
      title={editingMetric ? "Chỉnh Sửa Metric" : "Thêm Metric Mới"}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={editingMetric ? "Cập nhật" : "Thêm"}
      cancelText="Hủy"
      width={600}
    >
      <Form form={form} layout="vertical">
        {!editingMetric && (
          <Form.Item
            label="Mã Metric (Metric Code)"
            name="metricCode"
            rules={[{ required: true, message: "Vui lòng nhập mã metric" }]}
          >
            <Input placeholder="VD: ROE, ROA, EPS" />
          </Form.Item>
        )}

        <Form.Item
          label="Tên Metric"
          name="metricName"
          rules={[{ required: true, message: "Vui lòng nhập tên metric" }]}
        >
          <Input placeholder="VD: Return on Equity" />
        </Form.Item>

        <Form.Item
          label="Đơn Vị (Unit)"
          name="unit"
          rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
        >
          <Input placeholder="VD: %, VND, lần" />
        </Form.Item>

        <Form.Item label="Mô Tả" name="description">
          <TextArea rows={4} placeholder="Nhập mô tả về metric" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MetricsModal;
