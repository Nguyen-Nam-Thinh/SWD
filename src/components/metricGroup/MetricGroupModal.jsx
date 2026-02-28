import { Modal, Form, Input, InputNumber } from "antd";
import { useEffect } from "react";

const MetricGroupModal = ({ open, editingGroup, loading, onSubmit, onCancel }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && editingGroup) {
            form.setFieldsValue(editingGroup);
        } else if (open) {
            form.resetFields();
            form.setFieldsValue({ displayOrder: 0 }); // Mặc định order = 0
        }
    }, [open, editingGroup, form]);

    return (
        <Modal
            title={editingGroup ? "Sửa Nhóm Metric" : "Thêm Nhóm Metric mới"}
            open={open}
            onOk={() => form.validateFields().then(values => onSubmit(values))}
            onCancel={onCancel}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Tên Nhóm" name="groupName" rules={[{ required: true }]}>
                    <Input placeholder="VD: 1. Kết Quả Kinh Doanh" />
                </Form.Item>
                <Form.Item label="Thứ tự hiển thị" name="displayOrder">
                    <InputNumber className="w-full" min={0} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MetricGroupModal;