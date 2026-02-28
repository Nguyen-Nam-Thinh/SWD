import { Modal, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import industryService from "../../services/industryService";

const { TextArea } = Input;
const { Option } = Select;

const CompanyModal = ({ open, editingCompany, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [industries, setIndustries] = useState([]);

  // Lấy danh sách Ngành
  useEffect(() => {
    if (open) {
      industryService.getAllNoPaging().then(data => setIndustries(data || []));
    }
  }, [open]);

  useEffect(() => {
    if (open && editingCompany) {
      form.setFieldsValue({
        ...editingCompany,
        industryId: editingCompany.industryId // Map ID vào form
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editingCompany, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values, editingCompany);
      form.resetFields();
    } catch (error) { }
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
        <div className="grid grid-cols-2 gap-4">
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
            label="Sàn Giao Dịch"
            name="stockExchange"
            rules={[{ required: true, message: "Vui lòng chọn sàn giao dịch" }]}
          >
            <Select placeholder="Chọn sàn giao dịch">
              <Option value="HOSE">HOSE</Option>
              <Option value="HNX">HNX</Option>
              <Option value="UPCOM">UPCOM</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Tên Công Ty"
          name="companyName"
          rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
        >
          <Input placeholder="Nhập tên đầy đủ công ty" />
        </Form.Item>

        {/* THAY ĐỔI: Sử dụng Select cho Ngành */}
        <Form.Item
          label="Ngành (Industry)"
          name="industryId"
          rules={[{ required: true, message: "Vui lòng chọn ngành" }]}
        >
          <Select placeholder="Chọn ngành hoạt động" showSearch optionFilterProp="children">
            {industries.map(ind => (
              <Option key={ind.id} value={ind.id}>
                {ind.code} - {ind.nameVi}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Website" name="website">
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Form.Item label="Mô Tả" name="description">
          <TextArea rows={3} placeholder="Nhập mô tả về công ty" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyModal;