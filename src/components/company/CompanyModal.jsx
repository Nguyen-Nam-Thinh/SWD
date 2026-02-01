import { Modal, Form, Input, Select } from "antd";
import { useEffect } from "react";

const { TextArea } = Input;

const CompanyModal = ({
  open,
  editingCompany,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editingCompany) {
      form.setFieldsValue(editingCompany);
    } else if (open) {
      form.resetFields();
    }
  }, [open, editingCompany, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values, editingCompany);
      form.resetFields();
    } catch (error) {
      // Validation failed - form will show errors
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={editingCompany ? "Chỉnh Sửa Công Ty" : "Thêm Công Ty Mới"}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={editingCompany ? "Cập nhật" : "Thêm"}
      cancelText="Hủy"
      width={600}
    >
      <Form form={form} layout="vertical">
        {!editingCompany && (
          <Form.Item
            label="Mã Chứng Khoán (Ticker)"
            name="ticker"
            rules={[{ required: true, message: "Vui lòng nhập ticker" }]}
          >
            <Input placeholder="VD: FPT" />
          </Form.Item>
        )}

        <Form.Item
          label="Tên Công Ty"
          name="companyName"
          rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
        >
          <Input placeholder="Nhập tên đầy đủ công ty" />
        </Form.Item>

        <Form.Item
          label="Mã Ngành (Industry Code)"
          name="industryCode"
          rules={[{ required: true, message: "Vui lòng nhập mã ngành" }]}
        >
          <Input placeholder="VD: TECH, FOOD" />
        </Form.Item>

        <Form.Item
          label="Sàn Giao Dịch (Stock Exchange)"
          name="stockExchange"
          rules={[{ required: true, message: "Vui lòng chọn sàn giao dịch" }]}
        >
          <Select placeholder="Chọn sàn giao dịch">
            <Select.Option value="HOSE">HOSE</Select.Option>
            <Select.Option value="HNX">HNX</Select.Option>
            <Select.Option value="UPCOM">UPCOM</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Website" name="website">
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Form.Item label="Mô Tả" name="description">
          <TextArea rows={4} placeholder="Nhập mô tả về công ty" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyModal;
