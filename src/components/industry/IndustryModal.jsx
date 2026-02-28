import { Modal, Form, Input } from "antd";
import { useEffect } from "react";

const IndustryModal = ({ open, editingIndustry, loading, onSubmit, onCancel }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && editingIndustry) {
            form.setFieldsValue(editingIndustry);
        } else if (open) {
            form.resetFields();
        }
    }, [open, editingIndustry, form]);

    return (
        <Modal
            title={editingIndustry ? "Sửa thông tin Ngành" : "Thêm Ngành mới"}
            open={open}
            onOk={() => form.validateFields().then(values => onSubmit(values))}
            onCancel={onCancel}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                {!editingIndustry && (
                    <Form.Item label="Mã Ngành (Code)" name="code" rules={[{ required: true }]}>
                        <Input placeholder="VD: TECH, BANK..." />
                    </Form.Item>
                )}
                <Form.Item label="Tên Tiếng Việt" name="nameVi" rules={[{ required: true }]}>
                    <Input placeholder="VD: Công nghệ thông tin" />
                </Form.Item>
                <Form.Item label="Tên Tiếng Anh" name="nameEn">
                    <Input placeholder="VD: Information Technology" />
                </Form.Item>
                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default IndustryModal;