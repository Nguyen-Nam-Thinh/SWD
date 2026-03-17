import { Modal, Form, Input } from "antd";
import { useEffect } from "react";

const MetricGroupModal = ({
  open,
  editingGroup,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editingGroup) {
      form.setFieldsValue(editingGroup);
    } else if (open) {
      form.resetFields();
    }
  }, [open, editingGroup, form]);

  return (
    <Modal
      title={editingGroup ? "Sửa Nhóm Metric" : "Thêm Nhóm Metric mới"}
      open={open}
      onOk={() => form.validateFields().then((values) => onSubmit(values))}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên Nhóm"
          name="groupName"
          rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}
        >
          <Input placeholder="VD: Kết Quả Kinh Doanh" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MetricGroupModal;