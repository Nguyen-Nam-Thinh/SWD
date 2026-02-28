import { Modal, Form, Input, Switch, Select, InputNumber } from "antd";
import { useEffect, useState } from "react";
import metricGroupService from "../../services/metricGroupService";

const { TextArea } = Input;
const { Option } = Select;

const MetricsModal = ({ open, editingMetric, formRef, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [isAuto, setIsAuto] = useState(false);
  const [groups, setGroups] = useState([]);

  // Lấy danh sách Group khi mở Modal
  useEffect(() => {
    if (open) {
      const fetchGroups = async () => {
        try {
          const data = await metricGroupService.getAllNoPaging();
          setGroups(data || []);
        } catch (error) {
          console.error("Lỗi khi tải nhóm metric:", error);
        }
      };
      fetchGroups();
    }
  }, [open]);

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [form, formRef]);

  useEffect(() => {
    if (open && editingMetric) {
      form.setFieldsValue({
        ...editingMetric,
        // Backend trả về isAutoCalculated, map vào switch
        isAutoCalculated: editingMetric.isAutoCalculated || false,
      });
      setIsAuto(editingMetric.isAutoCalculated || false);
    } else if (!open) {
      form.resetFields();
      setIsAuto(false);
      form.setFieldsValue({ isAutoCalculated: false, displayOrder: 0 });
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
      width={700} // Tăng width vì form nhiều trường hơn
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          {!editingMetric && (
            <Form.Item
              label="Mã Metric (Metric Code)"
              name="metricCode"
              rules={[{ required: true, message: "Vui lòng nhập mã metric" }]}
            >
              <Input placeholder="VD: PROFIT_NET, ASSET_TOTAL" />
            </Form.Item>
          )}

          <Form.Item
            label="Nhóm chỉ số (Group)"
            name="groupId"
          >
            <Select placeholder="Chọn nhóm chỉ số" allowClear>
              {groups.map(g => (
                <Option key={g.id} value={g.id}>{g.groupName}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tên Tiếng Việt"
            name="metricNameVi"
            rules={[{ required: true, message: "Vui lòng nhập tên tiếng Việt" }]}
          >
            <Input placeholder="VD: Lợi nhuận sau thuế" />
          </Form.Item>

          <Form.Item
            label="Tên Tiếng Anh"
            name="metricNameEn"
          >
            <Input placeholder="VD: Net Profit After Tax" />
          </Form.Item>

          <Form.Item
            label="Đơn Vị (Unit)"
            name="unit"
          >
            <Input placeholder="VD: %, VND, lần" />
          </Form.Item>

          <Form.Item
            label="Thứ tự hiển thị"
            name="displayOrder"
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>
        </div>

        <Form.Item label="Mô Tả" name="description">
          <TextArea rows={2} placeholder="Nhập mô tả chi tiết về metric" />
        </Form.Item>

        {/* PHẦN GỘP FORMULA */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
          <Form.Item
            name="isAutoCalculated"
            valuePropName="checked"
            className="mb-2"
          >
            <Switch
              checkedChildren="Tự động tính toán"
              unCheckedChildren="Nhập tay"
              onChange={(checked) => setIsAuto(checked)}
            />
          </Form.Item>

          {isAuto && (
            <>
              <Form.Item
                label="Công thức tính (Formula)"
                name="formula"
                rules={[{ required: true, message: "Vui lòng nhập công thức tính" }]}
                className="mt-3"
              >
                <TextArea
                  rows={2}
                  className="font-mono text-red-500"
                  placeholder="VD: PROFIT_BEFORE_TAX - TAX_EXP"
                />
              </Form.Item>

              <Form.Item
                label="Giải thích công thức"
                name="explanation"
                className="mb-0"
              >
                <Input placeholder="VD: Lấy tổng lợi nhuận trừ đi thuế..." />
              </Form.Item>
            </>
          )}
        </div>

      </Form>
    </Modal>
  );
};

export default MetricsModal;